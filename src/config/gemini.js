const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini API の設定
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// 生成設定
const generationConfig = {
    temperature: 1,      
    topP: 0.95,         
    topK: 40,           
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

// モデル設定
const GEMINI_MODELS = {
    FLASH: "gemini-2.0-flash-exp",
    PRO: "gemini-1.5-pro"
};

module.exports = {
    genAI,
    generationConfig,
    GEMINI_API_KEY,
    GEMINI_MODELS
};