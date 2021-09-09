export default function HouseListing({ house }) {
  return <div
    key={house.id}
    className="overflow-hidden flex flex-col bg-white rounded-md shadow-md"
  >
    <div className="h-56 w-full">
      <img
        src={house.photoURL}
        className="w-full h-full object-center object-cover"
      />
    </div>
    <div className="pb-4 px-3 md:px-6">
      <div className="text-gray-500 text-sm pt-3 whitespace-nowrap">{house.address}</div>
      <div className="text-2xl pt-1">${house.price.toLocaleString()}</div>
      <div className="pt-3 text-xs text-gray-400">For sale by {house.homeowner}</div>
    </div>
  </div>
}