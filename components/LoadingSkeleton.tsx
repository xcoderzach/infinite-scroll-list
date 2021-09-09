export default function LoadingSkeleton() {
  return <div
    className="overflow-hidden flex flex-col bg-white rounded-md shadow-md"
  >
    <div className="h-56 w-full bg-gray-300"></div>
    <div className="pb-4 px-6">
      <div className="bg-gray-300 text-sm w-7/12 mt-4 whitespace-nowrap">&nbsp;</div>
      <div className="bg-gray-300 text-2xl mt-1 w-4/12">&nbsp;</div>
      <div className="bg-gray-300 mt-3 text-xs text-gray-400 w-6/12">&nbsp;</div>
    </div>
  </div>
}