---
title: "第16章：実装① ── 画像フラッシュと入力インターフェース"
---

## 第16章：実装① ── 画像フラッシュと入力インターフェース

### 16.1 プロジェクト構成

```
ninja-memory-trainer/
├── main.py              # FastAPIアプリケーション
├── static/
│   ├── index.html       # メインUI
│   ├── style.css        # スタイル
│   └── app.js           # フロントエンドロジック
├── scenes/              # 訓練用画像（自分で用意）
│   ├── room_01.jpg
│   └── ...
├── scenes.json          # シーンのメタデータ
├── requirements.txt
└── .env                 # APIキー
```

### 16.2 バックエンド：FastAPI

```python
# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json, random, os
from anthropic import Anthropic

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/scenes", StaticFiles(directory="scenes"), name="scenes")

client = Anthropic()

# シーンデータ読み込み
with open("scenes.json") as f:
    SCENES = json.load(f)

class RecallInput(BaseModel):
    scene_id: str
    user_recall: str
    exposure_ms: int

@app.get("/api/scene")
async def get_scene(difficulty: int = 5):
    """難易度に応じたシーンを返す"""
    object_count = max(3, min(20, difficulty + 2))
    
    candidates = [
        s for s in SCENES 
        if len(s["objects"]) >= object_count
    ]
    
    if not candidates:
        return JSONResponse({"error": "No suitable scene found"}, 400)
    
    scene = random.choice(candidates)
    return {
        "scene_id": scene["id"],
        "image_url": f"/scenes/{scene['filename']}",
        "object_count": object_count,
        # 正解は返さない（クライアントに見せない）
    }

@app.post("/api/score")
async def score_recall(data: RecallInput):
    """Claude APIで想起内容を採点する"""
    # 正解を取得
    scene = next((s for s in SCENES if s["id"] == data.scene_id), None)
    if not scene:
        return JSONResponse({"error": "Scene not found"}, 404)
    
    correct_objects = scene["objects"]
    
    # Claude APIで採点
    result = await score_with_claude(
        correct_objects=correct_objects,
        user_recall=data.user_recall,
        exposure_ms=data.exposure_ms
    )
    
    return result

async def score_with_claude(
    correct_objects: list[str],
    user_recall: str,
    exposure_ms: int
) -> dict:
    """Claude APIによる採点"""
    prompt = f"""あなたは忍者の記憶術トレーニングの採点官です。

## 正解（画像に含まれていたオブジェクト）
{json.dumps(correct_objects, ensure_ascii=False)}

## 訓練者の回答
{user_recall}

## 採点基準
- 露出時間: {exposure_ms}ms（短いほど難しい）
- 表記のゆれは正解として扱う（「りんご」「リンゴ」「Apple」は同じ）
- 部分的な説明も加点対象（「赤い丸いもの」→リンゴとして採点）

## 出力形式（JSONのみ返す）
{{
  "score": 0〜100の整数,
  "correct_items": ["正解したアイテムのリスト"],
  "missed_items": ["見落としたアイテムのリスト"],
  "false_items": ["実際にはなかったのに答えたアイテムのリスト"],
  "feedback": "具体的な改善アドバイス（2文以内）",
  "ninja_rank": "見習い|下忍|中忍|上忍|影"
}}"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    response_text = message.content[0].text
    return json.loads(response_text)
```

### 16.3 フロントエンド：フラッシュUI

```html
<!-- static/index.html（主要部分） -->
<div id="game-container">
  <!-- フラッシュ表示エリア -->
  <div id="flash-area">
    <img id="scene-image" src="" alt="" style="display:none">
    <div id="ready-screen">
      <p>準備ができたら「開始」を押してください</p>
      <button onclick="startFlash()">開始 ▶</button>
    </div>
    <div id="recall-screen" style="display:none">
      <p>見たものをすべて書いてください</p>
      <textarea id="recall-input" 
        placeholder="例: 赤いリンゴ、木製のテーブル、青い本..."></textarea>
      <button onclick="submitRecall()">送信</button>
    </div>
  </div>
  
  <!-- ステータス表示 -->
  <div id="status-bar">
    <div id="timer-bar"></div>
    <div id="lives">❤️❤️❤️</div>
    <div id="score-display">スコア: 0</div>
  </div>
</div>
```

```javascript
// static/app.js（主要部分）
let currentScene = null;
let difficulty = { level: 1, exposure_ms: 2000, object_count: 5 };

async function startFlash() {
  // シーン取得
  const res = await fetch(`/api/scene?difficulty=${difficulty.level}`);
  currentScene = await res.json();
  
  // 準備画面を隠す
  document.getElementById('ready-screen').style.display = 'none';
  
  // 画像をフラッシュ表示
  const img = document.getElementById('scene-image');
  img.src = currentScene.image_url;
  img.style.display = 'block';
  
  // タイマーバーのアニメーション
  startTimerBar(difficulty.exposure_ms);
  
  // 露出時間後に隠す
  setTimeout(() => {
    img.style.display = 'none';
    showRecallScreen();
  }, difficulty.exposure_ms);
}

async function submitRecall() {
  const userRecall = document.getElementById('recall-input').value;
  
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scene_id: currentScene.scene_id,
      user_recall: userRecall,
      exposure_ms: difficulty.exposure_ms
    })
  });
  
  const result = await res.json();
  showResult(result);
}
```

### 16.4 scenes.jsonの形式

```json
[
  {
    "id": "room_001",
    "filename": "room_01.jpg",
    "objects": [
      "赤いリンゴ",
      "木製のテーブル",
      "青い本",
      "白いコップ",
      "観葉植物"
    ],
    "scene_type": "room",
    "difficulty_tag": "easy"
  }
]
```

次章ではClaude APIによる採点エンジンの詳細実装を解説する。

:::message
**UIだけ先に試したい方へ**

フラッシュ表示・タイムバー・ライフ制のUI実装を単体でまとめたQiita記事があります：
[FastAPI + Vanilla JSで画像フラッシュ表示UIを作る（Qiita）](https://qiita.com/timeless_residents/items/2026-03-15-flash-ui-fastapi-vanillajs)
:::
