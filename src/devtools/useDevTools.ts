import { useState } from 'react';

export const useDevTools = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDevTools = () => {
    setIsOpen(prev => !prev);
  };

  return {
    isOpen,
    toggleDevTools
  };
}; 