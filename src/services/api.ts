export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  is_location?: boolean;
  location?: {
    name: string;
    address: string;
    coords?: {
      lat: number;
      lng: number;
    };
  };
  is_voice_memo?: boolean;
  voice_memo_url?: string;
  voice_memo_duration?: number;
  is_photo?: boolean;
  photo_url?: string;
  photo_caption?: string;
}

export interface WellnessMetrics {
  person: string;
  hydration: number;
  sleep: number;
  alcohol_units: number;
  last_meditation: string | null;
  hangover_risk: number;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  creator: string;
  votes: Record<string, number>;
  is_active: boolean;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  date: string;
  activity: string;
  location: string;
  time: string;
  created_at: string;
}

export const api = {
  // Chat endpoints
  async getMessages(): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/chat/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Wellness endpoints
  async getWellnessMetrics(): Promise<WellnessMetrics[]> {
    const response = await fetch(`${API_BASE_URL}/wellness/metrics`);
    if (!response.ok) throw new Error('Failed to fetch wellness metrics');
    return response.json();
  },

  async updateWellnessMetrics(person: string, metrics: Partial<WellnessMetrics>): Promise<WellnessMetrics> {
    const response = await fetch(`${API_BASE_URL}/wellness/metrics`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, metrics }),
    });
    if (!response.ok) throw new Error('Failed to update wellness metrics');
    return response.json();
  },

  // Poll endpoints
  async getPolls(): Promise<Poll[]> {
    const response = await fetch(`${API_BASE_URL}/polls`);
    if (!response.ok) throw new Error('Failed to fetch polls');
    return response.json();
  },

  async createPoll(poll: Omit<Poll, 'id' | 'votes' | 'created_at'>): Promise<Poll> {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poll),
    });
    if (!response.ok) throw new Error('Failed to create poll');
    return response.json();
  },

  async voteOnPoll(pollId: string, person: string, optionIndex: number): Promise<Poll> {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, optionIndex }),
    });
    if (!response.ok) throw new Error('Failed to vote on poll');
    return response.json();
  },

  // File upload
  async uploadFile(file: File): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },

  async deleteFile(filePath: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/upload/${filePath}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file');
  },
}; 