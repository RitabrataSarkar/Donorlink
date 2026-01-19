import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Create or get existing chat between two users
export const createOrGetChat = async (currentUserId, otherUserId, otherUserName, currentUserName = 'You') => {
  try {
    console.log('Creating/getting chat:', { currentUserId, otherUserId, otherUserName, currentUserName });
    
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    // Create a consistent chat ID by sorting user IDs
    const chatId = [currentUserId, otherUserId].sort().join('_');
    console.log('Generated chat ID:', chatId);
    
    // Check if chat already exists
    const chatRef = doc(db, 'chats', chatId);
    
    // Create chat document if it doesn't exist
    const chatData = {
      id: chatId,
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUserName,
        [otherUserId]: otherUserName
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Setting chat document:', chatData);
    await setDoc(chatRef, chatData, { merge: true });
    console.log('Chat document created/updated successfully');

    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

// Send a message in a chat
export const sendMessage = async (chatId, senderId, senderName, message) => {
  try {
    console.log('Sending message:', { chatId, senderId, senderName, message });
    
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    if (!message || !message.trim()) {
      throw new Error('Message cannot be empty');
    }
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    console.log('Adding message to collection:', messagesRef.path);
    
    const messageData = {
      senderId,
      senderName,
      message: message.trim(),
      timestamp: serverTimestamp(),
      read: false
    };
    
    console.log('Message data:', messageData);
    const docRef = await addDoc(messagesRef, messageData);
    console.log('Message added with ID:', docRef.id);

    // Update chat's last message info
    const chatRef = doc(db, 'chats', chatId);
    const updateData = {
      lastMessage: message.trim(),
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Updating chat document:', updateData);
    await updateDoc(chatRef, updateData);
    console.log('Chat document updated successfully');

    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Subscribe to messages in a chat (real-time)
export const subscribeToMessages = (chatId, callback) => {
  console.log('Subscribing to messages for chat:', chatId);
  
  if (!db) {
    console.error('Firestore database not initialized');
    return () => {};
  }
  
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    console.log('Messages subscription update, snapshot size:', snapshot.size);
    const messages = [];
    snapshot.forEach((doc) => {
      const messageData = {
        id: doc.id,
        ...doc.data()
      };
      console.log('Found message:', messageData);
      messages.push(messageData);
    });
    console.log('Total messages found:', messages.length);
    callback(messages);
  }, (error) => {
    console.error('Error in messages subscription:', error);
  });
};

// Get user's chat list
export const getUserChats = async (userId) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participants', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    const chats = [];
    
    snapshot.forEach((doc) => {
      chats.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Subscribe to user's chat list (real-time)
export const subscribeToUserChats = (userId, callback) => {
  console.log('Subscribing to user chats for:', userId);
  
  if (!db) {
    console.error('Firestore database not initialized');
    return () => {};
  }
  
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef, 
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    console.log('Chat subscription update, snapshot size:', snapshot.size);
    const chats = [];
    snapshot.forEach((doc) => {
      const chatData = {
        id: doc.id,
        ...doc.data()
      };
      console.log('Found chat:', chatData);
      chats.push(chatData);
    });
    console.log('Total chats found:', chats.length);
    callback(chats);
  }, (error) => {
    console.error('Error in chat subscription:', error);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef, 
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = [];
    
    snapshot.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { read: true }));
    });
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};
