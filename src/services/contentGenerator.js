const { getAICompletion } = require('../config/ai');

// チャプターの内容を生成
async function generateChapterContent(chapter) {
    const prompt = `
あなたは技術書の執筆経験が豊富なエキスパートです。
以下の章を、実践的で価値の高い内容になるように執筆してください。
このチャプターの構成といった構成を振り返るような内容は章立てしてまでは不要です。

章タイトル：${chapter.title}

含めるべきセクション：
${chapter.sections.map(section => `
### ${section.title}
${section.subsections.map(sub => `- ${sub}`).join('\n')}`).join('\n')}

執筆の要件：
1. 10000文字程度で記述
2. Markdown形式で出力
3. 実践的なコードスニペットや設定例を含める
4. 段階的な説明で理解を深められる構成
5. トラブルシューティングや注意点も記載
6. 実務での具体的なユースケースを含める
7. 初心者から上級者まで幅広い読者に対応
8. AIっぽくない自然な文章で記述

各セクションは以下の構造に従ってください：
1. 概要と重要性
2. 特徴と利点
3. 事前準備と前提条件 
4. 基本的な使い方
5. 実践的なテクニック
6. 応用例とユースケース
7. トラブルシューティング
8. まとめと次のステップ
`;

    try {
        // デフォルトで'flash'タイプのモデルを使用（Geminiの場合はflash、OpenAIの場合はo3-mini-high）
        return await getAICompletion(prompt, 'default');
    } catch (error) {
        console.error('Chapter content generation error:', error);
        return `# ${chapter.title}\n\n内容の生成中にエラーが発生しました。`;
    }
}

module.exports = {
    generateChapterContent
};