import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useVirtual } from 'react-virtual'
import HouseListing from '../components/HouseListing'
import LoadingSkeleton from '../components/LoadingSkeleton'

const perPage = 20
const cardHeight = 360
const totalCount = 1000

export default function Main({ results: initialResults }) {
  const [results, setResults] = useState(initialResults)
  const [loadedPages, setLoadedPages] = useState([true])
  const [screenWidth, setScreenWidth] = useState(1280)
  const parentRef = useRef()

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window ? window.innerWidth : 1280)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  let itemsPerRow = 1
  if(screenWidth >= 1024) {
    itemsPerRow = 3
  } else if(screenWidth >= 768) {
    itemsPerRow = 2
  }

  const {
    virtualItems,
    totalSize,
  } = useVirtual({
    // I'm kinda cheating here, but ideally the endpoint would
    // be able to return the total count.  The other workaround is
    // to set this to a lower number and increment it once results
    // load in, but that causes the scrolling hang every time
    // we load a page.
    size: Math.ceil(totalCount / itemsPerRow),
    parentRef,
    estimateSize: useCallback(() => cardHeight, []),
    overscan: 2
  })

  useEffect(() => {
    if(!virtualItems || !virtualItems.length) {
      return
    }
    const startRow = virtualItems[0].index
    const endRow = virtualItems[virtualItems.length - 1].index

    const startItem = startRow * itemsPerRow
    const endItem = endRow * itemsPerRow

    const startPage = Math.floor(startItem / perPage)
    const endPage = Math.floor(endItem / perPage)

    // If a user scrolls to a page boundary we may have to
    // fetch multiple pages to ensure all results are loaded.
    for(let i = startPage ; i <= endPage ; i++) {
      ;(async () => {
        let currentPage = i
        if(loadedPages[currentPage]) return
        // Create a marker for each page that we've already
        // loaded, so we don't load them again.
        setLoadedPages((loadedPages) => {
          let newLoadedPages = loadedPages.slice()
          newLoadedPages[currentPage] = true
          return newLoadedPages
        })
        let houses = await getPage(currentPage)
        setResults((results) => {
          let newResults = results.slice()
          // This allows us to sparsely populate the results array
          // for the case where the user scrolls directly to the end,
          // we can skip loading intermediate pages until they scroll
          // back up.
          if(newResults.length < (currentPage * perPage) + 1) {
            newResults.length = (currentPage * perPage) + 1
          }
          newResults.splice(currentPage * perPage, perPage, ...houses)
          return newResults
        })
      })()
    }
  }, [virtualItems])

  return (<>
    <Head>
      <title>Home Listings</title>
    </Head>
    <div className="p-2 md:p-8 mx-auto max-w-7xl h-screen w-full overflow-auto" ref={parentRef}>
      <div className="relative" style={{ height: totalSize }}>
        {virtualItems.map((item) => {
          return <div
            className="absolute w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 p-2 md:pb-6"
            key={item.index}
            style={{
              height: item.size,
              // Use transform to force gpu compositing
              transform: `translateY(${item.start}px)`
            }}>
            {new Array(itemsPerRow).fill(0).map((_, i) => {
              const house = results[item.index * itemsPerRow + i]

              if(!house) {
                return <LoadingSkeleton />
              }
              return <HouseListing house={house} />
            })
          }
        </div>
      })}
      </div>
    </div>
  </>)
}

// This could probably be debounced
async function getPage (pageNumber) {
  let attempts = 0
  while(true) {
    const response = await fetch(`http://app-homevision-staging.herokuapp.com/api_project/houses?page=${pageNumber + 1}&per_page=${perPage}`)
    if(response.status !== 200) {
      attempts++
      await new Promise(res => setTimeout(res, 2 ** attempts * 10))
      continue
    }
    const { houses, ok } = await response.json()
    if(!ok) {
      continue
    }
    return houses
  }
}

export const getServerSideProps = async (context) => {
  return {
    props: {
      results: await getPage(0)
    }
  }
}
