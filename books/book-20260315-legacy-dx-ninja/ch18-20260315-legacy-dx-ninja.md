---
title: "第18章：実装③ ── 難易度の自動調整アルゴリズム"
---

## 第18章：実装③ ── 難易度の自動調整アルゴリズム

### 18.1 適応的難易度の設計思想

忍者の訓練は「できたら次のレベルへ、できなければ繰り返す」という自然な適応プロセスだった。これをアルゴリズムとして実装する。

目標は「訓練者を常にフロー状態に保つ」こと。スコアが高すぎれば難しくし、低すぎれば易しくする。

### 18.2 難易度パラメータの定義

```python
from dataclasses import dataclass, field
from typing import Literal

@dataclass
class DifficultyParams:
    # 露出時間（ミリ秒）：短いほど難しい
    exposure_ms: int = 2000
    exposure_ms_min: int = 100
    exposure_ms_max: int = 5000
    
    # オブジェクト数：多いほど難しい
    object_count: int = 5
    object_count_min: int = 3
    object_count_max: int = 25
    
    # シーン複雑度：high/medium/low
    scene_complexity: Literal['low', 'medium', 'high'] = 'low'
    
    # ライフ数：少ないほどプレッシャーが高い
    lives: int = 3
    
    # 総合難易度レベル（1-10）
    level: float = 1.0
    
    def to_dict(self) -> dict:
        return {
            'exposure_ms': self.exposure_ms,
            'object_count': self.object_count,
            'scene_complexity': self.scene_complexity,
            'lives': self.lives,
            'level': round(self.level, 1)
        }
```

### 18.3 適応アルゴリズムの実装

```python
class AdaptiveDifficultyEngine:
    """
    Elo レーティングに着想を得た適応的難易度エンジン
    チェスの棋力評価と同じ原理で記憶力レベルを推定する
    """
    
    def __init__(self):
        self.params = DifficultyParams()
        self.session_history = []
        self.player_rating = 1000  # 初期レーティング
        self.k_factor = 32  # 評価変動の大きさ
    
    def update(self, score: int, session_data: dict) -> DifficultyParams:
        """
        セッション結果に基づいて難易度を更新する
        
        Args:
            score: 0-100のスコア
            session_data: セッション詳細データ
        
        Returns:
            次のセッションの難易度パラメータ
        """
        # セッション履歴に追加
        self.session_history.append({
            'score': score,
            'params': self.params.to_dict(),
            **session_data
        })
        
        # Eloレーティング更新
        expected = self._expected_score()
        actual = score / 100
        self.player_rating += self.k_factor * (actual - expected)
        
        # 直近5セッションの平均スコア
        recent = self.session_history[-5:]
        avg_score = sum(s['score'] for s in recent) / len(recent)
        
        # 難易度調整ロジック
        if avg_score >= 85:
            self._increase_difficulty()
        elif avg_score <= 50:
            self._decrease_difficulty()
        # 50-85は現状維持（フロー状態）
        
        return self.params
    
    def _expected_score(self) -> float:
        """現在の難易度に対する期待スコア（0-1）"""
        difficulty_rating = self._difficulty_to_rating()
        return 1 / (1 + 10 ** ((difficulty_rating - self.player_rating) / 400))
    
    def _difficulty_to_rating(self) -> float:
        """難易度をEloレーティングに変換"""
        # 露出時間が短いほど、オブジェクト数が多いほど高レーティング
        time_factor = (5000 - self.params.exposure_ms) / 5000
        count_factor = (self.params.object_count - 3) / 22
        return 800 + (time_factor * 600) + (count_factor * 400)
    
    def _increase_difficulty(self):
        """難易度を上げる"""
        # 露出時間を20%短縮（最小値で止める）
        self.params.exposure_ms = max(
            self.params.exposure_ms_min,
            int(self.params.exposure_ms * 0.8)
        )
        
        # オブジェクト数を1つ増加
        if self.params.object_count < self.params.object_count_max:
            self.params.object_count += 1
        
        # 複雑度を上げる（low→medium→high）
        if (self.params.exposure_ms <= 500 and 
            self.params.scene_complexity == 'low'):
            self.params.scene_complexity = 'medium'
        elif (self.params.exposure_ms <= 300 and 
              self.params.scene_complexity == 'medium'):
            self.params.scene_complexity = 'high'
        
        # レベルを更新
        self.params.level = min(10.0, self.params.level + 0.3)
        
        print(f"🔺 難易度UP: {self.params.to_dict()}")
    
    def _decrease_difficulty(self):
        """難易度を下げる"""
        self.params.exposure_ms = min(
            self.params.exposure_ms_max,
            int(self.params.exposure_ms * 1.3)
        )
        
        if self.params.object_count > self.params.object_count_min:
            self.params.object_count -= 1
        
        self.params.level = max(1.0, self.params.level - 0.3)
        
        print(f"🔻 難易度DOWN: {self.params.to_dict()}")
    
    def get_progress_report(self) -> dict:
        """進捗レポートを生成"""
        if not self.session_history:
            return {"message": "まだデータがありません"}
        
        first_score = self.session_history[0]['score']
        latest_score = self.session_history[-1]['score']
        improvement = latest_score - first_score
        
        return {
            "total_sessions": len(self.session_history),
            "player_rating": int(self.player_rating),
            "current_level": self.params.level,
            "current_exposure_ms": self.params.exposure_ms,
            "score_improvement": improvement,
            "ninja_rank": self._get_ninja_rank()
        }
    
    def _get_ninja_rank(self) -> str:
        """レーティングから忍者段位を返す"""
        rating = self.player_rating
        if rating >= 1800: return "影"
        if rating >= 1500: return "上忍"
        if rating >= 1200: return "中忍"
        if rating >= 1000: return "下忍"
        return "見習い"
```

### 18.4 間隔反復の統合

```python
from datetime import datetime, timedelta

class SpacedRepetitionScheduler:
    """
    エビングハウス忘却曲線に基づく間隔反復スケジューラ
    覚えたシーンを最適なタイミングで復習させる
    """
    
    INTERVALS = [1, 3, 7, 14, 30, 90]  # 日数
    
    def __init__(self):
        self.scene_records = {}  # scene_id → 学習記録
    
    def record_session(self, scene_id: str, score: int):
        if scene_id not in self.scene_records:
            self.scene_records[scene_id] = {
                'reviews': 0, 'last_score': 0, 'next_review': datetime.now()
            }
        
        record = self.scene_records[scene_id]
        record['reviews'] += 1
        record['last_score'] = score
        
        # スコアが高いほど次の復習を先に延ばす
        interval_idx = min(record['reviews'] - 1, len(self.INTERVALS) - 1)
        if score >= 80:
            interval_days = self.INTERVALS[interval_idx]
        else:
            interval_days = 1  # 低スコアは翌日に復習
        
        record['next_review'] = datetime.now() + timedelta(days=interval_days)
    
    def get_due_scenes(self) -> list[str]:
        """今日復習すべきシーンIDのリストを返す"""
        now = datetime.now()
        return [
            scene_id for scene_id, record in self.scene_records.items()
            if record['next_review'] <= now
        ]
```

次章で全体をまとめ、実際に動かすための手順を解説する。
