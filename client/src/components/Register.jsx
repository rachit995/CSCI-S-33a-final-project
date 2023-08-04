import Logo from "./Logo"
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "./html/Input";
import api from "../utils/api";
import { useEffect, useState } from "react";
import { toast } from "../utils/helper";
import { BiLoaderAlt } from "react-icons/bi";

const Register = () => {
  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => {
    setSubmitLoading(true)
    api.post('/register', data)
      .then((res) => {
        toast('success', 'Account created successfully, redirecting to login')
        if (res.status === 200) {
          setTimeout(() => {
            return navigate('/login');
          }, 1000);
        }
      })
      .catch(err => {
        toast('error', err.response.data.error)
        setSubmitLoading(false)
      })
  };
  useEffect(() => {
    document.body.classList.remove('bg-gray-100')
    return () => {
      document.body.classList.add('bg-gray-100')
    }
  }, [])
  return (
    <div className="flex flex-col justify-center flex-1 min-h-full px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className='inline-flex justify-center w-full'>
          <Logo variant='dark' text={false} />
        </div>
        <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-center text-gray-900">
          Register for an Bidster account
        </h2>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            register={register}
            name="username"
            label="Username"
            id="username"
            type="text"
            autoComplete="username"
            required
            registerOptions={{ required: true, maxLength: 20 }}
            placeholder="Eg. john.doe"
            error={errors.username}
            disabled={submitLoading}
          />

          <Input
            register={register}
            name="email"
            label="Email address"
            id="email"
            type="email"
            autoComplete="email"
            required
            registerOptions={{ required: true, pattern: /^\S+@\S+$/i }}
            placeholder="Eg. john.doe@email.com"
            error={errors.email}
            disabled={submitLoading}
          />

          <Input
            register={register}
            name="password"
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            registerOptions={{
              required: true,
              minLength: {
                value: 8,
                message: "Password must have at least 8 characters"
              }
            }}
            placeholder="Eg. ********"
            error={errors.password}
            disabled={submitLoading}
          />

          <Input
            register={register}
            name="confirmPassword"
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            autoComplete="confirm-password"
            required
            placeholder="Eg. ********"
            registerOptions={{
              required: true,
              validate: value => value === watch('password') || "The passwords do not match"
            }}
            error={errors.confirmPassword}
            disabled={submitLoading}
          />

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40"
              disabled={submitLoading}
            >
              {
                submitLoading ? (
                  <BiLoaderAlt className="inline-block mr-2 animate-spin" />
                ) : null
              }
              <span>Register</span>
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
