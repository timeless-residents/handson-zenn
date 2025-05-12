// AI サービス設定
const { genAI, generationConfig: geminiConfig, GEMINI_MODELS } = require('./gemini');
const { openai, generationConfig: openaiConfig, OPENAI_MODELS } = require('./openai');

// 使用するAIプロバイダーの設定
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' または 'openai'
const REASONING_EFFORT = process.env.REASONING_EFFORT || 'medium'; // 'low', 'medium', 'high'

// AIモデルの取得
async function getAICompletion(prompt, modelType = 'default') {
    try {
        // 環境変数から現在のプロバイダーを取得（動的に変更できるように）
        const currentProvider = process.env.AI_PROVIDER || AI_PROVIDER;

        if (currentProvider === 'gemini') {
            return await getGeminiCompletion(prompt, modelType);
        } else if (currentProvider === 'openai') {
            // modelTypeの変換（Gemini用の'pro'を適切なOpenAIモデルにマッピング）
            let openaiModelType = modelType;
            if (modelType === 'pro') {
                openaiModelType = 'gpt4';  // Geminiのproモデルに相当するOpenAIモデル
            }
            return await getOpenAICompletion(prompt, openaiModelType);
        } else {
            throw new Error(`未サポートのAIプロバイダー: ${currentProvider}`);
        }
    } catch (error) {
        // エラーメッセージをより詳細に
        console.error('AI completion error:', error);

        // エラーメッセージに詳細情報を追加（再試行メカニズム用）
        if (error.status) {
            error.message = `[${error.status} ${error.statusText || ''}] ${error.message}`;
        }

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

    // 言語指定を追加したシステムプロンプト
    const systemPrompt = `You are a helpful Japanese technical writer.
Always respond in Japanese language.
Format your response using Markdown.
When writing code examples, use appropriate syntax highlighting.
Your responses must be in Japanese, never switch to English.`;

    // OpenAIモデル用のオプション設定
    const options = {
        model: modelName,
        messages: [
            { role: 'system', content: systemPrompt },
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
