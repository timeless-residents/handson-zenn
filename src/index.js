require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { GEMINI_API_KEY } = require('./config/gemini');
const { getClipboardContent, parseClipboardContent } = require('./utils/clipboard');
const { generateDateBasedSlug } = require('./utils/slug');
const { generateBookCover } = require('./services/coverGenerator');
const { enhanceStructure } = require('./services/structureEnhancer');
const { generateChapterContent } = require('./services/contentGenerator');
const { generateBookConfig } = require('./services/bookConfigGenerator');
const { generateArticle, generateArticleWithBookReference } = require('./services/articleGenerator');

// メイン処理
async function main() {
    if (!GEMINI_API_KEY) {
        console.error('環境変数 GEMINI_API_KEY が設定されていません。');
        process.exit(1);
    }

    // クリップボードの内容を取得して解析
    const clipboardContent = getClipboardContent();
    console.log('デバッグ: クリップボードの内容:', clipboardContent);

    // 書籍生成
    console.log('\n📚 書籍を生成中...');
    const { title: originalTitle, chapters: originalChapters } = parseClipboardContent(clipboardContent);

    // 構成を改善
    console.log('📚 書籍の構成を改善中...');
    const enhanced = await enhanceStructure(originalTitle, originalChapters);

    // Bookのスラッグを生成
    const bookSlug = generateDateBasedSlug('book');
    const bookDir = path.join(process.cwd(), 'books', bookSlug);
    fs.mkdirSync(bookDir, { recursive: true });

    // config.yaml を生成
    const configContent = await generateBookConfig(enhanced);

    fs.writeFileSync(path.join(bookDir, 'config.yaml'), configContent);

    // カバー画像を生成
    await generateBookCover(enhanced.title, bookDir);

    // 各チャプターのコンテンツを生成
    console.log('📝 チャプターのコンテンツを生成中...');
    for (const chapter of enhanced.chapters) {
        console.log(`  - ${chapter.title} を生成中...`);
        const content = await generateChapterContent(chapter);
        
        const chapterContent = `---
title: "${chapter.title}"
---

${content}

## このチャプターの構成

${chapter.sections.map(section => `
### ${section.title}
${section.subsections.map(subsection => `- ${subsection}`).join('\n')}`).join('\n')}
`;
        fs.writeFileSync(path.join(bookDir, `${chapter.slug}.md`), chapterContent);
    }

    // 完了報告
    console.log('\n✨ Zenn Book を生成しました！');
    console.log(`📗 タイトル: ${enhanced.title}`);
    console.log(`📁 Book スラッグ: ${bookSlug}`);
    console.log('\n📑 生成されたチャプター:');
    enhanced.chapters.forEach(chapter => {
        console.log(`\n🔖 ${chapter.title} (${chapter.slug})`);
        if (chapter.sections && chapter.sections.length > 0) {
            console.log('   セクション:');
            chapter.sections.forEach(section => {
                console.log(`   - ${section.title}`);
                if (section.subsections && section.subsections.length > 0) {
                    section.subsections.forEach(subsection => {
                        console.log(`     * ${subsection}`);
                    });
                }
            });
        }
    });
    console.log(`\n📂 保存先: ${bookDir}`);

    // 書籍を紹介する記事を生成
    console.log('\n📝 書籍を紹介する記事を生成中...');
    const { title, chapters } = parseClipboardContent(clipboardContent);
    
    // 書籍情報を作成
    const bookInfo = {
        title: enhanced.title,
        slug: bookSlug,
        chapters: enhanced.chapters,
        topics: enhanced.topics || []
    };
    
    // 書籍紹介記事を生成
    const article = await generateArticleWithBookReference(title, chapters, bookInfo);
    const articleSlug = generateDateBasedSlug('article');
    const articlePath = path.join(process.cwd(), 'articles', `${articleSlug}.md`);

    // 記事のフロントマターとコンテンツを作成
    const articleContent = `---
title: "${article.title}"
emoji: "${article.emoji}"
type: "${article.type}"
topics: ${JSON.stringify(article.topics)}
published: ${article.published}
---

${article.content}`;

    fs.writeFileSync(articlePath, articleContent);

    console.log('\n✨ Zenn Article を生成しました！');
    console.log(`📗 タイトル: ${article.title}`);
    console.log(`📁 Article スラッグ: ${articleSlug}`);
    console.log(`📂 保存先: ${articlePath}`);
    console.log(`📚 紹介されている書籍: ${enhanced.title} (${bookSlug})`);
}

main().catch(console.error);