const { execSync } = require('child_process');
const { generateDateBasedSlug } = require('./slug');

// クリップボードまたは標準入力から内容を取得
function getClipboardContent() {
    // 標準入力からデータが来ているか確認
    if (!process.stdin.isTTY) {
        try {
            return require('fs').readFileSync(0, 'utf-8'); // 0 は標準入力を表す
        } catch (error) {
            console.error('標準入力からの読み取りに失敗しました:', error);
        }
    }

    // クリップボードから取得
    try {
        if (process.platform === 'darwin') {
            return execSync('pbpaste').toString();
        } else if (process.platform === 'win32') {
            return execSync('powershell Get-Clipboard').toString();
        } else {
            return execSync('xclip -selection clipboard -o').toString();
        }
    } catch (error) {
        console.error('クリップボードの内容を取得できませんでした:', error);
        process.exit(1);
    }
}

// クリップボードの内容を解析
function parseClipboardContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    console.log('デバッグ: 入力行数:', lines.length);
    
    if (lines.length === 0) {
        throw new Error('クリップボードの内容が空です');
    }

    // 最初の行をタイトルとして扱う
    const title = lines[0].replace(/^[「」]/g, '').trim();
    console.log('デバッグ: タイトル:', title);

    // 2行目をトピックとして扱う（記事用）
    const topic = lines[1]?.replace(/^[\*\-]\s+/, '').trim() || 'programming';
    console.log('デバッグ: トピック:', topic);

    // 残りの行から章を抽出（書籍用）
    const chapters = lines
        .slice(1)  // タイトル行をスキップ
        .filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- '))
        .map(line => ({
            title: line.replace(/^[\*\-]\s+/, '').trim(),
            sections: [],
            slug: generateDateBasedSlug('ch')
        }));

    console.log('デバッグ: 抽出された章の数:', chapters.length);
    chapters.forEach((ch, i) => {
        console.log(`デバッグ: 章${i + 1}:`, ch.title);
    });

    // 両方の情報を返す
    return { title, topic, chapters };
}

module.exports = {
    getClipboardContent,
    parseClipboardContent
};
