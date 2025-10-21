import React from "react";
import ArrowRight from "@/assets/icons/ArrowRight";

const DetailsTable = ({ setShowModal, listings = [] }) => {
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
        name: "Approved Date",
        width: "flex-[2]",
      },
      {
        name: "Actions",
        width: "flex-[2]",
      },
    ],
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
                  <p className="text-gray-500">No approved listings found</p>
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
                          {getUserInitials(listing.userId)}
                        </p>
                        <p>{listing.title || 'Property Owner'}</p>
                      </div>
                      <div className={`${tableData.head[2].width}`}>
                        {formatDate(listing.createdAt)}
                      </div>
                      <div className={`${tableData.head[3].width} flex`}>
                        <div className={`py-[2px] px-3 gap-2 flex rounded-full items-center ${
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
                      <div className={`${tableData.head[4].width}`}>
                        {formatDate(listing.updatedAt)}
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

export default DetailsTable;
