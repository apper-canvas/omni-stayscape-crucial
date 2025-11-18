import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { messageService } from '@/services/api/messageService';
import { bookingService } from '@/services/api/bookingService';
import { propertyService } from '@/services/api/propertyService';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Badge from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Get conversation ID from URL params
  const conversationId = searchParams.get('conversation');
  const bookingId = searchParams.get('booking');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      handleSelectConversation(parseInt(conversationId));
    } else if (bookingId) {
      handleCreateConversationForBooking(parseInt(bookingId));
    }
  }, [conversationId, bookingId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = searchQuery 
        ? await messageService.searchConversations(searchQuery)
        : await messageService.getAllConversations();
      
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversationForBooking = async (targetBookingId) => {
    try {
      setLoading(true);
      
      // Check if conversation already exists
      const existingConversation = await messageService.getConversationByBookingId(targetBookingId);
      if (existingConversation) {
        handleSelectConversation(existingConversation.Id);
        return;
      }

      // Get booking and property details
      const booking = await bookingService.getById(targetBookingId);
      const property = await propertyService.getById(booking.propertyId);

      // Create new conversation
      const conversationData = {
        bookingId: targetBookingId,
        guestName: booking.guestName,
        hostName: "Property Host", // Default host name - would come from user system
        propertyTitle: property.title
      };

      const newConversation = await messageService.createConversation(conversationData);
      
      // Update URL and select conversation
      setSearchParams({ conversation: newConversation.Id.toString() });
      handleSelectConversation(newConversation.Id);
      
      // Refresh conversations list
      loadConversations();
      
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (convId) => {
    try {
      setMessagesLoading(true);
      setError('');

      // Get conversation details
      const conversation = await messageService.getConversationById(convId);
      setSelectedConversation(conversation);

      // Get messages for this conversation
      const conversationMessages = await messageService.getMessagesByConversationId(convId);
      setMessages(conversationMessages);

      // Mark conversation as read
      await messageService.markConversationAsRead(convId);

      // Update URL
      setSearchParams({ conversation: convId.toString() });

      // Update conversations list to reflect read status
      setConversations(prev => 
        prev.map(conv => 
          conv.Id === convId ? { ...conv, unreadCount: 0 } : conv
        )
      );

    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
      toast.error('Failed to load conversation');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);

      const messageData = {
        conversationId: selectedConversation.Id,
        senderId: "current_user",
        senderName: "You", // Would come from user context
        senderType: "guest", // Would be determined by user role
        message: newMessage.trim()
      };

      const sentMessage = await messageService.sendMessage(messageData);
      
      // Add message to current view
      setMessages(prev => [...prev, sentMessage]);
      
      // Clear input
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadConversations();
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading && conversations.length === 0) {
    return <Loading className="min-h-96" />;
  }

  if (error && conversations.length === 0) {
    return (
      <ErrorView 
        title="Unable to load messages"
        message={error}
        onRetry={loadConversations}
      />
    );
  }

  return (
    <div className="h-full flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={cn(
        "w-full md:w-96 border-r border-gray-200 flex flex-col bg-gray-50",
        selectedConversation && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 font-display">Messages</h1>
            <Badge variant="secondary" className="text-xs">
              {conversations.length} conversations
            </Badge>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2"
            />
            <ApperIcon 
              name="Search" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
            />
          </form>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <Empty
              icon="MessageCircle"
              title="No conversations"
              message="Start a conversation by sending a message about one of your bookings."
              action={
                <Button variant="primary" onClick={() => navigate('/bookings')}>
                  <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                  View Bookings
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <div
                  key={conversation.Id}
                  onClick={() => handleSelectConversation(conversation.Id)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-white transition-colors duration-200",
                    selectedConversation?.Id === conversation.Id && "bg-white border-r-2 border-primary-500"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <ApperIcon name="Home" className="h-5 w-5 text-primary-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate font-body">
                          {conversation.guestName} & {conversation.hostName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="primary" className="text-xs ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1 font-medium">
                        {conversation.propertyTitle}
                      </p>
                      
                      <p className="text-sm text-gray-600 truncate mb-1 font-body">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      
                      <p className="text-xs text-gray-400">
                        {formatLastMessageTime(conversation.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className={cn(
        "flex-1 flex flex-col",
        !selectedConversation && "hidden md:flex"
      )}>
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <ApperIcon name="MessageCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2 font-display">
                Select a conversation
              </h3>
              <p className="text-gray-500 font-body">
                Choose a conversation from the sidebar to view messages
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Message Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setSearchParams({});
                  }}
                  className="md:hidden mr-3 p-1 text-gray-500 hover:text-gray-700"
                >
                  <ApperIcon name="ArrowLeft" className="h-5 w-5" />
                </button>
                
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 font-display">
                    {selectedConversation.guestName} & {selectedConversation.hostName}
                  </h2>
                  <p className="text-sm text-gray-600 font-body">
                    About: {selectedConversation.propertyTitle}
                  </p>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  Booking #{selectedConversation.bookingId}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messagesLoading ? (
                <Loading className="min-h-32" />
              ) : messages.length === 0 ? (
                <Empty
                  icon="MessageSquare"
                  title="No messages yet"
                  message="Start the conversation by sending your first message."
                />
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === "current_user";
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                    
                    return (
                      <div
                        key={message.Id}
                        className={cn(
                          "flex",
                          isCurrentUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex items-end space-x-2 max-w-xs lg:max-w-md",
                          isCurrentUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                        )}>
                          {showAvatar && (
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                              isCurrentUser
                                ? "bg-primary-500 text-white"
                                : "bg-gray-300 text-gray-700"
                            )}>
                              {message.senderName.charAt(0)}
                            </div>
                          )}
                          
                          <div className={cn(
                            "px-4 py-2 rounded-2xl",
                            isCurrentUser
                              ? "bg-primary-500 text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          )}>
                            <p className="text-sm font-body whitespace-pre-wrap">
                              {message.message}
                            </p>
                            <p className={cn(
                              "text-xs mt-1",
                              isCurrentUser ? "text-primary-100" : "text-gray-500"
                            )}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  variant="primary"
                  className="px-4 py-2 self-end"
                >
                  {sendingMessage ? (
                    <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                  ) : (
                    <ApperIcon name="Send" className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;