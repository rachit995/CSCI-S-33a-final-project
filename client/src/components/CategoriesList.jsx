import { useEffect } from 'react'
import useSwr from 'swr'
import api from '../utils/api'
import clsx from 'clsx'
import { HiFolder } from 'react-icons/hi'

const CategoriesList = () => {
  useEffect(() => {
    document.body.classList.add('bg-gray-100')
    return () => {
      document.body.classList.remove('bg-gray-100')
    }
  }, [])

  const fetcher = async () => {
    const response = await api.get('/categories')
    return response.data
  }

  const { data = [], mutate } = useSwr(`/categories`, fetcher, {
    refreshInterval: undefined,
  })

  useEffect(() => {
    async function fetchNewData() {
      const newData = await fetcher()
      mutate(newData.data)
    }
    fetchNewData()
  }, [])

  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Categories
          </h1>
        </div>
      </header>
      <div className="px-4 py-2 mx-auto max-w-7xl sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 mt-4 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
          {data.map((category) => (
            <a
              key={category.id}
              className={
                clsx(
                  'border-gray-300',
                  'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none'
                )
              }
              href={`/category/${category.id}`}
            >
              <span className="flex flex-1">
                <span className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {category.category}
                  </span>
                  <div className='inline-flex items-start mt-6 space-x-2'>
                    {category.activeListingCount > 0 ? (<div className="relative mt-[6px]">
                      <span className={clsx('flex place-items-center', 'w-2 h-2')}>
                        <span
                          className={clsx(
                            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                            'bg-green-400'
                          )}
                        ></span>
                        <span className={clsx('relative inline-flex rounded-full', 'bg-green-500', 'w-2 h-2')}></span>
                      </span>
                    </div>) : null}
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        category.activeListingCount > 0 ? 'text-gray-900' : 'text-gray-400'
                      )}>
                      {category.activeListingCount} Active Listings
                    </span>
                  </div>

                </span>
              </span>
              <HiFolder
                className={clsx('h-5 w-5 text-indigo-600')}
                aria-hidden="true"
              />
              <span
                className={clsx(
                  'border-2',
                  'border-transparent',
                  'pointer-events-none absolute -inset-px rounded-lg'
                )}
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </div>
    </div >
  )
}

export default CategoriesList
