// src/Components/ProductAiChat.tsx
import React, { useState } from 'react';
import aiService from '../Service/AiService'; // 🔥 Must be a correct import to the AiService class

interface ProductAiChatProps {
    productDescription: string;
    productId?: number; // ✅ Correction 1: Make it optional (add a question mark)
}

export const ProductAiChat: React.FC<ProductAiChatProps> = ({ productDescription, productId }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: any }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    // 🔥 The state variable that stores the conversation sequence/context
    const [conversationContext, setConversationContext] = useState({});

    const safeRender = (data: any): string => {
        // ... (The safeRender function remains as is, to maintain stability)
        if (typeof data === 'string' || typeof data === 'number') return String(data);
        if (typeof data === 'object' && data !== null && 'answer' in data) return safeRender(data.answer);
        try { return "❌ Data Error: " + JSON.stringify(data, null, 2); }
        catch (e) { return "Error: Unrenderable content."; }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // ✅ Using AiService: Easier to send the Context
            const fullResponse = await aiService.askQuestion(
                userMessage.text,
                productId,
                conversationContext
            );

            // 🔥 Update Context and save the conversation sequence
            setConversationContext(fullResponse.context);

            const botMessage = { sender: 'bot' as const, text: fullResponse.answer };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("AI Request Failed:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, a communication error occurred: ${safeRender(error)}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-widget-container">
            {/* ... (The rest of the rendering remains the same) */}
            <button onClick={() => setIsOpen(!isOpen)} className="chat-toggle-btn">
                {isOpen ? "Close Chat" : "🤖 Ask Me"}
            </button>
            
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header"><h4>Smart Assistant</h4><button onClick={() => setIsOpen(false)} className="close-btn">X</button></div>
                    <div className="chat-messages">
                        <div className="message bot">Hello! **{safeRender(productDescription)}**</div>
                        {messages.map((msg, index) => (<div key={index} className={`message ${msg.sender}`}>{safeRender(msg.text)}</div>))}
                        {loading && <div className="message bot">Typing...</div>}
                    </div>
                    <div className="chat-input-area">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about the product..." onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
                        <button onClick={handleSend} disabled={loading || !input.trim()}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};