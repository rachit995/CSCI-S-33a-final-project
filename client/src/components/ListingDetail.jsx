import { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import clsx from "clsx";
import { HiChevronLeft, HiChevronRight, HiHeart, HiOutlineEmojiSad, HiPencil, HiReply, HiX } from "react-icons/hi";
import { PiGavel } from "react-icons/pi";
import { FaAward } from "react-icons/fa";
import { IoMdAlarm } from "react-icons/io";
import api from "../utils/api";
import { useParams } from "react-router-dom";
import StarRating from "react-star-ratings";
import {
  getUserId,
  isAuthenticated,
  toast,
} from "../utils/helper";
import moment from "moment";
import useSwr from 'swr'
import { NumericFormat } from 'react-number-format';
import avatar from "../assets/default-avatar.png";
import _ from "lodash";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'
import Image from "rc-image";
import PropTypes from 'prop-types'

const ListingDetail = () => {
  let { id } = useParams();
  const userId = getUserId();
  const [bid, setBid] = useState(0);
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const { page, limit } = params

  const commentFetcher = async () => {
    const response = await api.get(`/listings/${id}/comments`, {
      params: { page, limit }
    })
    return response.data
  }

  const listingFetcher = async () => {
    const response = await api.get(`/listings/${id}`)
    return response.data
  }

  const {
    data: {
      count,
      numPages,
      results: comments = []
    } = {
      count: 0,
      numPages: 0,
      results: []
    },
    mutate: mutateComments,
  } = useSwr(`/listings/${id}/comments`, commentFetcher, {
    refreshInterval: undefined,
  })

  const {
    data: item = {},
    mutate: mutateListing
  } = useSwr(`/listings/${id}`, listingFetcher, {
    refreshInterval: undefined,
  })

  const fetchComments = useCallback(() => {
    async function fetchNewData() {
      const newData = await commentFetcher()
      mutateComments(newData.data)
    }
    fetchNewData()
  }, [id])

  const fetchListing = useCallback(() => {
    async function fetchNewData() {
      const newData = await listingFetcher()
      mutateListing(newData.data)
    }
    fetchNewData()
  }, [id])

  useEffect(() => {
    fetchListing()
  }, [id])

  useEffect(() => {
    fetchComments()
  }, [id, page, limit])

  useEffect(() => {
    if (item?.currentBid) {
      setBid(item.currentBid + 1);
    }
  }, [item]);

  const handleRating = (rate) => {
    if (!item?.userRating) {
      api
        .post(`/listings/${id}/ratings`, { rating: rate })
        .then(() => {
          fetchListing()
          fetchComments()
          toast("success", "Rating added successfully");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const toggleWatchlist = () => {
    api
      .post(`/listings/${id}/watch`)
      .then(() => {
        fetchListing()
        toast("success", "Listing added to watchlist");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const isOwner = item.isOwner;
  const isWinner = item.winnerId === userId;

  function bidFormSubmit(e) {
    e.preventDefault();
    api
      .post(`/listings/${id}/bids`, { bid })
      .then(() => {
        fetchListing()
        toast("success", "Bid placed successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function closeListing(e) {
    e.preventDefault();
    api
      .post(`/listings/${id}/close`)
      .then(() => {
        fetchListing()
        toast("success", "Listing closed successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const image = item.imageUrl

  function renderPages() {
    const currentPageIndex = page
    return _.range(1, numPages + 1)?.map((p, index) => {
      const pId = p
      const element = (
        <button
          key={pId}
          onClick={(e) => {
            e.preventDefault()
            setParams((prevParams) => {
              return {
                ...prevParams,
                page: pId,
              }
            })
          }}
          aria-current="page"
          className={`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium transition-all duration-150 ease-in-out focus:z-20 ${currentPageIndex === pId
            ? 'border-indigo-500 bg-indigo-600 font-bold text-white hover:bg-indigo-500'
            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          {index + 1}
        </button>
      )
      if (
        index === 0 ||
        numPages - 1 === index ||
        (currentPageIndex - 3 < index && currentPageIndex + 3 > index)
      ) {
        return element
      }
      if (currentPageIndex - 3 === index || currentPageIndex + 3 === index) {
        return (
          <span
            key={pId}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
            ...
          </span>
        )
      }
      return ''
    })
  }
  const mapContainer = useRef(null);
  const map = useRef(null);

  const lng = item?.longitude
  const lat = item?.latitude
  useEffect(() => {
    if (map.current || !lng || !lat) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 4
    });
    new mapboxgl.Marker({
      draggable: false
    })
      .setLngLat([lng, lat])
      .addTo(map.current);
  }, [lng, lat]);

  return (
    <div className="bg-white">
      <div className="max-w-2xl px-4 pb-16 mx-auto sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between w-full pt-10 pb-8">
          <div></div>
          {isOwner ? (
            <a
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              href={`/listing/${id}/edit`}
            >
              <HiPencil className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Edit listing
            </a>
          ) : null}
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <div className="flex flex-col-reverse">
            <div className="w-full aspect-h-1 aspect-w-1">
              <Image
                src={image}
                alt={item.title}
                className="object-cover object-center w-full h-full sm:rounded-lg"
                fallback='https://placehold.co/600x350?text=Bidster'
              />
            </div>
          </div>
          <div className="px-4 mt-10 sm:mt-16 sm:px-0 lg:mt-0">
            <div className="inline-flex items-start justify-between w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {item?.title}
              </h1>
              <div>
                <button
                  type="button"
                  className={clsx(
                    "flex items-center justify-center px-3 py-3 ml-4 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500",
                    {
                      "text-red-500 hover:bg-red-100 hover:text-red-600":
                        item?.isWatched,
                    }
                  )}
                  onClick={toggleWatchlist}
                >
                  <HiHeart
                    className="flex-shrink-0 w-6 h-6"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Add to watchlist</span>
                </button>
              </div>
            </div>

            <div className="mt-3">
              <h2 className="sr-only">Current Bid</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                <NumericFormat value={item?.currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
              </p>
            </div>
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div
                className={clsx({
                  "pointer-events-none": item?.userRating,
                })}
              >
                <StarRating
                  name={item?.title}
                  rating={item?.rating}
                  changeRating={handleRating}
                  starDimension="24px"
                  starRatedColor="#FDCC0D"
                  starHoverColor="#FDCC0D"
                  starSpacing="2px"
                />
              </div>
            </div>
            <div className="flex mt-4 space-x-4 text-sm text-gray-500">
              <div className="flex-none py-4">
                <img
                  src={avatar}
                  alt=""
                  className="w-10 h-10 bg-gray-100 rounded-full"
                />
              </div>
              <div
                className={clsx(
                  "flex-1 pt-4"
                )}
              >
                <div className="">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {item.username}
                    </h3>
                    <p>
                      <time dateTime={item.createdAt}>
                        {moment(item.createdAt).fromNow()}
                      </time>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="sr-only">Description</h3>
              <div
                className="space-y-6 text-base text-gray-700"
                dangerouslySetInnerHTML={{ __html: item?.description }}
              />
            </div>
            {isAuthenticated() ? (
              <>
                {/* Check if the user is the owner of the listing and the listing is active */}
                {isOwner && item?.active ? (
                  <div className="p-4 my-6 rounded-md bg-yellow-50">
                    <div className="grid items-center sm:space-x-2 sm:flex">
                      <div className="">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Current highest bid is{' '}
                          <NumericFormat value={item?.currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            {item?.totalBids} bid(s) so far. Close the listing
                            to sell the item to the highest bidder.
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="inline-flex mt-4 sm:mt-0 w-32 justify-center items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                          onClick={closeListing}
                        >
                          <IoMdAlarm
                            className="-ml-0.5 h-5 w-5"
                            aria-hidden="true"
                          />
                          Close listing
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
                {/* Check if the user is the owner of the listing and the listing is closed or the user is not the owner of the listing and the listing is closed */}
                {(isOwner && !item?.active) || (!isOwner && !item?.active) ?
                  item?.winnerId ?
                    (
                      <div className="p-4 my-6 rounded-md bg-green-50">
                        <div className="grid items-center sm:space-x-4 sm:flex">
                          <div>
                            <FaAward className="w-6 h-6 text-green-800" />
                          </div>
                          <div className="">
                            <h3 className="text-sm font-medium text-green-800">
                              This listing is closed.
                            </h3>
                            <div className="mt-1 text-sm text-green-700">
                              <p>
                                The item is sold to{" "}<strong>
                                  {item?.winnerId === userId
                                    ? "you"
                                    : item?.winnerName}{" "}</strong>
                                for <strong>
                                  <NumericFormat value={item?.currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                </strong>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 my-6 rounded-md bg-yellow-50">
                        <div className="grid items-center sm:space-x-4 sm:flex">
                          <div>
                            <HiOutlineEmojiSad className="w-6 h-6 text-yellow-800" />
                          </div>
                          <div className="">
                            <h3 className="text-sm font-medium text-yellow-800">
                              This listing is closed.
                            </h3>
                            <div className="mt-1 text-sm text-yellow-700">
                              <p>There is no winner for this listing.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  : null}
                {/* Check if the user is not the owner of the listing and the listing is active */}
                {!isOwner && item?.active ? (
                  <form className="mt-6" onSubmit={bidFormSubmit}>
                    <div className="grid items-end w-full mt-10 sm:space-x-2 sm:flex ">
                      <div className="w-full">
                        <label
                          htmlFor="bid"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          {item?.totalBids
                            ? `${item?.totalBids} bid(s) so far.`
                            : ""}{" "}
                          Place new bid at:
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="bid"
                            id="bid"
                            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="0.00"
                            min={item?.currentBid + 1}
                            value={bid}
                            onChange={(e) => setBid(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span
                              className="text-gray-500 sm:text-sm"
                              id="price-currency"
                            >
                              USD
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center w-full px-4 py-2 mt-4 space-x-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm sm:w-40 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        disabled={item?.isClosed}
                      >
                        <PiGavel
                          className="-ml-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                        <span>Place bid</span>
                      </button>
                    </div>
                  </form>
                ) : null}
              </>
            ) : (
              <div className="p-4 my-6 rounded-md bg-yellow-50">
                <div className="grid items-center sm:space-x-2 sm:flex">
                  <div className="">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Current highest bid is{' '}
                      <NumericFormat value={item?.currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Login to place a bid.
                      </p>
                    </div>
                  </div>
                  <div>
                    <a
                      type="button"
                      className="inline-flex mt-4 sm:mt-0 w-32 justify-center items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      href="/login"
                    >
                      <IoMdAlarm
                        className="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Login
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {item.latitude && item.longitude ? (<div className="px-4">
          <h2 className="mt-6 mb-2 text-2xl font-bold tracking-tight text-gray-900">
            Location
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            {
              isWinner
                ? 'This is location is accurate. Contact the seller for pickup.'
                : 'This is location is approximate. The actual location will be disclosed to the winner of the listing.'
            }
          </p>
          <div className="relative mt-2 overflow-hidden rounded-md shadow-sm">
            <div ref={mapContainer} className="map-container h-[400px]" />
          </div>
        </div>) : null}
        <div className="px-4 my-10">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
            Comments {comments.length ? `(${comments.length})` : null}
          </h2>
          <div className="flex items-start my-10 space-x-4">
            <div className="flex-shrink-0">
              <img
                className="inline-block w-10 h-10 rounded-full"
                src={avatar}
                alt=""
              />
            </div>
            <AddComment listingId={id} fetchComments={fetchComments} />
          </div>
          <div className="bg-white">
            <div>
              <div className="">
                {comments.map((comment, reviewIdx) => (
                  <Comment key={comment.id} comment={comment} reviewIdx={reviewIdx} fetchComments={fetchComments} listingId={id} winnerId={item.winnerId} />
                ))}
              </div>
              {numPages > 1 && (
                <div className="inline-flex items-center justify-between w-full my-6 space-x-4">
                  <div className="text-sm text-gray-500">
                    Showing{' '}
                    <span className="font-semibold">
                      {page === 1 ? page : (page - 1) * limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold">
                      {comments.length < limit ? count : limit * page}
                    </span>{' '}
                    of <span className="font-semibold">{count}</span> comments
                  </div>
                  <div>
                    <nav
                      className="inline-flex -space-x-px rounded-md shadow-sm isolate"
                      aria-label="Pagination"
                    >
                      <button
                        className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-20"
                        onClick={() => {
                          if (page - 1 > 0) {
                            setParams((prevParams) => {
                              return {
                                ...prevParams,
                                page: prevParams.page - 1,
                              }
                            })
                          }
                        }}
                      >
                        <span className="sr-only">Previous</span>
                        <HiChevronLeft className="w-5 h-5" />
                      </button>
                      {renderPages()}
                      <button
                        className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-20"
                        onClick={() => {
                          if (page + 1 <= numPages) {
                            setParams((prevParams) => {
                              return {
                                ...prevParams,
                                page: prevParams.page + 1,
                              }
                            })
                          }
                        }}
                      >
                        <span className="sr-only">Next</span>
                        <HiChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AddComment(props) {
  const { listingId, fetchComments, parentCommentId = null, callback = null } = props
  const [commentInput, setCommentInput] = useState("");
  function commentFormSubmit(e) {
    e.preventDefault();
    api
      .post(`/listings/${listingId}/comments`, {
        comment: commentInput,
        parentCommentId
      })
      .then(() => {
        setCommentInput("");
        fetchComments()
        toast("success", "Comment added successfully");
        if (callback) {
          callback()
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <div className="flex-1 min-w-0">
      <form className="relative" onSubmit={commentFormSubmit}>
        <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
          <label htmlFor="comment" className="sr-only">
            Add your comment
          </label>
          <textarea
            rows={3}
            name="comment"
            id="comment"
            className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Add your comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <div className="py-2" aria-hidden="true">
            <div className="py-px">
              <div className="h-9" />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

AddComment.propTypes = {
  listingId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  fetchComments: PropTypes.func.isRequired,
  parentCommentId: PropTypes.number,
  callback: PropTypes.func,
}


function Comment(props) {
  const { comment, reviewIdx, fetchComments, listingId, winnerId } = props
  const [showNewReply, setShowNewReply] = useState(false)

  return (
    <>
      <div
        key={comment.id}
        className="flex space-x-4 text-sm text-gray-500"
      >
        <div className="flex-none py-4">
          <img
            src={avatar}
            alt=""
            className="w-10 h-10 bg-gray-100 rounded-full"
          />
        </div>
        <div
          className={clsx(
            reviewIdx === 0 ? "" : "border-t border-gray-200",
            "flex-1 pt-4"
          )}
        >
          <div className="inline-flex items-center justify-between w-full">
            <div>
              <div className="inline-flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">
                  {comment.name}
                </h3>
                {winnerId === comment?.user ? (
                  <span className="items-center hidden px-2 py-1 text-xs font-medium text-green-700 rounded-md sm:inline-flex bg-green-50 ring-1 ring-inset ring-green-600/20">
                    Winner
                  </span>
                ) : null}
              </div>
              <p>
                <time dateTime={comment.createdAt}>
                  {moment(comment.createdAt).fromNow()}
                </time>
              </p>
            </div>
            <div className="inline-flex items-center space-x-4">
              {comment?.rating ? (
                <div className="items-center hidden sm:flex">
                  <StarRating
                    name={comment?.name}
                    rating={comment?.rating}
                    starDimension="16px"
                    starRatedColor="#FDCC0D"
                    starHoverColor="#FDCC0D"
                    starSpacing="2px"
                  />
                </div>
              ) : null}
              {
                showNewReply ? (
                  <button
                    type="button"
                    className="inline-flex items-center px-2 py-1 space-x-1 text-sm font-semibold text-red-600 rounded shadow-sm bg-red-50 hover:bg-red-100"
                    onClick={() => setShowNewReply(!showNewReply)}
                  >
                    <HiX className="w-4 h-4" aria-hidden="true" />
                    <span>
                      Close
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center px-2 py-1 space-x-1 text-sm font-semibold text-indigo-600 rounded shadow-sm bg-indigo-50 hover:bg-indigo-100"
                    onClick={() => setShowNewReply(!showNewReply)}
                  >
                    <HiReply className="w-4 h-4" aria-hidden="true" />
                    <span>
                      Reply
                    </span>
                  </button>
                )
              }
            </div>
          </div>
          <div
            className="py-4 prose-sm prose text-gray-500 max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.comment }}
          />
          {showNewReply ? (
            <div className="my-4">
              <AddComment
                listingId={listingId}
                fetchComments={fetchComments}
                parentCommentId={comment.id}
                callback={() => setShowNewReply(false)}
              />
            </div>
          ) : null}
          <div className="hidden sm:block">
            {comment?.replies?.map((reply, replyIdx) => (
              <div key={reply.id} className={clsx("pt-4", {
                "border-t border-gray-200": replyIdx === 0
              })}>
                <Comment comment={reply} reviewIdx={replyIdx} fetchComments={fetchComments} listingId={listingId} winnerId={winnerId} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-col sm:hidden">
        {comment?.replies?.map((reply, replyIdx) => (
          <div key={reply.id} className={clsx("pt-4", {
            "border-t border-gray-200": replyIdx === 0
          })}>
            <Comment comment={reply} reviewIdx={replyIdx} fetchComments={fetchComments} listingId={listingId} winnerId={winnerId} />
          </div>
        ))}
      </div>
    </>
  )
}

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  reviewIdx: PropTypes.number.isRequired,
  fetchComments: PropTypes.func.isRequired,
  listingId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  winnerId: PropTypes.number,
}


export default ListingDetail;
