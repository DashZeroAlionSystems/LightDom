/**
 * Chat Dashboard Route Component
 */

import React from 'react';
import MetaverseChatDashboard from '../components/MetaverseChatDashboard';

const ChatPage: React.FC = () => {
  return (
    <div className="h-screen bg-slate-900">
      <MetaverseChatDashboard />
    </div>
  );
};

export default ChatPage;