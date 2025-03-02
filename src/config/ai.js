// AI サービス設定
const { genAI, generationConfig: geminiConfig, GEMINI_MODELS } = require('./gemini');
const { openai, generationConfig: openaiConfig, OPENAI_MODELS } = require('./openai');

// 使用するAIプロバイダーの設定
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' または 'openai'
const REASONING_EFFORT = process.env.REASONING_EFFORT || 'medium'; // 'low', 'medium', 'high'

// AIモデルの取得
async function getAICompletion(prompt, modelType = 'default') {
    try {
        if (AI_PROVIDER === 'gemini') {
            return await getGeminiCompletion(prompt, modelType);
        } else if (AI_PROVIDER === 'openai') {
            return await getOpenAICompletion(prompt, modelType);
        } else {
            throw new Error(`未サポートのAIプロバイダー: ${AI_PROVIDER}`);
        }
    } catch (error) {
        console.error('AI completion error:', error);
        throw error;
    }
}

// Geminiモデルを用いた完了
async function getGeminiCompletion(prompt, modelType) {
    if (!genAI) {
        throw new Error('Gemini API キーが設定されていません');
    }

    let modelName;
    switch (modelType) {
        case 'pro':
            modelName = GEMINI_MODELS.PRO;
            break;
        case 'default':
        case 'flash':
        default:
            modelName = GEMINI_MODELS.FLASH;
    }

    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: geminiConfig,
    });

    const chatSession = model.startChat({
        generationConfig: geminiConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
}

// OpenAIモデルを用いた完了
async function getOpenAICompletion(prompt, modelType) {
    if (!openai) {
        throw new Error('OpenAI API キーが設定されていません');
    }

    let modelName;
    switch (modelType) {
        case 'gpt4':
            modelName = OPENAI_MODELS.GPT4;
            break;
        case 'gpt35':
            modelName = OPENAI_MODELS.GPT35_TURBO;
            break;
        case 'default':
        case 'o3-mini':
        default:
            modelName = OPENAI_MODELS.O3_MINI;
    }

    // OpenAIモデル用のオプション設定
    const options = {
        model: modelName,
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
        ],
        response_format: { type: "text" }
    };
    
    // Note: reasoning_effort parameter is removed as it's not supported by gpt-3.5-turbo

    const response = await openai.chat.completions.create(options);

    return response.choices[0].message.content;
}

module.exports = {
    getAICompletion,
    AI_PROVIDER,
    REASONING_EFFORT
};
