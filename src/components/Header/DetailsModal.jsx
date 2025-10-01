import { IMAGES } from "@/assets";
import Image from "next/image";
import React from "react";

const Row = () => {
  return (
    <div>
      <div className="flex gap-2 mx-6 text-sm border-b border-b-black/10">
        <div className="">
          <div className="flex items-start gap-4 py-2">
            <Image
              src={IMAGES.avatar}
              alt="avatar"
              height={80}
              width={80}
              className="h-8 w-8 rounded-full"
            />
            <div className="flex flex-col text-xs">
              <p>
                <span> Allena walt </span> requested for a new location for the
                property
              </p>
              <p className="font-semibold text-new-black">1 m ago</p>
            </div>
          </div>
        </div>
        <div className="items-center flex text-xs">
          <div className={`flex gap-1`}>
            <div className="px-3 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80">
              <p>Reject</p>
            </div>
            <div className="px-3 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80">
              <p>Accept</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ onclose }) => {
  return (
    <>
      <div className=" z-20 absolute justify-end flex top-16 right-24 rounded-3xl border border-black/10 bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-4 w-[34rem]">
            <div className="flex justify-between items-center py-3 px-6 border-b border-b-black/10">
              <p className="font-semibold">Notifications</p>
              <p className="cursor-pointer text-2xl" onClick={onclose}>
                x
              </p>
            </div>
            <Row />
            <Row />
            <Row />
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;
