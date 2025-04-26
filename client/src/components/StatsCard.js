import React from 'react';
import { Card } from 'react-bootstrap';

const StatsCard = ({ title, value, icon, description, color }) => {
  const IconComponent = icon;
  
  return (
    <Card className="stats-card h-100">
      <Card.Body>
        <div className="stats-icon" style={{ color: color || '#007bff' }}>
          <IconComponent />
        </div>
        <div className="stats-title">{title}</div>
        <div className="stats-value">{value}</div>
        {description && <div className="stats-description">{description}</div>}
      </Card.Body>
    </Card>
  );
};

export default StatsCard;