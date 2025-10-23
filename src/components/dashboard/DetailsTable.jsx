import React from "react";
import ArrowRight from "@/assets/icons/ArrowRight";

const DetailsTable = ({ setShowModal }) => {
  const tableData = {
    head: [
      { name: "No", width: "flex-1" },
      { name: "User Email", width: "flex-[2]" },
      { name: "Waiter Email", width: "flex-[2]" },
      { name: "Destination", width: "flex-[2]" },
      { name: "Date", width: "flex-[2]" },
      { name: "Booking Price", width: "flex-[2]" },
      { name: "Actions", width: "flex-[2]" },
    ],
    body: [
      {
        useremail: "muneeb@gmail.com",
        waiteremail: "muneeb@gmail.com",
        destination: "islambad",
        date: "Feb 10, 2025",
        price: "$120",
      },
      {
        useremail: "muneeb@gmail.com",
        waiteremail: "muneeb@gmail.com",
        destination: "islambad",
        date: "Feb 10, 2025",
        price: "$120",
      },
    ],
  };

  return (
    <div>
      <div className="w-full border border-black/10 rounded-2xl">
        <div className="w-full">
          <div className="text-start flex px-4 py-2 bg-slate-50 rounded-t-2xl">
            {tableData.head.map((item, index) => (
              <div key={index} className={`${item.width} text-start`}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
        <div className="text-[#7A7C7F] text-sm">
          {tableData.body.map((item, index) => (
            <div
              key={index}
              className="border-b flex border-b-black/10 py-4 px-4"
            >
              <div className={`${tableData.head[0].width}`}>{index + 1}.</div>
              <div className={`${tableData.head[1].width}`}>
                {item.useremail}
              </div>
              <div className={`${tableData.head[2].width}`}>
                {item.waiteremail}
              </div>
              <div className={`${tableData.head[3].width}`}>
                {item.destination}
              </div>
              <div className={`${tableData.head[4].width}`}>{item.date}</div>
              <div className={`${tableData.head[5].width} font-bold`}>
                {item.price}
              </div>
              <div
                onClick={setShowModal}
                className={`${tableData.head[6].width} gap-1 font-semibold flex items-center cursor-pointer text-primary`}
              >
                View Details
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailsTable;
