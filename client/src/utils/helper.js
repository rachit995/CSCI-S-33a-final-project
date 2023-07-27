import { toast as rToast } from 'react-toastify';

export function isAuthenticated() {
  return !!localStorage.getItem("token")
}

export function toast(type, message) {
  return rToast[type](message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true
  });
}
