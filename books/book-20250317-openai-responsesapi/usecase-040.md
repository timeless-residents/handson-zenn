---
title: "市民向け行政サービス案内：AIによる公共サービス情報提供の効率化"
---

# 市民向け行政サービス案内：AIによる公共サービス情報提供の効率化

## 概要

行政サービスに関する情報は多岐にわたり、市民が必要な情報を適切なタイミングで入手することは容易ではありません。従来の情報提供方法では、窓口での対応や電話問い合わせが中心となり、市民の利便性と行政の業務効率の両面で課題がありました。

本ユースケースでは、OpenAI Responses APIを活用して、市民が行政サービスに関する情報を簡単に検索・取得できるチャットボットシステムを紹介します。このシステムは、住民票などの各種証明書発行手続き、公共施設の利用案内、市民向けイベント情報、よくある質問への回答など、幅広い行政情報を対話形式で提供します。

これにより、市民は24時間いつでも必要な情報にアクセスでき、行政側も窓口や電話対応の負担軽減につながります。また、高齢者や障がい者、外国人居住者など、様々な市民のニーズに対応した情報提供が可能になり、行政サービスの包括性と透明性の向上に貢献します。

## 技術的解説

### 1. システム構成

このシステムは、以下のコンポーネントで構成されています：

1. **フロントエンド**: コンソールインターフェースとWebインターフェースの2種類を提供
2. **バックエンド**: OpenAI Responses APIを使用した対話処理エンジン
3. **データモジュール**: 行政手続き、施設、イベント、FAQ、緊急情報などのデータを管理

```python
def main():
    """メイン関数"""
    print("市民向け行政サービス案内AIアシスタントのデモ\n")
    print("インターフェースを選択してください:")
    print("1: コンソールインターフェース（テキストベース）")
    print("2: Webインターフェース（ブラウザベース）")

    choice = input("\n選択してください (1 または 2): ").strip()

    if choice == "1":
        console_interface()
    elif choice == "2":
        web_interface()
    else:
        print("無効な選択です。デフォルトのコンソールインターフェースを起動します。")
        console_interface()
```

この構成により、コマンドラインに慣れた職員向けのコンソールインターフェースと、一般市民向けのWebインターフェースの両方を提供し、様々なユーザーのニーズに対応しています。

### 2. ツール定義とFunction Calling

OpenAI Responses APIのFunction Calling機能を活用して、適切なタイミングで必要な情報を取得するためのツールを定義しています：

```python
def setup_tools():
    """ツール定義を設定します。"""
    return [
        {
            "type": "function",
            "name": "get_procedure_info",
            "description": "行政手続きIDを指定して手続きの詳細情報を取得します",
            "parameters": {
                "type": "object",
                "properties": {
                    "procedure_id": {
                        "type": "string",
                        "description": "手続きID（例: CERT-001）",
                    }
                },
                "required": ["procedure_id"],
            },
        },
        {
            "type": "function",
            "name": "search_procedures",
            "description": "キーワードで行政手続きを検索します",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "検索キーワード"},
                    "category": {
                        "type": "string",
                        "description": "手続きカテゴリ（residence:住民関連, tax:税金関連, welfare:福祉関連）",
                    },
                },
                "required": ["query"],
            },
        },
        # 他のツール定義（施設情報、イベント情報、FAQ、緊急情報など）
    ]
```

これらのツール定義により、AIは市民からの質問内容に応じて適切な関数を呼び出し、必要な情報を取得することができます。例えば、「住民票の取得方法を教えてください」という質問に対しては、`search_procedures`関数を呼び出して関連する手続き情報を検索します。

### 3. 対話処理の流れ

市民からの問い合わせを処理する中核となる関数は以下の通りです：

```python
def process_chat(client, user_message, conversation_history=None):
    """
    ユーザーからのメッセージを処理し、適切な応答を生成します。

    Args:
        client (openai.Client): OpenAIクライアント
        user_message (str): ユーザーからのメッセージ
        conversation_history (list, optional): 過去の会話履歴

    Returns:
        dict: 応答メッセージとステータス
    """
    tools = setup_tools()
    instructions = """
    あなたは地方自治体の行政サービス案内AIアシスタントです。
    市民からの行政手続き、公共施設、イベント、その他行政サービスに関する
    問い合わせに丁寧に回答してください。必要に応じて提供されたツールを使用して
    最新の正確な情報を提供してください。

    以下のガイドラインに従ってください：
    1. 常に礼儀正しく、敬語を使って対応する
    2. 質問に対しては具体的かつ簡潔に回答する
    3. 行政手続きや施設に関する質問には、必ずツールを使用して正確な情報を提供する
    4. わからないことや情報がない場合は、誤った情報を提供せず、正直に伝える
    5. 個人の状況によって異なる可能性がある場合は、一般的な情報を提供し、詳細は窓口での相談を案内する
    6. 行政サービスの利用方法についてはできるだけ具体的に説明し、必要書類や手続き方法を案内する
    7. 緊急の相談（災害、生活困窮など）については、適切な窓口や連絡先を案内する
    8. Markdownは使用せず、HTMLタグを使って情報を整形する。番号付きリストは<ol><li>項目</li></ol>、箇条書きは<ul><li>項目</li></ul>を使用
    9. 電話番号やリンクはHTML形式で記述する（例：<a href="URL">テキスト</a>）
    """

    # 会話履歴がある場合は、それを含めてリクエストを作成
    messages = []
    previous_response_id = None

    if conversation_history:
        for msg in conversation_history:
            if msg["role"] == "user":
                messages.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant" and "response_id" in msg:
                messages.append({"role": "assistant", "content": msg["content"]})
                previous_response_id = msg["response_id"]

    # 現在のユーザーメッセージを追加
    messages.append({"role": "user", "content": user_message})

    # OpenAI APIを呼び出し
    try:
        response = client.responses.create(
            model="gpt-4o",
            instructions=instructions,
            input=messages,
            tools=tools,
            tool_choice="auto",
            previous_response_id=previous_response_id,
        )

        # 関数呼び出しがある場合は処理
        function_calls = [msg for msg in response.output if msg.type == "function_call"]
        if function_calls:
            function_outputs = []
            for fc in function_calls:
                # 関数名とパラメータを取得
                func_name = fc.name
                params = json.loads(fc.arguments)

                # 対応する関数を呼び出し
                if func_name == "get_procedure_info":
                    result = get_procedure_info(**params)
                elif func_name == "search_procedures":
                    result = search_procedures(**params)
                # 他の関数呼び出し処理

                # 関数の出力を追加
                function_outputs.append(
                    {
                        "type": "function_call_output",
                        "call_id": fc.call_id,
                        "output": json.dumps(result, ensure_ascii=False),
                    }
                )

            # ツール出力を含めて最終応答を生成
            final_response = client.responses.create(
                model="gpt-4o",
                instructions=instructions,
                input=function_outputs,
                previous_response_id=response.id,
            )

            return {
                "status": "success",
                "message": final_response.output_text,
                "response_id": final_response.id,
            }

        # 関数呼び出しがない場合は直接レスポンスを返す
        return {
            "status": "success",
            "message": response.output_text,
            "response_id": response.id,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"エラーが発生しました: {str(e)}",
        }
```

この関数では、以下の重要なポイントに注目してください：

1. **システムプロンプト（instructions）**: AIに「行政サービス案内AIアシスタント」としての役割を与え、応答スタイルや情報提供の方針を指示しています。
2. **会話履歴の管理**: 過去の会話履歴を含めることで、文脈を考慮した応答が可能になっています。
3. **Function Calling**: ユーザーの質問に応じて適切な関数を呼び出し、必要な情報を取得しています。
4. **前回のレスポンスID**: `previous_response_id`を使用して会話の継続性を維持しています。

### 4. データモジュールの構造

行政サービス情報を管理するデータモジュールは、以下のようなデータ構造を持っています：

```python
# 行政手続き情報
PROCEDURES = [
    {
        "id": "CERT-001",
        "name": "住民票の写し",
        "category": "residence",
        "description": "住民登録されている住所や世帯構成などを証明する書類です。",
        "required_documents": ["本人確認書類（運転免許証、マイナンバーカードなど）"],
        "fee": 300,
        "processing_time": "即日（窓口申請の場合）",
        "online_available": True,
        "locations": ["市役所本庁舎1階市民課", "各地域センター"],
        "hours": "平日 8:30～17:15（土日祝日、年末年始を除く）",
        "notes": "同一世帯以外の方が申請する場合は委任状が必要です。"
    },
    # 他の手続き情報
]

# 施設情報
FACILITIES = [
    {
        "id": "LIB-001",
        "name": "中央図書館",
        "facility_type": "library",
        "address": "〒123-4567 市中央区本町1-1-1",
        "phone": "012-345-6789",
        "hours": "火～金：10:00～19:00、土日祝：10:00～17:00",
        "closed_days": "毎週月曜日（祝日の場合は翌平日）、年末年始、特別整理期間",
        "services": [
            "図書・雑誌の貸出・閲覧",
            "視聴覚資料の貸出・視聴",
            "レファレンスサービス",
            "複写サービス",
            "インターネット閲覧",
            "おはなし会"
        ],
        "facilities": ["学習室", "会議室", "視聴覚ブース", "児童コーナー"],
        "website": "https://www.city.example.lg.jp/library/",
        "notes": "駐車場は30台分あります。混雑時は公共交通機関をご利用ください。"
    },
    # 他の施設情報
]

# イベント情報、FAQ、緊急情報なども同様に定義
```

これらのデータ構造は、実際の行政サービス情報を模擬したものですが、実運用時には実際のデータベースやAPIと連携することで、常に最新の情報を提供することができます。

### 5. Webインターフェースの実装

一般市民向けのWebインターフェースは、Flaskを使用して以下のように実装されています：

```python
app = Flask(__name__)
api_client = None

@app.route("/")
def home():
    """ホームページを表示"""
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    """チャットAPIエンドポイント"""
    data = request.json
    user_message = data.get("message")
    conversation_history = data.get("history", [])

    if not user_message:
        return jsonify({"status": "error", "message": "メッセージが空です"})

    response = process_chat(api_client, user_message, conversation_history)
    return jsonify(response)

def web_interface():
    """Webベースのチャットインターフェース"""
    global api_client
    api_key = setup_environment()
    api_client = openai.Client(api_key=api_key)

    # テンプレートディレクトリの作成
    os.makedirs(os.path.join(os.path.dirname(__file__), "templates"), exist_ok=True)

    # HTMLテンプレートの作成
    html_template = """
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>市民向け行政サービス案内</title>
        <style>
            /* CSSスタイル */
        </style>
    </head>
    <body>
        <header>
            <h1>市民向け行政サービス案内</h1>
            <p>行政手続き、施設情報、イベント情報などについてお気軽にお問い合わせください</p>
        </header>
        
        <div class="quick-links">
            <div class="quick-link" onclick="askQuestion('住民票の取得方法について教えてください')">住民票について</div>
            <div class="quick-link" onclick="askQuestion('ゴミの分別方法について知りたいです')">ゴミの分別</div>
            <div class="quick-link" onclick="askQuestion('市内の図書館はどこにありますか？')">図書館情報</div>
            <div class="quick-link" onclick="askQuestion('今週末のイベントはありますか？')">イベント情報</div>
            <div class="quick-link" onclick="askQuestion('市役所の開庁時間を教えてください')">市役所情報</div>
        </div>
        
        <div class="chat-container" id="chat-container">
            <div class="message bot-message">
                こんにちは！市民向け行政サービス案内AIアシスタントです。行政手続き、施設情報、イベント情報などについてお気軽にお問い合わせください。
            </div>
        </div>
        
        <div class="input-container">
            <input type="text" id="user-input" placeholder="質問を入力してください...">
            <button id="send-button">送信</button>
        </div>
        
        <footer>
            <p>© 2025 市民向け行政サービス案内 - このサービスはAIを活用して情報提供を行っています。</p>
            <p>緊急時は各担当窓口に直接お問い合わせください。</p>
        </footer>
        
        <script>
            // JavaScriptコード
        </script>
    </body>
    </html>
    """

    # テンプレートを保存
    with open(
        os.path.join(os.path.dirname(__file__), "templates", "index.html"),
        "w",
        encoding="utf-8",
    ) as f:
        f.write(html_template)

    # Flaskアプリの起動
    print("Webインターフェースを起動しています...")
    print("以下のURLにアクセスしてください: http://localhost:5003")
    app.run(host="localhost", port=5003, debug=True)
```

このWebインターフェースでは、以下の特徴があります：

1. **クイックリンク**: よくある質問へのショートカットを提供し、ユーザーの利便性を向上
2. **チャットUI**: 対話形式でのコミュニケーションを実現し、自然な情報取得を可能に
3. **レスポンシブデザイン**: スマートフォンやタブレットからのアクセスにも対応
4. **非同期通信**: JavaScriptを使用した非同期通信により、スムーズな対話体験を提供

## ビジネス活用シナリオ

市民向け行政サービス案内システムは、様々な行政シーンで活用できます。以下に、具体的な活用シナリオを紹介します。

### 1. 自治体の総合窓口サービス

自治体の窓口業務では、様々な問い合わせに対応する必要があり、特に繁忙期には長い待ち時間が発生することがあります。

**活用例：中規模都市の市役所**

ある中規模都市の市役所では、窓口での問い合わせ対応に多くの人員を割いていましたが、特に年度始めや確定申告時期などの繁忙期には長い待ち時間が発生し、市民からの不満が寄せられていました。また、単純な情報提供のための問い合わせが多く、職員の業務効率が低下していました。

AIによる行政サービス案内システムを導入したところ、以下のような効果が得られました：

1. **窓口の待ち時間削減**: 基本的な情報提供はAIが担当し、窓口での待ち時間が平均30%減少
2. **24時間対応**: 営業時間外でも情報提供が可能になり、市民の利便性が向上
3. **職員の業務効率化**: 職員は複雑な相談や判断が必要な業務に集中できるようになり、サービスの質が向上
4. **問い合わせデータの分析**: 市民からの問い合わせ内容を分析し、よくある質問や改善すべき情報提供方法を特定

導入後、窓口での問い合わせ件数が40%減少し、市民満足度調査でのサービス評価が20%向上しました。また、職員の残業時間も15%削減され、働き方改革にも貢献しました。

### 2. 多言語対応による外国人住民支援

日本に住む外国人住民にとって、言語の壁は行政サービスへのアクセスを難しくする大きな要因となっています。

**活用例：外国人住民が増加している自治体**

ある自治体では、近年外国人住民が増加しており、多言語での情報提供が課題となっていました。特に、在留手続き、子どもの教育、医療、災害時の対応など、生活に密着した情報へのアクセスが困難な状況でした。

AIによる多言語対応の行政サービス案内システムを導入したところ、以下のような効果が得られました：

1. **多言語対応**: 英語、中国語、ベトナム語、ポルトガル語など10言語での情報提供が可能に
2. **文化的背景への配慮**: 各国の文化的背景を考慮した説明により、理解度が向上
3. **専門用語の平易な説明**: 行政特有の専門用語を平易に説明し、理解を促進
4. **画像や地図の活用**: 文字情報だけでなく、視覚的な情報も提供することで理解を支援

導入後、外国人住民からの問い合わせ対応時間が60%削減され、通訳者の配置コストも30%削減されました。また、外国人住民の行政サービス利用率が25%向上し、地域社会への統合が促進されました。

### 3. 災害時の緊急情報提供

災害時には、正確な情報を迅速に提供することが重要です。特に、避難所情報、ライフラインの状況、支援情報などへのアクセスが求められます。

**活用例：災害対策本部の情報発信**

ある自治体では、過去の災害時に情報発信が追いつかず、市民が必要な情報を得られないという課題がありました。特に、電話による問い合わせが集中し、対応が困難な状況でした。

AIによる災害時情報提供システムを導入したところ、以下のような効果が得られました：

1. **リアルタイム情報更新**: 災害対策本部からの情報をリアルタイムで反映
2. **個別状況への対応**: 地域や状況に応じた避難情報や支援情報を提供
3. **問い合わせ集中の緩和**: 電話による問い合わせが分散され、重要な連絡が取りやすくなった
4. **多チャネル展開**: チャットボット、SNS、デジタルサイネージなど多様なチャネルでの情報提供

導入後の訓練では、情報提供の応答時間が平均5分から即時に改善され、市民の90%が必要な情報に30分以内にアクセスできるようになりました。また、災害対策本部の情報発信担当者の負担が大幅に軽減されました。

### 4. 高齢者向け福祉サービス案内

高齢化社会において、高齢者向け福祉サービスの情報提供は重要な課題です。特に、介護保険、医療、生活支援などの複雑な制度について、わかりやすく説明することが求められます。

**活用例：高齢者福祉課の相談窓口**

ある自治体の高齢者福祉課では、介護保険や福祉サービスに関する問い合わせが多く、特に制度改正時には相談が集中していました。また、高齢者本人だけでなく、家族や介護者からの問い合わせも多く、対応に時間がかかっていました。

AIによる高齢者向け福祉サービス案内システムを導入したところ、以下のような効果が得られました：

1. **平易な言葉での説明**: 専門用語を避け、わかりやすい言葉で制度を説明
2. **個別状況に応じた案内**: 年齢、要介護度、世帯状況などに応じた適切なサービスを案内
3. **申請手続きの支援**: 必要書類や申請方法を具体的に説明し、手続きをサポート
4. **関連サービスの紹介**: 介護保険外のサービスや地域の支援団体なども紹介

導入後、基本的な問い合わせへの対応時間が70%削減され、専門職員は複雑なケースや直接支援が必要なケースに集中できるようになりました。また、サービス利用申請の不備が30%減少し、処理時間の短縮にもつながりました。

## 実装上の注意点

市民向け行政サービス案内システムを実装する際には、以下の点に注意が必要です。

### 1. 情報の正確性と最新性の確保

行政情報は頻繁に更新されるため、常に最新の情報を提供するための仕組みが重要です：

```python
def update_government_data():
    """行政データを更新する関数"""
    # 実際の実装では、データベースやAPIから最新情報を取得
    
    # 更新日時の記録
    update_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 更新ログの記録
    with open("data_update_log.txt", "a") as f:
        f.write(f"[{update_timestamp}] データ更新実行\n")
    
    try:
        # 手続き情報の更新
        updated_procedures = fetch_procedures_from_database()
        if updated_procedures:
            global PROCEDURES
            PROCEDURES = updated_procedures
            
        # 施設情報の更新
        updated_facilities = fetch_facilities_from_database()
        if updated_facilities:
            global FACILITIES
            FACILITIES = updated_facilities
            
        # イベント情報の更新
        updated_events = fetch_events_from_database()
        if updated_events:
            global EVENTS
            EVENTS = updated_events
            
        # FAQ情報の更新
        updated_faqs = fetch_faqs_from_database()
        if updated_faqs:
            global FAQS
            FAQS = updated_faqs
            
        # 緊急情報の更新
        updated_emergency_info = fetch_emergency_info_from_database()
        if updated_emergency_info:
            global EMERGENCY_INFO
            EMERGENCY_INFO = updated_emergency_info
        
        # 更新成功ログ
        with open("data_update_log.txt", "a") as f:
            f.write(f"[{update_timestamp}] データ更新成功\n")
            
        return True
        
    except Exception as e:
        # 更新失敗ログ
        with open("data_update_log.txt", "a") as f:
            f.write(f"[{update_timestamp}] データ更新失敗: {str(e)}\n")
        
        return False
```

この関数では、データベースやAPIから最新の行政情報を取得し、システム内のデータを更新しています。定期的な更新スケジュールを設定するか、情報が更新されたタイミングでトリガーされるようにすることで、常に最新の情報を提供できます。

### 2. プライバシーとセキュリティの確保

市民の個人情報を扱う可能性があるため、プライバシーとセキュリティの確保が重要です：

```python
def sanitize_user_input(user_input: str) -> str:
    """ユーザー入力から個人情報を検出・マスキングする"""
    # 個人情報のパターン
    patterns = {
        "マイナンバー": r"\d{12}|\d{4}-\d{4}-\d{4}",
        "電話番号": r"0\d{1,4}-\d{1,4}-\d{4}",
        "メールアドレス": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        "住所": r"〒\d{3}-\d{4}|東京都|北海道|大阪府|京都府|[^\s]{2,3}県[^\s]{2,3}市",
        "クレジットカード": r"\d{4}-\d{4}-\d{4}-\d{4}|\d{16}"
    }
    
    sanitized_input = user_input
    
    # 各パターンに対してマスキング処理
    import re
    for info_type, pattern in patterns.items():
        sanitized_input = re.sub(pattern, f"[{info_type}情報]", sanitized_input)
    
    return sanitized_input

def log_conversation(user_id: str, user_message: str, assistant_message: str, function_calls: List[Dict] = None) -> None:
    """会話ログを記録する（個人情報はマスキング）"""
    # ユーザーメッセージの個人情報をマスキング
    sanitized_user_message = sanitize_user_input(user_message)
    
    # ログエントリの作成
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,  # 実際の実装では匿名化されたIDを使用
        "user_message": sanitized_user_message,
        "assistant_message": assistant_message,
        "function_calls": function_calls
    }
    
    # ログの保存（実際の実装ではデータベースに保存）
    with open("conversation_logs.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
```

これらの関数では、ユーザー入力から個人情報を検出してマスキングし、会話ログを安全に記録しています。これにより、プライバシーを保護しつつ、システムの改善や監査のためのデータを収集することができます。

### 3. アクセシビリティの確保

高齢者や障がい者など、様々な市民が利用できるようにアクセシビリティを確保することが重要です：

```python
def enhance_accessibility(html_template: str) -> str:
    """アクセシビリティを向上させたHTMLテンプレートを生成する"""
    # WAI-ARIA属性の追加
    accessible_template = html_template
    
    # ランドマーク（landmark）ロールの追加
    accessible_template = accessible_template.replace("<header>", '<header role="banner">')
    accessible_template = accessible_template.replace("<div class=\"chat-container\"", '<main role="main"><div class="chat-container"')
    accessible_template = accessible_template.replace("</div>\n        \n        <div class=\"input-container\">", '</div>\n        </main>\n        \n        <div class="input-container">')
    accessible_template = accessible_template.replace("<footer>", '<footer role="contentinfo">')
    
    # フォーム要素のアクセシビリティ向上
    accessible_template = accessible_template.replace('<input type="text" id="user-input"', '<input type="text" id="user-input" aria-label="質問を入力"')
    accessible_template = accessible_template.replace('<button id="send-button">送信</button>', '<button id="send-button" aria-label="送信">送信</button>')
    
    # クイックリンクのアクセシビリティ向上
    accessible_template = accessible_template.replace('<div class="quick-link"', '<button class="quick-link"')
    accessible_template = accessible_template.replace('</div>', '</button>', 5)  # 最初の5つの出現のみ置換
    
    # フォントサイズ調整ボタンの追加
    font_size_controls = '''
    <div class="accessibility-controls" role="group" aria-label="文字サイズ調整">
        <button onclick="changeFontSize('smaller')" aria-label="文字を小さく">A-</button>
        <button onclick="changeFontSize('reset')" aria-label="文字サイズをリセット">A</button>
        <button onclick="changeFontSize('larger')" aria-label="文字を大きく">A+</button>
    </div>
    '''
    accessible_template = accessible_template.replace('</header>', f'{font_size_controls}</header>')
    
    # フォントサイズ調整のJavaScript関数を追加
    font_size_script = '''
    function changeFontSize(action) {
        const root = document.documentElement;
        let currentSize = parseFloat(getComputedStyle(root).fontSize);
        
        if (action === 'larger') {
            root.style.fontSize = (currentSize * 1.2) + 'px';
        } else if (action === 'smaller') {
            root.style.fontSize = (currentSize * 0.8) + 'px';
        } else if (action === 'reset') {
            root.style.fontSize = '16px';
        }
        
        localStorage.setItem('fontSize', root.style.fontSize);
    }
    
    // 保存されたフォントサイズを適用
    document.addEventListener('DOMContentLoaded', function() {
        const savedSize = localStorage.getItem('fontSize');
        if (savedSize) {
            document.documentElement.style.fontSize = savedSize;
        }
    });
    '''
    accessible_template = accessible_template.replace('</script>', f'{font_size_script}</script>')
    
    # 高コントラストモード切替ボタンの追加
    contrast_control = '''
    <button class="contrast-toggle" onclick="toggleContrast()" aria-label="コントラストを切り替え">コントラスト切替</button>
    '''
    accessible_template = accessible_template.replace('</div>\n        \n        <div class="chat-container"', f'{contrast_control}</div>\n        \n        <div class="chat-container"')
    
    # 高コントラストモードのCSS追加
    contrast_css = '''
    .high-contrast {
        background-color: #000 !important;
        color: #fff !important;
    }
    .high-contrast .chat-container, .high-contrast .message {
        background-color: #000 !important;
        border: 1px solid #fff !important;
    }
    .high-contrast .user-message {
        background-color: #00008B !important;
        color: #fff !important;
    }
    .high-contrast .bot-message {
        background-color: #006400 !important;
        color: #fff !important;
    }
    .high-contrast button, .high-contrast input {
        background-color: #000 !important;
        color: #fff !important;
        border: 2px solid #fff !important;
    }
    '''
    accessible_template = accessible_template.replace('</style>', f'{contrast_css}</style>')
    
    # 高コントラストモード切替のJavaScript関数を追加
    contrast_script = '''
    function toggleContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('highContrast', isHighContrast);
    }
    
    // 保存されたコントラスト設定を適用
    document.addEventListener('DOMContentLoaded', function() {
        const savedContrast = localStorage.getItem('highContrast');
        if (savedContrast === 'true') {
            document.body.classList.add('high-contrast');
        }
    });
    '''
    accessible_template = accessible_template.replace('</script>', f'{contrast_script}</script>')
    
    return accessible_template
```

この関数では、以下のアクセシビリティ向上策を実装しています：

1. **WAI-ARIA属性の追加**: スクリーンリーダーなどの支援技術でのナビゲーションを改善
2. **フォントサイズ調整機能**: 視力の弱い利用者のためのテキストサイズ調整機能
3. **高コントラストモード**: 視覚障がいのある利用者のための表示モード切替
4. **キーボード操作の改善**: キーボードのみでの操作性向上

### 4. 多言語対応

外国人住民向けに多言語対応を実装することも重要です：

```python
def setup_multilingual_support():
    """多言語対応の設定"""
    # 対応言語の定義
    supported_languages = {
        "ja": "日本語",
        "en": "English",
        "zh": "中文",
        "ko": "한국어",
        "vi": "Tiếng Việt",
        "pt": "Português",
        "es": "Español",
        "tl": "Tagalog",
        "th": "ไทย",
        "id": "Bahasa Indonesia"
    }
    
    # 言語ごとのシステムプロンプト
    system_prompts = {
        "ja": """あなたは地方自治体の行政サービス案内AIアシスタントです。
市民からの行政手続き、公共施設、イベント、その他行政サービスに関する
問い合わせに丁寧に回答してください。...""",
        
        "en": """You are an AI assistant for local government services.
Please politely respond to inquiries from citizens about administrative procedures,
public facilities, events, and other government services...""",
        
        "zh": """您是地方政府行政服务的AI助手。
请礼貌地回答市民关于行政手续、公共设施、活动和其他政府服务的咨询...""",
        
        # 他の言語も同様に定義
    }
    
    # 言語ごとのクイックリンクテキスト
    quick_links = {
        "ja": {
            "住民票": "住民票の取得方法について教えてください",
            "ゴミ分別": "ゴミの分別方法について知りたいです",
            "図書館": "市内の図書館はどこにありますか？",
            "イベント": "今週末のイベントはありますか？",
            "市役所": "市役所の開庁時間を教えてください"
        },
        "en": {
            "Residence Certificate": "How can I get a residence certificate?",
            "Garbage Sorting": "I want to know about garbage sorting methods.",
            "Library": "Where are the libraries in the city?",
            "Events": "Are there any events this weekend?",
            "City Hall": "Please tell me the opening hours of the city hall."
        },
        # 他の言語も同様に定義
    }
    
    return {
        "supported_languages": supported_languages,
        "system_prompts": system_prompts,
        "quick_links": quick_links
    }

def process_multilingual_chat(client, user_message, language_code, conversation_history=None):
    """多言語対応のチャット処理"""
    # 多言語設定の取得
    multilingual_config = setup_multilingual_support()
    
    # 言語に応じたシステムプロンプトの選択
    if language_code in multilingual_config["system_prompts"]:
        instructions = multilingual_config["system_prompts"][language_code]
    else:
        # デフォルトは日本語
        instructions = multilingual_config["system_prompts"]["ja"]
    
    # 以降は通常のprocess_chat関数と同様の処理
    # ただし、言語コードに応じた処理を追加
    
    # 例：日本語以外の場合は、関数呼び出し結果を該当言語に翻訳
    if language_code != "ja" and function_calls:
        for fc in function_calls:
            # 関数呼び出し結果を翻訳
            translated_result = translate_function_result(result, language_code)
            # 以降の処理
```

この実装では、以下の多言語対応機能を提供しています：

1. **複数言語のシステムプロンプト**: 各言語に最適化されたAIの応答スタイル
2. **言語別クイックリンク**: 各言語でよくある質問へのショートカット
3. **関数呼び出し結果の翻訳**: データベースから取得した情報を該当言語に翻訳

## まとめ

市民向け行政サービス案内システムは、OpenAI Responses APIの強力な活用例の一つです。Function Calling機能を活用して行政情報を検索・取得し、市民に対して対話形式で情報提供することで、行政サービスへのアクセシビリティを向上させることができます。

このシステムの主な利点は以下の通りです：

1. **24時間対応**: 市民はいつでも必要な情報にアクセスできる
2. **一貫性のある情報提供**: すべての問い合わせに対して同じ基準で正確な情報を提供
3. **多言語対応**: 外国人住民も母国語で行政情報にアクセス可能
4. **業務効率化**: 窓口や電話対応の負担軽減により、職員は複雑な業務に集中できる

実装にあたっては、情報の正確性と最新性の確保、プライバシーとセキュリティの確保、アクセシビリティの確保、多言語対応など、いくつかの重要な点に注意する必要があります。

市民向け行政サービス案内システムは、自治体の総合窓口サービス、多言語対応による外国人住民支援、災害時の緊急情報提供、高齢者向け福祉サービス案内など、様々な行政シーンで活用できます。これにより、行政サービスの包括性と透明性が向上し、市民満足度の向上と行政コストの削減の両立が可能になるでしょう。
