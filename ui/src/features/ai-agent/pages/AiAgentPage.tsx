import React from 'react';
import { ChatInterface } from '../components/ChatInterface';

export const AiAgentPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4 h-full flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">AI Intelligent Assistant</h1>
                <p className="text-gray-500 mt-1">
                    Ask questions about your inventory, sales, and get intelligent business insights.
                </p>
            </div>

            <div className="flex-1">
                <ChatInterface />
            </div>
        </div>
    );
};
