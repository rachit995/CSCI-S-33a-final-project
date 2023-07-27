import React, { useEffect } from 'react'
import Layout from './Layout'
import api from '../utils/api'
import { toast } from '../utils/helper'
import clsx from 'clsx'
import StarRatings from 'react-star-ratings'
import { HiDotsHorizontal, HiPlus, HiSearch, HiStar } from 'react-icons/hi'
import { debounce } from 'lodash'
import useSwr from 'swr'

const Listings = () => {
  const [filter, setFilter] = React.useState('active')
  const [query, setQuery] = React.useState('')
  const fetcher = async () => {
    const response = await api.get('/listings', {
      params: {
        filter,
        query
      }
    })
    return response.data
  }

  const { data: listings = [], mutate } = useSwr('/listings', fetcher, {
    refreshInterval: undefined,
  })

  useEffect(() => {
    document.body.classList.add('bg-gray-100')
    return () => {
      document.body.classList.remove('bg-gray-100')
    }
  }, [])

  const handleSearchChange = debounce((event) => {
    setQuery(event.target.value)
  }, 500)

  useEffect(() => {
    async function fetchNewData() {
      const newData = await fetcher()
      mutate(newData.data)
    }
    fetchNewData()
  }, [query, filter])
  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className='grid items-center justify-between w-full sm:inline-flex'>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Active Listings
            </h1>
            <div className='inline-flex items-center space-x-2'>
              <div className="sm:col-span-3">
                <div className="mt-2">
                  <select
                    id="filter"
                    name="filter"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    {[
                      {
                        name: 'All Listings', value: 'all'
                      },
                      {
                        name: 'Active Listings', value: 'active'
                      },
                      {
                        name: 'Closed Listings', value: 'closed'
                      },
                      {
                        name: 'My Listings', value: 'my'
                      }
                    ].map((item) => (
                      <option key={item.value} value={item.value}>{item.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex mt-2 rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <HiSearch className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="listing"
                      id="listing"
                      className="block w-40 rounded-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Eg. iPhone 12"
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div>
        <div className="max-w-2xl px-4 py-16 mx-auto sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Listings</h2>
          {listings.length > 0 ?
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="relative flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg group"
                >
                  <div className="relative bg-gray-200 aspect-h-9 aspect-w-16 sm:aspect-none group-hover:opacity-75 sm:h-40">
                    <img
                      src={listing.imageUrl}
                      alt={listing.imageUrl}
                      className="object-cover object-center w-full h-full sm:h-full sm:w-full"
                    />
                    {listing.rating ? (
                      <div className='absolute pl-1 pr-2 pt-0.5 pb-0 bg-white rounded shadow-sm top-2 left-2 text-sm'>
                        <div className='inline-flex items-center space-x-0.5'>
                          <HiStar className='text-lg text-yellow-500' />
                          <span className='font-semibold'>
                            {listing.rating}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col flex-1 p-4 space-y-2">
                    <h3 className="inline-flex items-center justify-between w-full text-sm font-medium text-gray-900">
                      <a href={`/listing/${listing.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {listing.title}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-500">{listing.description}</p>
                    <div className="flex flex-col justify-end flex-1">
                      <p className="text-sm italic text-gray-500">{listing.options}</p>
                      <p className="text-base font-medium text-gray-900">${listing.startingBid}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            : (
              <div className="relative z-30 p-10 pb-16 text-center">
                <HiDotsHorizontal className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h2 className="font-semibold text-slate-900">No listings found</h2>
                <p className="w-full max-w-sm mx-auto mt-2 text-sm leading-6 text-slate-600">
                  We can&apos;t find anything with that term at the moment, try searching something
                  else.
                </p>
                <a
                  type="button"
                  className="mt-6 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  href='/create-listing'
                >
                  <HiPlus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  Create Listing
                </a>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Listings
