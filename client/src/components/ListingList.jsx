import { HiChevronLeft, HiChevronRight, HiDotsHorizontal, HiOutlineEye, HiPlus, HiSearch, HiStar } from 'react-icons/hi'
import { FaRegFolderOpen } from 'react-icons/fa'
import _ from 'lodash'
import LinesEllipsis from 'react-lines-ellipsis'
import { getImgUrlSync } from '../utils/helper'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { NumericFormat } from 'react-number-format'

const ListingsList = (props) => {
  useEffect(() => {
    document.body.classList.add('bg-gray-100')
    return () => {
      document.body.classList.remove('bg-gray-100')
    }
  }, [])
  const {
    page,
    limit,
    filter,
    setFilter,
    setParams,
    title,
    listings,
    count,
    numPages,
    handleSearchChange
  } = props

  function renderPages() {
    const currentPageIndex = page
    return _.range(1, numPages + 1)?.map((p, index) => {
      const pId = p
      const element = (
        <button
          key={pId}
          onClick={(e) => {
            e.preventDefault()
            setParams((prevParams) => {
              return {
                ...prevParams,
                page: pId,
              }
            })
          }}
          aria-current="page"
          className={`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium transition-all duration-150 ease-in-out focus:z-20 ${currentPageIndex === pId
            ? 'border-indigo-500 bg-indigo-600 font-bold text-white hover:bg-indigo-500'
            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          {index + 1}
        </button>
      )
      if (
        index === 0 ||
        numPages - 1 === index ||
        (currentPageIndex - 3 < index && currentPageIndex + 3 > index)
      ) {
        return element
      }
      if (currentPageIndex - 3 === index || currentPageIndex + 3 === index) {
        return (
          <span
            key={pId}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            ...
          </span>
        )
      }
      return ''
    })
  }


  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className='grid items-center justify-between w-full sm:inline-flex'>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {title}
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
          <h2 className="sr-only">{title}</h2>
          {listings.length > 0 ?
            <>
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8">
                {listings.map((listing) => {
                  const image = getImgUrlSync(listing.imageUrl)
                  return (
                    <div
                      key={listing.id}
                      className={clsx("relative flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg group", {
                        'opacity-50': !listing.active
                      })}
                    >
                      <div className="relative bg-gray-200 aspect-h-9 aspect-w-16 sm:aspect-none group-hover:opacity-75 sm:h-40">
                        <img
                          src={image}
                          alt={listing.title}
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
                        {
                          !listing.active ? (
                            <div className='absolute top-2 right-2'>
                              <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                <svg className="h-1.5 w-1.5 fill-red-500" viewBox="0 0 6 6" aria-hidden="true">
                                  <circle cx={3} cy={3} r={3} />
                                </svg>
                                Closed
                              </span>
                            </div>
                          ) : null
                        }
                      </div>
                      <div className="flex flex-col flex-1 p-4 space-y-2">
                        <h3 className="inline-flex items-center justify-between w-full text-sm font-medium text-gray-900">
                          <div className='inline-flex items-center space-x-2'>
                            {listing.active ? (<div className="relative">
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
                            <a href={`/listing/${listing.id}`}>
                              {listing.title}
                            </a>
                          </div>
                        </h3>
                        <LinesEllipsis
                          text={listing.description}
                          maxLine='3'
                          ellipsis='...'
                          trimRight
                          basedOn='letters'
                          className='text-sm text-gray-500'
                        />
                        <div className='py-1'>
                          <a className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
                            href={`/category/${listing.category}`}
                          >
                            <FaRegFolderOpen className="w-4 h-4 text-yellow-700" aria-hidden="true" />
                            {listing.categoryName}
                          </a>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex flex-col justify-end flex-1 py-4">
                          <p className="mb-2 text-xs text-gray-500">Current Bid</p>
                          <p className="text-4xl font-medium text-gray-900">
                            <NumericFormat value={listing?.currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                          </p>
                        </div>
                        <a
                          href={`/listing/${listing.id}`}
                          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 space-x-2"
                        >
                          <HiOutlineEye className="w-5 h-5" aria-hidden="true" />
                          <span>View Listing</span>
                          <span className="sr-only">{listing.number}</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
              {numPages > 1 && (
                <div className="inline-flex items-center justify-between w-full my-4 space-x-4">
                  <div className="text-sm text-gray-500">
                    Showing{' '}
                    <span className="font-semibold">
                      {page === 1 ? page : (page - 1) * limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold">
                      {listings.length < limit ? count : limit * page}
                    </span>{' '}
                    of <span className="font-semibold">{count}</span> listings
                  </div>
                  <div>
                    <nav
                      className="inline-flex -space-x-px rounded-md shadow-sm isolate"
                      aria-label="Pagination"
                    >
                      <button
                        className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-20"
                        onClick={() => {
                          if (page - 1 > 0) {
                            setParams((prevParams) => {
                              return {
                                ...prevParams,
                                page: prevParams.page - 1,
                              }
                            })
                          }
                        }}
                      >
                        <span className="sr-only">Previous</span>
                        <HiChevronLeft className="w-5 h-5" />
                      </button>
                      {renderPages()}
                      <button
                        className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-20"
                        onClick={() => {
                          if (page + 1 <= numPages) {
                            setParams((prevParams) => {
                              return {
                                ...prevParams,
                                page: prevParams.page + 1,
                              }
                            })
                          }
                        }}
                      >
                        <span className="sr-only">Next</span>
                        <HiChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </>
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

ListingsList.defaultProps = {
  title: 'Listings',
  listings: [],
  count: 0,
  numPages: 0,
  page: 1,
  limit: 8,
  filter: 'active',
  setFilter: () => { },
  query: '',
  setQuery: () => { },
  setParams: () => { },
  handleSearchChange: () => { }
}

ListingsList.propTypes = {
  title: PropTypes.string,
  listings: PropTypes.array,
  count: PropTypes.number,
  numPages: PropTypes.number,
  page: PropTypes.number,
  limit: PropTypes.number,
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  query: PropTypes.string,
  setQuery: PropTypes.func,
  setParams: PropTypes.func,
  handleSearchChange: PropTypes.func
}


export default ListingsList
