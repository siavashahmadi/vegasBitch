import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Message, Poll } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import itinerary from '../itinerary';

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = 'vegasBitchGroupChat';

// Mock locations in Vegas for the demo
const vegasLocations = [
  { 
    name: 'Aria Resort & Casino', 
    address: '3730 S Las Vegas Blvd, Las Vegas, NV 89158',
    coords: { lat: 36.1072, lng: -115.1728 }
  },
  { 
    name: 'MGM Grand', 
    address: '3799 S Las Vegas Blvd, Las Vegas, NV 89109',
    coords: { lat: 36.1027, lng: -115.1702 }
  },
  { 
    name: 'Bellagio', 
    address: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',
    coords: { lat: 36.1129, lng: -115.1767 }
  },
  { 
    name: 'Caesars Palace', 
    address: '3570 S Las Vegas Blvd, Las Vegas, NV 89109',
    coords: { lat: 36.1162, lng: -115.1747 }
  }
];

// Mock data with string timestamps
const mockMessages: Message[] = [
  {
    id: generateId(),
    sender: "Kiarash",
    text: "Just arrived at the hotel!",
    timestamp: new Date(new Date().getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    is_location: true,
    location: vegasLocations[0]
  },
  {
    id: generateId(),
    sender: "Sia",
    text: "At the pool. Come join!",
    timestamp: new Date(new Date().getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    is_location: true, 
    location: vegasLocations[1]
  },
  {
    id: generateId(),
    sender: 'Daniel',
    text: "I'll be there in an hour. Who's at the hotel already?",
    timestamp: new Date(new Date().getTime() - 9 * 60 * 60 * 1000).toISOString(), // 9 hours ago
  },
  {
    id: generateId(),
    sender: 'Kyon',
    text: "I'm going to be a little late to dinner. Save me a seat.",
    timestamp: new Date(new Date().getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: generateId(),
    sender: 'Sia',
    text: "Just checked in. Room 1408. Let's meet at the lobby bar before dinner.",
    timestamp: new Date(new Date().getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: generateId(),
    sender: 'Kyon',
    text: "Check out this amazing DJ!",
    timestamp: new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    is_voice_memo: true,
    voice_memo_url: "https://example.com/voice-memo.mp3",
    voice_memo_duration: 45
  },
  {
    id: generateId(),
    sender: 'Peter',
    text: "Look at this view",
    timestamp: new Date(new Date().getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    is_photo: true,
    photo_url: "https://example.com/photo.jpg",
    photo_caption: "Amazing view from the pool!"
  },
  {
    id: generateId(),
    sender: 'Peter',
    text: "Don't forget we have dinner reservations at 8!",
    timestamp: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  }
];

const mockPolls: Poll[] = [
  {
    id: generateId(),
    question: "Where should we go for dinner?",
    options: ["Gordon Ramsay Hell's Kitchen", "Guy Fieri's Vegas Kitchen", "Bobby Flay's Mesa Grill"],
    creator: "Kiarash",
    votes: {},
    is_active: true,
    created_at: new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  }
];

const GroupChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(itinerary.people[0].name);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: [''] });
  const [showTips, setShowTips] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update the WebSocket message handler
  useWebSocket((message) => {
    if (message.type === 'message') {
      setMessages(prev => [...prev, message.payload.new]);
    } else if (message.type === 'poll') {
      setPolls(prev => {
        const index = prev.findIndex(p => p.id === message.payload.new.id);
        if (index === -1) return [...prev, message.payload.new];
        const updated = [...prev];
        updated[index] = message.payload.new;
        return updated;
      });
    }
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesData, pollsData] = await Promise.all([
          api.getMessages(),
          api.getPolls()
        ]);
        setMessages(messagesData);
        setPolls(pollsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Fallback to mock data if API fails
        setMessages(mockMessages);
        setPolls(mockPolls);
      }
    };
    fetchData();
  }, []);

  // Handle recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await api.sendMessage({
        sender: selectedPerson,
        text: newMessage,
        is_location: false,
        is_voice_memo: false,
        is_photo: false
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) return;

    try {
      const poll = await api.createPoll({
        question: newPoll.question,
        options: newPoll.options,
        creator: selectedPerson,
        is_active: true
      });
      setPolls(prev => [...prev, poll]);
      setShowPollCreator(false);
      setNewPoll({ question: '', options: [''] });
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const updatedPoll = await api.voteOnPoll(pollId, selectedPerson, optionIndex);
      setPolls(prev => prev.map(p => p.id === pollId ? updatedPoll : p));
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await api.uploadFile(file);
      const message = await api.sendMessage({
        sender: selectedPerson,
        text: '',
        is_photo: true,
        photo_url: url,
        is_location: false,
        is_voice_memo: false
      });
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'location' | 'polls'>('chat');
  const [seeingFriends, setSeeingFriends] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add new state variables for voice memo and photo features
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_polls`, JSON.stringify(polls));
  }, [polls]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const dateStr = formatDate(new Date(message.timestamp));
      const existingGroup = groups.find(g => g.date === dateStr);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: dateStr,
          messages: [message]
        });
      }
    });
    
    return groups;
  };

  const findMyFriends = () => {
    setSeeingFriends(true);
    
    // In a real app, this would trigger location sharing with friends
    // For this demo, we'll simulate finding friends after a short delay
    setTimeout(() => {
      setSeeingFriends(false);
      
      const randomPerson = itinerary.people
        .filter(p => p.name !== selectedPerson)
        [Math.floor(Math.random() * (itinerary.people.length - 1))];
      
      const randomLocation = vegasLocations[Math.floor(Math.random() * vegasLocations.length)];
      
      // Create a system message
      const newMsg: Message = {
        id: generateId(),
        sender: 'System',
        text: `${randomPerson.name} is at ${randomLocation.name}. They're about 10 minutes away from you.`,
        timestamp: new Date().toISOString(),
        is_location: true,
        location: randomLocation
      };
      
      setMessages([...messages, newMsg]);
    }, 3000);
  };

  const renderPollResults = (poll: Poll) => {
    const totalVotes = Object.keys(poll.votes).length;
    
    return (
      <div className="mt-2">
        <div className="text-xs text-cyber-gold mb-1">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</div>
        
        {poll.options.map((option, index) => {
          const votes = Object.values(poll.votes).filter(v => v === index).length;
          const percentage = totalVotes === 0 ? 0 : (votes / totalVotes) * 100;
          
          return (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{option}</span>
                <span>{votes} ({Math.round(percentage)}%)</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
                <motion.div 
                  className="h-full bg-cyber-pink"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(poll.votes)
                  .filter(([_, opt]) => opt === index)
                  .map(([person]) => (
                    <span key={person} className="text-xs px-1 bg-gray-800 rounded">
                      {person}
                    </span>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const messageGroups = groupMessagesByDate(messages);

  // Add new handlers for voice memo and photo functionality
  const handleStartRecording = () => {
    // In a real app, this would use the MediaRecorder API
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    
    // In a real app, this would save the recording and get a URL
    const mockUrl = 'https://example.com/voice-memo.mp3';
    
    // Create a new message with the voice memo
    const newMsg: Message = {
      id: generateId(),
      sender: selectedPerson,
      text: "Voice Memo",
      timestamp: new Date().toISOString(),
      is_voice_memo: true,
      voice_memo_url: mockUrl,
      voice_memo_duration: recordingTime,
      is_location: false,
      is_photo: false
    };
    
    setMessages([...messages, newMsg]);
    setRecordingTime(0);
    setShowMediaOptions(false);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, this would upload the file and get a URL
    const mockUrl = URL.createObjectURL(file);
    setSelectedImage(mockUrl);
    setShowMediaOptions(false);
  };

  const handleSendPhoto = async () => {
    if (!selectedImage) return;

    try {
      // In a real app, this would upload the image to your backend
      const mockPhotoUrl = typeof selectedImage === 'string' 
        ? selectedImage 
        : URL.createObjectURL(selectedImage);

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: selectedPerson,
        text: '',
        timestamp: new Date().toISOString(),
        is_photo: true,
        photo_url: mockPhotoUrl,
        photo_caption: photoCaption,
        is_location: false,
        is_voice_memo: false
      };

      setMessages(prev => [...prev, newMessage]);
      setSelectedImage(null);
      setPhotoCaption('');
      setShowPhotoModal(false);
      setShowMediaOptions(false);
    } catch (error) {
      console.error('Error sending photo:', error);
    }
  };

  const openPhotoModal = (url: string) => {
    setSelectedPhotoUrl(url);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotoUrl('');
  };

  // Add voice memo rendering
  const renderVoiceMemo = (voice_memo_url: string, voice_memo_duration: number) => {
    return (
      <div className="p-2 bg-black/50 rounded border border-cyber-blue/20 w-full flex items-center gap-2 mt-2">
        <motion.button
          className="p-2 bg-cyber-blue/20 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => console.log('Playing voice memo:', voice_memo_url)}
        >
          <span>▶️</span>
        </motion.button>
        <div className="flex-1">
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div 
              className="bg-cyber-blue h-1 rounded-full"
              style={{ width: '30%' }} // In a real app, this would be based on playback progress
            />
          </div>
        </div>
        <span className="text-xs text-gray-400">{formatRecordingTime(voice_memo_duration)}</span>
      </div>
    );
  };

  // Add photo rendering
  const renderPhoto = (photo_url: string, photo_caption?: string) => {
    return (
      <div className="mt-2">
        <motion.div
          className="relative rounded-lg overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openPhotoModal(photo_url)}
        >
          <img 
            src={photo_url} 
            alt={photo_caption || "Photo"} 
            className="w-full h-auto max-h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-2 text-white text-sm">
              {photo_caption && <span>{photo_caption}</span>}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const handleSendLocation = async (location: typeof vegasLocations[0]) => {
    try {
      const message = await api.sendMessage({
        sender: selectedPerson,
        text: `I'm at ${location.name}`,
        is_location: true,
        location,
        is_voice_memo: false,
        is_photo: false
      });
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp).toISOString()
      }]);
      setShowLocationPicker(false);
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  // Add missing functions
  const handleAddPollOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemovePollOption = (index: number) => {
    if (newPoll.options.length <= 2) return; // Need at least 2 options
    
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      const updatedPoll = await api.voteOnPoll(pollId, selectedPerson, -1); // -1 indicates closing the poll
      setPolls(prev => prev.map(p => p.id === pollId ? {
        ...updatedPoll,
        is_active: false
      } : p));
    } catch (error) {
      console.error('Error closing poll:', error);
    }
  };

  const handleSendVoiceMemo = async () => {
    try {
      // In a real app, this would upload the audio file to your backend
      const mockVoiceMemoUrl = 'https://example.com/voice-memo.mp3';
      const mockDuration = 30; // seconds

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: selectedPerson,
        text: '',
        timestamp: new Date().toISOString(),
        is_voice_memo: true,
        voice_memo_url: mockVoiceMemoUrl,
        voice_memo_duration: mockDuration,
        is_location: false,
        is_photo: false
      };

      setMessages(prev => [...prev, newMessage]);
      setIsRecording(false);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error sending voice memo:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender === selectedPerson;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          <div className={`p-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-cyber-blue/20 text-white' 
              : 'bg-gray-800/50 text-gray-200'
          }`}>
            {message.sender !== selectedPerson && message.sender !== 'System' && (
              <div className="text-xs text-cyber-gold font-bold mb-1">
                {message.sender}
              </div>
            )}
            
            {message.is_location && message.location && (
              <div className="mt-2">
                <a
                  href={`https://www.google.com/maps?q=${message.location.coords?.lat},${message.location.coords?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyber-blue hover:text-cyber-pink"
                >
                  📍 {message.location.name}
                </a>
              </div>
            )}

            {message.is_voice_memo && message.voice_memo_url && (
              renderVoiceMemo(message.voice_memo_url, message.voice_memo_duration || 0)
            )}

            {message.is_photo && message.photo_url && (
              renderPhoto(message.photo_url, message.photo_caption)
            )}

            {!message.is_location && !message.is_voice_memo && !message.is_photo && (
              <p className="text-sm">{message.text}</p>
            )}

            <div className="text-right mt-1">
              <span className="text-xs text-gray-500">
                {formatTime(new Date(message.timestamp))}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-lg rounded-xl p-4">
      {/* Header with tabs */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyber-blue flex items-center">
          <motion.span
            className="inline-block mr-2"
            animate={{ 
              rotate: [0, 10, 0, -10, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            👥
          </motion.span>
          Vegas Crew
        </h2>
        
        <div className="flex gap-2">
          <motion.button 
            className={`px-3 py-1 rounded-full text-xs ${
              activeTab === 'chat' ? 'bg-cyber-pink text-black font-bold' : 'bg-gray-800 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </motion.button>
          <motion.button 
            className={`px-3 py-1 rounded-full text-xs ${
              activeTab === 'location' ? 'bg-cyber-pink text-black font-bold' : 'bg-gray-800 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('location')}
          >
            Location
          </motion.button>
          <motion.button 
            className={`px-3 py-1 rounded-full text-xs ${
              activeTab === 'polls' ? 'bg-cyber-pink text-black font-bold' : 'bg-gray-800 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('polls')}
          >
            Polls
          </motion.button>
        </div>
      </div>
      
      {/* Person Selector */}
      <div className="mb-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {itinerary.people.map(person => (
            <motion.button
              key={person.name}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                selectedPerson === person.name 
                  ? 'bg-cyber-pink text-black font-bold' 
                  : 'bg-gray-800 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPerson(person.name)}
            >
              {person.name}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Main content area - changes based on active tab */}
      <div className="flex-grow overflow-y-auto scrollbar-hide mb-4 bg-black/40 rounded-lg p-3">
        {activeTab === 'chat' && (
          <div>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 text-xs bg-gray-800 rounded-full mb-3">
                    {group.date}
                  </span>
                </div>
                
                {group.messages.map(message => renderMessage(message))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {activeTab === 'location' && (
          <div>
            <motion.div 
              className="bg-gradient-to-r from-black/80 to-indigo-900/20 p-4 rounded-lg border border-cyber-blue/30 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-cyber-blue mb-3">Share Your Location</h3>
              <p className="text-sm mb-3">Let your friends know where you are by sharing your current location.</p>
              
              {showLocationPicker ? (
                <div className="space-y-2">
                  <h4 className="text-xs text-cyber-gold mb-2">Select a location:</h4>
                  {vegasLocations.map(location => (
                    <motion.button
                      key={location.name}
                      className="w-full text-left p-2 border border-cyber-blue/20 rounded bg-black/50 text-sm flex justify-between items-center"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(5, 217, 232, 0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendLocation(location)}
                    >
                      <div>
                        <div className="text-white">{location.name}</div>
                        <div className="text-xs text-gray-400">{location.address}</div>
                      </div>
                      <span className="text-cyber-blue">📍</span>
                    </motion.button>
                  ))}
                  
                  <motion.button
                    className="w-full p-2 mt-2 bg-gray-800 rounded text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLocationPicker(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  className="w-full p-3 bg-cyber-blue/20 rounded text-cyber-blue border border-cyber-blue/30"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(5, 217, 232, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLocationPicker(true)}
                >
                  Share Location
                </motion.button>
              )}
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-black/80 to-pink-900/20 p-4 rounded-lg border border-cyber-pink/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-cyber-pink mb-3">Find My Friends</h3>
              <p className="text-sm mb-3">Lost your friends in the crowd? See where everyone is right now.</p>
              
              {seeingFriends ? (
                <div className="text-center py-4">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-cyber-pink/20 mx-auto mb-3 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                      borderRadius: ["50%", "40%", "50%"] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: 'loop' 
                    }}
                  >
                    <span className="text-xl">🔍</span>
                  </motion.div>
                  <p className="text-sm text-cyber-gold">Searching for friends...</p>
                </div>
              ) : (
                <motion.button
                  className="w-full p-3 bg-cyber-pink/20 rounded text-cyber-pink border border-cyber-pink/30"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 42, 109, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={findMyFriends}
                >
                  Find My Friends
                </motion.button>
              )}
            </motion.div>
            
            <h3 className="text-cyber-gold mt-6 mb-3">Recent Locations</h3>
            
            {messages.filter(m => m.is_location).length === 0 ? (
              <p className="text-sm text-gray-400">No location updates yet</p>
            ) : (
              <div className="space-y-3">
                {messages
                  .filter(m => m.is_location)
                  .slice(-3)
                  .reverse()
                  .map(message => (
                    <motion.div
                      key={message.id}
                      className="p-3 border border-cyber-blue/20 rounded bg-black/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-cyber-gold text-sm">{message.sender}</span>
                        <span className="text-xs text-gray-400">
                          {formatTime(new Date(message.timestamp))}
                        </span>
                      </div>
                      {message.location && (
                        <div className="text-sm flex items-start gap-2">
                          <span className="text-cyber-blue">📍</span>
                          <div>
                            <div>{message.location.name}</div>
                            <div className="text-xs text-gray-400">{message.location.address}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                }
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'polls' && (
          <div>
            <motion.div 
              className="bg-gradient-to-r from-black/80 to-purple-900/20 p-4 rounded-lg border border-cyber-gold/30 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-cyber-gold mb-3">Quick Polls</h3>
              <p className="text-sm mb-3">Create a poll to help the group make decisions quickly.</p>
              
              {showPollCreator ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-cyber-blue mb-1 block">Question:</label>
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-cyber-blue/30 rounded p-2 text-white"
                      placeholder="Where should we go next?"
                      value={newPoll.question}
                      onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-cyber-blue mb-1 block">Options:</label>
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="flex-grow bg-black/50 border border-cyber-blue/30 rounded p-2 text-white"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        />
                        {newPoll.options.length > 2 && (
                          <motion.button
                            className="px-2 bg-red-900/30 rounded border border-red-500/30"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemovePollOption(index)}
                          >
                            ×
                          </motion.button>
                        )}
                      </div>
                    ))}
                    
                    <motion.button
                      className="w-full mt-2 p-2 bg-gray-800 rounded text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddPollOption}
                    >
                      + Add Option
                    </motion.button>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      className="flex-1 p-2 bg-cyber-gold/20 rounded text-cyber-gold border border-cyber-gold/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreatePoll}
                    >
                      Create Poll
                    </motion.button>
                    <motion.button
                      className="flex-1 p-2 bg-gray-800 rounded text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPollCreator(false)}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  className="w-full p-3 bg-cyber-gold/20 rounded text-cyber-gold border border-cyber-gold/30"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 215, 0, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPollCreator(true)}
                >
                  Create New Poll
                </motion.button>
              )}
            </motion.div>
            
            <h3 className="text-cyber-blue mb-3">Active Polls</h3>
            
            {polls.filter(p => p.is_active).length === 0 ? (
              <p className="text-sm text-gray-400">No active polls</p>
            ) : (
              <div className="space-y-4">
                {polls
                  .filter(p => p.is_active)
                  .map(poll => (
                    <motion.div 
                      key={poll.id}
                      className="p-4 border border-cyber-pink/30 rounded bg-gradient-to-br from-black/80 to-purple-900/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex justify-between mb-2">
                        <h4 className="text-cyber-pink font-bold">{poll.question}</h4>
                        <span className="text-xs text-gray-400">
                          {formatTime(new Date(poll.created_at))}
                        </span>
                      </div>
                      
                      <div className="text-xs text-cyber-blue mb-3">
                        Created by {poll.creator}
                      </div>
                      
                      {/* If I haven't voted, show options */}
                      {!poll.votes[selectedPerson] ? (
                        <div className="space-y-2 mb-3">
                          {poll.options.map((option, index) => (
                            <motion.button
                              key={index}
                              className="w-full p-2 bg-black/50 border border-cyber-pink/30 rounded text-left text-sm"
                              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 42, 109, 0.2)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleVote(poll.id, index)}
                            >
                              {option}
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-3">
                          {renderPollResults(poll)}
                        </div>
                      )}
                      
                      {poll.creator === selectedPerson && (
                        <motion.button
                          className="w-full p-2 mt-2 bg-gray-800 rounded text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleClosePoll(poll.id)}
                        >
                          Close Poll
                        </motion.button>
                      )}
                    </motion.div>
                  ))
                }
              </div>
            )}
            
            {polls.filter(p => !p.is_active).length > 0 && (
              <>
                <h3 className="text-gray-500 mt-6 mb-3">Closed Polls</h3>
                <div className="space-y-3 opacity-70">
                  {polls
                    .filter(p => !p.is_active)
                    .slice(0, 2) // Show only the last 2 closed polls
                    .map(poll => (
                      <motion.div 
                        key={poll.id}
                        className="p-3 border border-gray-700 rounded bg-black/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex justify-between mb-2">
                          <h4 className="text-gray-300">{poll.question}</h4>
                          <span className="text-xs text-gray-500">Closed</span>
                        </div>
                        
                        {renderPollResults(poll)}
                      </motion.div>
                    ))
                  }
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Input area */}
      {activeTab === 'chat' && (
        <div className="mt-auto">
          {/* Voice recording UI */}
          {isRecording && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 p-6 rounded-lg w-80">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Recording... {formatRecordingTime(recordingTime)}</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    className="flex-1 p-2 bg-red-500 rounded text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelRecording}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="flex-1 p-2 bg-green-500 rounded text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendVoiceMemo}
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </div>
          )}
          
          {/* Photo preview UI */}
          {selectedImage && (
            <div className="bg-black/50 border border-cyber-blue/30 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyber-blue">Photo Preview</span>
                <motion.button
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedImage(null)}
                >
                  ✕
                </motion.button>
              </div>
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedImage}
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    className="w-full bg-black/70 border border-cyber-blue/30 rounded p-2 text-white text-sm mb-2"
                    placeholder="Add a caption..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                  <motion.button
                    className="w-full py-1 bg-cyber-blue rounded text-xs"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendPhoto}
                  >
                    Send Photo
                  </motion.button>
                </div>
              </div>
            </div>
          )}
          
          {/* Regular chat input UI */}
          {!isRecording && !selectedImage && (
            <div className="flex gap-2">
              <div className="relative">
                <motion.button
                  className="h-full px-2 bg-cyber-gold/70 rounded-l border-r border-black"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                >
                  <span className="text-lg">+</span>
                </motion.button>
                
                {/* Media options menu */}
                {showMediaOptions && (
                  <motion.div
                    className="absolute bottom-12 left-0 bg-black/90 border border-cyber-blue/30 rounded-lg p-2 w-48"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <motion.button
                      className="w-full text-left p-2 flex items-center gap-2 hover:bg-black/50 rounded"
                      whileHover={{ x: 3 }}
                      onClick={handleStartRecording}
                    >
                      <span className="text-cyber-pink">🎤</span>
                      <span className="text-sm">Voice Memo</span>
                    </motion.button>
                    
                    <motion.button
                      className="w-full text-left p-2 flex items-center gap-2 hover:bg-black/50 rounded"
                      whileHover={{ x: 3 }}
                      onClick={handlePhotoClick}
                    >
                      <span className="text-cyber-blue">📷</span>
                      <span className="text-sm">Photo</span>
                    </motion.button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </motion.div>
                )}
              </div>
              
              <input
                type="text"
                className="flex-grow bg-black/50 border border-cyber-blue/30 rounded-r p-3 text-white"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <motion.button
                className="px-4 bg-cyber-pink rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
              >
                Send
              </motion.button>
            </div>
          )}
        </div>
      )}
      
      {/* Photo Modal */}
      {showPhotoModal && selectedPhotoUrl && (
        <motion.div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePhotoModal}
        >
          <motion.div
            className="relative max-w-4xl max-h-[80vh]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedPhotoUrl}
              alt="Full size preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <motion.button
              className="absolute top-2 right-2 bg-black/50 w-8 h-8 rounded-full flex items-center justify-center text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closePhotoModal}
            >
              ✕
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GroupChat; 