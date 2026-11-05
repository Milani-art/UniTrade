import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Messages.css';

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messageSummaries, setMessageSummaries] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setError("Please log in to view messages.");
    }
  }, []);


  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          const availableUsers = data.filter(u => u.id !== currentUser.id);
          const summaryResponse = await fetch(`/api/messages/summaries/${currentUser.id}`);
          const summaries = summaryResponse.ok ? await summaryResponse.json() : [];
          setMessageSummaries(summaries);
          setUsers(sortUsers(availableUsers, summaries));
          const requestedSeller = searchParams.get('seller')?.toLowerCase();
          if (requestedSeller) {
            const matchingSeller = availableUsers.find((user) => `${user.firstName} ${user.lastName}`.toLowerCase() === requestedSeller || user.universityEmail?.toLowerCase() === requestedSeller);
            if (matchingSeller) {
              setSelectedUser(matchingSeller);
              if (!searchParams.get('fromCheckout')) {
                setNewMessage(`Hi ${matchingSeller.firstName}, is this item still available?`);
              }
            }
          }
        } else {
          console.error("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    
    fetchUsers();
  }, [currentUser, searchParams]);

  const sortUsers = (availableUsers, summaries) => {
    const summaryByUser = new Map(summaries.map(summary => [summary.userId, summary]));
    return [...availableUsers].sort((first, second) => {
      const firstSummary = summaryByUser.get(first.id);
      const secondSummary = summaryByUser.get(second.id);
      if (Boolean(firstSummary?.unread) !== Boolean(secondSummary?.unread)) {
        return firstSummary?.unread ? -1 : 1;
      }
      if (firstSummary?.lastMessageAt && secondSummary?.lastMessageAt) {
        return new Date(secondSummary.lastMessageAt) - new Date(firstSummary.lastMessageAt);
      }
      if (firstSummary?.lastMessageAt) return -1;
      if (secondSummary?.lastMessageAt) return 1;
      return `${first.firstName} ${first.lastName}`.localeCompare(`${second.firstName} ${second.lastName}`);
    });
  };

  useEffect(() => {
    if (!currentUser) return;

    const refreshSummaries = async () => {
      try {
        const response = await fetch(`/api/messages/summaries/${currentUser.id}`);
        if (!response.ok) return;
        const summaries = await response.json();
        setMessageSummaries(summaries);
        setUsers(currentUsers => sortUsers(currentUsers, summaries));
      } catch (err) {
        console.error("Error refreshing message summaries:", err);
      }
    };

    const interval = setInterval(refreshSummaries, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        await fetch(`/api/messages/${currentUser.id}/${selectedUser.id}/read`, { method: 'PUT' });
        const response = await fetch(`/api/messages/${currentUser.id}/${selectedUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          const updatedSummaries = messageSummaries.map(summary =>
            summary.userId === selectedUser.id ? { ...summary, unread: false } : summary
          );
          setMessageSummaries(updatedSummaries);
          setUsers(sortUsers(users, updatedSummaries));
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Simple polling for real-time feel
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, selectedUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedUser) return;
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedUser.id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Could not send message. Please try again.");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return <div className="error-message">Please log in to view messages.</div>;
  }

  return (
    <div>
      <h1>Messages</h1>
      <div className="messages-container">
        
        {/* Sidebar: Users List */}
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h2>Contacts</h2>
          </div>
          <div className="users-list">
            {users.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No other users found.</div>
            ) : (
              users.map(user => {
                const summary = messageSummaries.find(item => item.userId === user.id);
                return (
                <div 
                  key={user.id} 
                  className={`user-item ${selectedUser?.id === user.id ? 'active' : ''} ${summary?.unread ? 'unread' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="user-avatar">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.firstName} {user.lastName}{summary?.unread && <span className="unread-dot" aria-label="Unread received message" />}</div>
                    <div className="user-email">{summary?.lastMessageAt ? `Last message ${formatTime(summary.lastMessageAt)}` : `${user.universityEmail} ${user.email ? ` · ${user.email}` : ''}`}</div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {!selectedUser ? (
            <div className="empty-chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <h3>Select a conversation</h3>
              <p>Choose a contact from the sidebar to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '1rem', marginRight: '10px' }}>
                  {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                </div>
                <div><h3>{selectedUser.firstName} {selectedUser.lastName}</h3><span className="verified-contact">&#10003; Verified student</span></div>
              </div>
              
              <div className="messages-list">
                {loading && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px' }}>No messages yet. Say hi!</div>
                ) : (
                  messages.map(msg => {
                    const isSent = msg.sender.id === currentUser.id;
                    return (
                      <div key={msg.id} className={`message-bubble-container ${isSent ? 'sent' : 'received'}`}>
                        <div className="message-bubble">
                          {msg.content}
                        </div>
                        <div className="message-time">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                {error && <div className="error-message">{error}</div>}
                <form className="message-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
