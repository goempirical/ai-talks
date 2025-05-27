import React, { useState, FormEvent, ForwardedRef } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = React.forwardRef(
  ({ onSendMessage, isLoading }: ChatInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSendMessage(message);
        if (ref && typeof ref !== 'function') {
          ref.current?.focus();
        }
        setMessage('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="chat-input"
          disabled={isLoading}
          ref={ref}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    );
  }
);

export default ChatInput;
