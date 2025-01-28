// src/scripts/convert-cover.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertCover(bookPath) {
    if (!bookPath) {
        // 引数がない場合は books ディレクトリの最新のディレクトリを探す
        const booksDir = path.join(process.cwd(), 'books');
        const dirs = fs.readdirSync(booksDir)
            .filter(name => name.startsWith('book'))
            .sort()
            .reverse();
        
        if (dirs.length === 0) {
            console.error('❌ books ディレクトリに本が見つかりません');
            process.exit(1);
        }
        
        bookPath = path.join(booksDir, dirs[0]);
    }

    const svgPath = path.join(bookPath, 'cover.svg');
    const pngPath = path.join(bookPath, 'cover.png');

    if (!fs.existsSync(svgPath)) {
        console.error('❌ cover.svg が見つかりません:', svgPath);
        process.exit(1);
    }

    try {
        await sharp(svgPath)
            .resize(500, 700) // Zennの推奨サイズ
            .png()
            .toFile(pngPath);

        console.log('✨ カバー画像を変換しました');
        console.log(`📁 出力先: ${pngPath}`);
    } catch (error) {
        console.error('❌ 変換中にエラーが発生しました:', error);
        process.exit(1);
    }
}

// コマンドライン引数から本のパスを取得
const bookPath = process.argv[2];
convertCover(bookPath).catch(console.error);