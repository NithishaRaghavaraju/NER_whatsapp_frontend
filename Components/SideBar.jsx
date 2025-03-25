import Image from "next/image";
import WhatsAppicon from "@/public/assets/images/whatsapp.png";

const Sidebar = ({ setShowChat }) => {
  return (
    <div className="w-full md:w-1/3 h-screen bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b text-lg font-semibold">Chats</div>

      {/* Search Bar */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 border rounded-lg outline-none"
        />
      </div>

      {/* Chat List */}
      <div className="p-3 space-y-3">
        <div
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 cursor-pointer"
          onClick={() => {
            if (window.innerWidth < 768) setShowChat(true); // Only works on mobile
          }}
        >
          <Image
            src={WhatsAppicon}
            alt="New Icon"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">WhatsApp Clone</p>
            <p className="text-sm text-gray-500">Available!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
