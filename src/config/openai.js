const OpenAI = require('openai');

// OpenAI API の設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// 生成設定
const generationConfig = {
    temperature: 1,
    top_p: 0.95,
    max_tokens: 4096
};

// モデル設定
const OPENAI_MODELS = {
    GPT4: "gpt-4",
    GPT35_TURBO: "gpt-3.5-turbo",
    O3_MINI: "gpt-3.5-turbo" // Updated from "o3-mini-2025-01-31" which doesn't exist
};

module.exports = {
    openai,
    generationConfig,
    OPENAI_API_KEY,
    OPENAI_MODELS
};
