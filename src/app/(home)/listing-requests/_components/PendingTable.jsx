import React, { useState } from "react";
import ArrowRight from "@/assets/icons/ArrowRight";
import toast from "react-hot-toast";
import NotificationService from "@/lib/notificationService";

const PendingTable = ({ setShowModal, listings = [], updateStatus }) => {
  const [updating, setUpdating] = useState({});

  const tableData = {
    head: [
      {
        name: "No",
        width: "flex-1",
      },
      {
        name: "Customer",
        width: "flex-[2]",
      },
      {
        name: "Request Date",
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

  const handleStatusUpdate = async (listingId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [listingId]: true }));
      await updateStatus(listingId, newStatus);
      
      // Send notification to user about status change
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await NotificationService.notifyListingStatusChange(listing, newStatus);
      }
      
      toast.success(`Listing ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      toast.error(`Failed to ${newStatus.toLowerCase()} listing`);
      console.error('Error updating status:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [listingId]: false }));
    }
  };

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

  const getUserInitials = (userId) => {
    // Generate initials from userId or use default
    return userId ? userId.substring(0, 2).toUpperCase() : 'PO';
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
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No pending listings found</p>
                </div>
              ) : (
                listings.map((listing, index) => {
                  const isUpdating = updating[listing.id];
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
                          {getUserInitials(listing.userId)}
                        </p>
                        <p>{listing.title || 'Property Owner'}</p>
                      </div>
                      <div className={`${tableData.head[2].width}`}>
                        {formatDate(listing.createdAt)}
                      </div>
                      <div className={`${tableData.head[3].width} flex`}>
                        <div className="flex">
                          <div className={`py-[2px] h-6 px-3 gap-2 flex rounded-full items-center ${
                            listing.status?.toLowerCase() === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : listing.status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`h-[6px] w-[6px] rounded-full ${
                              listing.status?.toLowerCase() === 'approved'
                                ? 'bg-green-500'
                                : listing.status?.toLowerCase() === 'pending'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`} />
                            <p className="rounded-full">{listing.status}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`${tableData.head[4].width} flex gap-1`}>
                        <button
                          onClick={() => handleStatusUpdate(listing.id, 'rejected')}
                          disabled={isUpdating}
                          className="px-4 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(listing.id, 'approved')}
                          disabled={isUpdating}
                          className="px-4 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Accept'}
                        </button>
                      </div>
                      <div
                        onClick={() => setShowModal(listing)}
                        className={`${tableData.head[5].width} gap-1 font-semibold flex items-center cursor-pointer text-primary`}
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
