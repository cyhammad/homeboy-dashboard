import GraphIcon from "@/assets/icons/Graph";
import React from "react";

const Card = () => {
  return (
    <div className="rounded-2xl flex border border-black/10 p-6 w-full">
      <div className="flex gap-4 justify-between w-full">
        <div>
          <p>Ongoing Bookings</p>
          <p className="text-2xl font-bold">256</p>
          <p>From Last month</p>
        </div>
        <div className="text-center justify-center items-center text-sm flex flex-col">
          <GraphIcon size={60} />
          <p className="px-1 w-10 py-1 rounded-full bg-red-400">20%</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
