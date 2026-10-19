import React from 'react';
import type { ConnectionStatus } from '../hooks/useWebSocket';

interface ConnectionStatusProps {
  status: ConnectionStatus;
}

const statusConfig: Record<ConnectionStatus, { label: string; className: string }> = {
  connected: { label: 'Online', className: 'status-connected' },
  connecting: { label: 'Connecting…', className: 'status-connecting' },
  error: { label: 'Error', className: 'status-error' },
  disconnected: { label: 'Offline', className: 'status-disconnected' },
};

export const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({ status }) => {
  const { label, className } = statusConfig[status];
  return (
    <span className={`alapai-status ${className}`}>
      <span className="alapai-status-dot" />
      {label}
    </span>
  );
};
