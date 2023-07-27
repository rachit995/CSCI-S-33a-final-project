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
  const token = localStorage.getItem("token")
  const newConfig = { ...config }
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  if (config.params) {
    newConfig.params = snakeCaseKeys(config.params, { deep: true })
  }
  if (config.data) {
    newConfig.data = snakeCaseKeys(config.data, { deep: true })
  }
  return newConfig
})

api.interceptors.response.use((response) => {
  const newResponse = { ...response }
  if (response.data && response.headers['content-type'].includes('application/json')) {
    newResponse.data = camelCaseKeys(response.data, { deep: true })
  }
  return newResponse
})

export default api

