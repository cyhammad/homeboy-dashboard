"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { BiTrash } from "react-icons/bi";

const LogoutModal = ({ onclose }) => {
  const router = useRouter();
  return (
    <>
      <div className=" z-20 absolute justify-end flex top-1/3 left-1/3 mx-auto rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-4 w-[24rem]">
            <div className="flex justify-between items-center py-3 px-6 border-b border-b-black/10">
              <p>Logout</p>
              <p className="cursor-pointer text-2xl" onClick={onclose}>
                x
              </p>
            </div>
            <div className="flex flex-col gap-2 px-6 pb-4 text-sm">
              <div className="flex justify-center">
                <p className="bg-red-500 p-3 rounded-full">
                  <BiTrash size={24} color="white" />
                </p>
              </div>
              <div className="flex">
                <div className="flex flex-col gap-2 items-center text-center w-full">
                  <p className="text-xl font-semibold">Logout</p>
                  <p className="text-[#98ABA8]">
                    Are you sure, you want to logout
                  </p>
                </div>
              </div>
              <div className="flex border-t border-t-black/20 py-4 gap-2">
                <p
                  onClick={onclose}
                  className=" bg-transparent w-full border text-center border-primary cursor-pointer text-primary px-3 py-2 rounded-xl "
                >
                  Cancel
                </p>
                <p
                  onClick={() => {
                    router.push("/login");
                  }}
                  className="bg-primary w-full hover:bg-primary/90 text-center cursor-pointer text-white px-3 py-2 rounded-xl "
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
