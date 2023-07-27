import { HiCamera, HiCheck, HiChevronDown, HiPlus, HiUserCircle } from "react-icons/hi"
import Layout from "./Layout"
import Input from "./html/Input"
import { useForm } from "react-hook-form";
import { Fragment, useEffect, useRef, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/helper";
import clsx from "clsx";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'
import { Float } from '@headlessui-float/react'
import { Combobox, Menu } from '@headlessui/react'
import _, { set } from "lodash";


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
console.log(import.meta.env.VITE_MAPBOX_TOKEN)
const CreateListing = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([])
  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [categoryError, setCategoryError] = useState(false)
  const [locationUpdated, setLocationUpdated] = useState(false)
  const onSubmit = (e) => {
    e.preventDefault()
    if (category === '') {
      setCategoryError(true)
      return toast('error', 'Please select a category')
    }
    api.post('/listings', {
      title,
      description,
      imageUrl: image,
      category: category.id,
      startingBid,
      longitude: locationUpdated ? lng : null,
      latitude: locationUpdated ? lat : null
    }).then(res => {
      if (res.status === 201) {
        toast('success', 'Listing created successfully')
        navigate('/listing')
      }
    }).catch(err => {
      console.log(err)
    })
  };
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);

  const handleDragEnd = () => {
    const marker = map.current.getCenter();
    setLng(+marker.lng);
    setLat(+marker.lat);
    setLocationUpdated(true)
  }

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 9
    });
    const marker = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);
    marker.on('dragend', handleDragEnd);
  });

  const [query, setQuery] = useState('')


  useEffect(() => {
    if (!!category.category && !_.find(categories, { category: category.category })) {
      api.post('/categories', { category: category.category })
        .then(res => {
          if (res.status === 201) {
            toast('success', 'Category created successfully')
            setCategories([...categories, res.data])
            setCategory(res.data)
            setQuery('')
          }
        })
    }
  }, [category])

  const filteredOptions =
    query === ''
      ? categories
      : categories.filter((option) =>
        option.category.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
      )

  function handleSetCategory(value) {
    setCategory(value)
    setQuery('')
  }
  console.log({ category })
  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Listing
          </h1>
        </div>
      </header>
      <div className="px-4 py-2 mx-auto max-w-7xl sm:px-6 sm:py-10 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={onSubmit}>
            <div className="space-y-12">
              <div className="pb-12 border-b border-gray-900/10">
                <div className="grid grid-cols-1 mt-10 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                      Title
                    </label>
                    <div className="mt-2">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          autoComplete="title"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Eg. 2019 MacBook Pro 16"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">Write a few sentences about the listing.</p>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
                      Image
                    </label>
                    <div className="mt-2">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <input
                          type="text"
                          name="image"
                          id="image"
                          autoComplete="image"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Eg. https://example.com/image.jpg"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    {image ? (
                      <img src={image} alt="" className="object-cover w-full h-64 rounded-md shadow-sm" />
                    ) : (
                      <div className="flex justify-center px-6 py-10 mt-2 border border-dashed rounded-lg border-gray-900/25">
                        <div className="text-center">
                          <HiCamera className="w-12 h-12 mx-auto text-gray-300" aria-hidden="true" />
                          <p className="text-xs leading-5 text-gray-600">
                            Drop the image link in the field above
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                      Category
                    </label>
                    <div className="mt-2">
                      <Combobox value={category} onChange={handleSetCategory}>
                        <Float
                          as="div"
                          className="relative"
                          placement="bottom-start"
                          offset={4}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          floatingAs={Fragment}
                        >
                          <div
                            className={clsx(
                              'relative cursor-default overflow-hidden rounded-md border border-gray-200 bg-white text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-indigo-500 sm:text-sm w-full',
                            )}
                          >
                            <Combobox.Input
                              className={clsx(
                                'border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 placeholder:italic focus:ring-indigo-500 w-full',
                              )}
                              displayValue={(option) => option?.category}
                              onChange={(event) => setQuery(event.target.value)}
                              maxLength={100}
                              placeholder="Search or create a category"
                            />

                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <HiChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </Combobox.Button>
                          </div>

                          <Combobox.Options
                            className={clsx(
                              'absolute max-h-60 max-w-xl overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm w-full',
                            )}
                          >
                            {query.length > 0 && filteredOptions.length === 0 && (
                              <Combobox.Option
                                value={{ id: query, category: query }}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-4 pr-4 ${active
                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                    : 'text-gray-900'
                                  }`
                                }

                              >
                                Create &quot;{query}&quot; category
                              </Combobox.Option>
                            )}
                            {filteredOptions.map((option) => (
                              <Combobox.Option
                                key={option.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                    : 'text-gray-900'
                                  }`
                                }
                                value={option}
                              >
                                {({ selected, active }) => {
                                  return (
                                    <>
                                      <span className={`block  ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {option.category}
                                      </span>
                                      {selected && (
                                        <span
                                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'
                                            }`}
                                        >
                                          <HiCheck className="w-5 h-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )
                                }}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        </Float>
                      </Combobox>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                        Starting bid
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          id="price"
                          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="0.00"
                          aria-describedby="price-currency"
                          value={startingBid}
                          onChange={(e) => setStartingBid(e.target.value)}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm" id="price-currency">
                            USD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <div>
                      <div className="flex justify-between">
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                          Location
                        </label>
                        <span className="text-sm leading-6 text-gray-500" id="email-optional">
                          Optional
                        </span>
                      </div>
                      <div className="relative mt-2 overflow-hidden rounded-md shadow-sm">
                        <div ref={mapContainer} className="map-container h-[400px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end mt-6 gap-x-6">
              <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateListing
