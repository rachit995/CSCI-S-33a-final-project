import axios from "axios"
import camelCaseKeys from 'camelcase-keys'
import snakeCaseKeys from 'snakecase-keys'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  // getting token from local storage
  const token = localStorage.getItem("token")
  const newConfig = { ...config }
  // if token exists, add it to the header as x-auth-token
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  // convert params and data to snake_case for python
  if (config.params) {
    newConfig.params = snakeCaseKeys(config.params, { deep: true })
  }
  // convert params and data to snake_case for python
  if (config.data) {
    newConfig.data = snakeCaseKeys(config.data, { deep: true })
  }
  return newConfig
})

api.interceptors.response.use((response) => {
  const newResponse = { ...response }
  // convert response data to camelCase coming from python snake_case
  if (response.data && response.headers['content-type'].includes('application/json')) {
    newResponse.data = camelCaseKeys(response.data, { deep: true })
  }
  return newResponse
})

export default api

