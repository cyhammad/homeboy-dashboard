"use client";
import React from "react";

const CustomInput = ({ type, title }) => {
  return (
    <div className="text-black w-full">
      <div className="flex flex-col gap-2">
        <div className="flex ">
          <p className="text-black/70">{title}</p>
        </div>
        <div className="rounded-lg flex items-center border border-black/20 px-4 py-2">
          {type == "area" ? (
            <textarea
              placeholder="Write"
              cols={10}
              rows={3}
              className="w-full outline-none"
            />
          ) : (
            <input
              type={type}
              placeholder="Write"
              className="outline-none w-full h-full"
              onChange={(e) => {
                console.log(e.target.value);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const CreateModal = ({
  onclose,
  status
}) => {
  return (
    <>
      <div className=" z-20 absolute justify-end flex top-6 right-6 rounded-2xl bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-1 w-[34rem]">
            <div className="flex justify-between py-3 px-6 border-b border-b-black/10">
              <p>Create Listing</p>
              <p className="cursor-pointer" onClick={onclose}>
                X
              </p>
            </div>
            <div className="flex flex-col gap-2 px-6 text-sm">
              <div className="text-sm border-b py-4 border-b-black/20">
                <p className="font-semibold text-black">Create Listing</p>
                <p>
                  Enter details here and listing will be live as you click
                  upload
                </p>
              </div>
              <div className="flex flex-col gap-4 py-4  text-xs">
                <div className="flex flex-col gap-2 w-full">
                  <CustomInput type="text" title="Title" />
                  <CustomInput type="area" title="Description" />
                  <div className="flex gap-2">
                    <CustomInput type="text" title="Location" />
                    <CustomInput type="text" title="Asking Price" />
                  </div>
                  <div>
                    <div className="flex flex-col gap-1">
                      <p>Gallery</p>
                      <label htmlFor="file">
                        <div className="border cursor-pointer flex justify-center items-center border-dashed border-black/30 rounded-lg h-24 w-full">
                          <div className="text-center">
                            <p>Drag here or upload</p>
                            <p>Png or Jpeg</p>
                          </div>
                        </div>
                      </label>
                      <input type="file" className="hidden" id="file" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex text-xs gap-2 py-2 px-6 justify-end border-t border-t-black/10">
              <div className="px-6 py-2 rounded-sm text-primary bg-transparent border border-primary cursor-pointer">
                <p>Cancel</p>
              </div>
              <div className="px-6 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80">
                <p>Upload</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateModal;
