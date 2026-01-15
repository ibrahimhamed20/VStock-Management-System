import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, StopCircle } from 'lucide-react';
import { aiAgentService, type ChatMessage } from '../services/aiAgentService';
// import { useAuthStore } from '@auth/stores'; // Keeping this if we need user details later

export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        if (inputRef.current) inputRef.current.style.height = 'auto';
        setIsLoading(true);
        setError(null);

        try {
            const response = await aiAgentService.chat({
                query: userMessage.content,
                conversationId: undefined,
            });

            const botMessage: ChatMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: new Date(response.timestamp),
                html: response.html,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setError('Failed to get response. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
            {/* Header - Minimalist */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <span className="text-lg">Store AI Assistant</span>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Beta</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {messages.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <Bot size={48} className="text-gray-800" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">How can I help you today?</h2>
                        <p className="text-gray-500 max-w-md">
                            I can analyze your inventory, track sales performance, or provide business insights.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col py-6">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`w-full px-4 py-6 hover:bg-gray-50/50 transition-colors ${msg.role === 'assistant' ? 'bg-transparent' : 'bg-transparent'
                                    }`}
                            >
                                <div className="max-w-3xl mx-auto flex gap-6">
                                    <div className="flex-shrink-0 mt-1">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'assistant'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="font-medium text-sm text-gray-900 mb-1">
                                            {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                                        </div>
                                        <div className="prose prose-slate max-w-none text-gray-800 leading-relaxed">
                                            {msg.html ? (
                                                <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="w-full px-4 py-6">
                                <div className="max-w-3xl mx-auto flex gap-6">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                                            <Bot size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="w-full px-4 py-4">
                                <div className="max-w-3xl mx-auto flex gap-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="max-w-3xl mx-auto">
                    <div
                        className={`relative flex items-end gap-2 p-3 bg-white border rounded-2xl shadow-sm transition-all ${isInputFocused ? 'border-gray-400 ring-1 ring-gray-200' : 'border-gray-200'
                            }`}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            placeholder="Message Store AI..."
                            className="flex-1 max-h-[200px] min-h-[24px] bg-transparent border-none focus:ring-0 resize-none p-0 text-gray-800 placeholder-gray-400 leading-relaxed"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${input.trim() && !isLoading
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? <StopCircle size={18} /> : <Send size={18} />}
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-400">
                            AI results may be inaccurate. Verify important data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
