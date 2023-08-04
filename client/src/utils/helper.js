import { toast as rToast } from 'react-toastify';

export function isAuthenticated() {
  return !!localStorage.getItem("token")
}

export function getUserId() {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user).id : null
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

/**
 * @param {string} url
 * @returns {string} url
 * @description This function will return the image url if the image is loaded successfully else it will return a placeholder image url
 */
export function getImgUrlSync(url) {
  const img = new Image();
  img.src = url;
  if (img.complete) {
    return url;
  }
  return "https://placehold.co/600x400?text=Bidster";
}
