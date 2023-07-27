import React from 'react'
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

const Alert = (props) => {
  const { text, type } = props
  if (type == 'success') {
    return (
      <div className="p-4 rounded-md bg-green-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <HiCheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              {text}
            </p>
          </div>
        </div>
      </div>
    )
  }
  if (type == 'error') {
    return (
      <div className="p-4 rounded-md bg-red-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <HiExclamationCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">
              {text}
            </p>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default Alert
