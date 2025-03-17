---
title: "JSONフォーマットによる構造化出力の生成"
---

# JSONフォーマットによる構造化出力の生成

## 概要

AIモデルの出力を直接アプリケーションで利用するには、自由形式のテキストよりも構造化されたデータ形式が適しています。このユースケースでは、OpenAI Responses APIの構造化出力機能を活用して、テキスト情報をJSON形式で取得する方法を解説します。単純なJSONオブジェクトの生成から、複雑なスキーマに基づいた厳密な構造化データの生成まで、様々なレベルでの活用方法を紹介します。

## 技術的解説

### JSON出力の仕組み

OpenAI Responses APIでは、`text.format`パラメータを使用して、モデルの出力形式を指定できます。JSON形式の出力には、主に2つのアプローチがあります：

#### 1. 基本的なJSONオブジェクト出力

```python
payload = {
    "model": "gpt-4o",
    "input": prompt,
    "text": {"format": {"type": "json_object"}},
    "max_output_tokens": 150,
}
```

この方法では、モデルに単純にJSON形式で出力するよう指示します。出力の構造は完全にモデルに委ねられます。

#### 2. JSONスキーマを使用した構造化出力

```python
payload = {
    "model": "gpt-4o",
    "input": prompt,
    "text": {
        "format": {
            "type": "json_schema",
            "name": "response_format",
            "schema": schema,
            "strict": True,
        }
    },
    "max_output_tokens": 500,
}
```

この方法では、出力すべきJSONの構造をスキーマとして明示的に定義します。`strict: True`を指定することで、スキーマで定義されたすべてのフィールドが出力されることを保証します。

### JSONスキーマの定義

JSONスキーマは、出力データの構造、型、制約を定義するための強力なツールです：

```python
product_schema = {
    "type": "object",
    "additionalProperties": False,  # 定義されていないプロパティを許可しない
    "properties": {
        "product_name": {"type": "string", "description": "製品の名称"},
        "price": {"type": "number", "description": "製品の価格（税抜き）"},
        "release_date": {
            "type": "string",
            "description": "発売予定日（YYYY-MM-DD形式）",
        },
        "features": {
            "type": "array",
            "items": {"type": "string", "description": "製品の特徴"},
            "description": "製品の主な特徴リスト",
        },
    },
    "required": ["product_name", "price", "release_date", "features"],
}
```

このスキーマでは：
- オブジェクトの構造と各フィールドの型を定義
- 各フィールドの説明（description）を提供し、モデルがより適切な値を生成できるようサポート
- 必須フィールド（required）を指定
- 追加のプロパティを許可するかどうか（additionalProperties）を制御

### 実装のポイント

```python
def create_json_schema_response(api_key, prompt, schema):
    """JSONスキーマを使用した構造化レスポンスを取得する"""
    url = "https://api.openai.com/v1/responses"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "gpt-4o",
        "input": prompt,
        "text": {
            "format": {
                "type": "json_schema",
                "name": "response_format",
                "schema": schema,
                "strict": True,
            }
        },
        "max_output_tokens": 500,
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"APIリクエストエラー: {e}")
        print(f"レスポンス: {response.text}")
    except Exception as e:
        print(f"エラーが発生しました: {e}")

    return None
```

この関数は、指定されたスキーマに従ったJSON形式の応答を生成します。`strict: True`を設定することで、スキーマで定義されたすべてのフィールドが出力されることを保証します。

### 応答の検証

生成されたJSONが期待通りのスキーマに従っているかを検証することも重要です：

```python
def validate_json_response(parsed, schema):
    """抽出したJSONを指定のスキーマでバリデーションする"""
    if not parsed:
        return False
    try:
        jsonschema.validate(instance=parsed, schema=schema)
        return True
    except jsonschema.exceptions.ValidationError as e:
        print("JSONバリデーションエラー:", e)
        return False
```

この関数は、`jsonschema`ライブラリを使用して、生成されたJSONが指定されたスキーマに準拠しているかを検証します。

## 活用シナリオ

このサンプルでは、JSON出力の4つの主要な活用シナリオを示しています：

### 1. 基本的なJSONオブジェクト出力

```python
basic_prompt = (
    "次の情報をJSON形式で出力してください：\n"
    "名前: 山田太郎\n"
    "年齢: 35\n"
    "職業: ソフトウェアエンジニア"
)
```

このシナリオでは、単純なテキスト情報をJSONオブジェクトに変換します。スキーマを指定せず、モデルに自由に構造化させる最も基本的な使用例です。

### 2. 製品情報の構造化

```python
product_prompt = (
    "次の製品説明からJSON形式で製品情報を抽出してください：\n\n"
    "新型スマートフォン「TechX Pro」は2024年5月15日に発売予定。価格は98,000円（税抜き）。\n"
    "主な特徴は高性能カメラ（5000万画素）、大容量バッテリー（5000mAh）、\n"
    "高速プロセッサ（Snapdragon 8 Gen 3）、防水防塵対応（IP68）です。"
)
```

このシナリオでは、非構造化テキストから特定の情報を抽出し、定義されたスキーマに従って構造化します。製品カタログやマーケティング資料からの情報抽出に適しています。

### 3. イベントスケジュールの構造化

```python
event_prompt = (
    "以下のイベント情報をJSON形式で構造化してください。"
    "各イベントは必ず以下のフィールドを出力すること。該当する情報がない場合は、空の配列 [] を出力してください。\n\n"
    "1. 技術セミナー「AIの最新動向」\n"
    "   日時: 2024年6月10日 14:00-16:00\n"
    "   場所: テックハブ東京（渋谷区）\n"
    "   参加費: 3,000円\n"
    "   持ち物: ノートPC（オプション）\n\n"
    "2. ワークショップ「実践的機械学習」\n"
    "   日時: 2024年6月15日 10:00-17:00\n"
    "   場所: デジタルスクエア大阪\n"
    "   参加費: 12,000円\n"
    "   持ち物: ノートPC（必須）、USBメモリ\n\n"
    "3. オンラインウェビナー「APIの活用法」\n"
    "   日時: 2024年6月20日 19:00-20:30\n"
    "   場所: Zoom（リンクは申込後に送付）\n"
    "   参加費: 無料\n"
    "   持ち物: []\n"
)
```

このシナリオでは、複数のイベント情報を配列として構造化し、各イベントの詳細を統一されたフォーマットで表現します。イベント管理システムやカレンダーアプリケーションとの連携に適しています。

### 4. 感情分析の構造化出力

```python
sentiment_prompt = (
    "次のレビューテキストを感情分析し、JSON形式で結果を出力してください。"
    "必ず全てのフィールドを出力すること。情報がない場合は、空の配列 [] を出力してください。\n\n"
    "「このアプリは非常に使いやすいインターフェースで気に入っています。特に検索機能と通知の設定が素晴らしいです。"
    "ただ、最近のアップデート後に時々クラッシュする問題があり、少し不便です。"
    "それでも全体的には満足していて、友人にも勧めたいと思います。」"
)
```

このシナリオでは、テキストの感情分析結果を階層的な構造で表現します。全体的な感情評価だけでなく、特定の側面（アスペクト）ごとの感情や、ポジティブ/ネガティブなポイントを構造化して出力します。

## ビジネス活用シナリオ

JSON形式の構造化出力は、様々なビジネスシーンで革新的な価値を生み出します：

### 1. データ抽出と変換の自動化

非構造化データから構造化データへの変換を自動化することで、データ処理パイプラインを効率化できます：

```python
def extract_structured_data(client, documents, schema):
    """複数の文書から構造化データを抽出します。"""
    results = []
    
    for doc in documents:
        prompt = f"以下の文書から重要な情報を抽出し、指定された形式でJSON出力してください:\n\n{doc}"
        response = create_json_schema_response(client, prompt, schema)
        parsed = extract_generated_json(response)
        
        if parsed and validate_json_response(parsed, schema):
            results.append(parsed)
        else:
            print(f"警告: 文書の処理に失敗しました: {doc[:100]}...")
    
    return results
```

この方法は、契約書、請求書、製品仕様書などの非構造化文書からデータを抽出し、データベースやスプレッドシートに取り込む際に特に有用です。

### 2. APIレスポンスの生成

AIを活用したAPIエンドポイントを構築する際、一貫した形式のレスポンスを生成できます：

```python
def generate_api_response(client, user_query, response_schema):
    """ユーザークエリに基づいてAPI形式のレスポンスを生成します。"""
    prompt = f"""
    ユーザーからの次のクエリに対して、APIレスポンスを生成してください:
    
    クエリ: {user_query}
    
    レスポンスは指定されたスキーマに厳密に従い、すべての必須フィールドを含めてください。
    エラーや不明な情報がある場合は、適切なエラーコードとメッセージを含めてください。
    """
    
    response = create_json_schema_response(client, prompt, response_schema)
    return extract_generated_json(response)
```

この方法により、AIを活用したAPIが常に一貫した形式のレスポンスを返すことを保証し、クライアントアプリケーションとの統合を容易にします。

### 3. データ分析レポートの自動生成

データセットの分析結果を構造化された形式で生成することで、ダッシュボードやレポートへの統合が容易になります：

```python
def generate_analysis_report(client, dataset, report_schema):
    """データセットを分析し、構造化されたレポートを生成します。"""
    # データセットの概要を作成
    summary = f"""
    データセット概要:
    - レコード数: {len(dataset)}
    - 期間: {min(dataset['date'])} から {max(dataset['date'])}
    - カテゴリ: {', '.join(set(dataset['category']))}
    
    主要指標:
    - 合計売上: {sum(dataset['revenue'])}
    - 平均単価: {sum(dataset['revenue']) / sum(dataset['units'])}
    - 最も売れた商品: {dataset.loc[dataset['units'].idxmax()]['product']}
    """
    
    prompt = f"""
    以下のデータセット概要に基づいて、詳細な分析レポートを生成してください。
    トレンド、パターン、異常値、および重要な洞察を特定してください。
    
    {summary}
    """
    
    response = create_json_schema_response(client, prompt, report_schema)
    return extract_generated_json(response)
```

この方法により、データ分析の結果を一貫した形式で取得し、ビジネスインテリジェンスツールやダッシュボードに直接統合できます。

### 4. 多言語コンテンツの構造化管理

複数言語でのコンテンツ管理を効率化できます：

```python
def generate_multilingual_content(client, base_content, languages, content_schema):
    """基本コンテンツを複数言語に翻訳し、構造化された形式で管理します。"""
    results = {}
    
    for lang in languages:
        prompt = f"""
        以下のコンテンツを{lang}に翻訳し、指定されたスキーマに従って出力してください。
        翻訳は自然で、文化的に適切であるべきです。
        
        原文:
        {base_content}
        """
        
        response = create_json_schema_response(client, prompt, content_schema)
        parsed = extract_generated_json(response)
        
        if parsed:
            results[lang] = parsed
    
    return results
```

この方法により、製品説明、マーケティングコピー、ヘルプドキュメントなどを複数言語で一貫した構造で管理できます。

## 効果的なJSONスキーマ設計のポイント

JSONスキーマを最大限に活用するためのベストプラクティスを紹介します：

### 1. 明確な型定義と制約

各フィールドの型と制約を明確に定義することで、より正確な出力を得られます：

```python
"price": {
    "type": "number",
    "minimum": 0,
    "description": "製品の価格（税抜き、円単位）"
},
"release_date": {
    "type": "string",
    "format": "date",
    "description": "発売予定日（YYYY-MM-DD形式）"
},
```

数値の範囲、文字列のフォーマット、配列の長さなどの制約を指定することで、より厳密なバリデーションが可能になります。

### 2. 詳細な説明（description）の提供

各フィールドに詳細な説明を提供することで、モデルがより適切な値を生成できるようになります：

```python
"features": {
    "type": "array",
    "items": {
        "type": "string",
        "description": "製品の特徴（技術仕様、機能、利点など）。各特徴は簡潔な文で表現し、技術的な詳細を含めてください。"
    },
    "description": "製品の主な特徴リスト。最も重要な特徴から順に並べてください。"
},
```

説明は単にフィールドの意味だけでなく、期待される形式、内容、優先順位などの詳細も含めると効果的です。

### 3. 列挙型（enum）の活用

特定の値のセットからの選択を強制したい場合は、列挙型を使用します：

```python
"category": {
    "type": "string",
    "enum": ["electronics", "clothing", "food", "books", "other"],
    "description": "製品のカテゴリ"
},
"priority": {
    "type": "string",
    "enum": ["low", "medium", "high", "critical"],
    "description": "タスクの優先度"
},
```

これにより、出力値が予め定義された選択肢の中から選ばれることを保証できます。

### 4. ネストされたオブジェクトと配列

複雑なデータ構造を表現するために、ネストされたオブジェクトと配列を活用します：

```python
"user": {
    "type": "object",
    "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "contact": {
            "type": "object",
            "properties": {
                "email": { "type": "string" },
                "phone": { "type": "string" }
            }
        }
    }
},
"order_items": {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "product_id": { "type": "string" },
            "quantity": { "type": "integer" },
            "price": { "type": "number" }
        }
    }
}
```

階層的なデータ構造を定義することで、複雑な関係性を持つ情報も適切に表現できます。

### 5. 条件付きフィールド

特定の条件下でのみ必要なフィールドを定義するには、条件付きスキーマを使用します：

```python
{
    "type": "object",
    "properties": {
        "payment_method": {
            "type": "string",
            "enum": ["credit_card", "bank_transfer", "paypal"]
        },
        "credit_card_number": { "type": "string" },
        "bank_account": { "type": "string" },
        "paypal_email": { "type": "string" }
    },
    "required": ["payment_method"],
    "allOf": [
        {
            "if": {
                "properties": { "payment_method": { "enum": ["credit_card"] } }
            },
            "then": { "required": ["credit_card_number"] }
        },
        {
            "if": {
                "properties": { "payment_method": { "enum": ["bank_transfer"] } }
            },
            "then": { "required": ["bank_account"] }
        },
        {
            "if": {
                "properties": { "payment_method": { "enum": ["paypal"] } }
            },
            "then": { "required": ["paypal_email"] }
        }
    ]
}
```

この例では、選択された支払い方法に応じて、異なるフィールドが必須となります。

## 応用テクニック

### 1. 段階的なデータ抽出と構造化

複雑なデータを段階的に抽出し構造化することで、より正確な結果を得られます：

```python
def staged_data_extraction(client, complex_document):
    """複雑な文書から段階的にデータを抽出します。"""
    
    # ステージ1: 主要セクションの特定
    sections_prompt = f"以下の文書の主要セクションを特定し、各セクションのタイトルと開始位置を出力してください:\n\n{complex_document}"
    sections_schema = {
        "type": "object",
        "properties": {
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": { "type": "string" },
                        "start_index": { "type": "integer" }
                    },
                    "required": ["title", "start_index"]
                }
            }
        },
        "required": ["sections"]
    }
    
    sections_response = create_json_schema_response(client, sections_prompt, sections_schema)
    sections_data = extract_generated_json(sections_response)
    
    # ステージ2: 各セクションからの詳細データ抽出
    results = {}
    
    for i, section in enumerate(sections_data["sections"]):
        # セクションのテキストを抽出
        start = section["start_index"]
        end = sections_data["sections"][i+1]["start_index"] if i < len(sections_data["sections"])-1 else len(complex_document)
        section_text = complex_document[start:end]
        
        # セクションに応じたスキーマを選択
        if "概要" in section["title"]:
            schema = summary_schema
        elif "財務" in section["title"]:
            schema = financial_schema
        elif "リスク" in section["title"]:
            schema = risk_schema
        else:
            schema = default_schema
        
        # セクション固有のデータを抽出
        section_prompt = f"以下の「{section['title']}」セクションから関連情報を抽出してください:\n\n{section_text}"
        section_response = create_json_schema_response(client, section_prompt, schema)
        section_data = extract_generated_json(section_response)
        
        results[section["title"]] = section_data
    
    return results
```

この方法は、長い契約書や技術文書など、複雑で多様な情報を含む文書の処理に特に有効です。

### 2. 複数モデルの組み合わせ

異なる強みを持つモデルを組み合わせることで、より高品質な構造化データを生成できます：

```python
def multi_model_extraction(client, document):
    """複数のモデルを組み合わせてデータ抽出の精度を向上させます。"""
    
    # ステップ1: 高精度モデルで初期抽出
    initial_prompt = f"以下の文書から主要な事実と数値データを抽出してください:\n\n{document}"
    initial_response = create_json_response(client, initial_prompt, model="gpt-4o")
    initial_data = extract_generated_json(initial_response)
    
    # ステップ2: 専門モデルで特定分野の詳細抽出
    if "financial_data" in initial_data:
        financial_prompt = f"以下の財務情報を詳細に分析し、構造化してください:\n\n{json.dumps(initial_data['financial_data'])}"
        financial_response = create_json_schema_response(client, financial_prompt, financial_schema, model="specialized-financial-model")
        financial_data = extract_generated_json(financial_response)
        initial_data["financial_data"] = financial_data
    
    # ステップ3: 最終的な統合と検証
    validation_prompt = f"以下の抽出データを検証し、矛盾や欠落がないか確認してください:\n\n{json.dumps(initial_data)}"
    validation_response = create_json_schema_response(client, validation_prompt, validation_schema, model="gpt-4o")
    validated_data = extract_generated_json(validation_response)
    
    return validated_data
```

この方法では、一般的なモデルと特定分野に特化したモデルを組み合わせることで、より正確で詳細な構造化データを生成できます。

### 3. インタラクティブな抽出と修正

ユーザーフィードバックを取り入れながら、段階的にデータ抽出の精度を向上させます：

```python
def interactive_extraction(client, document, schema):
    """ユーザーフィードバックを取り入れながら、データ抽出の精度を向上させます。"""
    
    # 初期抽出
    prompt = f"以下の文書から情報を抽出し、指定されたスキーマに従って出力してください:\n\n{document}"
    response = create_json_schema_response(client, prompt, schema)
    data = extract_generated_json(response)
    
    # ユーザーフィードバックのシミュレーション
    feedback = {
        "corrections": [
            {"field": "release_date", "value": "2024-06-01"},
            {"field": "features[2]", "value": "改良された防水性能（IP68対応）"}
        ],
        "missing": [
            {"field": "warranty", "value": "2年間の製品保証"}
        ]
    }
    
    # フィードバックに基づく修正
    refinement_prompt = f"""
    以下の抽出データを、ユーザーフィードバックに基づいて修正してください:
    
    元のデータ:
    {json.dumps(data, ensure_ascii=False, indent=2)}
    
    ユーザーフィードバック:
    - 修正: {', '.join([f"{item['field']}を「{item['value']}」に修正" for item in feedback['corrections']])}
    - 追加: {', '.join([f"{item['field']}を「{item['value']}」として追加" for item in feedback['missing']])}
    
    修正後のデータを指定されたスキーマに従って出力してください。
    """
    
    refinement_response = create_json_schema_response(client, refinement_prompt, schema)
    refined_data = extract_generated_json(refinement_response)
    
    return refined_data
```

この方法では、初期の抽出結果に対するユーザーフィードバックを取り入れ、より正確なデータを段階的に生成します。

## まとめ

JSONフォーマットによる構造化出力は、OpenAI Responses APIの強力な機能の一つです。この機能により：

- テキストデータを一貫した構造で取得
- アプリケーションで直接利用可能なデータ形式での出力
- 複雑なデータ構造の正確な表現

が可能になります。ビジネスコンテキストでは、この機能を活用することで：

- データ抽出と変換プロセスの自動化
- AIを活用したAPIの構築と統合
- 複雑なデータ分析レポートの自動生成
- 多言語コンテンツの一貫した管理

などの価値を創出できます。

JSONスキーマを活用した構造化出力は、AIの生成能力とアプリケーションの処理能力を橋渡しする重要な技術です。適切なスキーマ設計と検証プロセスを組み合わせることで、AIの柔軟性と構造化データの厳密性という、一見相反する特性を両立させることができます。これにより、AIをビジネスプロセスやアプリケーションにシームレスに統合する道が開かれるでしょう。
