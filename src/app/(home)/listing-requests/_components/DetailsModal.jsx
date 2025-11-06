import { IMAGES } from "@/assets";
import DollarIcon from "@/assets/icons/Dollar";
import DoorIcon from "@/assets/icons/Door";
import LocationIcon from "@/assets/icons/Location";
import Image from "next/image";
import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import Swal from "sweetalert2";
import { useUserData } from "@/hooks/useUserData";

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
        {img && img !== "" ? (
          <Image
            src={img}
            alt=""
            width={100}
            height={100}
            className="h-[24rem] w-[20rem]"
          />
        ) : (
          <div className="rounded-lg object-cover w-full h-24 bg-gray-200 flex items-center justify-center">
            <p>No image</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailsModal = ({ onclose, status, listing }) => {
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  
  // Fetch user data for the requester
  const { userData, loading: userLoading } = useUserData(listing?.userId);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleStatusChange = async (newStatus) => {
    if (!listing?.id) return;

    // Close the dialog first
    onclose();

    const actionText = newStatus === "approved" ? "approve" : "reject";
    const actionColor = newStatus === "approved" ? "#10b981" : "#ef4444";

    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this listing?`,
      text: `"${listing.title}" will be ${actionText}d and moved to the ${newStatus} section.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${actionText} it!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // Show loading state
        Swal.fire({
          title: `${
            actionText.charAt(0).toUpperCase() + actionText.slice(1)
          }ing...`,
          text: "Please wait while we update the listing status.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(`/api/listings/${listing.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to update listing status");
        }

        const result = await response.json();

        // Show success message
        Swal.fire({
          title: "Success!",
          text: `Listing has been ${actionText}d successfully.`,
          icon: "success",
          confirmButtonColor: actionColor,
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (error) {
        console.error("Error updating listing status:", error);

        // Show error message
        Swal.fire({
          title: "Error!",
          text: "Failed to update listing status. Please try again.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  return (
    <>
      {showImage && (
        <Popup
          onClose={() => {
            setShowImage(false);
          }}
          img={selectedImage}
        />
      )}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2 px-6 text-sm">
          {/* Requester Information */}
          <div className="flex py-4 border-b border-b-black/20 items-center gap-4">
            {userLoading ? (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="h-14 w-14 rounded-full overflow-hidden">
                  {userData?.imageUrl ? (
                    <img
                      src={userData.imageUrl}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={IMAGES.avatar}
                      alt="avatar"
                      height={51}
                      width={51}
                      className="h-14 w-14 rounded-full"
                    />
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-black text-lg">
                    {userData?.name || "Unknown User"}
                  </p>
                  <p className="text-gray-600">{userData?.email || "No email provided"}</p>
                </div>
              </>
            )}
          </div>
          
          {/* Contact and Request Status */}
          <div className="flex gap-8 py-4 border-b border-b-black/20 text-xs">
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-black/50 font-semibold">Phone</p>
                <p className="text-black">{userData?.phone || listing?.phone || "N/A"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-black/50 font-semibold">Status</p>
                <div className="flex">
                  <div
                    className={`py-[2px] px-3 gap-2 flex rounded-full items-center w-fit ${
                      status == "Approved"
                        ? "bg-green-100 text-green-700"
                        : status == "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    } `}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        status == "Approved"
                          ? "bg-green-600"
                          : status == "Pending"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                    />
                    <p className="rounded-full">{status}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-black/50 font-semibold">Request Date</p>
                <p className="text-black">{formatDate(listing?.createdAt)}</p>
              </div>
              {status === "Approved" && (
                <div className="flex flex-col gap-1">
                  <p className="text-black/50 font-semibold">Approved On</p>
                  <p className="text-black">{formatDate(listing?.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Listing Details */}
          <div className="text-xs py-4">
            <div className="mb-3">
              <p className="font-bold text-lg text-black">
                {listing?.title || "Property Details"}
              </p>
            </div>
            <div className="text-black/60 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <DoorIcon />
                </div>
                <p>{listing?.description || "No description available"}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <DollarIcon />
                </div>
                <p>{formatPrice(listing?.price)} Asking</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <LocationIcon color="black" />
                </div>
                <p>{listing?.location || "Location not specified"}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <DoorIcon />
                </div>
                <p>Bedrooms: {listing?.bedCount || 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <DoorIcon />
                </div>
                <p>Bathrooms: {listing?.bathCount || 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <DoorIcon />
                </div>
                <p>Area: {listing?.area ? `${listing.area.toLocaleString()} sq ft` : "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-black/10 rounded-md">
                  <DoorIcon />
                </div>
                <p>Property Condition: {listing?.propertyCondition ? `${listing.propertyCondition}/10` : "N/A"}</p>
              </div>
            </div>
          </div>
          
          {/* Property Images */}
          <div className="flex gap-4 py-4">
            {listing?.imageUrls && listing.imageUrls.length > 0 ? (
              listing.imageUrls.slice(0, 3).map((imageUrl, index) => {
                if (
                  imageUrl !== "" &&
                  imageUrl !== null &&
                  imageUrl !== undefined
                ) {
                  return (
                    <Image
                      key={index}
                      onClick={() => {
                        setSelectedImage(imageUrl);
                        setShowImage(true);
                      }}
                      alt={`Property image ${index + 1}`}
                      width={100}
                      height={100}
                      src={imageUrl}
                      className="w-24 h-24 object-cover rounded cursor-pointer"
                    />
                  );
                }
                return (
                  <div key={index} className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <p className="text-xs text-gray-500">No image</p>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-sm">No images available</div>
            )}
          </div>
        </div>
        {status == "Pending" && (
          <div className="flex text-xs gap-2 py-2 px-6 justify-end border-t border-t-black/10">
            <div
              onClick={() => handleStatusChange("rejected")}
              className="px-6 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80"
            >
              <p>Reject</p>
            </div>
            <div
              onClick={() => handleStatusChange("approved")}
              className="px-6 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80"
            >
              <p>Accept</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DetailsModal;

