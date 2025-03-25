"use client";
import { useState,useEffect } from "react";
import Chats from "@/Components/Chats.jsx";
import Sidebar from "@/Components/SideBar.jsx";

const Page = () => {
  const [showChat, setShowChat] = useState(false);


  return (
    <div className="flex h-screen">
      {!showChat && <Sidebar setShowChat={setShowChat} />}
      <Chats showChat={showChat} setShowChat={setShowChat} />
    </div>
     
  );
};

export default Page;
