import React from "react";
import ArrowRight from "@/assets/icons/ArrowRight";
import Swal from 'sweetalert2';

const PendingTable = ({ listings = [], setShowModal }) => {
  const tableData = {
    head: [
      {
        name: "No",
        width: "flex-1",
      },
      {
        name: "Title",
        width: "flex-[2]",
      },
      {
        name: "Location",
        width: "flex-[2]",
      },
      {
        name: "Price",
        width: "flex-[2]",
      },
      {
        name: "Status",
        width: "flex-[2]",
      },
      {
        name: "Accept/Reject",
        width: "flex-[3]",
      },
      {
        name: "Actions",
        width: "flex-[2]",
      },
    ],
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getInitials = (title) => {
    if (!title) return "N/A";
    return title.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStatusChange = async (listingId, newStatus, listingTitle) => {
    const actionText = newStatus === 'approved' ? 'approve' : 'reject';
    const actionColor = newStatus === 'approved' ? '#10b981' : '#ef4444';
    
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this listing?`,
      text: `"${listingTitle}" will be ${actionText}d and moved to the ${newStatus} section.`,
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
        // Show loading state
        Swal.fire({
          title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ing...`,
          text: 'Please wait while we update the listing status.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await fetch(`/api/listings/${listingId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update listing status');
        }

        const result = await response.json();
        
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: `Listing has been ${actionText}d successfully.`,
          icon: 'success',
          confirmButtonColor: actionColor,
          timer: 2000,
          timerProgressBar: true
        });
        
      } catch (error) {
        console.error('Error updating listing status:', error);
        
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update listing status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };
  return (
    <div>
      <div>
        <div>
          <div className="w-full border border-black/10 rounded-2xl">
            <div className="w-full text-sm">
              <div className="text-start flex px-4 py-3 bg-slate-50 rounded-2xl">
                {tableData.head.map((item, index) => {
                  return (
                    <div key={index} className={`${item.width} text-start`}>
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[#7A7C7F] text-sm">
              {listings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending listings found
                </div>
              ) : (
                listings.map((listing, index) => {
                  return (
                    <div
                      key={listing.id}
                      className={`border-b flex border-b-black/10 py-4 px-4`}
                    >
                      <div className={`${tableData.head[0].width}`}>
                        {index + 1}.
                      </div>
                      <div
                        className={`${tableData.head[1].width} flex items-center gap-2`}
                      >
                        <p className="bg-primary rounded-full w-7 h-7 text-xs items-center text-white justify-center flex">
                          {getInitials(listing.title)}
                        </p>
                        <p className="truncate">{listing.title || "Untitled"}</p>
                      </div>
                      <div className={`${tableData.head[2].width}`}>
                        {listing.location || "N/A"}
                      </div>
                      <div className={`${tableData.head[3].width}`}>
                        {formatPrice(listing.price)}
                      </div>
                      <div className={`${tableData.head[4].width} flex`}>
                        <div className="flex">
                          <div className="py-[2px] h-6 px-3 gap-2 flex rounded-full items-center bg-new-yellow/20 text-new-yellow">
                            <p className="h-[6px] w-[6px] rounded-full bg-new-yellow" />
                            <p className=" rounded-full capitalize">{listing.status}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`${tableData.head[5].width} flex gap-1`}>
                        <div 
                          onClick={() => handleStatusChange(listing.id, 'rejected', listing.title)}
                          className="px-4 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80"
                        >
                          <p>Reject</p>
                        </div>
                        <div 
                          onClick={() => handleStatusChange(listing.id, 'approved', listing.title)}
                          className="px-4 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80"
                        >
                          <p>Accept</p>
                        </div>
                      </div>
                      <div
                        onClick={() => setShowModal(listing)}
                        className={`${tableData.head[6].width} gap-1 font-semibold flex items-center cursor-pointer text-primary`}
                      >
                        View Details
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingTable;
