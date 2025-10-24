import ArrowRight from "@/assets/icons/ArrowRight";
import React from "react";

const CancelledTable = ({ listings = [], setShowModal }) => {
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
        name: "Rejected Date",
        width: "flex-[2]",
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
                  No rejected listings found
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
                        <div className="py-[2px] px-3 gap-2 flex rounded-full items-center bg-new-red/20 text-new-red">
                          <p className="h-[6px] w-[6px] rounded-full bg-new-red" />
                          <p className=" rounded-full capitalize">{listing.status}</p>
                        </div>
                      </div>
                      <div className={`${tableData.head[5].width}`}>
                        {formatDate(listing.updatedAt)}
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

export default CancelledTable;
