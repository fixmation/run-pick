import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatWindow } from '@/components/chat/ChatWindow';

interface RideChatButtonProps {
  chatRoomId: number;
  orderId: number;
  serviceType: string;
  otherUser: {
    id: number;
    name: string;
    role: 'customer' | 'driver';
    phone?: string;
  };
  unreadCount?: number;
  onUnreadCountChange?: (count: number) => void;
}

export function RideChatButton({ 
  chatRoomId, 
  orderId, 
  serviceType, 
  otherUser, 
  unreadCount = 0,
  onUnreadCountChange 
}: RideChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setIsMinimized(false);
    // Clear unread count when chat is opened
    if (!isChatOpen && onUnreadCountChange) {
      onUnreadCountChange(0);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        variant="outline"
        size="sm"
        className="relative bg-white shadow-md hover:shadow-lg transition-all"
        data-testid="button-open-chat"
        aria-label={`Chat with ${otherUser.name}${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Chat Window */}
      {isChatOpen && (
        <ChatWindow
          chatRoomId={chatRoomId}
          orderId={orderId}
          serviceType={serviceType}
          otherUser={otherUser}
          onClose={() => setIsChatOpen(false)}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
        />
      )}
    </>
  );
}