import React, { useEffect } from 'react'
import api from '../utils/api'
import { debounce } from 'lodash'
import useSwr from 'swr'
import ListingsList from './ListingList'

const Watchlist = () => {
  const [filter, setFilter] = React.useState('active')
  const [query, setQuery] = React.useState('')
  const [params, setParams] = React.useState({ page: 1, limit: 8 })
  const { page, limit } = params
  const fetcher = async () => {
    const response = await api.get('/watchlist', {
      params: {
        filter,
        query,
        page,
        limit,
      },
    })
    return response.data
  }

  const { data: {
    count,
    numPages,
    results: listings
  } = {
      count: 0,
      numPages: 0,
      results: []
    }, mutate } = useSwr(`/watchlist`, fetcher, {
      refreshInterval: undefined,
    })

  const handleSearchChange = debounce((event) => {
    setQuery(event.target.value)
  }, 500)

  useEffect(() => {
    async function fetchNewData() {
      const newData = await fetcher()
      mutate(newData.data)
    }
    fetchNewData()
  }, [query, filter, page, limit])

  let title = 'Watchlist'

  return (
    <ListingsList
      title={title}
      listings={listings}
      count={count}
      numPages={numPages}
      page={page}
      limit={limit}
      setParams={setParams}
      handleSearchChange={handleSearchChange}
      filter={filter}
      setFilter={setFilter}
      filterOptions={['all', 'active', 'closed', 'winner']}
    />
  )
}

export default Watchlist
