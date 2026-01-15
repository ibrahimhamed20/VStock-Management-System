import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    html?: string;
}

export interface ChatResponse {
    message: string;
    html?: string;
    timestamp: string;
    conversationId: string;
}

export interface ChatQuery {
    query: string;
    conversationId?: string;
}

export const aiAgentService = {
    chat: async (data: ChatQuery): Promise<ChatResponse> => {
        // Get token from localStorage
        const authStorage = localStorage.getItem('auth-storage');
        let token = '';

        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                token = parsed.state?.accessToken;
            } catch (e) {
                console.error('Failed to parse auth token', e);
            }
        }

        const response = await axios.post<ChatResponse>(
            `${API_URL}/ai-agent/chat`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    },
};
