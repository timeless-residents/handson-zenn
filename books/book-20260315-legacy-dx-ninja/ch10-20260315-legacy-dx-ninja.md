---
title: "第10章：現代認知科学での解釈 ── VWFAとフォトグラフィックメモリ"
---

## 第10章：現代認知科学での解釈 ── VWFAとフォトグラフィックメモリ

### 10.1 フォトグラフィックメモリは実在するか

「写真記憶（フォトグラフィックメモリ）」——見たものを写真のように完全に記憶する能力——は、科学的には証明されていない。ただし、これに近い能力を持つ人が存在することは確かだ。

より正確には「直接映像記憶（Eidetic Memory）」と呼ばれる能力で、主に子どもに多く見られ、大人になると失われることが多い。全人口の2〜10%が持つとされる。

### 10.2 VWFA（文字視覚野）と視覚記憶

側頭葉の「Visual Word Form Area（VWFA）」は、文字認識に特化した脳領域だ。興味深いのは、VWFA が文字だけでなく、視覚的に「意味のあるパターン」全般の高速認識に関与している点だ。

忍者の網膜記憶術は、文字ではなく視覚的なシーン全体をVWFA的に処理するトレーニングと解釈できる。意味のある塊（チャンク）として視覚情報を処理する回路を強化することが、高速・高精度の記憶を可能にする。

### 10.3 ワーキングメモリの拡張

標準的なワーキングメモリの容量は「7±2チャンク」（ミラーの法則）とされる。しかし訓練によってチャンクのサイズを大きくすることで、実質的な処理量を増やすことができる。

```python
class WorkingMemory:
    def __init__(self, chunks: int = 7):
        self.capacity = chunks  # ミラーの法則
        self.buffer = []
    
    def encode_chunk(self, items: list, as_pattern: bool = False) -> bool:
        """
        as_pattern=True: 複数アイテムを1チャンクとして符号化（専門家の戦略）
        as_pattern=False: 個別に符号化（初心者の戦略）
        """
        if as_pattern:
            if len(self.buffer) >= self.capacity:
                return False
            self.buffer.append({'type': 'pattern', 'items': items})
        else:
            for item in items:
                if len(self.buffer) >= self.capacity:
                    return False
                self.buffer.append({'type': 'item', 'data': item})
        return True
```

### 10.4 スリープと記憶の固定化

神経科学の研究で明らかになっているのは、記憶の固定化（Consolidation）が睡眠中に行われるという事実だ。特にREM睡眠中に、海馬から大脳皮質への記憶転送が起きる。

忍者の訓練が「朝の復習」を重視していたとすれば、これは前夜の記憶固定化を活用した合理的な設計だ。AIトレーニングアプリでも、セッション終了後に「今日覚えたものの復習リスト」を翌朝提示する機能を検討したい。
