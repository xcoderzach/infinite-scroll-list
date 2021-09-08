import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useVirtual } from 'react-virtual'

export default function Main() {
  let [results, setResults] = useState([])

  // const parentRef = useRef()

  // const {
  //   virtualItems,
  //   totalSize,
  //   scrollToIndex,
  //   scrollToOffset,
  // } = useVirtual({
  //   size: 1000,
  //   parentRef,
  //   estimateSize: useCallback(() => 100, []),
  //   overscan: 5
  // })

  useEffect(() => {
    const getPage = async () => {
      const response = await fetch('http://app-homevision-staging.herokuapp.com/api_project/houses?page=1&per_page=10')
      const { houses, ok } = await response.json()
      setResults(houses)
    }
    getPage()
  }, [])

  console.log(results)
  return (
    <div className="p-8 mx-auto max-w-7xl">
      <Head>
        <title>Home Listings</title>
      </Head>
      <main>
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((house) =>
            <li
              key={house.id}
              className="overflow-hidden col-span-1 flex flex-col bg-white rounded-md shadow-md"
            >
              <div className="h-56">
                <img
                  src={house.photoURL}
                  className="w-full h-full object-center object-cover group-hover:opacity-75"
                />
              </div>
              <div className="pb-4 px-8">
                <div className="text-gray-500 text-sm pt-4">{house.address}</div>
                <div className="text-2xl pt-1">${house.price.toLocaleString()}</div>
                <div className="pt-3 text-xs text-gray-400">For sale by {house.homeowner}</div>
              </div>
            </li>
          )}
        </ul>
      </main>
    </div>
  )
}
