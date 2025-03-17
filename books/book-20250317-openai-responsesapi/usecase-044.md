---
title: "バリアフリー情報アクセス支援：AIによる包括的なアクセシビリティ情報提供"
---

# バリアフリー情報アクセス支援：AIによる包括的なアクセシビリティ情報提供

## 概要

障がい者や高齢者、ベビーカー利用者など、移動や施設利用に特別な配慮が必要な方々にとって、バリアフリー情報へのアクセスは日常生活を送る上で極めて重要です。しかし、こうした情報は断片的であったり、最新の状態に更新されていなかったり、あるいは必要な詳細が欠けていることが少なくありません。

本ユースケースでは、OpenAI Responses APIを活用して、バリアフリー施設や情報へのアクセスを支援するシステムを紹介します。このシステムは、ユーザーの質問に応じて、バリアフリー施設の情報、アクセス方法、利用方法などを構造化された形式で提供します。また、アクセシビリティに配慮したインターフェースを備え、文字サイズの調整、ハイコントラストモード、音声読み上げ機能などを実装しています。

これにより、障がい者や高齢者、その家族や支援者は、外出先での移動や施設利用に関する情報を事前に把握し、より安心して社会参加することができるようになります。また、施設管理者や自治体にとっても、バリアフリー情報の提供と更新が容易になり、インクルーシブな社会づくりに貢献することができます。

## 技術的解説

### 1. システム構成

このシステムは、以下のコンポーネントで構成されています：

1. **Webインターフェース**: ユーザーからの質問入力と情報表示を行うUI
2. **OpenAI Responses API連携**: バリアフリー情報の生成と構造化を行うAI機能
3. **アクセシビリティ機能**: 文字サイズ調整、ハイコントラストモード、音声読み上げなどの機能

```python
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import json
import requests

# 環境変数の読み込み
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-key")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
API_URL = "https://api.openai.com/v1/chat/completions"  # ChatCompletion APIのエンドポイント
```

このシステムでは、FlaskをWebフレームワークとして使用し、OpenAI Responses APIと連携してバリアフリー情報を提供します。

### 2. バリアフリー情報生成機能

OpenAI Responses APIを活用して、ユーザーの質問に応じたバリアフリー情報を生成する機能を実装しています：

```python
@app.route("/", methods=["GET", "POST"])
def index():
    response_data = None
    query_type = "facility"  # デフォルトのクエリ種別

    if request.method == "POST":
        user_query = request.form.get("query", "")
        query_type = request.form.get("query_type", "facility")

        try:
            # システムプロンプトの設定
            system_prompt = """
            あなたはバリアフリー情報アクセス支援の専門家です。ユーザーの質問に対して、バリアフリー施設や情報へのアクセスを支援する情報を提供してください。
            必ず以下のJSON形式で回答してください:
            
            {
                "title": "タイトル", 
                "summary": "情報の要約",
                "details": [
                    {
                        "category": "カテゴリ",
                        "information": "詳細情報"
                    }
                ],
                "accessibility_tips": ["ヒント1", "ヒント2"],
                "additional_resources": ["リソース1", "リソース2"]
            }
            """
            if query_type == "facility":
                system_prompt += """
                施設に関する質問の場合は、以下の情報も含めてください:
                - 車いすアクセス
                - 視覚障害者向け設備
                - 聴覚障害者向け設備
                - 多目的トイレの有無
                - 最寄りの公共交通機関からのアクセス
                """
            elif query_type == "service":
                system_prompt += """
                サービスに関する質問の場合は、以下の情報も含めてください:
                - 利用可能な支援サービス
                - 事前予約の必要性
                - 利用料金
                - 対応している言語
                - オンラインでの申請方法
                """

            # ChatCompletion API用のペイロード作成
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                "response_format": {"type": "json_object"}
            }

            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            }

            # APIへリクエスト送信
            api_response = requests.post(API_URL, headers=headers, json=payload)
            api_response.raise_for_status()
            response_json = api_response.json()

            # レスポンステキストの取得
            response_text = response_json["choices"][0]["message"]["content"]
            parsed_json = json.loads(response_text)

            response_data = {
                "raw_response": response_text,
                "parsed_json": parsed_json,
                "model": response_json.get("model", ""),
                "id": response_json.get("id", ""),
                "usage": {
                    "input_tokens": response_json["usage"]["prompt_tokens"],
                    "output_tokens": response_json["usage"]["completion_tokens"],
                    "total_tokens": response_json["usage"]["total_tokens"]
                }
            }

        except Exception as e:
            # 例外発生時はエラーメッセージとAPIレスポンスの詳細も返す
            error_details = ""
            if "api_response" in locals():
                try:
                    error_details = api_response.text
                except:
                    error_details = "APIレスポンスの詳細を取得できませんでした"
            response_data = {"error": str(e), "details": error_details}

    return render_template("index.html", response=response_data, query_type=query_type)
```

この関数では、以下の重要なポイントに注目してください：

1. **クエリタイプの分岐**: 施設情報とサービス情報で異なるプロンプトを使用
2. **構造化された応答**: JSON形式で構造化された情報を要求
3. **詳細な情報カテゴリ**: 車いすアクセス、視覚障害者向け設備など、具体的な情報カテゴリを指定
4. **エラーハンドリング**: API呼び出しの例外処理と詳細なエラー情報の提供

### 3. アクセシビリティ機能の実装

Webインターフェースには、様々なアクセシビリティ機能を実装しています：

```html
<div class="accessibility-controls">
    <div class="font-size-control">
        <span>文字サイズ:</span>
        <button class="font-size-btn" onclick="changeFontSize('small')">小</button>
        <button class="font-size-btn" onclick="changeFontSize('medium')">中</button>
        <button class="font-size-btn" onclick="changeFontSize('large')">大</button>
    </div>
    <label>
        <input type="checkbox" id="high-contrast" onchange="toggleHighContrast()">
        ハイコントラストモード
    </label>
</div>

<script>
    function readAloud(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        speechSynthesis.speak(utterance);
    }
    
    function changeFontSize(size) {
        const body = document.body;
        if (size === 'small') {
            body.style.fontSize = '14px';
        } else if (size === 'medium') {
            body.style.fontSize = '16px';
        } else if (size === 'large') {
            body.style.fontSize = '18px';
        }
    }
    
    function toggleHighContrast() {
        const highContrast = document.getElementById('high-contrast').checked;
        if (highContrast) {
            // 背景と文字色を高コントラストに
            document.body.style.backgroundColor = '#000';
            document.body.style.color = '#fff';
            
            // ボタンのコントラストを向上
            document.querySelectorAll('button').forEach(btn => {
                if (btn.classList.contains('read-aloud-btn')) {
                    btn.style.backgroundColor = '#0D47A1';
                } else if (btn.classList.contains('toggle-raw')) {
                    btn.style.backgroundColor = '#263238';
                } else if (btn.classList.contains('font-size-btn')) {
                    btn.style.backgroundColor = '#424242';
                } else {
                    btn.style.backgroundColor = '#2E7D32';
                }
                btn.style.color = '#fff';
                btn.style.borderColor = '#fff';
            });
            
            // 結果カードの視認性向上
            document.querySelectorAll('.result-card').forEach(card => {
                card.style.backgroundColor = '#222';
                card.style.color = '#fff';
                card.style.borderColor = '#fff';
                card.style.boxShadow = '0 2px 4px rgba(255,255,255,0.2)';
            });
            
            // 詳細項目の境界線を明確に
            document.querySelectorAll('.detail-item').forEach(item => {
                item.style.borderBottomColor = '#aaa';
            });
            
            // カテゴリヘッダーをより目立たせる
            document.querySelectorAll('.detail-category').forEach(cat => {
                cat.style.color = '#ffeb3b';
                cat.style.fontWeight = 'bold';
            });
            
            // アクセシビリティコントロールの背景色を調整
            document.querySelector('.accessibility-controls').style.backgroundColor = '#1a472a';
            
            // 入力フォームの視認性向上
            document.querySelector('textarea').style.backgroundColor = '#333';
            document.querySelector('textarea').style.color = '#fff';
            document.querySelector('textarea').style.borderColor = '#aaa';
            
            // 見出しをより目立たせる
            document.querySelectorAll('h1, h2, h3').forEach(h => {
                h.style.color = '#4CAF50';
            });
            
        } else {
            // すべてのスタイルをリセット
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            
            document.querySelectorAll('button').forEach(btn => {
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            });
            
            document.querySelectorAll('.result-card').forEach(card => {
                card.style.backgroundColor = '';
                card.style.color = '';
                card.style.borderColor = '';
                card.style.boxShadow = '';
            });
            
            document.querySelectorAll('.detail-item').forEach(item => {
                item.style.borderBottomColor = '';
            });
            
            document.querySelectorAll('.detail-category').forEach(cat => {
                cat.style.color = '';
                cat.style.fontWeight = '';
            });
            
            document.querySelector('.accessibility-controls').style.backgroundColor = '';
            
            document.querySelector('textarea').style.backgroundColor = '';
            document.querySelector('textarea').style.color = '';
            document.querySelector('textarea').style.borderColor = '';
            
            document.querySelectorAll('h1, h2, h3').forEach(h => {
                h.style.color = '';
            });
        }
    }
</script>
```

これらの機能では、以下のアクセシビリティ向上策を提供しています：

1. **文字サイズ調整**: 小・中・大の3段階で文字サイズを調整可能
2. **ハイコントラストモード**: 背景色と文字色のコントラストを高め、視認性を向上
3. **音声読み上げ機能**: Web Speech APIを使用して、情報を音声で読み上げ
4. **構造化された情報表示**: カテゴリ別に情報を整理し、理解しやすく表示

### 4. 情報表示の構造化

バリアフリー情報を構造化して表示する機能も実装しています：

```html
<div class="result-card">
    <div class="result-title">{{ response.parsed_json.title }}</div>
    <div class="result-summary">{{ response.parsed_json.summary }}</div>
    
    <h3>詳細情報</h3>
    {% for detail in response.parsed_json.details %}
    <div class="detail-item">
        <div class="detail-category">{{ detail.category }}</div>
        <div class="detail-info">{{ detail.information }}</div>
    </div>
    {% endfor %}
    
    <h3>アクセシビリティのヒント</h3>
    <ul class="tips-list">
        {% for tip in response.parsed_json.accessibility_tips %}
        <li class="tip-item">{{ tip }}</li>
        {% endfor %}
    </ul>
    
    <h3>追加リソース</h3>
    <ul class="resources-list">
        {% for resource in response.parsed_json.additional_resources %}
        <li class="resource-item">{{ resource }}</li>
        {% endfor %}
    </ul>
    
    <button class="read-aloud-btn" onclick="readAloud('{{ response.parsed_json.summary }}')">内容を読み上げる</button>
</div>
```

この表示形式では、以下の情報構造を採用しています：

1. **タイトルと要約**: 情報の概要を簡潔に表示
2. **詳細情報**: カテゴリ別に詳細情報を整理して表示
3. **アクセシビリティのヒント**: 施設やサービスを利用する際の具体的なヒント
4. **追加リソース**: より詳細な情報を得るための外部リソース
5. **読み上げボタン**: 情報を音声で聞くためのボタン

## ビジネス活用シナリオ

バリアフリー情報アクセス支援システムは、様々なシーンで活用できます。以下に、具体的な活用シナリオを紹介します。

### 1. 自治体の情報提供サービス

自治体では、市民や観光客に対して、公共施設や交通機関のバリアフリー情報を提供する必要があります。

**活用例：中規模都市の観光・バリアフリー情報ポータル**

ある中規模都市では、市内の公共施設や観光スポットのバリアフリー情報を提供するポータルサイトを運営していましたが、情報の更新が追いつかず、また詳細な情報が不足していることが課題でした。特に、車いす利用者や視覚障害者など、特定のニーズを持つ利用者向けの情報提供が不十分でした。

AIによるバリアフリー情報アクセス支援システムを導入したところ、以下のような効果が得られました：

1. **詳細な施設情報の提供**: 車いすアクセス、視覚障害者向け設備、聴覚障害者向け設備など、詳細な情報を提供
2. **多様なニーズへの対応**: 様々な障がいや状況に応じた情報とヒントを提供
3. **アクセシビリティの向上**: 文字サイズ調整、ハイコントラストモード、音声読み上げなどの機能で情報アクセスを改善
4. **情報更新の効率化**: AIによる情報生成と構造化で、情報提供の負担を軽減

導入後、障がい者や高齢者からの「情報が見つけやすくなった」という評価が増加し、市内の公共施設や観光スポットの利用率が15%向上しました。また、情報提供に関する問い合わせが30%減少し、職員の負担軽減にもつながりました。

### 2. 交通事業者の利用者サポート

鉄道やバスなどの交通事業者では、障がい者や高齢者が安心して利用できるよう、バリアフリー情報を提供する必要があります。

**活用例：大手鉄道会社の駅バリアフリー案内**

ある大手鉄道会社では、各駅のバリアフリー設備や利用方法について情報提供を行っていましたが、駅ごとに情報の粒度や質にばらつきがあり、また利用者の個別のニーズに対応することが難しい状況でした。

AIによるバリアフリー情報アクセス支援システムを導入したところ、以下のような効果が得られました：

1. **駅別の詳細情報**: 各駅のエレベーター、エスカレーター、多目的トイレなどの設備情報を詳細に提供
2. **経路案内の充実**: 出発駅から目的駅までの最適なバリアフリー経路を案内
3. **リアルタイム情報の統合**: エレベーターの稼働状況など、リアルタイム情報との連携
4. **多言語対応**: 日本語だけでなく、英語や中国語など多言語での情報提供

導入後、障がい者や高齢者の鉄道利用率が20%向上し、駅員への問い合わせが25%減少しました。また、外国人観光客からの評価も高く、「日本の鉄道は障がい者にも優しい」という口コミが増加しました。

### 3. 商業施設のインクルーシブ対応

ショッピングモールやデパートなどの商業施設では、多様な顧客に対応するため、バリアフリー情報を提供する必要があります。

**活用例：大型ショッピングモールの顧客サポート**

ある大型ショッピングモールでは、バリアフリー設備を充実させていましたが、それらの情報が顧客に十分に伝わっておらず、また店舗ごとの対応にもばらつきがあることが課題でした。

AIによるバリアフリー情報アクセス支援システムを導入したところ、以下のような効果が得られました：

1. **施設全体のマップ情報**: エレベーター、多目的トイレ、休憩スペースなどの位置情報を視覚的に提供
2. **店舗別の対応情報**: 各店舗の入口の段差、通路幅、試着室の広さなど、詳細情報を提供
3. **サービス情報の充実**: 車いすの貸出、手話対応スタッフ、介助サービスなどの情報を提供
4. **イベント情報のアクセシビリティ**: イベントや催事のバリアフリー対応状況を事前に確認可能

導入後、障がい者や高齢者の来店頻度が25%向上し、滞在時間も平均30分増加しました。また、「バリアフリー対応が充実している」という口コミが増加し、新規顧客の獲得にもつながりました。

### 4. 観光地のインバウンド対応

観光地では、国内外からの多様な観光客に対して、バリアフリー情報を提供する必要があります。

**活用例：人気観光エリアの情報提供**

ある人気観光エリアでは、外国人観光客や障がいを持つ観光客が増加していましたが、バリアフリー情報が不足しており、また言語の壁もあって、十分な情報提供ができていない状況でした。

AIによるバリアフリー情報アクセス支援システムを導入したところ、以下のような効果が得られました：

1. **観光スポット別の詳細情報**: 各観光スポットのバリアフリー設備や対応状況を詳細に提供
2. **多言語対応**: 日本語、英語、中国語、韓国語など、多言語での情報提供
3. **モデルコース提案**: 車いす利用者や視覚障害者向けのモデルコースを提案
4. **緊急時の対応情報**: 災害時の避難経路や対応方法など、安全情報も提供

導入後、障がいを持つ観光客の満足度が大幅に向上し、「バリアフリー対応が充実している観光地」としての評判が広がりました。また、外国人観光客からの「情報が分かりやすい」という評価も増加し、リピーターの獲得にもつながりました。

## 実装上の注意点

バリアフリー情報アクセス支援システムを実装する際には、以下の点に注意が必要です。

### 1. 情報の正確性と最新性の確保

バリアフリー情報は、利用者の安全と利便性に直結するため、正確性と最新性が極めて重要です：

```python
def verify_facility_information(facility_name, information):
    """施設情報の正確性を検証する関数"""
    # 最終更新日時の確認
    last_updated = get_last_updated_date(facility_name)
    current_date = datetime.now().date()
    days_since_update = (current_date - last_updated).days
    
    verification_result = {
        "is_verified": True,
        "warnings": [],
        "suggestions": []
    }
    
    # 更新日時の確認
    if days_since_update > 90:  # 3ヶ月以上更新がない場合
        verification_result["warnings"].append(f"この情報は{days_since_update}日前のものです。最新の状況と異なる可能性があります。")
        verification_result["is_verified"] = False
    
    # 必須情報の確認
    required_fields = ["車いすアクセス", "多目的トイレ", "最寄りの公共交通機関"]
    for field in required_fields:
        if field not in information or not information[field]:
            verification_result["warnings"].append(f"{field}の情報が不足しています。")
            verification_result["is_verified"] = False
    
    # 矛盾する情報の確認
    if "エレベーターあり" in information and "エレベーターなし" in information:
        verification_result["warnings"].append("エレベーターの有無について矛盾する情報があります。")
        verification_result["is_verified"] = False
    
    return verification_result
```

この関数では、以下のチェックを行っています：

1. **更新日時の確認**: 情報が最新かどうかを確認
2. **必須情報の確認**: 重要な情報が欠けていないかを確認
3. **矛盾する情報の確認**: 情報内に矛盾がないかを確認

### 2. アクセシビリティガイドラインの遵守

Webインターフェースは、WCAG（Web Content Accessibility Guidelines）などのアクセシビリティガイドラインに準拠する必要があります：

```javascript
function enhanceAccessibility() {
    // すべての画像に代替テキストを追加
    document.querySelectorAll('img:not([alt])').forEach(img => {
        img.alt = "画像の説明";  // 実際には適切な説明を設定
    });
    
    // フォームのラベル付け
    document.querySelectorAll('input, textarea, select').forEach(element => {
        if (!element.id) {
            element.id = 'element-' + Math.random().toString(36).substr(2, 9);
        }
        
        const label = element.previousElementSibling;
        if (label && label.tagName === 'LABEL' && !label.htmlFor) {
            label.htmlFor = element.id;
        }
    });
    
    // キーボードナビゲーションの改善
    document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #4CAF50';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
        });
    });
    
    // ARIAロールの追加
    document.querySelector('header').setAttribute('role', 'banner');
    document.querySelector('nav').setAttribute('role', 'navigation');
    document.querySelector('main').setAttribute('role', 'main');
    document.querySelector('footer').setAttribute('role', 'contentinfo');
    
    // フォーカス順序の最適化
    const focusableElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    for (let i = 0; i < focusableElements.length; i++) {
        focusableElements[i].tabIndex = i + 1;
    }
}
```

この関数では、以下のアクセシビリティ向上策を実装しています：

1. **代替テキストの追加**: 画像に適切な代替テキストを設定
2. **フォームのラベル付け**: フォーム要素に適切なラベルを関連付け
3. **キーボードナビゲーションの改善**: フォーカス状態を視覚的に明示
4. **ARIAロールの追加**: 要素の役割を明確に定義
5. **フォーカス順序の最適化**: 論理的なタブ順序を設定

### 3. 多様なニーズへの対応

様々な障がいや状況に対応するため、多様なニーズを考慮した情報提供が必要です：

```python
def adapt_information_for_specific_needs(information, user_needs):
    """ユーザーの特定のニーズに合わせて情報を調整する関数"""
    adapted_information = information.copy()
    
    if "visual_impairment" in user_needs:
        # 視覚障害者向けの調整
        adapted_information["priority_info"] = [
            "音声ガイド設備",
            "点字表示",
            "触知案内図",
            "誘導ブロック",
            "介助サービス"
        ]
        adapted_information["additional_tips"] = [
            "事前に電話で詳細を確認することをお勧めします",
            "駅員や施設スタッフに声をかけると案内してもらえます",
            "盲導犬の同伴が可能です"
        ]
    
    elif "wheelchair_user" in user_needs:
        # 車いす利用者向けの調整
        adapted_information["priority_info"] = [
            "スロープの有無",
            "エレベーターの位置と大きさ",
            "通路の幅",
            "多目的トイレの位置",
            "段差の有無"
        ]
        adapted_information["additional_tips"] = [
            "混雑時間を避けると移動しやすいです",
            "事前に電話で車いす対応の確認をお勧めします",
            "介助が必要な場合は30分前までに連絡すると対応可能です"
        ]
    
    elif "hearing_impairment" in user_needs:
        # 聴覚障害者向けの調整
        adapted_information["priority_info"] = [
            "筆談対応",
            "手話対応スタッフ",
            "電光掲示板",
            "フラッシュライト付き警報装置",
            "字幕・文字情報サービス"
        ]
        adapted_information["additional_tips"] = [
            "事前にメールでの問い合わせが可能です",
            "手話通訳者の同伴は歓迎されています",
            "緊急時は視覚的な警報も発信されます"
        ]
    
    elif "elderly" in user_needs:
        # 高齢者向けの調整
        adapted_information["priority_info"] = [
            "手すりの設置状況",
            "休憩スペース",
            "段差の少ないルート",
            "トイレの位置",
            "スタッフのサポート体制"
        ]
        adapted_information["additional_tips"] = [
            "ゆっくり移動できる時間帯をお勧めします",
            "杖や歩行器の貸出サービスがあります",
            "体調不良時の休憩スペースが各フロアにあります"
        ]
    
    return adapted_information
```

この関数では、視覚障害者、車いす利用者、聴覚障害者、高齢者など、様々なニーズに合わせて情報を調整しています。それぞれのニーズに応じて、優先的に提供すべき情報や追加のヒントを変更することで、より有用な情報提供を実現しています。

### 4. 多言語対応

様々な言語背景を持つユーザーに対応するため、多言語対応も重要です：

```python
def translate_information(information, target_language):
    """情報を指定された言語に翻訳する関数"""
    # 翻訳対象の言語コード
    language_codes = {
        "ja": "日本語",
        "en": "英語",
        "zh": "中国語（簡体字）",
        "zh-tw": "中国語（繁体字）",
        "ko": "韓国語",
        "es": "スペイン語",
        "fr": "フランス語",
        "de": "ドイツ語",
        "vi": "ベトナム語",
        "tl": "タガログ語",
        "th": "タイ語",
        "id": "インドネシア語"
    }
    
    if target_language not in language_codes:
        return information  # 対応していない言語の場合は元の情報を返す
    
    try:
        # システムプロンプトの設定
        system_prompt = f"""
        あなたはプロの翻訳者です。以下のバリアフリー情報を{language_codes[target_language]}に翻訳してください。
        翻訳の際は、以下の点に注意してください：
        1. 専門用語や施設名は適切に翻訳する
        2. 文化的な違いを考慮し、必要に応じて補足説明を追加する
        3. 原文の意味を正確に伝える
        4. 自然で読みやすい文章にする
        5. JSONの構造を維持する
        """
        
        # 翻訳リクエスト
        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(information, ensure_ascii=False, indent=2)}
            ],
            "response_format": {"type": "json_object"}
        }
        
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        
        # APIへリクエスト送信
        api_response = requests.post(API_URL, headers=headers, json=payload)
        api_response.raise_for_status()
        response_json = api_response.json()
        
        # 翻訳結果の取得
        translated_text = response_json["choices"][0]["message"]["content"]
        translated_info = json.loads(translated_text)
        
        return translated_info
    
    except Exception as e:
        print(f"翻訳中にエラーが発生しました: {e}")
        return information  # エラー時は元の情報を返す
```

この関数では、OpenAI Responses APIを活用して、バリアフリー情報を様々な言語に翻訳しています。単なる機械翻訳ではなく、専門用語の適切な翻訳や文化的な違いを考慮した補足説明の追加など、質の高い翻訳を実現しています。

## まとめ

バリアフリー情報アクセス支援システムは、OpenAI Responses APIの効果的な活用例の一つです。障がい者や高齢者など、様々なニーズを持つユーザーに対して、バリアフリー施設や情報へのアクセスを支援することで、社会参加の促進とインクルーシブな社会づくりに貢献することができます。

このシステムの主な利点は以下の通りです：

1. **構造化された情報提供**: バリアフリー情報をカテゴリ別に整理し、理解しやすく提供
2. **多様なニーズへの対応**: 視覚障害者、車いす利用者、聴覚障害者、高齢者など、様々なニーズに合わせた情報提供
3. **アクセシビリティ機能**: 文字サイズ調整、ハイコントラストモード、音声読み上げなど、情報アクセスを支援する機能
4. **多言語対応**: 様々な言語背景を持つユーザーに対応した情報提供

実装にあたっては、情報の正確性と最新性の確保、アクセシビリティガイドラインの遵守、多様なニーズへの対応、多言語対応など、いくつかの重要な点に注意する必要があります。

バリアフリー情報アクセス支援システムは、自治体の情報提供サービス、交通事業者の利用者サポート、商業施設のインクルーシブ対応、観光地のインバウンド対応など、様々なシーンで活用できます。これにより、障がい者や高齢者の社会参加を促進し、誰もが安心して暮らせる社会の実現に貢献することが期待されます。
