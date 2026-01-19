import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const ChatList = () => {
  const { currentUser } = useAuth();
  const { startChat } = useChat();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch last message for a chat
  const fetchLastMessage = async (chatId) => {
    try {
      console.log('ChatList: Fetching last message for chat:', chatId);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      console.log('ChatList: Messages snapshot for chat', chatId, 'size:', snapshot.size);
      
      if (!snapshot.empty) {
        const lastMessageDoc = snapshot.docs[0];
        const messageData = lastMessageDoc.data();
        console.log('ChatList: Found last message for chat', chatId, ':', messageData);
        return messageData;
      } else {
        console.log('ChatList: No messages found for chat:', chatId);
      }
      return null;
    } catch (error) {
      console.error('ChatList: Error fetching last message for chat', chatId, error);
      return null;
    }
  };

  // Fetch chats directly from Firestore
  useEffect(() => {
    if (!currentUser) {
      setChats([]);
      setLoading(false);
      return;
    }

    console.log('ChatList: Fetching chats for user:', currentUser.uid);
    setLoading(true);
    setError(null);

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        console.log('ChatList: Received chats snapshot, size:', snapshot.size);
        
        // Fetch chats with their last messages
        const chatPromises = snapshot.docs.map(async (doc) => {
          const chatData = {
            id: doc.id,
            ...doc.data()
          };
          
          // Fetch last message for this chat
          const lastMessage = await fetchLastMessage(doc.id);
          if (lastMessage) {
            chatData.lastMessage = lastMessage.message; // Fixed: use 'message' field instead of 'text'
            chatData.lastMessageTime = lastMessage.timestamp;
            console.log('ChatList: Added last message to chat', doc.id, ':', lastMessage.message);
          } else {
            console.log('ChatList: No last message found for chat:', doc.id);
          }
          
          console.log('ChatList: Final chat data:', chatData);
          return chatData;
        });
        
        const chatsWithMessages = await Promise.all(chatPromises);
        setChats(chatsWithMessages);
        setLoading(false);
      },
      (error) => {
        console.error('ChatList: Error fetching chats:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('ChatList: Cleaning up chat subscription');
      unsubscribe();
    };
  }, [currentUser]);

  // Get other participant's name
  const getOtherParticipantName = (chat) => {
    if (!chat || !currentUser) return 'Unknown';
    const otherParticipantId = chat.participants?.find(id => id !== currentUser.uid);
    return chat.participantNames?.[otherParticipantId] || 'Unknown User';
  };

  // Handle chat click - open the chat modal
  const handleChatClick = async (chat) => {
    console.log('ChatList: Chat clicked:', chat);
    
    if (!chat || !currentUser) {
      console.error('ChatList: Invalid chat or user');
      return;
    }

    try {
      // Get the other participant's ID and name
      const otherParticipantId = chat.participants?.find(id => id !== currentUser.uid);
      const otherParticipantName = getOtherParticipantName(chat);
      
      if (!otherParticipantId) {
        console.error('ChatList: Could not find other participant');
        return;
      }

      console.log('ChatList: Starting chat with:', otherParticipantId, otherParticipantName);
      await startChat(otherParticipantId, otherParticipantName);
    } catch (error) {
      console.error('ChatList: Error opening chat:', error);
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">⚠️ Error loading messages</div>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
      
      {chats.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Start chatting with donors to see your messages here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => {
            const otherParticipantName = getOtherParticipantName(chat);
            
            return (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {otherParticipantName.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {otherParticipantName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
