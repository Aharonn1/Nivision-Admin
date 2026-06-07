import React, { useState, useEffect, useRef } from 'react';
import aiService from '../Service/AiService';

export const DashboardAiChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState<any>({});
    
    // --- הודעת פתיחה נקייה ללא שמות ---
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([
        { sender: 'bot', text: 'שלום, אני כאן כדי לעזור לך לנתח את נתוני המכירות והביצועים של Nivision. מה תרצה לבדוק?' }
    ]);
    
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const response: any = await aiService.askQuestion(userMsg, undefined, context);
            
            let extractedText = "";
            if (response && typeof response === 'object') {
                extractedText = response.text || response.answer || "";
                if (!extractedText && typeof response === 'string') {
                    extractedText = response;
                }
            } else {
                extractedText = String(response || "");
            }

            if (!extractedText || extractedText === "[object Object]") {
                extractedText = "הסוכן מנתח את הנתונים, אנא שאל שוב בצורה ממוקדת.";
            }

            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: extractedText 
            }]);
            
            if (response && response.context) setContext(response.context);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "מצטער, חלה שגיאת תקשורת במערכת." }]);
        } finally {
            setLoading(false);
        }
    };

    // --- צבע המותג האחיד לכל האלמנטים ---
    const brandColor = '#121931'; // כחול כהה מהדאשבורד (כמו בכפתור ה-AI הראשי)

    return (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 999999, direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* כפתור AI עם כיתוב AI (בצבע המותג) */}
            <div onClick={() => setIsOpen(!isOpen)} style={{
                width: '65px', height: '65px', borderRadius: '50%', 
                backgroundColor: brandColor, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)', transition: 'all 0.3s ease',
                border: '2px solid rgba(255,255,255,0.1)',
                fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px'
            }}>
                {isOpen ? '✖' : 'AI'}
            </div>

            {/* חלון הצ'אט */}
            {isOpen && (
                <div style={{
                    position: 'absolute', bottom: '85px', right: '0', 
                    width: '350px', height: '500px',
                    backgroundColor: '#ffffff', borderRadius: '12px', 
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', 
                    boxShadow: '0 12px 40px rgba(0,0,0,0.25)', border: '1px solid #d1d5db'
                }}>
                    
                    {/* כותרת בצבע המותג */}
                    <div style={{ 
                        padding: '16px', backgroundColor: brandColor, color: 'white', 
                        fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        Nivision Strategic Agent
                    </div>
                    
                    {/* גוף השיחה */}
                    <div style={{ 
                        flex: 1, padding: '15px', overflowY: 'auto', 
                        backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' 
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.sender === 'user' ? brandColor : '#ffffff',
                                color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                                padding: '10px 14px', borderRadius: '12px', 
                                maxWidth: '85%', fontSize: '14px', lineHeight: '1.5',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '13px', fontStyle: 'italic', padding: '5px' }}>
                                מנתח נתונים...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* אזור הקלט */}
                    <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', backgroundColor: '#ffffff' }}>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            style={{ 
                                flex: 1, padding: '10px 15px', borderRadius: '8px', 
                                border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px',
                                backgroundColor: '#fdfdfd'
                            }} 
                            placeholder="שאל שאלה לניתוח..." 
                        />
                        {/* תיקון: כפתור ה"שלח" מקבל את צבע המותג הכהה (BrandColor) */}
                        <button 
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            style={{ 
                                padding: '0 15px', backgroundColor: brandColor, color: 'white', 
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                transition: '0.2s', opacity: (loading || !input.trim()) ? 0.6 : 1,
                                fontWeight: '600'
                            }}
                        >
                            שלח
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};