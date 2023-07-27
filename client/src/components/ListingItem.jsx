import { useEffect } from 'react'
import { useState } from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { HiHeart } from 'react-icons/hi'
import api from '../utils/api'
import { useParams } from 'react-router-dom'
import StarRating from 'react-star-ratings';
import { toast } from '../utils/helper'

const ListingItem = () => {
  let { id } = useParams();
  const [item, setItem] = useState({})
  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        setItem(res.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [id])

  const handleRating = (rate) => {
    if (!item?.userRating) {
      api.post(`/listings/${id}/ratings`, { rating: rate })
        .then(res => {
          setItem(res.data)
          toast('success', 'Rating added successfully')
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
  return (
    <div className="bg-white">
      <div className="max-w-2xl px-4 py-16 mx-auto sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <Tab.Group as="div" className="flex flex-col-reverse">
            <div className="w-full aspect-h-1 aspect-w-1">
              <img
                src={item?.imageUrl}
                alt={item?.title}
                className="object-cover object-center w-full h-full sm:rounded-lg"
              />
            </div>
          </Tab.Group>

          <div className="px-4 mt-10 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{item?.title}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">${item?.currentBid}</p>
            </div>

            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className={clsx({
                'pointer-events-none': item?.userRating
              })}>
                <StarRating
                  name={item?.title}
                  rating={item?.rating}
                  changeRating={handleRating}
                  starDimension='24px'
                  starRatedColor='#FDCC0D'
                  starHoverColor='#FDCC0D'
                  starSpacing='2px'
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>

              <div
                className="space-y-6 text-base text-gray-700"
                dangerouslySetInnerHTML={{ __html: item?.description }}
              />
            </div>

            <form className="mt-6">
              <div className="flex mt-10">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 max-w-xs px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                >
                  Add to bag
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center px-3 py-3 ml-4 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500"
                >
                  <HiHeart className="flex-shrink-0 w-6 h-6" aria-hidden="true" />
                  <span className="sr-only">Add to favorites</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingItem
