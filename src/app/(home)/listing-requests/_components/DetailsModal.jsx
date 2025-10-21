import { IMAGES } from "@/assets";
import DollarIcon from "@/assets/icons/Dollar";
import DoorIcon from "@/assets/icons/Door";
import LocationIcon from "@/assets/icons/Location";
import Image from "next/image";
import React, { useState } from "react";
import { CgClose } from "react-icons/cg";

const Popup = ({ onClose, img }) => {
  return (
    <div className="z-30 absolute justify-end flex top-10 right-10 bg-white">
      <div
        onClick={onClose}
        className="absolute bg-white rounded-full top-2 right-2"
      >
        <p className="text-2xl cursor-pointer p-1">
          <CgClose size={14} />{" "}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Image
          src={img}
          alt=""
          width={100}
          height={100}
          className="h-[24rem] w-[20rem]"
        />
      </div>
    </div>
  );
};

const DetailsModal = ({
  onclose,
  status,
  listing = null,
  updateStatus = null
}) => {
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    let date;
    if (dateString.toDate) {
      // Firestore timestamp
      date = dateString.toDate();
    } else {
      // String date
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!updateStatus || !listing) return;
    
    try {
      setUpdating(true);
      await updateStatus(listing.id, newStatus);
      onclose(); // Close modal after successful update
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  // If no listing data, show placeholder
  if (!listing) {
    return (
      <div className="z-20 absolute justify-end flex top-6 right-6 rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-4 w-[34rem]">
            <div className="flex justify-between py-3 px-6 border-b border-b-black/10">
              <p>Listing Details</p>
              <p className="text-2xl cursor-pointer p-1" onClick={onclose}>
                <CgClose size={14} />
              </p>
            </div>
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">No listing data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className=" z-20 absolute justify-end flex top-6 right-6 rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          {showImage && (
            <Popup
              onClose={() => {
                setShowImage(false);
              }}
              img={selectedImage}
            />
          )}
          <div className="flex flex-col gap-4 w-[34rem]">
            <div className="flex justify-between py-3 px-6 border-b border-b-black/10">
              <p>Listing Requests</p>
              <p className="text-2xl cursor-pointer p-1" onClick={onclose}>
                <CgClose size={14} />
              </p>
            </div>
              <div className="flex flex-col gap-2 px-6 text-sm">
                <div className="flex py-2 border-b border-b-black/20 items-center gap-4">
                  <div className="bg-primary rounded-full w-14 h-14 text-xs items-center text-white justify-center flex">
                    {listing.userId ? listing.userId.substring(0, 2).toUpperCase() : 'PO'}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-black">{listing.title || 'Property Owner'}</p>
                    <p>{listing.userId || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 py-4 border-b border-b-black/20 text-xs">
                  <div className="flex justify-between">
                    <div className="flex flex-col flex-1 gap-1">
                      <p className="text-black/50 font-semibold">Status</p>
                      <div className="flex">
                        <div
                          className={`py-[2px] px-3 gap-2 flex rounded-full items-center ${
                            listing.status?.toLowerCase() === "approved"
                              ? "bg-green-100 text-green-800"
                              : listing.status?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <div
                            className={`h-[6px] w-[6px] rounded-full ${
                              listing.status?.toLowerCase() === "approved"
                                ? "bg-green-500"
                                : listing.status?.toLowerCase() === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <p className="rounded-full">{listing.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <p className="text-black/50 font-semibold">Request Date</p>
                      <p className="">{formatDate(listing.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex flex-col flex-1 gap-1">
                      <p className="text-black/50 font-semibold">Property ID</p>
                      <p className="text-xs">{listing.id}</p>
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <p className="text-black/50 font-semibold">Last Updated</p>
                      <p>{formatDate(listing.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs">
                  <div className="">
                    <p className="font-semibold text-lg ">{listing.title}</p>
                  </div>
                  <div className="text-black/60 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <p className="px-2 py-1 bg-new-black/10 rounded-md">
                        <DoorIcon />
                      </p>
                      <p>{listing.description || 'No description available'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="px-2 py-1 bg-new-black/10 rounded-md">
                        <DollarIcon />
                      </p>
                      <p>${listing.price?.toLocaleString() || '0'} Asking</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="px-2 py-1 bg-new-black/10 rounded-md">
                        <LocationIcon color="black" />
                      </p>
                      <p>{listing.location || 'Location not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 py-4">
                  {listing.imageUrls && listing.imageUrls.length > 0 ? (
                    listing.imageUrls.slice(0, 3).map((imageUrl, index) => (
                      <Image
                        key={index}
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          setShowImage(true);
                        }}
                        alt={`Property image ${index + 1}`}
                        width={80}
                        height={80}
                        src={imageUrl}
                        className="object-cover rounded cursor-pointer hover:opacity-80"
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 bg-gray-200 rounded">
                      <p className="text-xs text-gray-500">No images</p>
                    </div>
                  )}
                </div>
              </div>
            {listing.status?.toLowerCase() == "pending" && (
              <div className="flex text-xs gap-2 py-2 px-6 justify-end border-t border-t-black/10">
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="px-6 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updating}
                  className="px-6 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Accept'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;
