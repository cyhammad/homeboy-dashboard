import { IMAGES } from "@/assets";
import DollarIcon from "@/assets/icons/Dollar";
import DoorIcon from "@/assets/icons/Door";
import LocationIcon from "@/assets/icons/Location";
import Image from "next/image";
import React, { useState } from "react";
import { CgClose } from "react-icons/cg";

const Popup = ({ onClose, img }) => {
  return (
    <div className="z-30 absolute justify-end flex top-10 right-10 bg-white">
      <div
        onClick={onClose}
        className="absolute bg-white rounded-full top-2 right-2"
      >
        <p className="text-2xl cursor-pointer p-1">
          <CgClose size={14} />{" "}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Image
          src={img}
          alt=""
          width={100}
          height={100}
          className="h-[24rem] w-[20rem]"
        />
      </div>
    </div>
  );
};

const DetailsModal = ({
  onclose,
  status
}) => {
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  return (
    <>
      <div className=" z-20 absolute justify-end flex top-6 right-6 rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          {showImage && (
            <Popup
              onClose={() => {
                setShowImage(false);
              }}
              img={selectedImage}
            />
          )}
          <div className="flex flex-col gap-4 w-[34rem]">
            <div className="flex justify-between py-3 px-6 border-b border-b-black/10">
              <p>Listing Requests</p>
              <p className="text-2xl cursor-pointer p-1" onClick={onclose}>
                <CgClose size={14} />
              </p>
            </div>
            <div className="flex flex-col gap-2 px-6 text-sm">
              <div className="flex py-2 border-b border-b-black/20 items-center gap-4">
                <Image
                  src={IMAGES.avatar}
                  alt="avatar"
                  height={100}
                  width={100}
                  className="h-14 w-14 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-semibold text-black">Allena walt</p>
                  <p>allena@gamil.com</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-4 border-b border-b-black/20 text-xs">
                <div className="flex justify-between">
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-black/50 font-semibold">Phone</p>
                    <p>+2324732853</p>
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-black/50 font-semibold">Request Date</p>
                    <p className="">08/08/2024</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-black/50 font-semibold">Status</p>
                    <div className="flex">
                      <div
                        className={`py-[2px] px-3 gap-2 flex rounded-full items-center ${
                          status == "Approved"
                            ? "bg-new-green/20 text-new-green"
                            : status == "Pending"
                            ? "bg-new-yellow/20 text-new-yellow"
                            : "bg-new-red/20 text-new-red"
                        } `}
                      >
                        <p
                          className={`h-[6px] w-[6px] rounded-full ${
                            status == "Approved"
                              ? "bg-new-green text-new-green"
                              : status == "Pending"
                              ? "bg-new-yellow text-new-yellow"
                              : "bg-new-red text-new-red"
                          }`}
                        />
                        <p className=" rounded-full">{status}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-black/50 font-semibold">Approved On</p>
                    <p>08/08/2024</p>
                  </div>
                </div>
              </div>
              <div className="text-xs">
                <div className="">
                  <p className="font-semibold text-lg ">Hamilton</p>
                </div>
                <div className="text-black/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="px-2 py-1 bg-new-black/10 rounded-md">
                      <DoorIcon />
                    </p>
                    <p>
                      3bed 2bath 1386 sqft. delivered vacant ARV $315K - $345K
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="px-2 py-1 bg-new-black/10 rounded-md">
                      <DollarIcon />
                    </p>
                    <p>$250k Asking</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="px-2 py-1 bg-new-black/10 rounded-md">
                      <LocationIcon color="black" />
                    </p>
                    <p>7865 City, CT Texas 56487</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 py-4">
                <Image
                  onClick={() => {
                    setSelectedImage(IMAGES.house);
                    setShowImage(true);
                  }}
                  alt=""
                  width={80}
                  height={80}
                  src={IMAGES.house}
                  className=""
                />
                <Image
                  onClick={() => {
                    setSelectedImage(IMAGES.house);
                    setShowImage(true);
                  }}
                  alt=""
                  width={80}
                  height={80}
                  src={IMAGES.house}
                  className=""
                />
                <Image
                  onClick={() => {
                    setSelectedImage(IMAGES.house);
                    setShowImage(true);
                  }}
                  alt=""
                  width={80}
                  height={80}
                  src={IMAGES.house}
                  className=""
                />
              </div>
            </div>
            {status == "Pending" && (
              <div className="flex text-xs gap-2 py-2 px-6 justify-end border-t border-t-black/10">
                <div className="px-6 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80">
                  <p>Reject</p>
                </div>
                <div className="px-6 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80">
                  <p>Accept</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;
