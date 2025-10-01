import { IMAGES } from "@/assets";
import Image from "next/image";
import React from "react";

// Example of another popup (commented out, kept in JSX form)
// const Popup = ({ onClose, img }) => {
//   return (
//     <div className="p-4 rounded-2xl border border-black/20">
//       <div onClick={onClose}>
//         <p className="text-2xl cursor-pointer">X</p>
//       </div>
//       <div className="flex flex-col gap-2">
//         <Image
//           src={IMAGES.house}
//           alt=""
//           width={100}
//           height={100}
//           className=""
//         />
//       </div>
//     </div>
//   );
// };

const DetailsModal = ({ onclose }) => {
  return (
    <>
      <div className="z-20 absolute justify-end flex top-6 right-6 rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-4 w-[34rem]">
            <div className="flex justify-between items-center py-5 px-6 border-b border-b-black/10">
              <p>Inquiry Requests</p>
              <p className="cursor-pointer text-2xl" onClick={onclose}>
                x
              </p>
            </div>
            <div className="flex flex-col gap-2 px-6 pb-4 text-sm">
              <div className="flex py-4 border-b border-b-black/20 items-center gap-4">
                <Image
                  src={IMAGES.avatar}
                  alt="avatar"
                  height={100}
                  width={100}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <p>Allena walt</p>
                  <p>allena@gamil.com</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 py-4 border-b border-b-black/20">
                <div className="flex justify-between">
                  <div className="flex flex-col flex-1">
                    <p className="text-black/50 font-semibold">Phone</p>
                    <p>+2324732853</p>
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-black/50 font-semibold">Request Date</p>
                    <p>08/08/2024</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="py-2">
                  <p className="font-semibold text-xl">Hamilton</p>
                </div>
                <div className="text-black/60 flex flex-col gap-2">
                  <div>
                    <p>3bed 2bath 1386 sqft. delivered vacant ARV $315K - $345K</p>
                  </div>
                  <div>
                    <p>$250k Asking</p>
                  </div>
                  <div>
                    <p>7865 City, CT Texas 56487</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 py-2">
                <Image alt="" width={100} height={100} src={IMAGES.house} />
                <Image alt="" width={100} height={100} src={IMAGES.house} />
                <Image alt="" width={100} height={100} src={IMAGES.house} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;
