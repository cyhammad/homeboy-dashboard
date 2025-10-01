import TrendDown from "@/assets/icons/TrendDown";
import TrendUp from "@/assets/icons/TrendUp";
import React from "react";

const Card = ({ data, index }) => {
  return (
    <div className={`flex px-6  py-4 w-full my-2 ${index  == 0 ? "" : "border-l border-l-black/20"} bg-white`}>
      <div className="flex gap-4 justify-between w-full">
        <div>
          <p className="text-[#7A7C7F]">{data.name}</p>
          <p className="text-2xl font-medium">{data.amount}</p>
          <div className="flex items-center gap-2">
        <div className="text-center justify-center items-center text-sm flex flex-col">
          <p
            className={`px-4 flex items-center gap-1 text-center w-20 py-1 rounded-full ${
              data.status == "up"
                ? "bg-[#00997E29] text-[#00997E]"
                : "bg-[#FF414B29] text-[#FF414B]"
            }`}
          >
            {data.status == "up" ? (
              <TrendUp size={10} />
            ) : (
              <TrendDown size={10} />
            )}
            {data.percent}%
          </p>
        </div>
          <p className="text-[#A6A8A9] text-sm">From Last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
