import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import DOMPurify from "dompurify";

const VirtualAssistantModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hi! I am your Virtual Medical Assistant. I can help you with your pre-appointment preparations?",
    },
  ]);
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    try {
      // Send the chat history along with the new user input to the backend
      const response = await axiosInstance.post("/virtual-assistant", {
        chatHistory: newMessages.map((message) => ({
          role: message.sender === "assistant" ? "assistant" : "user",
          content: message.text,
        })),
      });

      const aiResponse = response.data.suggestions.join("\n");

      setMessages([...newMessages, { sender: "assistant", text: aiResponse }]);
    } catch (error) {
      console.error("Error fetching virtual assistant response:", error);
      setMessages([
        ...newMessages,
        {
          sender: "assistant",
          text: "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="w-3/4 lg:w-1/3 bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Virtual Medical Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className=" h-64 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.sender === "assistant" ? "text-blue-600" : "text-black"
              }`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(message.text),
              }}
            />
          ))}
        </div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <button
          onClick={handleSendMessage}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default VirtualAssistantModal;
