import React, { useState } from 'react';
import axios from 'axios';
import appConfig from '../Utils/AppConfig';
// ודא שאתה מייבא את ה-AppConfig שלך כ-appConfig

interface ProductInfo {
    productId: number;
    // ... יכול להכיל פרטי מוצר נוספים
}

// נניח שאתה מקבל את פרטי המוצר כ-props
const ProductQA: React.FC<ProductInfo> = ({ productId }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('שאל שאלה על המוצר...');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setAnswer('מחפש תשובה... ⏳');

        try {
            // 🏆 שליחת בקשה לנקודת הקצה החדשה שהגדרנו ב-Backend
            const response = await axios.post(
                appConfig.askProductUrl, 
                {
                    question: question,
                    productId: productId, // שליחת מזהה המוצר
                }
            );
            
            // הצגת התשובה שחזרה מה-NLP Service
            setAnswer(response.data.answer); 

        } catch (error) {
            setAnswer('שגיאה בחיבור לשרת או בניתוח השאלה. בדוק את לוג השרת.');
            console.error('AI Request Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qa-widget">
            <h3>שאל את ה-AI על המוצר</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="האם הנעליים נגד מים?..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'מנתח...' : 'שאל'}
                </button>
            </form>
            <div className="answer-box">
                <p>תשובה: <strong>{answer}</strong></p>
            </div>
        </div>
    );
};

export default ProductQA;