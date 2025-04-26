import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const EmptyState = ({ message, icon }) => {
  const IconComponent = icon || FaInfoCircle;
  
  return (
    <div className="empty-state">
      <IconComponent />
      <h5>{message}</h5>
    </div>
  );
};

export default EmptyState;