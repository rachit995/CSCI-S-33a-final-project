import { HiCamera, HiCheck, HiChevronDown, HiSearch } from "react-icons/hi"
import { ImMagicWand } from "react-icons/im"
import { Fragment, useEffect, useRef, useState } from "react";
import api from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "../utils/helper";
import clsx from "clsx";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'
import { Float } from '@headlessui-float/react'
import { Combobox } from '@headlessui/react'
import _ from "lodash";
import PropTypes from 'prop-types'
import Image from "rc-image";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const AddEditListing = (props) => {
  const { mode } = props
  const { id } = useParams()
  const navigate = useNavigate();
  const [categories, setCategories] = useState([])
  const isEdit = mode === 'edit'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState({
    id: '',
    category: ''
  })
  const [startingBid, setStartingBid] = useState('')
  const [locationUpdated, setLocationUpdated] = useState(false)
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);

  const mapContainer = useRef(null);
  const map = useRef(null);
  let marker = useRef(null);

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
      zoom: 4
    });
    marker.current = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.current.on('dragend', handleDragEnd);
  }, [lng, lat]);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data)
      })
      .catch(err => {
        console.log(err)
      })
    if (isEdit && id) {
      api.get(`/listings/${id}`)
        .then(res => {
          const { title, description, imageUrl, category, startingBid, categoryName, isOwner, latitude, longitude } = res.data
          if (!isOwner) {
            navigate(`/listing/${id}`)
          }
          setTitle(title)
          setDescription(description)
          setImage(imageUrl)
          setCategory({
            id: category,
            category: categoryName
          })
          setStartingBid(startingBid)
          setLng(longitude)
          setLat(latitude)
          marker.current.setLngLat([longitude, latitude])
          map.current.setCenter([longitude, latitude])
        })
    }
  }, [])

  useEffect(() => {
    document.body.classList.add('bg-gray-100')
    return () => {
      document.body.classList.remove('bg-gray-100')
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    if (category.id === '') {
      return toast('error', 'Please select a category')
    }
    if (isEdit) {
      api.put(`/listings/${id}`, {
        title,
        description,
        imageUrl: image,
        category: category.id,
        startingBid,
        longitude: locationUpdated ? lng : null,
        latitude: locationUpdated ? lat : null
      }).then(res => {
        if (res.status === 201) {
          toast('success', 'Listing updated successfully')
          navigate('/listing')
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
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
    }

  };

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

  const [isGenerating, setIsGenerating] = useState(false)
  function generateDescription(e) {
    e.preventDefault()
    setIsGenerating(true)
    if (!title) {
      setIsGenerating(false)
      return toast('error', 'Please enter some details in the title to generate description')
    }
    api.post('/ai/generate_description', { title })
      .then(res => {
        if (res.status === 200) {
          setDescription(res.data.description)
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        setIsGenerating(false)
      })
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isEdit ? 'Edit Listing' : 'Create Listing'}
          </h1>
        </div>
      </header>
      <div className="px-4 py-2 mx-auto max-w-7xl sm:px-6 sm:py-10 lg:px-8">
        <div className="max-w-2xl px-10 pt-1 pb-8 mx-auto bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
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
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:pointer-events-none"
                          placeholder="Eg. 2019 MacBook Pro 16"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          disabled={isGenerating}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <div className="flex justify-between">
                      <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                        Description
                      </label>
                      <button
                        type="button"
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 inline-flex items-center space-x-1 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={generateDescription}
                        disabled={isGenerating}
                      >
                        {
                          isGenerating ? (
                            <svg className="w-3 h-3 -ml-1 text-gray-900 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <ImMagicWand aria-hidden="true" />
                          )
                        }
                        <span>
                          {
                            isGenerating ? 'Generating' : 'Generate'
                          } Description
                        </span>
                      </button>
                    </div>
                    <div className="mt-2">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:pointer-events-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Eg. 3 months old, no scratches, comes with charger and box"
                        disabled={isGenerating}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">Write a few sentences about the listing.</p>
                  </div>

                  <div className="col-span-full">
                    <div className="flex justify-between">
                      <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
                        Image
                      </label>
                    </div>

                    <div className="mt-2">
                      <div className="relative flex items-stretch flex-grow focus-within:z-10">
                        <input
                          type="text"
                          name="image"
                          id="image"
                          autoComplete="image"
                          className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Paste image link here or type keywords to search for images"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          onClick={() => {
                            alert('Now the image will be opened in a new tab. You can copy the image link from there and paste it in the image field.')
                            window.open(`https://source.unsplash.com/random/900x700/?${image}`, '_blank')
                          }}
                        >
                          <HiSearch className="w-5 h-5 text-white-400" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-full">
                    {image ? (
                      <Image
                        src={image}
                        alt={title}
                        className="object-cover w-full h-64 rounded-md shadow-sm"
                        fallback={`https://placehold.co/600x350?text=${title}`}
                      />
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
                              maxLength={40}
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
                          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:pointer-events-none"
                          placeholder="0.00"
                          aria-describedby="price-currency"
                          value={startingBid}
                          onChange={(e) => setStartingBid(e.target.value)}
                          required
                          disabled={isEdit}
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
                        <div ref={mapContainer} className="h-[300px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end mt-6 gap-x-6">
              <a
                className="text-sm font-semibold leading-6 text-gray-900"
                href={isEdit ? `/listing/${id}` : '/listing'}
              >
                Cancel
              </a>
              <button
                type="submit"
                className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isEdit ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

AddEditListing.defaultProps = {
  mode: 'create'
}

AddEditListing.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit'])
}

export default AddEditListing
