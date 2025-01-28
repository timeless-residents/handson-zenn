const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini API の設定
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 生成設定
const generationConfig = {
    temperature: 1,      
    topP: 0.95,         
    topK: 40,           
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

module.exports = {
    genAI,
    generationConfig,
    GEMINI_API_KEY
};