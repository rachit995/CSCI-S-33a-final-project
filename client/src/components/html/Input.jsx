import clsx from 'clsx'
import PropTypes from 'prop-types';
import { HiExclamationCircle } from 'react-icons/hi';

const Input = (props) => {
  const { register, label, id, type, autoComplete, required, className, name, registerOptions, placeholder, error } = props
  return (
    <div>
      <div className="">
        <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
          {label}
        </label>
      </div>
      <div className="relative mt-2 rounded-md shadow-sm">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className={clsx(
            "block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", className, {
            "text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500": error
          })}
          {...register(name, registerOptions)}
        />
        {error ? (<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <HiExclamationCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
        </div>) : null}
      </div>
      {error ? (<p className="mt-2 text-sm text-red-600" id="email-error">
        {error.message}
      </p>) : null}
    </div>
  )
}

Input.propTypes = {
  register: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  autoComplete: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  registerOptions: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
}

export default Input

