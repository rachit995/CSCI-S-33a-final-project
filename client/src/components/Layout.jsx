import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { HiX } from 'react-icons/hi'
import { GiHamburgerMenu } from 'react-icons/gi'
import Logo from './Logo'
import avatar from '../assets/default-avatar.png'
import { isAuthenticated } from '../utils/helper'
import { NavLink } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl: avatar,
}


const userNavigation = [
  { name: 'Sign out', href: '#' },
]


const Layout = (props) => {
  const { children } = props

  const navigation = [
    { name: 'Login', href: '/login', current: false, visible: !isAuthenticated() },
    { name: 'Register', href: '/register', current: false, visible: !isAuthenticated() },
    {
      name: 'Listings',
      href: '/listing',
      current: false,
      visible: isAuthenticated()
    },
    { name: 'Create Listing', href: '/create-listing', current: false, visible: isAuthenticated() },
    { name: 'Watchlist', href: '/watchlist', current: false, visible: isAuthenticated() },
    { name: 'Categories', href: '/category', current: false, visible: isAuthenticated() },
    { name: 'Map View', href: '/map-view', current: false, visible: isAuthenticated() },
  ]
  const filteredNavigation = navigation.filter(item => item.visible)
  const userNavigation = [
    {
      name: 'Sign out', onClick: (e) => {
        e.preventDefault()
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    },
  ]
  return (
    <>
      <ToastContainer />
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <a href="/" className="inline-flex items-center flex-shrink-0 space-x-2">
                      <Logo className="w-8 h-8 text-white" />
                      <span className="ml-4 text-xl font-bold tracking-tight text-white">Bidster</span>
                    </a>
                    <div className="hidden md:block">
                      <div className="flex items-baseline ml-10 space-x-4">
                        {filteredNavigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) => clsx(
                              isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'px-3 py-2 text-sm font-medium rounded-md'

                            )}
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center ml-4 md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex items-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <img className="w-8 h-8 rounded-full" src={user.imageUrl} alt="" />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    href={item.href}
                                    onClick={item.onClick}
                                    className={clsx(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="flex -mr-2 md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <HiX className="block w-6 h-6" aria-hidden="true" />
                      ) : (
                        <GiHamburgerMenu className="block w-6 h-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {filteredNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={clsx(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block rounded-md px-3 py-2 text-base font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img className="w-10 h-10 rounded-full" src={avatar} alt="" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">{user.name}</div>
                      <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="px-2 mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        onClick={item.onClick}
                        className="block px-3 py-2 text-base font-medium text-gray-400 rounded-md hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <main>
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout
