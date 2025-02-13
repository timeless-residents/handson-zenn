const { genAI, generationConfig } = require('../config/gemini');
const { generateDateBasedSlug } = require('../utils/slug');

// Geminiを使用して構成を改善
async function enhanceStructure(title, chapters) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig,
    });
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const prompt = `
あなたは技術書執筆のエキスパートです。
以下の技術書の構成を、より実践的で価値の高い内容になるように改善してください。

原題：${title}

現在の章立て：
${chapters.map(ch => `- ${ch.title}`).join('\n')}

以下の点を考慮して改善案を提示してください：
1. テーマに関する最新のベストプラクティスを反映
2. 実務での具体的な課題解決に役立つ内容
3. 初級者から上級者まで段階的に理解できる構成
4. トラブルシューティングや注意点も含める
5. 各章に具体的な実装例やコード例を含める

出力形式：
1. まず改善された書籍タイトルを # で始まる見出しとして出力
2. その後に各章を ## で始まる見出しとして出力
3. 各章の下に ### で始まる節を記載
4. 必要に応じて #### で始まる小節も記載
5. 読み応え重視で、20章程度の構成を目指す
`;

    try {
        const result = await chatSession.sendMessage(prompt);
        const enhancedStructure = result.response.text();
        console.log('Gemini Response:', enhancedStructure);
        
        const lines = enhancedStructure.split('\n').filter(line => line.trim());
        let newTitle = '';
        let currentChapter = null;
        let currentSection = null;
        const enhancedChapters = [];

        lines.forEach(line => {
            if (line.startsWith('# ')) {
                newTitle = line.replace('# ', '').trim();
            } else if (line.startsWith('## ')) {
                if (currentChapter) {
                    enhancedChapters.push(currentChapter);
                }
                currentChapter = {
                    title: line.replace('## ', '').trim(),
                    sections: [],
                    slug: generateDateBasedSlug(`ch${enhancedChapters.length + 1}`)
                };
            } else if (line.startsWith('### ')) {
                currentSection = {
                    title: line.replace('### ', '').trim(),
                    subsections: []
                };
                if (currentChapter) {
                    currentChapter.sections.push(currentSection);
                }
            } else if (line.startsWith('    * ') && currentSection) {
                currentSection.subsections.push(
                    line.replace('    * ', '').trim()
                );
            }
        });

        if (currentChapter) {
            enhancedChapters.push(currentChapter);
        }

        return {
            title: newTitle || title, 
            chapters: enhancedChapters
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

module.exports = {
    enhanceStructure
};