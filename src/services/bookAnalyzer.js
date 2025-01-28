const { genAI, generationConfig } = require('../config/gemini');

// タイトルからテーマや特徴を抽出
async function analyzeTitle(title) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig,
    });
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const prompt = `
タイトル「${title}」を分析し、以下の情報を抽出してください。
JSON形式で出力してください：

{
    "mainTheme": "主要なテーマ（技術名やトピック）",
    "techLevel": "想定される技術レベル（初級/中級/上級）",
    "bookType": "本の種類（入門書/解説書/実践ガイド/etc）",
    "keywords": ["関連するキーワード（3つまで）"],
    "suggestedColors": {
        "primary": "メインカラー（hexカラーコード）",
        "secondary": "アクセントカラー（hexカラーコード）",
        "background": "背景色（hexカラーコード）"
    }
}
`;

    try {
        const result = await chatSession.sendMessage(prompt);
        const text = result.response.text();
        
        // Markdownのコードブロックを除去
        const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
            return JSON.parse(jsonText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // フォールバック値を返す
            return {
                mainTheme: title.split(/[\s:：]/)[0] || "技術書",  // タイトルの最初の単語をテーマとして使用
                techLevel: "中級",
                bookType: "実践ガイド",
                keywords: [title.split(/[\s:：]/)[0] || "プログラミング", "技術", "開発"],
                suggestedColors: {
                    primary: "#2563eb",
                    secondary: "#60a5fa",
                    background: "#1e293b"
                }
            };
        }
    } catch (error) {
        console.error('Title analysis error:', error);
        // フォールバック値を返す
        return {
            mainTheme: "技術書",
            techLevel: "中級",
            bookType: "解説書",
            keywords: ["プログラミング", "技術", "開発"],
            suggestedColors: {
                primary: "#2563eb",
                secondary: "#60a5fa",
                background: "#1e293b"
            }
        };
    }
}

module.exports = {
    analyzeTitle
};