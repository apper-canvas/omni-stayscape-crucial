import { toast } from 'react-toastify';

// Mock conversation data
const mockConversations = [
  {
    Id: 1,
    bookingId: 1,
    guestName: "Sarah Johnson",
    hostName: "Michael Chen",
    propertyTitle: "Luxury Downtown Loft",
    lastMessage: "Thank you for accepting my booking! I have a quick question about parking.",
    lastMessageTime: "2024-01-15T10:30:00Z",
    unreadCount: 1,
    status: "active"
  },
  {
    Id: 2,
    bookingId: 2,
    guestName: "David Wilson",
    hostName: "Emma Rodriguez",
    propertyTitle: "Cozy Mountain Cabin",
    lastMessage: "The cabin looks amazing! What's the best route from the highway?",
    lastMessageTime: "2024-01-14T16:45:00Z",
    unreadCount: 0,
    status: "active"
  },
  {
    Id: 3,
    bookingId: 3,
    guestName: "Lisa Wang",
    hostName: "James Thompson",
    propertyTitle: "Beachfront Villa Paradise",
    lastMessage: "Perfect! Looking forward to our stay. See you next week.",
    lastMessageTime: "2024-01-13T09:15:00Z",
    unreadCount: 2,
    status: "active"
  }
];

// Mock message data
const mockMessages = [
  {
    Id: 1,
    conversationId: 1,
    senderId: "guest_1",
    senderName: "Sarah Johnson",
    senderType: "guest",
    message: "Hi! I'm excited about my upcoming booking. Could you please tell me about parking options near the property?",
    timestamp: "2024-01-15T09:00:00Z",
    status: "delivered"
  },
  {
    Id: 2,
    conversationId: 1,
    senderId: "host_1",
    senderName: "Michael Chen",
    senderType: "host",
    message: "Hello Sarah! Welcome to my property. There's complimentary street parking right in front of the building, and a paid parking garage two blocks away if you prefer covered parking.",
    timestamp: "2024-01-15T09:15:00Z",
    status: "delivered"
  },
  {
    Id: 3,
    conversationId: 1,
    senderId: "guest_1",
    senderName: "Sarah Johnson",
    senderType: "guest",
    message: "Thank you for accepting my booking! I have a quick question about parking.",
    timestamp: "2024-01-15T10:30:00Z",
    status: "delivered"
  },
  {
    Id: 4,
    conversationId: 2,
    senderId: "guest_2",
    senderName: "David Wilson",
    senderType: "guest",
    message: "Hi Emma! The cabin looks amazing! What's the best route from the highway?",
    timestamp: "2024-01-14T16:45:00Z",
    status: "delivered"
  },
  {
    Id: 5,
    conversationId: 3,
    senderId: "guest_3",
    senderName: "Lisa Wang",
    senderType: "guest",
    message: "Thank you for the warm welcome! We're really looking forward to our stay.",
    timestamp: "2024-01-13T08:30:00Z",
    status: "delivered"
  },
  {
    Id: 6,
    conversationId: 3,
    senderId: "host_3",
    senderName: "James Thompson",
    senderType: "host",
    message: "You're very welcome! I've left some local restaurant recommendations and beach access information in the welcome folder. Enjoy your stay!",
    timestamp: "2024-01-13T09:00:00Z",
    status: "delivered"
  },
  {
    Id: 7,
    conversationId: 3,
    senderId: "guest_3",
    senderName: "Lisa Wang",
    senderType: "guest",
    message: "Perfect! Looking forward to our stay. See you next week.",
    timestamp: "2024-01-13T09:15:00Z",
    status: "delivered"
  }
];

// Service class for message operations
class MessageService {
  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const storedConversations = localStorage.getItem('stayscape_conversations');
      const storedMessages = localStorage.getItem('stayscape_messages');
      
      this.conversations = storedConversations ? JSON.parse(storedConversations) : [...mockConversations];
      this.messages = storedMessages ? JSON.parse(storedMessages) : [...mockMessages];
    } catch (error) {
      console.error('Error loading messages from storage:', error);
      this.conversations = [...mockConversations];
      this.messages = [...mockMessages];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('stayscape_conversations', JSON.stringify(this.conversations));
      localStorage.setItem('stayscape_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  }

  // Conversation methods
  async getAllConversations() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.conversations].sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  }

  async getConversationById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const conversation = this.conversations.find(c => c.Id === parseInt(id));
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return { ...conversation };
  }

  async getConversationByBookingId(bookingId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const conversation = this.conversations.find(c => c.bookingId === parseInt(bookingId));
    return conversation ? { ...conversation } : null;
  }

  async createConversation(conversationData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if conversation already exists for this booking
    const existingConversation = this.conversations.find(c => c.bookingId === conversationData.bookingId);
    if (existingConversation) {
      return { ...existingConversation };
    }

    const newConversation = {
      Id: Math.max(...this.conversations.map(c => c.Id), 0) + 1,
      bookingId: conversationData.bookingId,
      guestName: conversationData.guestName,
      hostName: conversationData.hostName,
      propertyTitle: conversationData.propertyTitle,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: "active"
    };

    this.conversations.push(newConversation);
    this.saveToStorage();
    return { ...newConversation };
  }

  async updateConversationLastMessage(conversationId, message, timestamp) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversationIndex = this.conversations.findIndex(c => c.Id === conversationId);
    if (conversationIndex === -1) {
      throw new Error('Conversation not found');
    }

    this.conversations[conversationIndex].lastMessage = message;
    this.conversations[conversationIndex].lastMessageTime = timestamp;
    this.conversations[conversationIndex].unreadCount += 1;
    
    this.saveToStorage();
    return { ...this.conversations[conversationIndex] };
  }

  async markConversationAsRead(conversationId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversationIndex = this.conversations.findIndex(c => c.Id === conversationId);
    if (conversationIndex !== -1) {
      this.conversations[conversationIndex].unreadCount = 0;
      this.saveToStorage();
    }
  }

  // Message methods
  async getMessagesByConversationId(conversationId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const messages = this.messages
      .filter(m => m.conversationId === parseInt(conversationId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return messages.map(m => ({ ...m }));
  }

  async sendMessage(messageData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newMessage = {
      Id: Math.max(...this.messages.map(m => m.Id), 0) + 1,
      conversationId: messageData.conversationId,
      senderId: messageData.senderId || "current_user",
      senderName: messageData.senderName,
      senderType: messageData.senderType,
      message: messageData.message,
      timestamp: new Date().toISOString(),
      status: "delivered"
    };

    this.messages.push(newMessage);

    // Update conversation last message
    await this.updateConversationLastMessage(
      messageData.conversationId,
      messageData.message,
      newMessage.timestamp
    );

    this.saveToStorage();
    toast.success('Message sent successfully');
    return { ...newMessage };
  }

  async deleteMessage(messageId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const messageIndex = this.messages.findIndex(m => m.Id === messageId);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }

    this.messages.splice(messageIndex, 1);
    this.saveToStorage();
    toast.success('Message deleted');
  }

  // Utility methods
  async getTotalUnreadCount() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  async searchConversations(query) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!query.trim()) {
      return this.getAllConversations();
    }

    const searchTerm = query.toLowerCase();
    const filtered = this.conversations.filter(conv =>
      conv.guestName.toLowerCase().includes(searchTerm) ||
      conv.hostName.toLowerCase().includes(searchTerm) ||
      conv.propertyTitle.toLowerCase().includes(searchTerm) ||
      conv.lastMessage.toLowerCase().includes(searchTerm)
    );

    return filtered.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  }
}

// Export service instance
export const messageService = new MessageService();
export default messageService;