---
title: "画像入力と説明生成"
---

# 画像入力と説明生成

## 概要

AIの能力は、テキスト処理だけでなく視覚情報の理解にも及んでいます。このユースケースでは、OpenAI Responses APIを使用して画像を分析し、詳細な説明を生成する方法を紹介します。ローカルファイルからの画像、URLからの画像など、様々な入力方法に対応し、単純な説明から専門的な分析、多言語での出力まで、幅広い活用方法を示します。

## 技術的解説

### 画像入力の仕組み

OpenAI Responses APIでは、テキストだけでなく画像も入力として受け付けることができます。画像の送信方法には主に2つの方法があります：

#### 1. Base64エンコード画像

ローカルファイルの画像をBase64形式にエンコードして送信する方法です：

```python
def encode_image_to_base64(image_path):
    """画像ファイルをBase64にエンコードします。"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# 使用例
base64_image = encode_image_to_base64("path/to/image.jpg")
```

#### 2. 画像URL

インターネット上の画像URLを直接指定する方法です：

```python
image_url = "https://example.com/image.jpg"
```

### マルチモーダルリクエストの構築

APIリクエストでは、テキストと画像を組み合わせた入力を構築します：

```python
def create_image_response(client, prompt_text, image_data, image_type="base64"):
    """画像を含むレスポンスを生成します。"""
    # 入力形式を構築
    content = []
    
    # テキスト部分を追加
    content.append({"type": "text", "text": prompt_text})
    
    # 画像部分を追加
    if image_type == "base64":
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_data}"
            }
        })
    else:  # url
        content.append({
            "type": "image_url",
            "image_url": {
                "url": image_data
            }
        })

    # APIリクエスト
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": content}]
    )
    
    return {
        "id": response.id,
        "model": response.model,
        "created_at": response.created,
        "output_text": response.choices[0].message.content,
        "usage": response.usage
    }
```

### 画像処理のベストプラクティス

より効率的な画像分析のために、以下の処理を実装することが推奨されます：

#### 画像のリサイズ

大きな画像はAPIの処理に時間がかかるため、適切なサイズにリサイズすることが重要です：

```python
def resize_image_if_needed(image_path, max_size=(1024, 1024)):
    """必要に応じて画像をリサイズします。"""
    img = Image.open(image_path)
    
    # リサイズが必要かチェック
    if img.width > max_size[0] or img.height > max_size[1]:
        print(f"画像をリサイズします: {img.width}x{img.height} -> 最大{max_size[0]}x{max_size[1]}")
        img.thumbnail(max_size, Image.LANCZOS)
        
        # 新しいファイル名で保存
        filename, ext = os.path.splitext(image_path)
        new_path = f"{filename}_resized{ext}"
        img.save(new_path)
        return new_path
    
    return image_path
```

#### 画像形式の検証

APIが処理できる画像形式（JPEG、PNG、GIF、WebP）であることを確認します：

```python
def validate_image_format(image_path):
    """画像形式が有効かどうかを検証します。"""
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    ext = os.path.splitext(image_path)[1].lower()
    return ext in valid_extensions
```

## 活用シナリオ

このサンプルでは、画像分析と説明生成の4つの主要なシナリオを示しています：

### 1. 基本的な画像説明

ローカルファイルの画像を分析し、基本的な説明を生成します：

```python
prompt = "この画像を詳細に説明してください。写っているものや、画像の雰囲気、特徴的な要素についても触れてください。"
response = create_image_response(client, prompt, base64_image, "base64")
```

出力例：
```
この画像は美しい山岳風景を捉えた写真です。山々が湖または川に映り込んでいる様子が見られます。
前景は静かな水面で、その水面に周囲の山々と空が鏡のように反射しています。
背景には雄大な山脈があり、その頂上部分には雪が残っているように見えます。
全体的に青と緑の色調が豊かで、自然の息をのむような美しさを表現しています。
朝や夕方の光が景色を温かく照らしており、穏やかで静寂な雰囲気が伝わってきます。
```

### 2. URL画像の分析

インターネット上の画像URLを指定して分析します：

```python
image_url = "https://example.com/image.jpg"
prompt = "この画像に何が写っていますか？主な被写体と背景について説明してください。"
response = create_image_response(client, prompt, image_url, "url")
```

### 3. 専門的な画像分析

より詳細で専門的な分析を要求するプロンプトを使用します：

```python
prompt = """
この画像を詳細に分析し、以下の情報を提供してください：
1. 画像の種類（写真、図表、イラストなど）
2. 主要な視覚要素とその配置
3. 色調と全体的な雰囲気
4. 画像から読み取れるストーリーや文脈
5. この画像が適している用途や活用方法

専門的な視点から分析し、詳細な説明を提供してください。
"""
```

出力例：
```
1. 画像の種類: この画像は高解像度の風景写真です。

2. 主要な視覚要素とその配置:
   - 中央に穏やかな湖または川の水面
   - 背景に壮大な山脈
   - 水面に映り込む山々と空のリフレクション
   - 前景の岩や植生

3. 色調と全体的な雰囲気:
   - 青系統のクールトーン（水面、空、遠景の山）
   - 緑と茶色の自然な色調（近景の植物や岩）
   - ゴールデンアワーの温かみのある光（日の出または日没時の撮影）
   - 全体的に静謐で雄大な雰囲気

4. 画像から読み取れるストーリーや文脈:
   この画像は手つかずの自然の美しさと壮大さを表現しています。人間の介入がほとんど見られない原生自然の一瞬を切り取ったものであり、自然との調和や永続性を感じさせます。水面の完璧な反射は宇宙の均衡と平和を象徴しているようです。

5. 適している用途や活用方法:
   - 旅行や観光の宣伝素材
   - 自然保護や環境保全キャンペーン
   - 瞑想やウェルネスアプリの背景
   - カレンダーや壁紙
   - 自然をテーマにした出版物の表紙
   - 高級リゾートやエコツーリズムの広告
```

### 4. 多言語での画像分析

同じ画像に対して複数の言語で説明を生成します：

```python
prompt = """
Analyze this image and provide your description in three languages:
1. First in English
2. Then in Japanese (日本語)
3. Finally in Spanish (Español)

Include details about the main elements, colors, mood, and any interesting aspects.
"""
```

出力例：
```
1. English:
This image captures a breathtaking mountain landscape reflected in a perfectly still body of water. The majestic mountains rise in the background, their peaks possibly snow-capped, while the foreground features the mirror-like surface of a lake or river. The scene is bathed in soft light, suggesting either dawn or dusk, creating a peaceful and serene atmosphere. The color palette includes deep blues of the water and sky, rich greens of vegetation, and earthy tones of the mountains. The perfect reflection creates a symmetrical composition that enhances the sense of harmony and natural balance.

2. 日本語:
この画像は、静かな水面に完璧に映り込む息をのむような山岳風景を捉えています。雄大な山々が背景に聳え立ち、その頂は雪で覆われているようです。前景には湖か川の鏡のような水面が広がっています。シーンは柔らかな光に包まれており、夜明けか夕暮れ時を思わせ、平和で静かな雰囲気を醸し出しています。色彩は水面と空の深い青、植物の豊かな緑、山々の大地の色調を含んでいます。完璧な反射が生み出す左右対称の構図が、自然の調和とバランスの感覚を高めています。

3. Español:
Esta imagen captura un impresionante paisaje montañoso reflejado en una superficie de agua perfectamente quieta. Las majestuosas montañas se elevan en el fondo, con sus picos posiblemente cubiertos de nieve, mientras que en primer plano se aprecia la superficie similar a un espejo de un lago o río. La escena está bañada por una luz suave, lo que sugiere el amanecer o el atardecer, creando una atmósfera pacífica y serena. La paleta de colores incluye azules profundos del agua y el cielo, verdes intensos de la vegetación y tonos terrosos de las montañas. El reflejo perfecto crea una composición simétrica que realza la sensación de armonía y equilibrio natural.
```

## ビジネス活用シナリオ

画像分析と説明生成は、様々なビジネスシーンで革新的な価値を生み出します：

### 1. アクセシビリティ向上

視覚障害者向けのアクセシビリティを向上させるために、画像の詳細な説明を自動生成できます：

```python
def generate_accessibility_description(client, image_path):
    """アクセシビリティのための画像説明を生成します。"""
    base64_image = encode_image_to_base64(image_path)
    
    prompt = """
    この画像の詳細な説明を生成してください。視覚障害者が画像の内容を理解できるよう、
    以下の点に注意して説明してください：
    1. 主要な被写体と配置を明確に説明
    2. 色彩や雰囲気も含めて説明
    3. 画像の目的や文脈がわかるよう説明
    4. 重要な詳細は省略せず、順序立てて説明
    
    簡潔かつ情報量の多い説明を提供してください。
    """
    
    response = create_image_response(client, prompt, base64_image, "base64")
    return response["output_text"]
```

この機能により、ウェブサイトやアプリケーションのアクセシビリティを向上させ、より多くのユーザーに情報を提供できます。

### 2. コンテンツ管理の自動化

大量の画像を自動的に分類・整理するために、画像の内容を分析し、適切なタグやカテゴリを付与できます：

```python
def categorize_image(client, image_path):
    """画像を分析してカテゴリとタグを生成します。"""
    base64_image = encode_image_to_base64(image_path)
    
    prompt = """
    この画像を分析し、以下の情報をJSON形式で提供してください：
    1. 主要カテゴリ（風景、人物、建物、動物、食べ物、製品など）
    2. サブカテゴリ（より具体的な分類）
    3. 関連キーワード（10個程度）
    4. 画像の雰囲気（明るい、暗い、活気のある、静かななど）
    5. 主な色調
    
    JSON形式で返してください。
    """
    
    response = create_image_response(client, prompt, base64_image, "base64")
    # JSONパースなどの処理
    return response["output_text"]
```

この機能により、メディアライブラリやデジタルアセット管理システムでの画像整理が効率化されます。

### 3. Eコマースでの製品説明生成

製品画像から自動的に詳細な商品説明を生成し、オンラインショップのコンテンツ作成を効率化できます：

```python
def generate_product_description(client, product_image_path, product_category):
    """製品画像から商品説明を生成します。"""
    base64_image = encode_image_to_base64(product_image_path)
    
    prompt = f"""
    この画像は{product_category}カテゴリの製品です。
    この製品画像を詳細に分析し、以下を含む魅力的な商品説明を生成してください：
    1. 製品の主な特徴と外観
    2. 素材や品質の印象
    3. 想定される用途や活用シーン
    4. ターゲットユーザーへのアピールポイント
    5. 他の製品との差別化ポイント
    
    オンラインショップに掲載できる、魅力的で説得力のある300字程度の説明文を作成してください。
    """
    
    response = create_image_response(client, prompt, base64_image, "base64")
    return response["output_text"]
```

この機能により、Eコマースサイトのコンテンツ作成コストを削減し、より魅力的な商品ページを効率的に作成できます。

### 4. 不動産物件の自動説明

不動産物件の写真から自動的に物件の特徴や魅力を抽出し、リスティングの作成を支援できます：

```python
def analyze_real_estate_image(client, image_path, property_type):
    """不動産物件の画像を分析し、特徴を抽出します。"""
    base64_image = encode_image_to_base64(image_path)
    
    prompt = f"""
    この画像は{property_type}の不動産物件の写真です。
    この画像を詳細に分析し、以下の情報を抽出してください：
    1. 空間の特徴（広さ、天井の高さ、間取りの特徴など）
    2. デザインや内装の特徴（スタイル、素材、色調など）
    3. 採光や窓の状況
    4. 設備や家具の特徴
    5. 物件の魅力的なポイント
    6. 改善の余地がある点
    
    不動産リスティングに活用できる、客観的かつ魅力的な分析を提供してください。
    """
    
    response = create_image_response(client, prompt, base64_image, "base64")
    return response["output_text"]
```

この機能により、不動産業者は物件リスティングの作成を効率化し、より詳細で魅力的な物件情報を提供できます。

## 応用テクニック

### 1. 画像内のテキスト抽出

画像に含まれるテキストを抽出し、構造化された形式で取得できます：

```python
def extract_text_from_image(client, image_path):
    """画像内のテキストを抽出します。"""
    base64_image = encode_image_to_base64(image_path)
    
    prompt = """
    この画像に含まれるすべてのテキストを抽出し、以下の形式で提供してください：
    1. 主要な見出しやタイトル
    2. 段落やボディテキスト
    3. リストや箇条書き
    4. 表やグラフのラベルやデータ
    5. その他の文字情報
    
    可能な限り元の形式や構造を維持し、テキストを正確に抽出してください。
    """
    
    response = create_image_response(client, prompt, base64_image, "base64")
    return response["output_text"]
```

この機能により、スキャンされた文書、チャート、プレゼンテーションスライドなどからテキスト情報を効率的に抽出できます。

### 2. 画像の比較分析

複数の画像を同時に分析し、類似点や相違点を抽出できます：

```python
def compare_images(client, image_path1, image_path2):
    """2つの画像を比較分析します。"""
    base64_image1 = encode_image_to_base64(image_path1)
    base64_image2 = encode_image_to_base64(image_path2)
    
    # 入力形式を構築
    content = [
        {"type": "text", "text": "これら2つの画像を比較し、類似点と相違点を詳細に分析してください。"},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image1}"}},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image2}"}}
    ]
    
    # APIリクエスト
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": content}]
    )
    
    return response.choices[0].message.content
```

この機能により、製品の比較、ビフォーアフター分析、時系列変化の検出などが可能になります。

### 3. 画像からのデータ抽出

グラフや表から数値データを抽出し、構造化された形式で取得できます：

```python
def extract_data_from_chart(client, chart_image_path):
    """グラフや表から数値データを抽出します。"""
    base64_image = encode_image_to_base64(chart_image_path)
    
    prompt = """
    この画像はグラフまたは表です。
    画像から以下の情報を抽出し、JSON形式で提供してください：
    1. グラフ/表のタイトルと種類
    2. 軸のラベルと単位（グラフの場合）
    3. データポイントまたはセルの値
    4. 凡例情報
    5. トレンドや主要な発見
    
    可能な限り正確に数値データを抽出し、構造化された形式で提供してください。
    """
    
    response = create_image_response(client, prompt, base64_image, "base64")
    return response["output_text"]
```

この機能により、レポートやプレゼンテーション資料からのデータ抽出が効率化され、データ分析や再利用が容易になります。

## 実装上の注意点

画像分析と説明生成を実装する際の主な注意点は以下の通りです：

### 1. 画像サイズと品質

- **サイズ制限**: 大きすぎる画像はAPIの処理に時間がかかるため、適切なサイズ（1024x1024ピクセル程度）にリサイズすることが推奨されます。
- **品質バランス**: 画像の品質を維持しながらもファイルサイズを抑える必要があります。JPEGの場合は適切な圧縮率を選択しましょう。
- **アスペクト比**: 極端に縦長や横長の画像は、リサイズ時に情報が失われる可能性があるため注意が必要です。

### 2. プロンプト設計

- **具体的な指示**: 「この画像を説明して」よりも「この画像の主要な被写体、色調、雰囲気を説明して」のように具体的な指示を与えると、より適切な結果が得られます。
- **目的の明確化**: 画像分析の目的（アクセシビリティ、データ抽出、感情分析など）を明確にすることで、より適切な結果が得られます。
- **出力形式の指定**: 構造化された出力が必要な場合は、JSON形式などの具体的な出力形式を指定しましょう。

### 3. エラーハンドリング

- **画像形式の検証**: APIがサポートしている画像形式（JPEG、PNG、GIF、WebP）であることを確認しましょう。
- **タイムアウト対策**: 大きな画像や複雑な分析では処理に時間がかかる場合があるため、適切なタイムアウト設定が必要です。
- **エラーメッセージの処理**: APIからのエラーメッセージを適切に処理し、ユーザーに分かりやすいフィードバックを提供しましょう。

### 4. プライバシーとセキュリティ

- **個人情報の保護**: 画像に個人を特定できる情報が含まれている場合は、適切な処理（顔のぼかしなど）を行いましょう。
- **機密情報の扱い**: 機密情報を含む画像の処理には十分注意し、必要に応じて情報を削除または制限しましょう。
- **データ保存ポリシー**: 画像データの保存期間や利用目的を明確にし、適切なデータ管理を行いましょう。

## まとめ

画像入力と説明生成は、OpenAI Responses APIの強力な機能の一つです。この機能により：

- テキストと画像を組み合わせた複合的な分析が可能に
- 視覚情報の詳細な理解と説明の自動生成
- 多言語での画像コンテンツの説明
- 専門的な視点からの画像分析

が実現できます。ビジネスコンテキストでは、この機能を活用することで：

- アクセシビリティの向上
- コンテンツ管理の効率化
- Eコマースでの製品説明の自動生成
- 不動産物件の自動分析
- 画像データからの情報抽出

などの価値を創出できます。

画像分析と説明生成は、人間の視覚的理解をAIで拡張する重要な技術です。適切なプロンプト設計と画像処理を組み合わせることで、様々な業界やユースケースで革新的なアプリケーションを実現できるでしょう。
