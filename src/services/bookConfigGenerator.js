const { genAI, generationConfig } = require('../config/gemini');

/**
 * Generate enhanced book configuration in YAML format
 * @param {Object} enhanced - Enhanced book structure
 * @param {string} enhanced.title - Book title
 * @param {Array} enhanced.chapters - Array of chapter objects
 * @returns {Promise<string>} YAML formatted book configuration
 */
async function generateBookConfig(enhanced) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig,
    });
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    // Generate summary and topics based on the book structure
    const prompt = `
技術書「${enhanced.title}」の内容について分析し、以下の情報を生成してください：

1. 本の概要（3行程度）：
   - 本書の主題と目的
   - 扱う技術や概念の範囲
   - 読者が得られる価値
   
2. 関連するトピックタグ（5個）：
   - 本書の内容を最もよく表す技術用語やキーワード
   - 一般的な単語は避け、具体的な技術やフレームワーク名を使用
   - トピック文字列は記号や空白を含まず、簡潔なキーワードを選定

章立て：
${enhanced.chapters.map(ch => `
${ch.title}
${ch.sections.map(section => `- ${section.title}
  ${section.subsections.map(sub => `  - ${sub}`).join('\n')}`).join('\n')}`).join('\n')}

出力形式：
まず3行の概要を出力し、
空行を挟んでから、
"Topics:"という行の後にトピックタグを1行1つずつ箇条書きで出力してください。
`;

    try {
        const result = await chatSession.sendMessage(prompt);
        const text = result.response.text();
        
        // Parse the result
        const [summaryText, topicsSection] = text.split('\nTopics:');
        const topics = topicsSection
            ?.split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.trim().replace(/^-\s*/, '').replace(/\s+/g, '').trim())
            || [];

        // Generate YAML configuration
        const yamlConfig = `title: "${enhanced.title}"
summary: |-
${summaryText.trim().split('\n').map(line => `  ${line.trim()}`).join('\n')}

topics: 
${topics.map(topic => `  - ${topic}`).join('\n')}

published: false
price: 1000
chapters:
${enhanced.chapters.map(chapter => `  - ${chapter.slug}`).join('\n')}`;

        return yamlConfig;
    } catch (error) {
        console.error('Book configuration generation error:', error);
        throw error;
    }
}

module.exports = {
    generateBookConfig
};