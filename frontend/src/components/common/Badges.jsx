import React from 'react';

export const StatusBadge = ({ status }) => {
  const formatted = status ? status.toLowerCase() : 'open';
  const label = status ? status.replace('_', ' ') : 'OPEN';
  return <span className={`badge badge-${formatted}`}>{label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const formatted = priority ? priority.toLowerCase() : 'low';
  return <span className={`badge badge-${formatted}`}>{priority}</span>;
};
