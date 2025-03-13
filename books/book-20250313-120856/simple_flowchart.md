---
title: シンプルなフローチャートの作成
---

前章までで、Draw.ioの基本概念とPythonを使ったAPIクライアントの基本構造について学びました。この章では、それらの知識を応用して、実際にシンプルなフローチャートを作成する方法を詳しく解説します。また、Claude 3.7の支援を受けて効率的にフローチャートを設計・実装する方法も紹介します。

## フローチャートの基本要素

フローチャート（流れ図）は、プロセスやアルゴリズムを視覚的に表現するための図表です。基本的なフローチャートには、以下の要素が含まれます：

1. **開始/終了**: プロセスの開始点と終了点を表す楕円形
2. **処理**: 具体的な操作や計算を表す長方形
3. **入力/出力**: データの入力や出力を表す平行四辺形
4. **条件分岐**: 条件に基づく分岐を表す菱形
5. **接続線**: 各要素間の流れを表す矢印

これらの要素を組み合わせることで、様々なプロセスやアルゴリズムを表現できます。

## シンプルなフローチャートの設計

まずは、シンプルなフローチャートの例として、ユーザー登録プロセスを表現するフローチャートを設計してみましょう。このプロセスは以下のような流れになります：

1. 開始
2. ユーザー情報の入力（名前、メールアドレス、パスワード）
3. 入力データの検証
4. 検証結果に基づく分岐：
   - 検証失敗：エラーメッセージを表示して再入力
   - 検証成功：ユーザー情報をデータベースに保存
5. 登録完了メッセージの表示
6. 終了

この処理フローを元に、フローチャートをPythonコードで実装していきます。

## フローチャート作成の基本的なアプローチ

フローチャートをプログラムで作成する場合、一般的に以下のようなアプローチを取ります：

1. 空のダイアグラムを作成
2. ノード（処理ステップ）を追加
3. ノード間の接続（矢印）を追加
4. 必要に応じてスタイルを調整
5. ダイアグラムをファイルに出力

このアプローチに沿って、ユーザー登録プロセスのフローチャートを実装しましょう。

## シンプルなフローチャートの実装

前回作成したAPIクライアントをベースに、ユーザー登録プロセスのフローチャートを作成するPythonコードを見ていきましょう。まず、完全なコードを示し、その後に詳細な説明を加えます。

```python
"""
シンプルなユーザー登録フローチャートの作成例
"""

import uuid
import json
import os
from drawio_api.client import DrawioAPIClient

def create_user_registration_flowchart():
    """ユーザー登録プロセスのフローチャートを作成する"""
    # クライアントインスタンスを作成
    client = DrawioAPIClient()
    
    # 新しいダイアグラムを作成
    diagram = client.create_diagram(title="ユーザー登録プロセス")
    
    # ノードの配置座標を計算するための基本値
    base_x = 300
    base_y = 50
    step_y = 100  # 縦方向の間隔
    
    # 1. 開始ノード（楕円形、緑色）
    diagram = client.add_node(
        diagram=diagram,
        label="開始",
        x=base_x,
        y=base_y,
        width=120,
        height=50,
        style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    start_id = diagram["cells"][-1]["id"]
    
    # 2. ユーザー情報入力ノード（平行四辺形、青色）
    diagram = client.add_node(
        diagram=diagram,
        label="ユーザー情報入力",
        x=base_x,
        y=base_y + step_y,
        width=160,
        height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    input_id = diagram["cells"][-1]["id"]
    
    # 3. データ検証ノード（処理、黄色）
    diagram = client.add_node(
        diagram=diagram,
        label="入力データの検証",
        x=base_x,
        y=base_y + step_y * 2,
        width=160,
        height=60,
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    validation_id = diagram["cells"][-1]["id"]
    
    # 4. 検証結果の分岐ノード（菱形、オレンジ色）
    diagram = client.add_node(
        diagram=diagram,
        label="検証成功？",
        x=base_x,
        y=base_y + step_y * 3,
        width=140,
        height=80,
        style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;"
    )
    decision_id = diagram["cells"][-1]["id"]
    
    # 5. エラーメッセージノード（平行四辺形、赤色）
    diagram = client.add_node(
        diagram=diagram,
        label="エラーメッセージ表示",
        x=base_x - 200,
        y=base_y + step_y * 4,
        width=160,
        height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
    )
    error_id = diagram["cells"][-1]["id"]
    
    # 6. データベース保存ノード（シリンダー、青色）
    diagram = client.add_node(
        diagram=diagram,
        label="ユーザー情報保存",
        x=base_x + 200,
        y=base_y + step_y * 4,
        width=160,
        height=60,
        style="shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    save_id = diagram["cells"][-1]["id"]
    
    # 7. 完了メッセージノード（平行四辺形、緑色）
    diagram = client.add_node(
        diagram=diagram,
        label="登録完了メッセージ",
        x=base_x + 200,
        y=base_y + step_y * 5,
        width=160,
        height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    complete_id = diagram["cells"][-1]["id"]
    
    # 8. 終了ノード（楕円形、緑色）
    diagram = client.add_node(
        diagram=diagram,
        label="終了",
        x=base_x,
        y=base_y + step_y * 6,
        width=120,
        height=50,
        style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    end_id = diagram["cells"][-1]["id"]
    
    # エッジの追加（接続線）
    # 開始 -> 入力
    diagram = client.add_edge(
        diagram=diagram,
        source_id=start_id,
        target_id=input_id,
        style="endArrow=classic;html=1;rounded=0;"
    )
    
    # 入力 -> 検証
    diagram = client.add_edge(
        diagram=diagram,
        source_id=input_id,
        target_id=validation_id,
        style="endArrow=classic;html=1;rounded=0;"
    )
    
    # 検証 -> 分岐
    diagram = client.add_edge(
        diagram=diagram,
        source_id=validation_id,
        target_id=decision_id,
        style="endArrow=classic;html=1;rounded=0;"
    )
    
    # 分岐（いいえ） -> エラーメッセージ
    diagram = client.add_edge(
        diagram=diagram,
        source_id=decision_id,
        target_id=error_id,
        label="いいえ",
        style="endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;fontColor=#FF0000;"
    )
    
    # 分岐（はい） -> データベース保存
    diagram = client.add_edge(
        diagram=diagram,
        source_id=decision_id,
        target_id=save_id,
        label="はい",
        style="endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;fontColor=#009900;"
    )
    
    # データベース保存 -> 完了メッセージ
    diagram = client.add_edge(
        diagram=diagram,
        source_id=save_id,
        target_id=complete_id,
        style="endArrow=classic;html=1;rounded=0;"
    )
    
    # エラーメッセージ -> 入力（戻る）
    diagram = client.add_edge(
        diagram=diagram,
        source_id=error_id,
        target_id=input_id,
        style="endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;curved=1;exitX=0.5;exitY=0;entryX=0;entryY=0.5;"
    )
    
    # 完了メッセージ -> 終了
    diagram = client.add_edge(
        diagram=diagram,
        source_id=complete_id,
        target_id=end_id,
        style="endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;entryX=1;entryY=0.5;"
    )
    
    return diagram

def main():
    """メイン関数"""
    # 出力ディレクトリの確認と作成
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # フローチャートの作成
    flowchart = create_user_registration_flowchart()
    
    # JSON形式で保存
    output_path = os.path.join(output_dir, "user_registration_flowchart.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(flowchart, f, indent=2, ensure_ascii=False)
    
    print(f"ユーザー登録フローチャートを作成し、{output_path}に保存しました。")

if __name__ == "__main__":
    main()
```

## コードの詳細説明

上記のコードでは、ユーザー登録プロセスをフローチャートとして表現しています。以下、主要な部分について詳しく説明します。

### 1. ノードの配置座標の計算方法

フローチャートでは、ノードの位置関係が重要です。このコードでは、以下のように座標を計算しています：

```python
base_x = 300  # X座標の基準点
base_y = 50   # Y座標の基準点
step_y = 100  # 縦方向の間隔
```

このように基準点と間隔を設定することで、ノードを等間隔に配置したり、特定のパターンで配置したりすることが容易になります。例えば、縦に連続するノードは`base_y + step_y * n`のように計算できます。

### 2. ノードの種類とスタイルの選択

フローチャートの各要素には、それぞれ適切な形状とスタイルがあります：

- **開始/終了**: 楕円形、緑色
```python
style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
```

- **入力/出力**: 平行四辺形、青色（エラーメッセージは赤色）
```python
style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
```

- **処理**: 長方形（角丸）、黄色
```python
style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
```

- **条件分岐**: 菱形、オレンジ色
```python
style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;"
```

- **データベース**: シリンダー形、青色
```python
style="shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
```

これらの色やスタイルは、フローチャートの標準的な慣習に基づいていますが、必要に応じてカスタマイズすることもできます。

### 3. エッジのスタイル設定

エッジ（接続線）のスタイル設定も、フローチャートの可読性に大きく影響します：

- **標準的な接続**: シンプルな矢印
```python
style="endArrow=classic;html=1;rounded=0;"
```

- **条件分岐からの接続**: ラベル付き、色付き
```python
# 「はい」の場合（緑色）
style="endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;fontColor=#009900;"

# 「いいえ」の場合（赤色）
style="endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;fontColor=#FF0000;"
```

- **戻りの流れ**: 曲線、直交ルーティング
```python
style="endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;curved=1;exitX=0.5;exitY=0;entryX=0;entryY=0.5;"
```

エッジのスタイルを適切に設定することで、処理の流れを視覚的に分かりやすく表現できます。

### 4. 各ノードのIDの管理

各ノードを追加した後、そのIDを変数に保存しておくことが重要です：

```python
diagram = client.add_node(...)
start_id = diagram["cells"][-1]["id"]
```

これにより、後でエッジを追加する際に、正確にノード間を接続することができます。

## フローチャートの出力と可視化

上記のコードを実行すると、JSONファイルとして保存されますが、このままでは視覚的に確認できません。次に、このJSONファイルを実際の図表として可視化する方法を紹介します。

まずは、SVGとして出力するための関数を追加しましょう。前の章で紹介した`generate_svg_from_diagram`関数を使用します：

```python
def main():
    # ...前述のコード...
    
    # JSON形式で保存
    output_path = os.path.join(output_dir, "user_registration_flowchart.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(flowchart, f, indent=2, ensure_ascii=False)
    
    # SVG形式で保存
    svg_output_path = os.path.join(output_dir, "user_registration_flowchart.svg")
    svg_content = client.export_to_svg(flowchart)
    with open(svg_output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    
    # HTMLビューワーを作成
    html_output_path = os.path.join(output_dir, "user_registration_flowchart.html")
    html_content = client.export_to_html(flowchart)
    with open(html_output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"ユーザー登録フローチャートを作成し、以下に保存しました：")
    print(f"- JSON: {output_path}")
    print(f"- SVG: {svg_output_path}")
    print(f"- HTML: {html_output_path}")
```

## Claude 3.7を活用したフローチャート設計

フローチャートの設計は、特に複雑なプロセスを扱う場合、考慮すべき点が多くなります。Claude 3.7のようなAIモデルを活用することで、設計プロセスを効率化できます。

以下に、Claude 3.7を使ってフローチャートの設計を支援する例を示します：

```python
import anthropic
import os
import json
from dotenv import load_dotenv

def design_flowchart_with_claude(process_description):
    """Claude 3.7を使ってフローチャートの設計を支援する"""
    # APIキーの取得
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Anthropicクライアントの初期化
    client = anthropic.Anthropic(api_key=api_key)
    
    # プロンプトの構築
    prompt = f"""
    以下のプロセス説明に基づいて、最適なフローチャートの設計を提案してください。
    各ノードの種類、ラベル、接続関係、配置などについて具体的に提案してください。
    
    プロセス説明：
    {process_description}
    
    以下の形式で回答してください：
    
    1. フローチャートの概要
    2. ノードリスト（種類、ラベル、スタイル、位置情報）
    3. 接続リスト（接続元、接続先、ラベル、スタイル）
    4. 特別な考慮事項やレイアウトの提案
    5. Pythonコードのサンプル（DrawioAPIClientを使用）
    """
    
    # Claude 3.7に分析を依頼
    response = client.messages.create(
        model="claude-3-7-sonnet-20240229",
        max_tokens=2500,
        temperature=0.2,
        system="あなたはフローチャート設計の専門家です。与えられたプロセス説明をわかりやすく視覚化するためのフローチャート設計を提案してください。",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.content[0].text

# 使用例
process_description = """
商品購入プロセス：
1. ユーザーが商品を閲覧
2. ユーザーが商品をカートに追加
3. ユーザーがカートの内容を確認
4. カートが空の場合、商品閲覧に戻る
5. ユーザーが配送先情報を入力
6. ユーザーが支払い方法を選択
7. 支払い方法によって分岐：
   a. クレジットカード：カード情報を入力し、有効性を確認
   b. PayPal：PayPalサイトに遷移して認証
   c. 銀行振込：振込情報を表示
8. 注文内容の最終確認
9. 注文の確定
10. 注文確認メールの送信
11. 注文完了画面の表示
"""

flowchart_design = design_flowchart_with_claude(process_description)
print(flowchart_design)
```

このコードを実行すると、Claude 3.7がプロセス説明を分析し、最適なフローチャートの設計を提案します。提案には、ノードの種類や配置、接続関係、そしてPythonコードのサンプルが含まれます。

Claude 3.7から返された設計提案を元に、実際のコードを実装することで、効率的にフローチャートを作成できます。

## フローチャートのレイアウト最適化

フローチャートの視認性を高めるためには、レイアウトの最適化が重要です。以下に、レイアウトを改善するためのいくつかのテクニックを紹介します。

### 1. グリッドに基づく配置

ノードをグリッドに沿って配置することで、整然としたレイアウトを実現できます：

```python
def calculate_grid_position(row, col, grid_width=200, grid_height=100, offset_x=100, offset_y=50):
    """グリッドベースの座標を計算する"""
    x = offset_x + col * grid_width
    y = offset_y + row * grid_height
    return x, y

# 使用例
row, col = 0, 1  # グリッド位置（行、列）
x, y = calculate_grid_position(row, col)
```

### 2. 自動レイヤリング

複雑なフローチャートでは、処理の階層に応じてノードを配置すると理解しやすくなります：

```python
def assign_layers(nodes, edges):
    """ノードに階層（レイヤー）を割り当てる"""
    # 開始ノードを特定
    start_nodes = [n for n in nodes if n.get("is_start", False)]
    
    # 各ノードの階層を初期化
    for node in nodes:
        node["layer"] = -1
    
    # 開始ノードを第0層に設定
    for node in start_nodes:
        node["layer"] = 0
    
    # 幅優先探索で各ノードの階層を決定
    changed = True
    while changed:
        changed = False
        for edge in edges:
            source = next((n for n in nodes if n["id"] == edge["source"]), None)
            target = next((n for n in nodes if n["id"] == edge["target"]), None)
            
            if source and target and source["layer"] >= 0:
                if target["layer"] < 0 or target["layer"] > source["layer"] + 1:
                    target["layer"] = source["layer"] + 1
                    changed = True
    
    return nodes
```

### 3. 交差を減らすエッジのルーティング

エッジ（接続線）の交差を減らすことで、フローチャートの可読性が向上します：

```python
def add_routed_edge(client, diagram, source_id, target_id, label="", avoid_nodes=None):
    """交差を避けるルーティングを考慮したエッジを追加する"""
    # ノードの情報を取得
    source_node = next((c for c in diagram["cells"] if c["id"] == source_id), None)
    target_node = next((c for c in diagram["cells"] if c["id"] == target_id), None)
    
    if not source_node or not target_node:
        return diagram
    
    # 直線ルーティングで交差が少ない場合
    if not avoid_nodes:
        style = "endArrow=classic;html=1;rounded=0;"
        if label:
            style += "fontColor=#000000;"
        return client.add_edge(diagram, source_id, target_id, label, style)
    
    # 交差を避けるためのポイントを計算
    sx, sy = source_node["geometry"]["x"], source_node["geometry"]["y"]
    tx, ty = target_node["geometry"]["x"], target_node["geometry"]["y"]
    
    # 直交ルーティングのスタイル
    style = "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    if label:
        style += "fontColor=#000000;"
    
    # エッジを追加
    diagram = client.add_edge(diagram, source_id, target_id, label, style)
    
    return diagram
```

## 実践的なフローチャート例：決済処理フロー

より実践的な例として、ECサイトの決済処理フローを表現するフローチャートを作成してみましょう。

```python
def create_payment_processing_flowchart():
    """ECサイトの決済処理フローのフローチャートを作成する"""
    # クライアントインスタンスを作成
    client = DrawioAPIClient()
    
    # 新しいダイアグラムを作成
    diagram = client.create_diagram(title="決済処理フロー")
    
    # グリッドベースの座標計算用の設定
    grid_width = 220
    grid_height = 100
    
    # ノードの追加
    # 1. カート確認（開始）
    x, y = calculate_grid_position(0, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="カート確認",
        x=x, y=y,
        width=140, height=50,
        style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    cart_id = diagram["cells"][-1]["id"]
    
    # 2. 配送先入力
    x, y = calculate_grid_position(1, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="配送先情報入力",
        x=x, y=y,
        width=160, height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    shipping_id = diagram["cells"][-1]["id"]
    
    # 3. 支払い方法選択
    x, y = calculate_grid_position(2, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="支払い方法選択",
        x=x, y=y,
        width=160, height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    payment_select_id = diagram["cells"][-1]["id"]
    
    # 4. 支払い方法による分岐
    x, y = calculate_grid_position(3, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="選択した\n支払い方法",
        x=x, y=y,
        width=140, height=80,
        style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;"
    )
    payment_decision_id = diagram["cells"][-1]["id"]
    
    # 5. クレジットカード情報入力
    x, y = calculate_grid_position(4, 0, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="クレジットカード\n情報入力",
        x=x, y=y,
        width=160, height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    credit_id = diagram["cells"][-1]["id"]
    
    # 6. PayPal認証
    x, y = calculate_grid_position(4, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="PayPal認証",
        x=x, y=y,
        width=160, height=60,
        style="shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    paypal_id = diagram["cells"][-1]["id"]
    
    # 7. 銀行振込情報表示
    x, y = calculate_grid_position(4, 2, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="銀行振込\n情報表示",
        x=x, y=y,
        width=160, height=60,
        style="shape=document;whiteSpace=wrap;html=1;boundedLbl=1;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;"
    )
    bank_id = diagram["cells"][-1]["id"]
    
    # 8. カード有効性確認
    x, y = calculate_grid_position(5, 0, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="カード有効性確認",
        x=x, y=y,
        width=160, height=60,
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    card_validation_id = diagram["cells"][-1]["id"]
    
    # 9. 有効性確認結果
    x, y = calculate_grid_position(6, 0, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="カード\n有効？",
        x=x, y=y,
        width=120, height=80,
        style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;"
    )
    card_decision_id = diagram["cells"][-1]["id"]
    
    # 10. エラーメッセージ
    x, y = calculate_grid_position(7, 0, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="エラーメッセージ\n表示",
        x=x-100, y=y,
        width=160, height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
    )
    error_id = diagram["cells"][-1]["id"]
    
    # 11. 注文内容確認
    x, y = calculate_grid_position(7, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="注文内容確認",
        x=x, y=y,
        width=160, height=60,
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    order_confirm_id = diagram["cells"][-1]["id"]
    
    # 12. 注文確定ボタン
    x, y = calculate_grid_position(8, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="注文確定",
        x=x, y=y,
        width=140, height=60,
        style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    order_submit_id = diagram["cells"][-1]["id"]
    
    # 13. 注文処理
    x, y = calculate_grid_position(9, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="注文処理",
        x=x, y=y,
        width=140, height=60,
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    order_process_id = diagram["cells"][-1]["id"]
    
    # 14. データベース保存
    x, y = calculate_grid_position(10, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="注文データ保存",
        x=x, y=y,
        width=160, height=60,
        style="shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    db_save_id = diagram["cells"][-1]["id"]
    
    # 15. 注文確認メール送信
    x, y = calculate_grid_position(11, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="注文確認メール送信",
        x=x, y=y,
        width=160, height=60,
        style="shape=document;whiteSpace=wrap;html=1;boundedLbl=1;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;"
    )
    email_id = diagram["cells"][-1]["id"]
    
    # 16. 注文完了（終了）
    x, y = calculate_grid_position(12, 1, grid_width, grid_height)
    diagram = client.add_node(
        diagram=diagram,
        label="注文完了",
        x=x, y=y,
        width=140, height=50,
        style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    complete_id = diagram["cells"][-1]["id"]
    
    # エッジの追加（接続線）
    # カート確認 -> 配送先入力
    diagram = client.add_edge(diagram, cart_id, shipping_id)
    
    # 配送先入力 -> 支払い方法選択
    diagram = client.add_edge(diagram, shipping_id, payment_select_id)
    
    # 支払い方法選択 -> 支払い方法分岐
    diagram = client.add_edge(diagram, payment_select_id, payment_decision_id)
    
    # 支払い方法分岐 -> クレジットカード
    diagram = client.add_edge(
        diagram, payment_decision_id, credit_id, 
        "クレジットカード", 
        "endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;entryX=0.5;entryY=0;fontColor=#000000;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 支払い方法分岐 -> PayPal
    diagram = client.add_edge(
        diagram, payment_decision_id, paypal_id, 
        "PayPal", 
        "endArrow=classic;html=1;rounded=0;exitX=0.5;exitY=1;fontColor=#000000;"
    )
    
    # 支払い方法分岐 -> 銀行振込
    diagram = client.add_edge(
        diagram, payment_decision_id, bank_id, 
        "銀行振込", 
        "endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;entryX=0.5;entryY=0;fontColor=#000000;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # クレジットカード情報入力 -> カード有効性確認
    diagram = client.add_edge(diagram, credit_id, card_validation_id)
    
    # カード有効性確認 -> 有効性確認結果
    diagram = client.add_edge(diagram, card_validation_id, card_decision_id)
    
    # 有効性確認結果 -> エラーメッセージ
    diagram = client.add_edge(
        diagram, card_decision_id, error_id, 
        "いいえ", 
        "endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;fontColor=#FF0000;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # エラーメッセージ -> クレジットカード情報入力（戻る）
    diagram = client.add_edge(
        diagram, error_id, credit_id, 
        "", 
        "endArrow=classic;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0;entryY=0.5;edgeStyle=orthogonalEdgeStyle;curved=1;"
    )
    
    # 有効性確認結果 -> 注文内容確認
    diagram = client.add_edge(
        diagram, card_decision_id, order_confirm_id, 
        "はい", 
        "endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;fontColor=#009900;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # PayPal認証 -> 注文内容確認
    diagram = client.add_edge(
        diagram, paypal_id, order_confirm_id,
        "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 銀行振込情報表示 -> 注文内容確認
    diagram = client.add_edge(
        diagram, bank_id, order_confirm_id,
        "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 注文内容確認 -> 注文確定
    diagram = client.add_edge(diagram, order_confirm_id, order_submit_id)
    
    # 注文確定 -> 注文処理
    diagram = client.add_edge(diagram, order_submit_id, order_process_id)
    
    # 注文処理 -> データベース保存
    diagram = client.add_edge(diagram, order_process_id, db_save_id)
    
    # データベース保存 -> 注文確認メール送信
    diagram = client.add_edge(diagram, db_save_id, email_id)
    
    # 注文確認メール送信 -> 注文完了
    diagram = client.add_edge(diagram, email_id, complete_id)
    
    return diagram
```

このコードでは、ECサイトの決済処理フローを詳細なフローチャートとして表現しています。グリッドベースの座標計算を使用して、ノードを整然と配置し、エッジのスタイルを適切に設定することで、処理の流れを視覚的に分かりやすく表現しています。

## まとめ

この章では、シンプルなフローチャートの作成方法について詳しく解説しました。主なポイントは以下の通りです：

1. フローチャートの基本要素と種類
2. 各種ノードのスタイル設定方法
3. エッジの接続とスタイル設定
4. ノードの配置とレイアウト最適化
5. グリッドベースの座標計算
6. 実践的なフローチャート例
7. Claude 3.7を活用したフローチャート設計

これらの知識とテクニックを活用することで、様々なプロセスやアルゴリズムを視覚的に表現するフローチャートを効率的に作成できるようになります。次の章では、ノードのスタイリングについてさらに詳しく掘り下げていきます。

## 練習問題

1. この章で作成したユーザー登録フローチャートに、「ユーザー情報確認」ステップを追加してみましょう。

2. ECサイトの商品検索プロセスをフローチャートで表現してみましょう。以下の要素を含めてください：
   - 検索キーワード入力
   - カテゴリ選択
   - 価格範囲指定
   - 検索実行
   - 結果表示
   - 結果がない場合の処理

3. グリッドベースの座標計算を改良して、フローチャートの分岐パスを美しく配置する関数を実装してみましょう。

4. Claude 3.7を使って、あなた自身が考えたプロセスのフローチャート設計を支援してもらい、その結果を元に実装してみましょう。

5. 既存のフローチャートをDraw.ioのネイティブ形式（.drawio）にエクスポートする機能を追加してみましょう。