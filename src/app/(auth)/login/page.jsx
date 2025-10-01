"use client";
import { IMAGES } from "@/assets";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

const CustomInput = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="text-black">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-black/70">
            {type !== "password" ? "Username/email..." : "Password"}
          </p>
          {type === "password" && (
            <div>
              <p className="underline text-primary font-semibold cursor-pointer">
                Forgot Password
              </p>
            </div>
          )}
        </div>
        <div className="rounded-lg flex items-center border border-black/20 px-4 py-2">
          <input
            type={
              type === "password"
                ? showPassword
                  ? "text"
                  : "password"
                : "text"
            }
            placeholder={
              type !== "password" ? "Username/email..." : "Your Password"
            }
            className="outline-none w-full h-full"
            onChange={(e) => {
              console.log(e.target.value);
            }}
          />
          {type === "password" ? (
            showPassword ? (
              <BsEyeSlashFill onClick={() => setShowPassword(false)} />
            ) : (
              <BsEyeFill onClick={() => setShowPassword(true)} />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <div className="flex-1 bg-white p-4 flex h-screen font-sora">
      <div className="flex-[4]">
        <Image
          alt=""
          src={IMAGES.image}
          height={100}
          width={100}
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
      <div className="flex-[6] flex justify-center w-full">
        <div className="flex px-28 items-center justify-center flex-col gap-4 w-full">
          <div className="text-center text-[#24282E] flex flex-col gap-2 py-2">
            <p className="font-semibold text-2xl">Welcome Back!</p>
            <p className="text-new-grey text-sm">
              Welcome back, please enter your details.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-4/5 text-new-grey text-sm">
            <CustomInput type="text" />
            <CustomInput type="password" />
          </div>
          <div className="w-4/5">
            <div className="w-full px-2 py-2 text-center hover:bg-primary/80 flex justify-between bg-primary rounded-lg">
              <Link
                href="/dashboard"
                className="text-center cursor-pointer w-full"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="text-center text-new-grey py-3 text-sm">
            <p className="flex gap-1">
              Don&apos;t have an account?
              <span className="underline text-primary font-semibold cursor-pointer">
                Register now
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
