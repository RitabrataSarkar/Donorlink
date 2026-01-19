import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  subscribeToUserChats, 
  subscribeToMessages, 
  sendMessage as sendChatMessage,
  createOrGetChat,
  markMessagesAsRead 
} from '../services/chatService';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unsubscribeChats, setUnsubscribeChats] = useState(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null);

  // Subscribe to user's chats when user is logged in
  useEffect(() => {
    console.log('ChatContext: User changed:', currentUser?.uid);
    
    if (currentUser) {
      console.log('ChatContext: Setting up chat subscription for user:', currentUser.uid);
      
      const unsubscribe = subscribeToUserChats(currentUser.uid, (userChats) => {
        console.log('ChatContext: Received chats update:', userChats.length, userChats);
        setChats(userChats);
      });
      
      // Store the unsubscribe function directly
      setUnsubscribeChats(unsubscribe);

      return () => {
        console.log('ChatContext: Cleaning up chat subscription');
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else {
      console.log('ChatContext: No user, clearing chats');
      setChats([]);
      setActiveChat(null);
      setMessages([]);
      setIsChatOpen(false);
      
      // Clean up existing subscription
      if (unsubscribeChats) {
        unsubscribeChats();
        setUnsubscribeChats(null);
      }
    }
  }, [currentUser]);

  // Subscribe to messages when active chat changes
  useEffect(() => {
    if (activeChat && currentUser) {
      // Unsubscribe from previous messages
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }

      const unsubscribe = subscribeToMessages(activeChat.id, (chatMessages) => {
        setMessages(chatMessages);
        // Mark messages as read
        markMessagesAsRead(activeChat.id, currentUser.uid);
      });
      
      setUnsubscribeMessages(() => unsubscribe);

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      setMessages([]);
      if (unsubscribeMessages) {
        unsubscribeMessages();
        setUnsubscribeMessages(null);
      }
    }
  }, [activeChat, currentUser]);

  // Start a new chat with a donor
  const startChat = async (donorId, donorName) => {
    if (!currentUser) {
      console.error('No current user found');
      return;
    }
    
    console.log('Starting chat:', { currentUserId: currentUser.uid, donorId, donorName });
    
    try {
      setLoading(true);
      const currentUserName = currentUser.displayName || currentUser.email || 'Anonymous';
      const chatId = await createOrGetChat(currentUser.uid, donorId, donorName, currentUserName);
      
      // Find the chat in our chats list or create a temporary one
      let chat = chats.find(c => c.id === chatId);
      if (!chat) {
        chat = {
          id: chatId,
          participants: [currentUser.uid, donorId],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'You',
            [donorId]: donorName
          },
          lastMessage: '',
          lastMessageTime: new Date()
        };
      }
      
      setActiveChat(chat);
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (message) => {
    if (!activeChat || !currentUser || !message.trim()) return;

    try {
      await sendChatMessage(
        activeChat.id, 
        currentUser.uid, 
        currentUser.displayName || 'Anonymous',
        message
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Open chat by chat ID
  const openChat = (chat) => {
    setActiveChat(chat);
    setIsChatOpen(true);
  };

  // Close chat
  const closeChat = () => {
    setIsChatOpen(false);
    setActiveChat(null);
  };

  // Get other participant's name in a chat
  const getOtherParticipantName = (chat) => {
    if (!chat || !currentUser) return 'Unknown';
    
    const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
    return chat.participantNames?.[otherParticipantId] || 'Unknown User';
  };

  // Get unread message count for a chat
  const getUnreadCount = (chat) => {
    // This would require additional logic to track unread messages
    // For now, we'll return 0
    return 0;
  };

  const value = {
    chats,
    activeChat,
    messages,
    isChatOpen,
    loading,
    startChat,
    sendMessage,
    openChat,
    closeChat,
    getOtherParticipantName,
    getUnreadCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
