import React from "react";
import ArrowRight from "@/assets/icons/ArrowRight";

const DetailsTable = ({ setShowModal, inquiries = [], formatDate, getUserInitials }) => {
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
        name: "Email",
        width: "flex-[2]",
      },
      {
        name: "Phone",
        width: "flex-[2]",
      },
      {
        name: "Request Date",
        width: "flex-[2]",
      },
      {
        name: "Actions",
        width: "flex-[2]",
      },
    ],
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
              {inquiries.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No inquiry requests found</p>
                </div>
              ) : (
                inquiries.map((inquiry, index) => {
                  return (
                    <div
                      key={inquiry.id}
                      className={`border-b flex border-b-black/10 py-4 px-4`}
                    >
                      <div className={`${tableData.head[0].width}`}>
                        {index + 1}.
                      </div>
                      <div
                        className={`${tableData.head[1].width} flex items-center gap-2`}
                      >
                        <p className="bg-primary rounded-full w-7 h-7 text-xs items-center text-white justify-center flex">
                          {getUserInitials(inquiry.inquirerName)}
                        </p>
                        <p>{inquiry.inquirerName || 'Inquirer'}</p>
                      </div>
                      <div className={`${tableData.head[2].width}`}>
                        {inquiry.inquirerEmail || 'N/A'}
                      </div>
                      <div className={`${tableData.head[3].width}`}>
                        {inquiry.inquirerPhone || 'N/A'}
                      </div>
                      <div className={`${tableData.head[4].width}`}>
                        {formatDate(inquiry.createdAt)}
                      </div>
                      <div
                        onClick={() => setShowModal(inquiry)}
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
