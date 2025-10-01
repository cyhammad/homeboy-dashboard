import React from "react";
import GraphIcon from "@/assets/icons/Graph";

const Card = ({
  title,
  value,
  description,
  change,
  changeColor = "bg-red-400",
  icon,
}) => {
  return (
    <div className="rounded-2xl flex border border-black/10 p-6 w-full">
      <div className="flex gap-4 justify-between w-full">
        {/* Left side */}
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-new-black">{value}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-center justify-center text-sm">
          {icon ? icon : <GraphIcon size={60} />}
          <p
            className={`px-2 py-1 mt-2 rounded-full text-white font-semibold ${changeColor}`}
          >
            {change}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
