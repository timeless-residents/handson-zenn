const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { getAICompletion } = require('../config/ai');
const { analyzeTitle } = require('./bookAnalyzer');

// カバー用のSVGを生成
async function generateCoverSVG(title) {
    // タイトルを分析
    const analysis = await analyzeTitle(title);

    const prompt = `
あなたはSVGデザインの専門家です。以下の分析に基づいて、技術書のカバー画像用のSVGを生成してください。

タイトル: "${title}"
メインテーマ: ${analysis.mainTheme}
想定読者レベル: ${analysis.techLevel}
本の種類: ${analysis.bookType}
キーワード: ${analysis.keywords.join(', ')}

デザイン要件:
1. サイズ: viewBox="0 0 500 700"（Zenn本の推奨サイズ、アスペクト比1:1.4）
2. 配色:
   - メインカラー: ${analysis.suggestedColors.primary}
   - アクセントカラー: ${analysis.suggestedColors.secondary}
   - 背景色: ${analysis.suggestedColors.background}
3. テキストレイアウト:
   - タイトルを2〜3行に分けて配置
   - フォントサイズは大きめ（メインタイトル：96px以上）
   - 太字フォントの使用
   - テキストの周りに適度な余白
4. デザイン要素:
   - ${analysis.mainTheme}に関連する視覚的要素やアイコン
   - バックグラウンドパターンやグラデーションの活用
   - モダンでクリーンなデザイン
5. 強調ポイント:
   - タイトルを目立たせるためのコントラスト
   - サブタイトルとの視覚的な階層構造
   - テキストの読みやすさを最優先

以下の点に注意してSVGを生成してください：
- フォントは system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif を使用
- テキストには必ずtext-rendering="optimizeLegibility"を指定
- 長いタイトルは適切に改行して視認性を確保、tspanでレイアウトしやすいように工夫
- テキストには白い縁取りや影を付けて背景との分離を強調

SVGコードのみを出力してください。コメントやマークダウンは不要です。
`;

    try {
        const svgCode = await getAICompletion(prompt, 'default');
        
        // SVGコードの基本的な検証（より寛容な検証に変更）
        const cleanedSvgCode = svgCode
            .replace(/```.*\n?|\n?```/g, '')  // Markdownのコードブロックを除去
            .trim();
            
        if (!cleanedSvgCode.includes('<svg') || !cleanedSvgCode.includes('</svg>')) {
            throw new Error('Invalid SVG generated');
        }
        
        return cleanedSvgCode;
    } catch (error) {
        console.error('SVG generation error:', error);
        // タイトルを行に分割（長さに基づいて）
        const words = title.replace(/[「」]/g, '').split(' ');
        let lines = [];
        let currentLine = '';
        
        for (const word of words) {
            if (currentLine.length + word.length > 12) {
                lines.push(currentLine.trim());
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        }
        if (currentLine) {
            lines.push(currentLine.trim());
        }
        
        // 行が1つしかない場合は2つに分割
        if (lines.length === 1) {
            const line = lines[0];
            const midpoint = Math.ceil(line.length / 2);
            let splitPoint = line.slice(0, midpoint).lastIndexOf(' ');
            if (splitPoint === -1) splitPoint = midpoint;
            lines = [
                line.slice(0, splitPoint).trim(),
                line.slice(splitPoint).trim()
            ];
        }

        // SVGを生成
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700">
    <rect width="500" height="700" fill="${analysis.suggestedColors.background}"/>
    <defs>
        <linearGradient id="titleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="white"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
    </defs>
    ${lines.map((line, i) => `
    <text
        x="250"
        y="${280 + i * 60}"
        font-family="system-ui"
        font-size="${i === 0 ? 48 : 36}"
        font-weight="bold"
        fill="url(#titleGradient)"
        text-anchor="middle"
        dominant-baseline="middle"
    >${line}</text>`).join('')}
</svg>`;
    }
}

// カバー画像を生成

async function generateBookCover(title, outputDir) {
    // GeminiでSVGを生成
    const svgCode = await generateCoverSVG(title);

    // SVGファイルを一時的に保存
    const svgPath = path.join(outputDir, 'cover.svg');
    fs.writeFileSync(svgPath, svgCode);

    // SVGをPNGに変換（改善版）
    await sharp(svgPath, {
        density: 300 // DPIを上げて高品質化
    })
        .resize(500, 700, {
            kernel: sharp.kernel.lanczos3, // より高品質なリサイズアルゴリズム
            fit: 'fill'
        })
        .png({
            quality: 100,
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: true
        })
        .toFile(path.join(outputDir, 'cover.png'))
        .catch(error => {
            console.error('PNG conversion error:', error);
            // エラーが発生した場合でも処理を継続
        });

    // SVGの生成時にフォントの指定も改善
    const improvedSvgCode = svgCode.replace(
        /font-family="system-ui"/g,
        'font-family="system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif"'
    );
    
    // 改善したSVGを保存
    fs.writeFileSync(svgPath, improvedSvgCode);

    console.log('📘 カバー画像を生成しました');
}


module.exports = {
    generateBookCover
};