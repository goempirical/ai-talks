import React from "react";
import { Message } from "../types";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-container ${
        isUser ? "user-message" : "assistant-message"
      } max-w-[80%]`}
    >
      <div className="flex items-start">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-500" : "bg-gray-500"
          } text-white font-bold mr-2`}
        >
          {isUser ? "U" : "A"}
        </div>
        <div>
          <p className="text-sm text-gray-500">
            {isUser ? "You" : "Assistant"} •{" "}
            {new Date(message.createdAt).toLocaleTimeString()}
          </p>
          <div className="mt-1 text-gray-800 whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
