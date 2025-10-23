"use client";
import { IMAGES } from "@/assets";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { signIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const CustomInput = ({ type, value, onChange, name }) => {
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
                : "email"
            }
            placeholder={
              type !== "password" ? "Username/email..." : "Your Password"
            }
            className="outline-none w-full h-full"
            value={value}
            onChange={onChange}
            name={name}
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success("Login successful! Welcome back!");
      router.push("/");
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-4/5 text-new-grey text-sm">
              <CustomInput 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <CustomInput 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              <div className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-2 py-2 text-center hover:bg-primary/80 flex justify-between bg-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-center cursor-pointer w-full">
                    {loading ? "Signing in..." : "Login"}
                  </span>
                </button>
              </div>
            </form>
            <div className="text-center text-new-grey py-3 text-sm">
              <p className="flex gap-1">
                Don&apos;t have an account?
                <Link
                  href="/sign-up"
                  className="underline text-primary font-semibold cursor-pointer"
                >
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
