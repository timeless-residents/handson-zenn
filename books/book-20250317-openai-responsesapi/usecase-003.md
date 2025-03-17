---
title: "ストリーミングによるリアルタイム応答表示"
---

# ストリーミングによるリアルタイム応答表示

## 概要

AIとのインタラクションにおいて、ユーザー体験を大きく左右する要素の一つが応答速度です。OpenAI Responses APIのストリーミング機能を活用すると、モデルが思考し応答を生成する過程をリアルタイムで表示できるようになります。このユースケースでは、ストリーミング機能の実装方法と、それによってもたらされるユーザー体験の向上について解説します。

## 技術的解説

### ストリーミングの仕組み

ストリーミングでは、完全な応答が生成されるのを待つのではなく、モデルが生成した内容を小さな「チャンク」（断片）として逐次的に受け取ります。これにより、以下のような利点があります：

- ユーザーは応答の生成を待つ間も内容を読み始めることができる
- アプリケーションは生成中の内容に基づいて早期に処理を開始できる
- モデルの思考プロセスが可視化され、より自然な対話感が得られる

### 実装のポイント

```python
def create_streaming_response(client, prompt_text, instructions=None):
    """ストリーミングレスポンスを生成します。"""
    params = {
        "model": "gpt-4o",
        "input": prompt_text,
        "stream": True,  # ストリーミングを有効化
    }
    
    # instructionsが指定されている場合は追加
    if instructions:
        params["instructions"] = instructions
    
    return client.responses.create(**params)
```

ストリーミングを有効にするには、APIリクエストに`stream=True`パラメータを追加するだけです。この単純な変更により、応答はイテレータとして返され、生成されたテキストの断片を順次取得できるようになります。

### ストリーミングイベントの処理

```python
def process_streaming_response(stream, demo_name):
    """ストリーミングレスポンスを処理して表示します。"""
    print(f"\n===== {demo_name} =====")
    print("ストリーミングレスポンス開始:")
    
    full_text = ""
    start_time = time.time()
    
    # イベントカウンター（統計用）
    event_counts = {}
    
    for event in stream:
        # イベントタイプをカウント
        event_type = event.type
        event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        # 特定のイベントタイプに応じた処理
        if event_type == "response.output_text.delta":
            # テキスト増分を取得して表示
            delta_text = event.delta
            full_text += delta_text
            print(delta_text, end="", flush=True)
    
    # 処理時間の計算
    elapsed_time = time.time() - start_time
    
    print("\n\n処理完了")
    print(f"総処理時間: {elapsed_time:.2f}秒")
    print(f"受信イベント統計: {json.dumps(event_counts, indent=2)}")
    
    return full_text
```

ストリーミングレスポンスは、様々なタイプのイベントを含むイテレータとして返されます。最も重要なのは`response.output_text.delta`イベントで、これが生成されたテキストの断片を含んでいます。このイベントを処理することで、テキストをリアルタイムで表示できます。

## 活用シナリオ

このサンプルでは、ストリーミングの3つの主要な活用シナリオを示しています：

### 1. 基本的な質問応答

```python
prompt1 = "AIの主な応用分野を5つ挙げて、各分野を簡潔に説明してください。"
stream1 = create_streaming_response(client, prompt1)
process_streaming_response(stream1, "デモ1: 短い質問への回答")
```

このシナリオでは、比較的短い応答でもストリーミングによってユーザーは即座に情報を受け取り始めることができます。

### 2. 創造的なコンテンツ生成

```python
prompt2 = "未来の宇宙旅行をテーマにした短い物語（400文字程度）を作成してください。"
instructions2 = "あなたは創造的なSF作家です。想像力豊かで、未来の技術に基づいた物語を作成してください。"
stream2 = create_streaming_response(client, prompt2, instructions2)
process_streaming_response(stream2, "デモ2: 創造的なコンテンツ生成")
```

物語や長文コンテンツの生成では、ストリーミングの効果がより顕著になります。ユーザーは物語が展開していく過程をリアルタイムで体験できます。

### 3. 構造化された説明

```python
prompt3 = "機械学習の初心者向けに、教師あり学習と教師なし学習の違いを説明し、それぞれの代表的なアルゴリズムと応用例を3つずつ挙げてください。"
instructions3 = "あなたは教育者です。段階的で明確な説明を心がけ、専門用語は必ず平易な言葉で補足してください。見出しを使った構造化された回答を作成してください。"
stream3 = create_streaming_response(client, prompt3, instructions3)
process_streaming_response(stream3, "デモ3: 段階的な説明")
```

教育的なコンテンツでは、ストリーミングによって学習者は情報を段階的に受け取り、理解を深めることができます。

## ビジネス活用シナリオ

ストリーミング機能は、様々なビジネスシーンで革新的な価値を生み出します：

### 1. 対話型カスタマーサポート

顧客の問い合わせに対して、即座に応答し始めることで待ち時間の体感を減少させ、顧客満足度を向上させることができます。

```python
def customer_support_chat(client, customer_query):
    """顧客の問い合わせに対してリアルタイムで応答します。"""
    instructions = """
    あなたは親切で効率的なカスタマーサポート担当者です。
    以下のガイドラインに従ってください：
    1. 顧客の問題を素早く理解し、共感を示す
    2. 明確で段階的な解決策を提供する
    3. 専門用語は避け、わかりやすい言葉で説明する
    4. 必要に応じて追加の質問をする
    """
    
    print("カスタマーサポート応答中...")
    stream = create_streaming_response(client, customer_query, instructions)
    
    # リアルタイムで応答を表示
    for event in stream:
        if event.type == "response.output_text.delta":
            print(event.delta, end="", flush=True)
```

このアプローチにより、顧客は応答が完全に生成されるのを待つ必要がなく、即座にサポートを受けている感覚を得られます。

### 2. リアルタイムコンテンツ生成

ライブイベントやプレゼンテーションでの即時コンテンツ生成に活用できます。

```python
def live_content_generation(client, topic, audience):
    """ライブイベント中にリアルタイムでコンテンツを生成します。"""
    prompt = f"トピック「{topic}」について、{audience}向けの簡潔な説明を生成してください。"
    instructions = "専門家として、最新の情報と洞察を提供してください。"
    
    stream = create_streaming_response(client, prompt, instructions)
    
    # 生成されたコンテンツをリアルタイムで表示システムに送信
    for event in stream:
        if event.type == "response.output_text.delta":
            display_system.update(event.delta)  # 表示システムを更新
```

プレゼンターは質問に対する回答や補足情報をリアルタイムで得ることができ、よりインタラクティブなプレゼンテーションが可能になります。

### 3. 協調的ドキュメント作成

ユーザーとAIが協力してドキュメントを作成する際、ストリーミングによってよりスムーズな協働が実現します。

```python
def collaborative_writing(client, document_context, user_request):
    """ユーザーとAIが協力してドキュメントを作成します。"""
    prompt = f"現在のドキュメント:\n{document_context}\n\nユーザーの要求:\n{user_request}"
    instructions = "ドキュメントの文体と構造を維持しながら、ユーザーの要求に基づいて適切な内容を追加または修正してください。"
    
    stream = create_streaming_response(client, prompt, instructions)
    
    # ユーザーがリアルタイムで編集できるようにテキストを表示
    generated_text = ""
    for event in stream:
        if event.type == "response.output_text.delta":
            delta = event.delta
            generated_text += delta
            editor.update_preview(generated_text)  # エディタのプレビューを更新
            
            # ユーザーが生成中に介入できる機能
            if user_interrupts():
                # ユーザーの介入を処理
                handle_user_intervention(generated_text)
                break
```

ユーザーは生成中のテキストを見ながらリアルタイムで介入でき、より効率的な共同作業が可能になります。

## 効果的なストリーミング実装のポイント

ストリーミング機能を最大限に活用するためのベストプラクティスを紹介します：

### 1. ユーザーインターフェースの最適化

ストリーミングテキストを効果的に表示するためのUIデザインが重要です：

- **タイピング効果**: 人間がタイプしているような自然な表示速度の調整
- **スクロール制御**: 長いテキストの場合、自動スクロールと手動スクロールのバランス
- **視覚的フィードバック**: 生成中であることを示すインジケータ（点滅するカーソルなど）

```python
def display_with_typing_effect(delta_text, speed=0.01):
    """タイピング効果でテキストを表示します。"""
    for char in delta_text:
        print(char, end="", flush=True)
        time.sleep(speed)  # 文字ごとに短い遅延を追加
```

### 2. 早期処理と並行処理

ストリーミングの利点を活かし、テキストが完全に生成される前に処理を開始できます：

- **進行中の分析**: 生成されたテキストの一部から意味を抽出し始める
- **並行タスク**: 生成中に関連リソースの準備や補足情報の取得を開始
- **早期フィードバック**: 問題が検出された場合に早期に介入

```python
def process_while_streaming(stream):
    """ストリーミング中にテキストを処理します。"""
    buffer = ""
    sentences = []
    
    for event in stream:
        if event.type == "response.output_text.delta":
            buffer += event.delta
            
            # 文単位で処理
            if '。' in buffer or '.' in buffer:
                new_sentences = re.split(r'([。.])', buffer)
                for i in range(0, len(new_sentences)-1, 2):
                    if new_sentences[i]:
                        complete_sentence = new_sentences[i] + (new_sentences[i+1] if i+1 < len(new_sentences) else "")
                        sentences.append(complete_sentence)
                        # 完成した文に対して処理を実行
                        process_sentence(complete_sentence)
                
                # 未完成の部分を保持
                buffer = new_sentences[-1] if len(new_sentences) % 2 == 1 else ""
    
    # 残りのバッファを処理
    if buffer:
        sentences.append(buffer)
        process_sentence(buffer)
    
    return sentences
```

### 3. エラー処理とフォールバック

ストリーミング中の接続問題や中断に対応するための戦略が必要です：

- **接続監視**: ストリーミング中の接続状態を監視
- **部分的な結果の保存**: 生成された部分を定期的に保存
- **フォールバックメカニズム**: 接続が失われた場合に非ストリーミングモードに切り替え

```python
def robust_streaming(client, prompt, max_retries=3):
    """堅牢なストリーミング処理を実装します。"""
    retry_count = 0
    accumulated_text = ""
    
    while retry_count < max_retries:
        try:
            stream = create_streaming_response(client, prompt)
            
            for event in stream:
                if event.type == "response.output_text.delta":
                    delta = event.delta
                    accumulated_text += delta
                    print(delta, end="", flush=True)
            
            # 正常に完了
            return accumulated_text
            
        except Exception as e:
            retry_count += 1
            print(f"\n接続エラー: {e}. リトライ {retry_count}/{max_retries}...")
            
            if retry_count >= max_retries:
                print("\nストリーミングモードでの接続に失敗しました。非ストリーミングモードに切り替えます。")
                # 非ストリーミングモードでリトライ
                response = client.responses.create(
                    model="gpt-4o",
                    input=prompt,
                    stream=False
                )
                return accumulated_text + response.output_text
            
            # 短い待機後にリトライ
            time.sleep(2)
```

## 応用テクニック

### 1. インタラクティブなストリーミング

ユーザーがストリーミング中に介入できる機能を実装することで、より対話的な体験を提供できます：

```python
def interactive_streaming(client, initial_prompt):
    """ユーザーが介入可能なインタラクティブなストリーミングを実装します。"""
    prompt = initial_prompt
    full_response = ""
    
    stream = create_streaming_response(client, prompt)
    
    # 別スレッドでユーザー入力を監視
    user_input = None
    def get_user_input():
        nonlocal user_input
        user_input = input()
    
    import threading
    input_thread = threading.Thread(target=get_user_input)
    input_thread.daemon = True
    input_thread.start()
    
    print("生成中... (介入するには何かキーを押してEnterを押してください)")
    
    for event in stream:
        if event.type == "response.output_text.delta":
            delta = event.delta
            full_response += delta
            print(delta, end="", flush=True)
            
            # ユーザー入力をチェック
            if user_input is not None:
                print("\n\nユーザーが介入しました。生成を中断します。")
                break
    
    # 生成された部分に基づいて続行
    if user_input is not None:
        print("\n生成を続行するための指示を入力してください:")
        continuation_prompt = input()
        new_prompt = f"これまでの回答:\n{full_response}\n\n新しい指示:\n{continuation_prompt}"
        
        # 新しいプロンプトで再開
        return full_response + "\n\n" + interactive_streaming(client, new_prompt)
    
    return full_response
```

### 2. マルチモーダル出力の段階的生成

テキストだけでなく、コードやマークダウン、表などの構造化コンテンツをストリーミングで生成する際の特殊な処理：

```python
def process_structured_streaming(stream):
    """構造化コンテンツのストリーミングを処理します。"""
    current_block = {"type": "text", "content": ""}
    blocks = []
    
    code_block_started = False
    table_started = False
    
    for event in stream:
        if event.type == "response.output_text.delta":
            delta = event.delta
            
            # コードブロックの開始を検出
            if "```" in delta and not code_block_started:
                # 現在のテキストブロックを終了
                if current_block["content"]:
                    blocks.append(current_block)
                
                # 新しいコードブロックを開始
                code_block_started = True
                current_block = {"type": "code", "content": delta}
            
            # コードブロックの終了を検出
            elif "```" in delta and code_block_started:
                current_block["content"] += delta
                blocks.append(current_block)
                
                # 新しいテキストブロックを開始
                code_block_started = False
                current_block = {"type": "text", "content": ""}
            
            # 表の開始を検出
            elif "|" in delta and "-|-" in delta and not table_started:
                # 現在のテキストブロックを終了
                if current_block["content"]:
                    blocks.append(current_block)
                
                # 新しい表ブロックを開始
                table_started = True
                current_block = {"type": "table", "content": delta}
            
            # 通常のコンテンツ追加
            else:
                current_block["content"] += delta
            
            # 各ブロックタイプに応じた表示処理
            display_block(current_block)
    
    # 最後のブロックを追加
    if current_block["content"]:
        blocks.append(current_block)
    
    return blocks
```

### 3. 進捗表示の強化

長い応答の生成中にユーザーに進捗状況を視覚的に伝える方法：

```python
def enhanced_progress_display(stream, expected_length=1000):
    """進捗表示を強化したストリーミング処理を実装します。"""
    full_text = ""
    char_count = 0
    start_time = time.time()
    last_update_time = start_time
    
    # 進捗バーの初期化
    from tqdm import tqdm
    progress_bar = tqdm(total=expected_length, desc="生成中", unit="文字")
    
    for event in stream:
        if event.type == "response.output_text.delta":
            delta = event.delta
            full_text += delta
            char_count += len(delta)
            
            # 進捗バーの更新
            progress_bar.update(len(delta))
            
            # 生成速度の計算と表示（1秒ごとに更新）
            current_time = time.time()
            if current_time - last_update_time >= 1.0:
                elapsed = current_time - start_time
                chars_per_second = char_count / elapsed if elapsed > 0 else 0
                progress_bar.set_postfix(速度=f"{chars_per_second:.1f}文字/秒")
                last_update_time = current_time
    
    progress_bar.close()
    
    # 最終統計
    total_time = time.time() - start_time
    print(f"\n生成完了: {char_count}文字, {total_time:.2f}秒, 平均速度: {char_count/total_time:.1f}文字/秒")
    
    return full_text
```

## まとめ

ストリーミング機能は、OpenAI Responses APIの強力な特長の一つです。この機能により：

- ユーザーの待ち時間の体感を大幅に削減
- リアルタイムでの処理と介入が可能に
- より自然で対話的なAIエクスペリエンスの実現

が可能になります。ビジネスコンテキストでは、この機能を活用することで：

- カスタマーサポートの応答性と満足度の向上
- リアルタイムコラボレーションの実現
- インタラクティブなコンテンツ生成の効率化

などの価値を創出できます。

ストリーミング機能は、特に長文の生成や対話的なアプリケーションにおいて、ユーザー体験を根本的に変革する可能性を秘めています。適切なUIデザインと組み合わせることで、AIとのコミュニケーションをより自然で効率的なものにすることができるでしょう。
