import React, { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { Message } from '../types';
import { sendMessage } from '../services/api';
import { useChat } from '../contexts/ChatContext';

const ChatPage = () => {
  const { messages, addMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      const history = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      return sendMessage(content, history);
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
      };
      addMessage(assistantMessage);
    },
  });

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      createdAt: new Date(),
    };
    
    addMessage(userMessage);
    sendMessageMutation.mutate(content);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Chat with AI Assistant</h2>
        
        <div className="messages-container space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={sendMessageMutation.isPending} 
        />
        
        {sendMessageMutation.isError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error: Failed to send message. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
