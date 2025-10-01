"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, []);
  return <div>Home</div>;
};

export default Home;
