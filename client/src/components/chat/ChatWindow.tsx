import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, X, MessageCircle, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatConnection } from '@/hooks/useChatConnection';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface ChatWindowProps {
  chatRoomId: number;
  orderId: number;
  serviceType: string;
  otherUser: {
    id: number;
    name: string;
    role: 'customer' | 'driver';
    phone?: string;
  };
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function ChatWindow({ 
  chatRoomId, 
  orderId, 
  serviceType, 
  otherUser, 
  onClose,
  isMinimized = false,
  onToggleMinimize 
}: ChatWindowProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    isConnected,
    sendMessage: sendChatMessage,
    markAsRead,
    error
  } = useChatConnection({
    chatRoomId,
    onMessage: (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    },
    onTyping: (userId, typing) => {
      if (userId !== user?.id) {
        setOtherUserTyping(typing);
      }
    },
    onMessagesRead: () => {
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    },
    onChatHistory: (history) => {
      setMessages(history);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    sendChatMessage({
      type: 'chat_message',
      chatRoomId,
      senderId: user.id,
      messageText: message.trim(),
      messageType: 'text'
    });

    setMessage('');
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendChatMessage({
        type: 'typing_start',
        chatRoomId
      });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      sendChatMessage({
        type: 'typing_stop',
        chatRoomId
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when chat opens
    if (chatRoomId && user) {
      markAsRead();
    }
  }, [chatRoomId, user, markAsRead]);

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
        <CardHeader className="pb-2 cursor-pointer" onClick={onToggleMinimize}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <CardTitle className="text-sm">{otherUser.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {serviceType.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 shadow-lg flex flex-col" data-testid="chat-window">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{otherUser.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {otherUser.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Online' : 'Offline'}</span>
                <span>•</span>
                <span>Order #{orderId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {otherUser.phone && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`tel:${otherUser.phone}`, '_self')}
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {onToggleMinimize && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleMinimize}
                title="Minimize"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 py-2">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.senderId === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div>{msg.messageText}</div>
                  <div className={`text-xs mt-1 ${
                    msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    {msg.senderId === user?.id && (
                      <span className="ml-2">
                        {msg.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>{otherUser.name} is typing</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <div className="p-3 border-t">
        {error && (
          <div className="text-xs text-red-500 mb-2">
            Connection error: {error}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${otherUser.name}...`}
            className="flex-1"
            disabled={!isConnected}
            data-testid="chat-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            size="sm"
            data-testid="chat-send-button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}