import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChatWindow } from './ChatWindow';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface ChatTriggerProps {
  orderId: number;
  serviceType: string;
  otherUser: {
    id: number;
    name: string;
    role: 'customer' | 'driver';
    phone?: string;
  };
  variant?: 'button' | 'icon' | 'card';
  className?: string;
}

export function ChatTrigger({ 
  orderId, 
  serviceType, 
  otherUser, 
  variant = 'button',
  className = '' 
}: ChatTriggerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Get chat room for this order
  const { data: chatRoom, isLoading } = useQuery({
    queryKey: ['/api/chat/room', orderId, serviceType],
    queryFn: async () => {
      const response = await fetch(`/api/chat/room/${orderId}/${serviceType}`, {
        credentials: 'include'
      });
      if (response.status === 404) {
        // Chat room doesn't exist yet
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch chat room');
      }
      return response.json();
    },
    retry: false
  });

  const createChatRoom = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Determine customer and driver IDs based on user roles
      const customerId = user.role === 'customer' ? user.id : otherUser.id;
      const driverId = user.role === 'driver' ? user.id : otherUser.id;

      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          serviceType,
          customerId,
          driverId,
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create chat room');
      }

      const newRoom = await response.json();
      
      // Invalidate and refetch the chat room query to update state
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/room', orderId, serviceType] 
      });
      
      return newRoom;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  };

  const handleOpenChat = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      let room = chatRoom;
      
      if (!room) {
        room = await createChatRoom();
      }
      
      setIsChatOpen(true);
      setIsMinimized(false);
    } catch (error) {
      console.error('Failed to open chat:', error);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsMinimized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant=\"ghost\"
          size=\"sm\"
          onClick={handleOpenChat}
          disabled={isLoading}
          className={className}
          data-testid=\"chat-trigger-icon\"
        >
          <MessageCircle className=\"h-4 w-4\" />
        </Button>
        
        {isChatOpen && chatRoom && (
          <ChatWindow
            chatRoomId={chatRoom.id}
            orderId={orderId}
            serviceType={serviceType}
            otherUser={otherUser}
            onClose={handleCloseChat}
            isMinimized={isMinimized}
            onToggleMinimize={handleToggleMinimize}
          />
        )}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${className}`}>
          <div className=\"flex items-center justify-between mb-3\">
            <div className=\"flex items-center gap-3\">
              <div className=\"bg-blue-100 p-2 rounded-full\">
                <User className=\"h-4 w-4 text-blue-600\" />
              </div>
              <div>
                <h3 className=\"font-medium text-sm\">{otherUser.name}</h3>
                <p className=\"text-xs text-gray-500 capitalize\">{otherUser.role}</p>
              </div>
            </div>
            <Badge variant=\"outline\" className=\"text-xs\">
              {serviceType.toUpperCase()}
            </Badge>
          </div>
          
          <div className=\"flex gap-2\">
            <Button
              onClick={handleOpenChat}
              disabled={isLoading}
              size=\"sm\"
              className=\"flex-1\"
              data-testid=\"chat-trigger-card\"
            >
              <MessageCircle className=\"h-4 w-4 mr-1\" />
              Chat
            </Button>
            
            {otherUser.phone && (
              <Button variant=\"outline\" size=\"sm\" asChild>
                <a href={`tel:${otherUser.phone}`}>
                  <Phone className=\"h-4 w-4\" />
                </a>
              </Button>
            )}
          </div>
        </div>
        
        {isChatOpen && chatRoom && (
          <ChatWindow
            chatRoomId={chatRoom.id}
            orderId={orderId}
            serviceType={serviceType}
            otherUser={otherUser}
            onClose={handleCloseChat}
            isMinimized={isMinimized}
            onToggleMinimize={handleToggleMinimize}
          />
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <Button
        onClick={handleOpenChat}
        disabled={isLoading}
        variant=\"outline\"
        size=\"sm\"
        className={className}
        data-testid=\"chat-trigger-button\"
      >
        <MessageCircle className=\"h-4 w-4 mr-2\" />
        Chat with {otherUser.name}
      </Button>
      
      {isChatOpen && chatRoom && (
        <ChatWindow
          chatRoomId={chatRoom.id}
          orderId={orderId}
          serviceType={serviceType}
          otherUser={otherUser}
          onClose={handleCloseChat}
          isMinimized={isMinimized}
          onToggleMinimize={handleToggleMinimize}
        />
      )}
    </>
  );
}