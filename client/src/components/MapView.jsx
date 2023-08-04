import { useEffect, useRef } from 'react'
import api from '../utils/api'
import useSwr from 'swr'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const MapView = () => {
  useEffect(() => {
    document.body.classList.add('bg-gray-100')
    return () => {
      document.body.classList.remove('bg-gray-100')
    }
  }, [])

  const fetcher = async () => {
    const response = await api.get('/map_listings')
    return response.data
  }

  const { data = [], mutate } = useSwr(`/map_listings`, fetcher, {
    refreshInterval: undefined,
  })

  useEffect(() => {
    async function fetchNewData() {
      const newData = await fetcher()
      mutate(newData.data)
    }
    fetchNewData()
  }, [])

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current || !data.length) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 2
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    data.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;

      new mapboxgl.Marker()
        .setLngLat([listing.longitude, listing.latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeOnClick: true,
            closeButton: false,
            maxWidth: '142px',
            focusAfterOpen: false
          })
            .setLngLat([listing.longitude, listing.latitude])
            .setHTML(`
            <a href="/listing/${listing.id}" class="block group">
              <img src="${listing.imageUrl}" class="h-20 rounded aspect-video ring-0 transition-all duration-200 group-hover:ring-2 ring-offset-2 ring-blue-500">
              <div class="text-xs font-semibold mt-2 group-hover:underline">
                ${listing.title}
              </div>
              <div class="text-xs text-gray-500 w-full">
                ${listing.description.slice(0, 40)}${listing.description.length > 40 ? '...' : ''}
              </div>
            </a>
            `)
        )
        .addTo(map.current)
        .togglePopup();
    });
  }, [data]);

  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Map View
          </h1>
        </div>
      </header>
      <div className="px-4 py-2 mx-auto max-w-7xl sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto overflow-hidden bg-white shadow-sm max-w-7xl ring-1 ring-gray-900/5 sm:rounded-xl">
          <div ref={mapContainer} className="h-[800px]" />
        </div>
        <p className="px-2 my-4 text-sm leading-6 text-center text-gray-600">
          * These are the listings that are currently available on the map. Click on the marker to see more details. <strong>All the locations are approximate.</strong>
        </p>
      </div>
    </div>
  )
}

export default MapView
