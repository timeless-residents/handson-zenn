const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config/gemini');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generateArticleContent(title, topic) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
技術記事「${title}」を書いてください。以下の要件に従ってください：

- Markdown形式で書く
- 技術的な正確性を重視
- コードサンプルを含める（該当する場合）
- 実践的で具体的な例を含める
- 段階的な説明で理解しやすくする
- 結論と次のステップを含める

トピック: ${topic}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function generateArticleEmoji(title, topic) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
技術記事「${title}」に最適な絵文字を1つ選んでください。
トピック: ${topic}

以下の条件を考慮してください：
- 記事の内容を視覚的に表現できる
- 技術的なトピックに相応しい
- 分かりやすく親しみやすい

絵文字だけを返してください。説明は不要です。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
}

async function generateArticle(title, topic) {
    const content = await generateArticleContent(title, topic);
    const emoji = await generateArticleEmoji(title, topic);

    const article = {
        title,
        emoji,
        type: "tech",
        topics: [topic],
        published: false,
        content
    };

    return article;
}

module.exports = {
    generateArticle
};
