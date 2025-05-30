import { createContext } from 'react';

export const MessageContext = createContext({
  messages: [],
  addMessage: (message) => {},
  removeMessage: (id) => {},
});