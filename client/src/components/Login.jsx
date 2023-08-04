import Logo from './Logo'
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from './html/Input';
import api from '../utils/api';
import { toast } from '../utils/helper';
import { BiLoaderAlt } from 'react-icons/bi';

const Login = () => {
  useEffect(() => {
    document.body.classList.remove('bg-gray-100')
    return () => {
      document.body.classList.add('bg-gray-100')
    }
  }, [])
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitLoading, setSubmitLoading] = useState(false)
  const onSubmit = data => {
    setSubmitLoading(true)
    api.post('/token', data)
      .then((res) => {
        toast('success', 'Logged in successfully, redirecting to home')
        if (res.status === 200 && res.data.token) {
          localStorage.setItem('token', res.data.token)
          api.get('/me')
            .then(res => {
              if (res.status === 200) {
                localStorage.setItem('user', JSON.stringify(res.data))
              }
            })
            .catch(err => {
              console.log(err)
            })
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      })
      .catch(err => {
        toast('error', err.response.data.error || 'Wrong username or password')
        setSubmitLoading(false)
      })
  };
  return (
    <div className="flex flex-col justify-center flex-1 min-h-full px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className='inline-flex justify-center w-full'>
          <Logo variant='dark' text={false} />
        </div>
        <h2 className="mt-4 mb-2 text-2xl font-bold leading-9 tracking-tight text-center text-gray-900">
          Sign in to your Bidster account
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
            registerOptions={{ required: true }}
            placeholder="Eg. john.doe"
            error={errors.username}
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
            }}
            placeholder="Eg. ••••••••"
            error={errors.password}
            disabled={submitLoading}
          />

          <div>
            <button
              type="submit"
              className="w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 inline-flex items-center disabled:opacity-40"
              disabled={submitLoading}
            >
              {
                submitLoading ? (
                  <BiLoaderAlt className="inline-block mr-2 animate-spin" />
                ) : null
              }
              <span>Sign in</span>
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center text-gray-500">
          Not a member?{' '}
          <a href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
