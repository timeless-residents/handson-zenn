// src/scripts/threejs-cover-generator.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { JSDOM } = require("jsdom");

/**
 * Three.jsカバー画像を生成するプログラム
 * SVGテンプレートを基に、日付と更新内容を変更してPNG画像を出力します
 */
async function generateThreejsCover(options = {}) {
  // デフォルトオプション
  const defaultOptions = {
    outputDir: path.join(process.cwd(), "books/_evg-threejs"),
    templatePath: path.join(process.cwd(), "books/_evg-threejs", "cover.svg"),
    outputFilename: "cover.png",
    date: new Date(),
    updateLine1: "基本シェーダーの実装",
    updateLine2: "パーティクルエフェクト",
    seasonNumber: "01",
  };

  // オプションをマージ
  const config = { ...defaultOptions, ...options };

  // 出力ディレクトリが存在しない場合は作成
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // テンプレートSVGファイルを読み込み
  if (!fs.existsSync(config.templatePath)) {
    console.error(
      "❌ テンプレートSVGファイルが見つかりません:",
      config.templatePath
    );
    process.exit(1);
  }

  // SVGファイルを読み込み (オリジナルを保持)
  const originalSvgContent = fs.readFileSync(config.templatePath, "utf-8");

  // SVGタグが含まれているか確認
  if (!originalSvgContent.includes("<svg")) {
    console.error("❌ SVGファイルにsvgタグが見つかりません");
    process.exit(1);
  }

  try {
    // オリジナルSVGコンテンツでDOMを構築
    const dom = new JSDOM(originalSvgContent, { contentType: "image/svg+xml" });
    const document = dom.window.document;

    // 日付の更新
    const dateElement = document.getElementById("update-date");
    if (dateElement) {
      const date = config.date;
      const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][
        date.getDay()
      ];
      const dateStr = `${date.getFullYear()}年${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}月${date
        .getDate()
        .toString()
        .padStart(2, "0")}日(${dayOfWeek}) 更新`;
      dateElement.textContent = dateStr;
    } else {
      console.warn("⚠️ update-date 要素が見つかりません");
    }

    // 更新内容の変更
    const line1Element = document.getElementById("update-line1");
    if (line1Element && config.updateLine1) {
      line1Element.textContent = config.updateLine1;
    } else if (config.updateLine1) {
      console.warn("⚠️ update-line1 要素が見つかりません");
    }

    const line2Element = document.getElementById("update-line2");
    if (line2Element && config.updateLine2) {
      line2Element.textContent = config.updateLine2;
    } else if (config.updateLine2) {
      console.warn("⚠️ update-line2 要素が見つかりません");
    }

    // シーズン番号の変更
    if (config.seasonNumber) {
      const seasonElement = document.getElementById("season-text");
      if (seasonElement) {
        seasonElement.textContent = `SEASON ${config.seasonNumber}`;
      } else {
        // ID がない場合は内容で検索
        const seasonElements = document.querySelectorAll("text");
        let found = false;
        for (const el of seasonElements) {
          if (el.textContent.includes("SEASON")) {
            el.textContent = `SEASON ${config.seasonNumber}`;
            found = true;
            break;
          }
        }
        if (!found) {
          console.warn("⚠️ シーズン表示の要素が見つかりません");
        }
      }
    }

    // XMLドキュメント全体をシリアライズ
    // ここでdom.serializeではなく、document.documentElementを使用することで
    // 元のXML構造を保持します
    let finalSvgContent = dom.serialize();

    // 一時ファイルとして保存
    const tempSvgPath = path.join(config.outputDir, "temp-cover.svg");
    fs.writeFileSync(tempSvgPath, finalSvgContent);

    // SVGファイルの内容確認（デバッグ用）
    console.log(`📄 更新されたSVGファイルを保存しました: ${tempSvgPath}`);

    // PNG画像に変換
    const outputPath = path.join(config.outputDir, config.outputFilename);
    try {
      await sharp(tempSvgPath)
        .resize(500, 700) // Zennの推奨サイズ
        .png()
        .toFile(outputPath);

      console.log("✨ カバー画像を生成しました");
      console.log(`📁 出力先: ${outputPath}`);

      // SVGも保存しておく
      const svgOutputPath = path.join(
        config.outputDir,
        path.basename(config.outputFilename, ".png") + ".svg"
      );
      fs.copyFileSync(tempSvgPath, svgOutputPath);
      console.log(`📄 SVG出力: ${svgOutputPath}`);

      // 一時ファイルを削除
      fs.unlinkSync(tempSvgPath);

      return outputPath;
    } catch (error) {
      console.error("❌ 画像変換中にエラーが発生しました:", error);
      console.log("💡 一時SVGファイルを確認してみてください:", tempSvgPath);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ SVGの操作中にエラーが発生しました:", error);

    // エラーが発生した場合のフォールバック
    console.log("💡 フォールバック方法を試行します...");

    try {
      // より単純なアプローチ：正規表現でテキストを置換する
      let modifiedSvg = originalSvgContent;

      // 日付の置換
      if (options.date) {
        const date = options.date;
        const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][
          date.getDay()
        ];
        const dateStr = `${date.getFullYear()}年${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}月${date
          .getDate()
          .toString()
          .padStart(2, "0")}日(${dayOfWeek}) 追加!`;

        // update-date IDを持つ要素のテキストコンテンツを置換
        modifiedSvg = modifiedSvg.replace(
          /(<text[^>]*id="update-date"[^>]*>)[^<]*(<\/text>)/,
          `$1${dateStr}$2`
        );
      }

      // 更新内容1の置換
      if (options.updateLine1) {
        modifiedSvg = modifiedSvg.replace(
          /(<tspan[^>]*id="update-line1"[^>]*>)[^<]*(<\/tspan>)/,
          `$1${options.updateLine1}$2`
        );
      }

      // 更新内容2の置換
      if (options.updateLine2) {
        modifiedSvg = modifiedSvg.replace(
          /(<tspan[^>]*id="update-line2"[^>]*>)[^<]*(<\/tspan>)/,
          `$1${options.updateLine2}$2`
        );
      }

      // シーズン番号の置換
      if (options.seasonNumber) {
        modifiedSvg = modifiedSvg.replace(
          /(<text[^>]*id="season-text"[^>]*>)[^<]*(<\/text>)/,
          `$1SEASON ${options.seasonNumber}$2`
        );

        // ID無しの場合のフォールバック
        modifiedSvg = modifiedSvg.replace(
          /(<text[^>]*>[^<]*SEASON )\d+([^<]*<\/text>)/,
          `$1${options.seasonNumber}$2`
        );
      }

      // 一時ファイルとして保存
      const tempSvgPath = path.join(config.outputDir, "temp-cover.svg");
      fs.writeFileSync(tempSvgPath, modifiedSvg);

      // PNG画像に変換
      const outputPath = path.join(config.outputDir, config.outputFilename);

      await sharp(tempSvgPath).resize(500, 700).png().toFile(outputPath);

      console.log("✨ フォールバック方法でカバー画像を生成しました");
      console.log(`📁 出力先: ${outputPath}`);

      // SVGも保存
      const svgOutputPath = path.join(
        config.outputDir,
        path.basename(config.outputFilename, ".png") + ".svg"
      );
      fs.copyFileSync(tempSvgPath, svgOutputPath);

      // 一時ファイルを削除
      fs.unlinkSync(tempSvgPath);

      return outputPath;
    } catch (fallbackError) {
      console.error("❌ フォールバック方法も失敗しました:", fallbackError);
      process.exit(1);
    }
  }
}

// コマンドライン引数を解析
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--output" || arg === "-o") {
      options.outputDir = args[++i];
    } else if (arg === "--template" || arg === "-t") {
      options.templatePath = args[++i];
    } else if (arg === "--line1" || arg === "-1") {
      options.updateLine1 = args[++i];
    } else if (arg === "--line2" || arg === "-2") {
      options.updateLine2 = args[++i];
    } else if (arg === "--season" || arg === "-s") {
      options.seasonNumber = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Three.js カバージェネレーター

使用方法:
  node threejs-cover-generator.js [オプション]

オプション:
  --output, -o    出力ディレクトリのパス
  --template, -t  SVGテンプレートファイルのパス
  --line1, -1     更新内容1行目のテキスト
  --line2, -2     更新内容2行目のテキスト
  --season, -s    シーズン番号
  --help, -h      ヘルプメッセージを表示

例:
  node threejs-cover-generator.js --line1 "WebGLシェーダー" --line2 "ライティング効果" --season "02"
`);
}

// メイン処理
if (require.main === module) {
  const options = parseArguments();
  generateThreejsCover(options).catch(console.error);
}

module.exports = generateThreejsCover;
