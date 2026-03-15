---
title: "第17章：実装② ── Claude APIによる記憶採点エンジン"
---

## 第17章：実装② ── Claude APIによる記憶採点エンジン

### 17.1 なぜルールベースではなくAIで採点するか

最初の設計判断として「ルールベースとAIのどちらで採点するか」を検討した。

ルールベースの採点の例：
```python
# ルールベース（シンプルだが硬直的）
def simple_score(correct: list, recalled: str) -> int:
    count = sum(1 for item in correct if item in recalled)
    return int(count / len(correct) * 100)
```

この方法の問題点：
- 「リンゴ」と「apple」は別物として扱われる
- 「赤くて丸い果物」という説明的な回答を評価できない
- 部分的に正しい回答（「大きな本」→正解は「青い本」）をゼロ点にしてしまう
- フィードバックが生成できない

Claude APIを使うことで、これらすべてが解決する。

### 17.2 採点プロンプトの設計

```python
# scoring_engine.py
import json
from anthropic import Anthropic

client = Anthropic()

SCORING_PROMPT = """あなたは忍者の記憶術道場の採点官です。
厳しくも公平に、そして訓練者の成長を促す採点をしてください。

## 画像に含まれていたオブジェクト（正解）
{correct_objects}

## 訓練者の回答
{user_recall}

## 採点ルール
1. 表記のゆれは正解（リンゴ・りんご・Appleはすべて同じ）
2. 色・形・素材など属性の一致で部分点（「赤い丸いもの」→「赤いリンゴ」で80点）
3. 余分な回答は減点なし（幻を見たとしても）
4. 順序は問わない

## 忍者段位の基準
- 影（95点以上）：現代最高峰の記憶術師
- 上忍（80-94点）：任務遂行に支障なし
- 中忍（60-79点）：実用レベルに近い
- 下忍（40-59点）：基礎は身についている
- 見習い（40点未満）：訓練継続が必要

## 出力形式（JSONのみ、前後のテキスト不要）
{{
  "score": 整数（0-100）,
  "correct_items": ["正解したアイテム"],
  "missed_items": ["見落としたアイテム"],
  "partial_items": [{{"item": "アイテム名", "reason": "部分点の理由"}}],
  "feedback": "訓練者への具体的なアドバイス（忍者の言葉遣いで、50文字以内）",
  "ninja_rank": "段位名"
}}"""

def score_memory(
    correct_objects: list[str],
    user_recall: str,
    exposure_ms: int,
    session_history: list[dict] = None
) -> dict:
    """
    Claude APIで記憶の採点を行う
    
    Args:
        correct_objects: 正解のオブジェクトリスト
        user_recall: ユーザーの回答
        exposure_ms: 露出時間
        session_history: 過去のセッション履歴（コンテキストとして活用）
    
    Returns:
        採点結果のdict
    """
    prompt = SCORING_PROMPT.format(
        correct_objects=json.dumps(correct_objects, ensure_ascii=False, indent=2),
        user_recall=user_recall
    )
    
    # セッション履歴があれば傾向をプロンプトに追加
    if session_history:
        recent = session_history[-5:]  # 直近5セッション
        avg_score = sum(s['score'] for s in recent) / len(recent)
        common_misses = _find_common_misses(recent)
        
        context = f"\n\n## 訓練者の最近の傾向\n"
        context += f"直近5セッションの平均スコア: {avg_score:.0f}点\n"
        if common_misses:
            context += f"よく見落とすオブジェクトタイプ: {', '.join(common_misses)}\n"
        
        prompt += context
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw = message.content[0].text.strip()
    
    # JSONのみ抽出（前後のテキストを除去）
    if '```json' in raw:
        raw = raw.split('```json')[1].split('```')[0].strip()
    elif '```' in raw:
        raw = raw.split('```')[1].split('```')[0].strip()
    
    result = json.loads(raw)
    
    # 露出時間ボーナス（短い時間で高スコアは加点）
    if exposure_ms < 500 and result['score'] >= 70:
        result['score'] = min(100, result['score'] + 10)
        result['feedback'] += f"（{exposure_ms}msの高速記憶に追加点！）"
    
    return result

def _find_common_misses(history: list[dict]) -> list[str]:
    """過去セッションで頻繁に見落としたアイテムタイプを分析"""
    miss_counts = {}
    for session in history:
        for item in session.get('missed_items', []):
            # カテゴリ抽出（簡易版）
            category = _categorize_item(item)
            miss_counts[category] = miss_counts.get(category, 0) + 1
    
    # 2回以上見落としたカテゴリを返す
    return [cat for cat, count in miss_counts.items() if count >= 2]

def _categorize_item(item: str) -> str:
    """アイテムを大まかなカテゴリに分類"""
    categories = {
        '食べ物': ['リンゴ', '果物', '野菜', '食品'],
        '家具': ['テーブル', '椅子', '棚', '机'],
        '本・書類': ['本', '書類', '雑誌', 'ノート'],
        '電子機器': ['パソコン', 'スマホ', '電話'],
    }
    for cat, keywords in categories.items():
        if any(kw in item for kw in keywords):
            return cat
    return 'その他'
```

### 17.3 フィードバックの質を高める

採点だけでなく、成長を促すフィードバックが重要だ。

```python
# フィードバックのパーソナライズ
def generate_coaching_message(
    result: dict,
    session_number: int,
    exposure_ms: int
) -> str:
    """
    採点結果から、パーソナライズされたコーチングメッセージを生成
    """
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": f"""忍者道場のコーチとして、訓練者に一言アドバイスをください。

訓練回数: {session_number}回目
今回のスコア: {result['score']}点
段位: {result['ninja_rank']}
見落としたもの: {result['missed_items']}
露出時間: {exposure_ms}ms

厳しくも温かく、50文字以内で。"""
        }]
    )
    
    return message.content[0].text
```

### 17.4 エラーハンドリングと信頼性

AIを使ったシステムでは、予期せぬレスポンスへの対処が重要だ。

```python
def safe_score(correct_objects, user_recall, exposure_ms) -> dict:
    """エラーハンドリング付きの採点関数"""
    try:
        return score_memory(correct_objects, user_recall, exposure_ms)
    except json.JSONDecodeError:
        # JSONパース失敗時のフォールバック
        return {
            "score": _fallback_score(correct_objects, user_recall),
            "correct_items": [],
            "missed_items": correct_objects,
            "feedback": "採点システムに問題が発生しました。再挑戦してください。",
            "ninja_rank": "見習い"
        }
    except Exception as e:
        print(f"Scoring error: {e}")
        return {"score": 0, "feedback": "エラーが発生しました", "ninja_rank": "見習い"}

def _fallback_score(correct: list, recalled: str) -> int:
    """シンプルなフォールバック採点"""
    count = sum(1 for item in correct 
                if any(word in recalled for word in item.split()))
    return int(count / len(correct) * 100) if correct else 0
```

次章では難易度の自動調整アルゴリズムの完全実装を解説する。
