---
title: "第5章：忍者の情報収集・分析・実行の三層構造"
---

## 第5章：忍者の情報収集・分析・実行の三層構造

### 5.1 忍術の情報アーキテクチャ

忍者の仕事を現代のソフトウェアアーキテクチャで読み直すと、驚くほど明確な三層構造が見えてくる。

```
Layer 1: 情報収集（In-nin：陰忍）
  └── 潜入・観察・記憶

Layer 2: 情報分析（判断）
  └── 収集した情報の解釈・優先度付け

Layer 3: 情報実行（Yo-nin：陽忍）
  └── 主君への報告・作戦への反映
```

現代のAIエージェントアーキテクチャ（RAG: Retrieval-Augmented Generation）と比較すると、その類似性は際立っている。

### 5.2 In-nin（陰忍）：データ収集レイヤー

陰忍は「影に潜む忍び」——敵地に潜入し、情報を収集する役割だ。

このレイヤーで網膜記憶術が最も重要になる。敵の陣地に潜入した際、脱出できるのは一度きりかもしれない。見たものを完全に記憶して持ち帰る必要がある。

```python
# 陰忍的データ収集の現代解釈
class InNin:
    def __init__(self, memory_capacity: int = 100):
        self.observations = []
        self.capacity = memory_capacity
    
    def observe(self, scene: dict, exposure_time: float) -> bool:
        """
        scene: 観察対象のデータ
        exposure_time: 観察可能時間（短いほど高度な記憶術が必要）
        """
        if len(self.observations) >= self.capacity:
            return False  # 記憶容量超過
        
        # 露出時間が短いほど、鮮明な記憶が必要
        memory_quality = min(1.0, exposure_time / 2.0)
        self.observations.append({
            'data': scene,
            'quality': memory_quality,
            'timestamp': time.time()
        })
        return True
```

### 5.3 判断レイヤー：情報の優先度付け

収集した大量の情報から、何が重要かを判断するのが分析レイヤーだ。

忍者は潜入先で無数の情報に接する。すべてを同等に記憶しようとすれば容量が足りない。何を優先して記憶するかの判断が、経験と訓練によって磨かれる。

現代のRAGシステムで言えば、これはベクトル検索における「関連度スコアリング」に相当する。

### 5.4 Yo-nin（陽忍）：実行レイヤー

陽忍は表に出る忍び——商人や旅人を装い、公然と情報収集する役割だ。

このレイヤーでは、記憶した情報を「いかに正確に再現するか」が問われる。主君への報告は口頭で行われ、絵図や文書は後から記憶を頼りに再現される。

```python
# 報告書の生成（記憶からの再構成）
class YoNin:
    def generate_report(self, memory: InNin, query: str) -> str:
        """記憶から関連情報を引き出してレポートを生成"""
        relevant_observations = [
            obs for obs in memory.observations
            if self._is_relevant(obs, query)
        ]
        return self._synthesize(relevant_observations)
```

### 5.5 現代AIエージェントとの対応

この三層構造は、現代のAIエージェント設計と驚くほど対応している。

| 忍者の役割 | AIエージェントの要素 |
|-----------|-------------------|
| 陰忍（潜入・観察） | Web検索・API呼び出し・データ収集 |
| 判断（優先度付け） | ベクトル検索・関連度スコアリング |
| 陽忍（報告・実行） | LLMによる回答生成・アクション実行 |

本書で実装するトレーニングアプリも、この三層構造で設計される。ユーザーは「陰忍」として視覚情報を収集し、「判断」として何が重要かを選択し、「陽忍」として想起・報告する。AIはそのパフォーマンスを評価するコーチの役割を担う。
