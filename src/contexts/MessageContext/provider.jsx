import React, { useState, useCallback } from 'react';
import { MessageContext } from './context';

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addMessage = useCallback((message) => {
    const id = Date.now();
    const newMessage = {
      id,
      text: message.text,
      type: message.type || 'info', // 'success', 'error', 'info', 'warning'
      duration: message.duration || 5000, // Default 5 seconds
    };

    setMessages(prev => [...prev, newMessage]);

    // Auto-remove message after duration
    setTimeout(() => {
      removeMessage(id);
    }, newMessage.duration);
  }, []);

  const removeMessage = useCallback((id) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);

  return (
    <MessageContext.Provider value={{ messages, addMessage, removeMessage }}>
      {children}
      {/* Message Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-4 rounded-lg shadow-lg max-w-md transition-all duration-300 ${
              message.type === 'error' ? 'bg-red-500 text-white' :
              message.type === 'success' ? 'bg-green-500 text-white' :
              message.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="text-sm">{message.text}</p>
              <button
                onClick={() => removeMessage(message.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  );
};