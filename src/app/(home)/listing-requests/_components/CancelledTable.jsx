import ArrowRight from "@/assets/icons/ArrowRight";
import React from "react";

const CancelledTable = ({ setShowModal }) => {
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
        name: "Rejected Date",
        width: "flex-[2]",
      },
      {
        name: "Actions",
        width: "flex-[2]",
      },
    ],
    body: [
      {
        customer: "Cahaya Dewi",
        requestDate: "08/09/23",
        rejectedDate: "08/09/23",
        status: "Rejected",
      },
      {
        customer: "Cahaya Dewi",
        requestDate: "08/09/23",
        rejectedDate: "08/09/23",
        status: "Rejected",
      },
      {
        customer: "Cahaya Dewi",
        requestDate: "08/09/23",
        rejectedDate: "08/09/23",
        status: "Rejected",
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
              {tableData.body.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`border-b flex border-b-black/10 py-4 px-4`}
                  >
                    <div className={`${tableData.head[0].width}`}>
                      {index + 1}.
                    </div>
                    <div
                      className={`${tableData.head[1].width} flex items-center gap-2`}
                    >
                      <p className="bg-primary rounded-full w-7 h-7 text-xs items-center text-white justify-center flex">
                        CD
                      </p>
                      <p>{item.customer}</p>
                    </div>
                    <div className={`${tableData.head[2].width}`}>
                      {item.requestDate}
                    </div>
                    <div className={`${tableData.head[3].width} flex`}>
                      <div className="py-[2px] px-3 gap-2 flex rounded-full items-center bg-new-red/20 text-new-red">
                        <p className="h-[6px] w-[6px] rounded-full bg-new-red" />
                        <p className=" rounded-full">{item.status}</p>
                      </div>
                    </div>
                    <div className={`${tableData.head[4].width}`}>
                      {item.rejectedDate}
                    </div>
                    <div
                      onClick={setShowModal}
                      className={`${tableData.head[5].width} gap-1 font-semibold flex items-center cursor-pointer text-primary`}
                    >
                      View Details
                      <ArrowRight size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelledTable;
