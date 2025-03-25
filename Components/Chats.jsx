"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Search from "@/public/assets/images/search.png";
import Close from "@/public/assets/images/close.png";
import NewIcon from "@/public/assets/images/ner-icon.png";
import WhatsAppicon from "@/public/assets/images/whatsapp.png";
import Loading from "@/public/assets/images/typing.gif";
import down from "@/public/assets/images/down.png";
import up from "@/public/assets/images/up.png";

const Chats = ({ showChat, setShowChat }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [highlightedWords, setHighlightedWords] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const messageRefs = useRef([]);

  const [messages, setMessages] = useState([
    { text: "Hii", sender: "bot", person: [], location: [] },
    { text: "how is your day been?", sender: "bot", person: [], location: [] },
    { text: "Hii", sender: "user", person: [], location: [] },
  ]);
  const [message, setMessage] = useState("");

  const handleCloseSearch = () => {
    setSearchActive(false);
    setFilterMenuOpen(false);
    setHighlightedWords([]);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    if (option === "Person") {
      const allPerson = messages.flatMap((msg, index) =>
        msg.person.map((p) => ({ ...p, index }))
      );
      const uniquePerson = Array.from(
        new Map(allPerson.map((p) => [p.word.toLowerCase(), p])).values()
      );
      setHighlightedWords(uniquePerson);
      setSearchResults(uniquePerson.map((p) => p.index));
      setCurrentResultIndex(0);
    } else if (option === "Location") {
      const allLocation = messages.flatMap((msg, index) =>
        msg.location.map((l) => ({ ...l, index }))
      );
      const uniqueLocation = Array.from(
        new Map(allLocation.map((l) => [l.word.toLowerCase(), l])).values()
      );
      setHighlightedWords(uniqueLocation);
      setSearchResults(uniqueLocation.map((l) => l.index));
      setCurrentResultIndex(0);
    }
  };
  const scrollToMessage = (messageIndex) => {
    if (messageRefs.current[messageIndex]) {
      messageRefs.current[messageIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const goToNextResult = () => {
    if (searchResults.length === 0) return;

    setCurrentResultIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % searchResults.length;
      scrollToMessage(searchResults[nextIndex]);
      return nextIndex;
    });
  };

  const goToPreviousResult = () => {
    if (searchResults.length === 0) return;

    setCurrentResultIndex((prevIndex) => {
      const prevIndexUpdated =
        (prevIndex - 1 + searchResults.length) % searchResults.length;
      scrollToMessage(searchResults[prevIndexUpdated]);
      return prevIndexUpdated;
    });
  };

  const highlightText = (text, messageIndex) => {
    if (!highlightedWords.length) return text;

    const substringsToHighlight = highlightedWords
      .filter((item) => item.index === messageIndex)
      .map(({ substring }) => substring)
      .sort((a, b) => a[0] - b[0]);

    if (!substringsToHighlight.length) return text;

    let highlightedText = [];
    let lastIndex = 0;

    substringsToHighlight.forEach(([start, end], i) => {
      if (start >= lastIndex) {
        highlightedText.push(text.slice(lastIndex, start));

        highlightedText.push(
          <span key={i} className="bg-yellow-300 px-1 rounded">
            {text.slice(start, end)}
          </span>
        );

        lastIndex = end;
      }
    });

    highlightedText.push(text.slice(lastIndex));

    return highlightedText;
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageIndex = messages.length;
    const existingEntities = {
      person: messages.flatMap((msg) => msg.person),
      location: messages.flatMap((msg) => msg.location),
    };

    const newMessage = {
      text: message,
      sender: "user",
      person: [],
      location: [],
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("https://nithisha2201-whatsapp-ner.hf.space/api/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index: messageIndex,
          message,
          existingEntities,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          person: data.person_user || [],
          location: data.location_user || [],
        };

        return [
          ...updatedMessages,
          {
            text: data.response,
            sender: "bot",
            person: data.person_bot || [],
            location: data.location_bot || [],
          },
        ];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex-1 h-screen flex flex-col relative ${
        showChat ? "block" : "hidden md:flex"
      } `}
    >
      {/* Header */}
      <div className="flex items-center p-4 text-black text-lg font-semibold relative z-20 border-b-1 border-black">
        <button
          className="md:hidden mr-2 text-xl"
          onClick={() => setShowChat(false)}
        >
          {" "}
          ←{" "}
        </button>

        {!searchActive ? (
          <div className="flex items-center space-x-3 rounded-lg cursor-pointer">
            <Image
              src={WhatsAppicon}
              alt="New Icon"
              className="w-7 h-7 rounded-full"
            />
            <p className="font-semibold text-sm">WhatsApp Clone</p>
          </div>
        ) : (
          <div className="flex items-center bg-white text-black px-3 rounded-lg w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-[80%] sm:w-[90%] py-1 border rounded-lg outline-none placeholder:text-sm px-4 font-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="w-[10%] sm:w-[5%] flex justify-end items-end"
            >
              <Image
                src={NewIcon}
                alt="New Icon"
                className="h-[20px] w-[20px]"
              />
            </button>
            <button
              onClick={handleCloseSearch}
              className="w-[10%] sm:w-[5%] flex justify-end items-end"
            >
              <Image src={Close} alt="Close" className="h-[15px] w-[15px]" />
            </button>
          </div>
        )}

        {!searchActive && (
          <div className="ml-auto relative">
            <Image
              src={Search}
              alt="Search"
              className="h-[20px] w-[25px] pr-2 cursor-pointer"
              onClick={() => setSearchActive(true)}
            />
          </div>
        )}
      </div>

      {/* Filter Options Menu */}
      {filterMenuOpen && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-4 w-64 z-20">
          <h3 className="text-lg font-semibold mb-3 text-center">
            Choose the entity
          </h3>
          <div className="flex items-center border rounded-full bg-gray-100 relative">
            <button
              className={`flex-1 text-center py-2 rounded-l-full ${
                selectedOption === "Person"
                  ? "bg-green-200 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => handleOptionSelect("Person")}
            >
              Person
            </button>
            <div className="h-5 w-[1px] bg-gray-400"></div>
            <button
              className={`flex-1 text-center py-2 rounded-r-full ${
                selectedOption === "Location"
                  ? "bg-green-200 font-semibold"
                  : "bg-transparent"
              }`}
              onClick={() => handleOptionSelect("Location")}
            >
              Location
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto relative z-10 bg-opacity-0 bg-[url('../public/assets/images/bgwhatsapp.png')]">
        {messages.map((msg, index) => (
          <div
            key={index}
            ref={(el) => (messageRefs.current[index] = el)}
            className={
              msg.sender === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={
                msg.sender === "user"
                  ? "bg-green-400 shadow-sm text-white p-3 rounded-lg max-w-xs"
                  : "bg-white shadow-sm p-3 rounded-lg max-w-xs"
              }
            >
              {highlightText(msg.text, index)}
            </div>
          </div>
        ))}

        {/* Show loading GIF when waiting for response */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm p-1 rounded-lg max-w-xs">
              <Image src={Loading} alt="Loading..." width={50} height={50} />
            </div>
          </div>
        )}
      </div>
      {searchActive && (
        <div className="flex items-center justify-between border-b py-2 px-4 md:px-8">
          <button
            onClick={goToPreviousResult}
            className="text-gray-600 px-3 py-1 border rounded hover:bg-gray-100 transition"
          >
            <Image src={up} alt="Previous" width={15} height={15} />
          </button>
          {highlightedWords.length === 0 ? (
            <span className="text-gray-500 text-sm md:text-base">
              No Matches
            </span>
          ) : (
            <span className="font-semibold text-sm md:text-base">
              {currentResultIndex + 1} of {highlightedWords.length}
            </span>
          )}
          <button
            onClick={goToNextResult}
            className="text-gray-600 px-3 py-1 border rounded hover:bg-gray-100 transition"
          >
            <Image src={down} alt="Next" width={15} height={15} />
          </button>
        </div>
      )}

      {/* Message Input */}

      <div
        className={`p-3 border-t flex transition-all duration-300 ${
          searchActive ? "bg-black/10 blur-md invisible" : "visible"
        }`}
      >
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg outline-none"
        />
        <button
          className={`ml-2 p-2 rounded-lg ${
            isLoading
              ? "bg-white cursor-not-allowed text-green-500"
              : "bg-green-500 text-white "
          }`}
          onClick={handleSend}
          disabled={isLoading}
        >
          {" "}
          {isLoading ? "Wait..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chats;
