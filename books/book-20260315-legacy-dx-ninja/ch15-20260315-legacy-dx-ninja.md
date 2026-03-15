---
title: "第15章：システム設計 ── フラッシュ→想起→採点→難易度調整"
---

## 第15章：システム設計 ── フラッシュ→想起→採点→難易度調整

### 15.1 システム全体像

```
┌─────────────────────────────────────────────────┐
│          忍者網膜記憶トレーナー                    │
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 画像生成  │───▶│フラッシュ│───▶│  想起UI  │  │
│  │ (シーン)  │    │ エンジン │    │ (入力)   │  │
│  └──────────┘    └──────────┘    └────┬─────┘  │
│                                        │        │
│  ┌──────────┐    ┌──────────┐         │        │
│  │ 難易度   │◀───│  採点    │◀────────┘        │
│  │ 調整器   │    │ エンジン │                   │
│  └──────────┘    │ (Claude) │                   │
│                  └──────────┘                   │
└─────────────────────────────────────────────────┘
```

### 15.2 コンポーネント設計

**画像生成モジュール**
テスト用の画像シーンを生成・管理する。初期段階は既存の画像データセットを使用し、将来的にはAI画像生成も検討する。

```python
class SceneGenerator:
    def __init__(self, difficulty: dict):
        self.difficulty = difficulty
    
    def generate(self) -> dict:
        """
        難易度に応じたシーンを生成する
        returns: {
            'image_path': str,
            'objects': list[str],  # 正解リスト
            'metadata': dict       # シーン情報
        }
        """
        object_count = self.difficulty['object_count']
        scene_type = self.difficulty.get('scene_type', 'room')
        
        # シーンタイプ別の画像を選択
        scenes = self._load_scenes(scene_type)
        selected = random.choice([
            s for s in scenes 
            if len(s['objects']) >= object_count
        ])
        
        # 難易度に応じてオブジェクト数を制限
        return {
            'image_path': selected['path'],
            'objects': selected['objects'][:object_count],
            'metadata': selected['metadata']
        }
```

**フラッシュエンジン**
画像を指定時間だけ表示し、その後隠すUIロジックを担当する。

```python
class FlashEngine:
    def __init__(self, exposure_ms: int = 1000):
        self.exposure_ms = exposure_ms
        self.state = 'ready'  # ready | flashing | hidden
    
    async def flash(self, scene: dict) -> None:
        self.state = 'flashing'
        await display_image(scene['image_path'])
        
        await asyncio.sleep(self.exposure_ms / 1000)
        
        await hide_image()
        self.state = 'hidden'
```

### 15.3 データフロー

```
セッション開始
    ↓
シーン生成（SceneGenerator）
    ↓
フラッシュ表示（FlashEngine）
    ↓
ユーザー入力待機（想起UI）
    ↓
Claude APIによる採点（ScoringEngine）
    ↓
スコア表示 + フィードバック
    ↓
難易度調整（DifficultyManager）
    ↓
次のシーンへ or セッション終了
```

### 15.4 採点の設計思想

採点はルールベースではなくAI（Claude）に任せる。その理由：

1. **自然言語の柔軟性**：「赤いリンゴ」と「りんご（赤）」は同じ正解として扱いたい
2. **部分点の計算**：「5個中3個正解で60点」より細かい評価が可能
3. **フィードバックの生成**：「〇〇を見落としがちです。位置を意識して見てみましょう」

### 15.5 技術スタック

```
Frontend: HTML/CSS/JavaScript（シンプルに保つ）
Backend:  Python（FastAPI）
AI:       Claude API（claude-sonnet-4系）
Storage:  ローカルファイル or SQLite（個人利用想定）
Images:   ローカル画像データセット
```

次の3章で、各コンポーネントの実装コードを詳しく解説する。
