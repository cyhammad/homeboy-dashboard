import Image from "next/image";
import DoorIcon from "@/assets/icons/Door";
import DollarIcon from "@/assets/icons/Dollar";
import LocationIcon from "@/assets/icons/Location";

import React, { useState } from "react";

import { IMAGES } from "@/assets";
import { CgClose } from "react-icons/cg";
import Swal from 'sweetalert2';

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

const DetailsModal = ({ inquiry, onclose }) => {
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getInitials = (name) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusChange = async (newStatus) => {
    if (!inquiry?.id) return;
    
    // Close the dialog first
    onclose();
    
    const actionText = newStatus === 'approved' ? 'approve' : 'reject';
    const actionColor = newStatus === 'approved' ? '#10b981' : '#ef4444';
    
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this inquiry?`,
      text: `"${inquiry.buyerName}"'s inquiry will be ${actionText}d and moved to the ${newStatus} section.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText} it!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Processing...',
          text: `Please wait while we ${actionText} the inquiry.`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await fetch(`/api/inquiries/${inquiry.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update inquiry status');
        }

        Swal.fire({
          title: 'Success!',
          text: `Inquiry has been ${actionText}d successfully.`,
          icon: 'success',
          confirmButtonColor: actionColor,
          confirmButtonText: 'Great!'
        });

        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        console.error('Error updating inquiry status:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to update inquiry status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Try Again'
        });
      }
    }
  };

  if (!inquiry) {
    return (
      <div className="flex flex-col gap-4 w-full p-6">
        <p className="text-gray-500 text-center">No inquiry data available</p>
      </div>
    );
  }

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
          <div className="flex py-2 border-b border-b-black/20 items-center gap-4">
            <div className="bg-primary rounded-full w-14 h-14 text-sm items-center text-white justify-center flex">
              {getInitials(inquiry.buyerName)}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-black">{inquiry.buyerName || 'N/A'}</p>
              <p>{inquiry.buyerEmail || 'N/A'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 py-4 border-b border-b-black/20 text-xs">
            <div className="flex justify-between">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-black/50 font-semibold">Phone</p>
                <p>{inquiry.buyerPhone || 'N/A'}</p>
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-black/50 font-semibold">Request Date</p>
                <p>{formatDate(inquiry.requestedAt)}</p>
              </div>
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-black/50 font-semibold">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                inquiry.status?.toLowerCase() === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : inquiry.status?.toLowerCase() === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {inquiry.status || 'Pending'}
              </span>
            </div>
          </div>
          <div className="text-xs">
            <div className="">
              <p className="font-semibold text-lg">{inquiry.property?.title || 'Property Details'}</p>
            </div>
            <div className="text-black/60 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="px-2 py-1 bg-new-black/10 rounded-md">
                  <DoorIcon />
                </p>
                <p>{inquiry.property?.description || inquiry.description || 'No description available'}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="px-2 py-1 bg-new-black/10 rounded-md">
                  <DollarIcon />
                </p>
                <p>{formatPrice(inquiry.property?.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="px-2 py-1 bg-new-black/10 rounded-md">
                  <LocationIcon color="black" />
                </p>
                <p>{inquiry.property?.location || 'Location not specified'}</p>
              </div>
            </div>
          </div>
          {inquiry.property?.imageUrls && inquiry.property.imageUrls.length > 0 && (
            <div className="flex gap-4 py-4">
              {inquiry.property.imageUrls.slice(0, 3).map((imageUrl, index) => (
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
                  className="cursor-pointer rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          
          {/* Action Buttons for Pending Inquiries */}
          {inquiry.status?.toLowerCase() === 'pending' && (
            <div className="flex gap-4 py-4 border-t border-t-black/20">
              <button
                onClick={() => handleStatusChange('approved')}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
              >
                Accept Inquiry
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
              >
                Reject Inquiry
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailsModal;
