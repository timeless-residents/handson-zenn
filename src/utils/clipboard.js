const { execSync } = require('child_process');
const { generateDateBasedSlug } = require('./slug');

// クリップボードの内容を取得
function getClipboardContent() {
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

    // 残りの行から章を抽出
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

    if (chapters.length === 0) {
        throw new Error('章の情報が見つかりませんでした。各章は "* " または "- " で始まる行として記述してください。');
    }

    return { title, chapters };
}

module.exports = {
    getClipboardContent,
    parseClipboardContent
};