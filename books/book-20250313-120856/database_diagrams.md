---
title: データベース図の作成とカスタマイズ
---

前章では、様々な高度な図形の作成とカスタマイズについて学びました。この章では、より専門的なデータベース図の作成方法について詳しく解説します。データベース設計は多くのソフトウェア開発プロジェクトにおいて重要な部分であり、ER図（Entity-Relationship Diagram）やデータモデル図を使って視覚化することで、データベース構造の理解と設計を容易にします。

## データベース図の種類と用途

データベース図には主に以下のような種類があります：

1. **ER図（Entity-Relationship Diagram）**：エンティティ（テーブル）間の関係を表現する図
2. **物理データモデル図**：実際のデータベーステーブル、列、データ型、制約などを表現する図
3. **論理データモデル図**：概念的なエンティティと関係を表現する図
4. **スキーマ図**：データベースのスキーマ構造を表現する図

これらの図は、データベース設計、ドキュメント作成、チーム内でのコミュニケーション、および開発プロセスでの参照として重要な役割を果たします。

## ER図の基本要素

ER図の主要な構成要素は以下の通りです：

1. **エンティティ（Entity）**：データベースのテーブルに相当し、通常は長方形で表現
2. **属性（Attribute）**：エンティティの列（フィールド）に相当
3. **関係（Relationship）**：エンティティ間の関連性を表すリンク
4. **カーディナリティ（Cardinality）**：関係の多重度（1対1、1対多、多対多など）

Draw.ioを使ったER図の作成には、これらの要素を適切に表現するためのテクニックが必要です。以下に、各要素を実装する方法を示します。

### 1. エンティティの表現

エンティティは通常、テーブル形式で表現されます。テーブル名を上部に配置し、その下に列名とデータ型を記述します。

```python
def add_entity(client, diagram, entity_name, attributes=None, x=0, y=0, width=180, height=None, **style_props):
    """ER図のエンティティ（テーブル）を追加する"""
    if attributes is None:
        attributes = []
    
    # テキストの構築
    text = f"<b>{entity_name}</b>"
    
    if attributes:
        text += "<hr>"
        for attr in attributes:
            # 主キーの場合は下線を引く
            if attr.endswith(" (PK)"):
                name = attr.replace(" (PK)", "")
                text += f"<u>{name}</u> (PK)<br>"
            # 外部キーの場合は斜体にする
            elif attr.endswith(" (FK)"):
                name = attr.replace(" (FK)", "")
                text += f"<i>{name}</i> (FK)<br>"
            else:
                text += f"{attr}<br>"
    
    # 高さの自動計算
    if height is None:
        line_count = 1 + len(attributes)
        if attributes:
            line_count += 1  # セパレータ行
        
        height = max(60, line_count * 20)  # 最低60px、1行あたり20px
    
    # 基本スタイル
    base_style = "shape=table;startSize=30;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;fillColor=#FFFFFF;strokeColor=#000000;swimlaneFillColor=#ffffff;"
    style = modify_style(base_style, **style_props)
    
    # エンティティを追加
    diagram = client.add_node(diagram, text, x, y, width, height, style)
    
    return diagram, diagram["cells"][-1]["id"]
```

また、列のデータ型や制約をより詳細に表示するために、属性の表示を拡張することもできます：

```python
def add_detailed_entity(client, diagram, entity_name, columns=None, x=0, y=0, width=240, **style_props):
    """データ型や制約を含む詳細なエンティティを追加する"""
    if columns is None:
        columns = []
    
    # ヘッダー行を作成
    text = f"<table border='1' cellspacing='0' cellpadding='3' style='width:100%;'><tr><th colspan='3'>{entity_name}</th></tr>"
    
    # 列ヘッダー
    text += "<tr><th>名前</th><th>型</th><th>制約</th></tr>"
    
    # 各列の情報を追加
    for col in columns:
        name = col.get("name", "")
        data_type = col.get("type", "")
        constraints = col.get("constraints", "")
        
        # 主キーや外部キーなどの特別な装飾
        if "PK" in constraints:
            name = f"<u><b>{name}</b></u>"
        elif "FK" in constraints:
            name = f"<i>{name}</i>"
        
        text += f"<tr><td>{name}</td><td>{data_type}</td><td>{constraints}</td></tr>"
    
    text += "</table>"
    
    # 行数に基づいて高さを計算
    height = 60 + len(columns) * 25  # ヘッダー60px + 各列25px
    
    # 基本スタイル
    base_style = "shape=internalStorage;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FFFFFF;strokeColor=#000000;"
    style = modify_style(base_style, **style_props)
    
    # エンティティを追加
    diagram = client.add_node(diagram, text, x, y, width, height, style)
    
    return diagram, diagram["cells"][-1]["id"]
```

### 2. 関係の表現

エンティティ間の関係は、通常、線や矢印で表現されます。関係の種類（1対1、1対多、多対多）を示すために、線の端に特殊なマーカーを追加します。

```python
def add_relationship(client, diagram, source_id, target_id, relationship_type, label="", **style_props):
    """エンティティ間の関係を追加する"""
    # 関係タイプに基づいてスタイルを設定
    if relationship_type == "one-to-one":
        # 1対1の関係
        edge_style = "endArrow=ERone;startArrow=ERone;html=1;entryX=0;entryY=0.5;endFill=0;startFill=0;"
    elif relationship_type == "one-to-many":
        # 1対多の関係
        edge_style = "endArrow=ERmany;startArrow=ERone;html=1;entryX=0;entryY=0.5;endFill=0;startFill=0;"
    elif relationship_type == "many-to-many":
        # 多対多の関係
        edge_style = "endArrow=ERmany;startArrow=ERmany;html=1;entryX=0;entryY=0.5;endFill=0;startFill=0;"
    else:
        # デフォルトは単純な矢印
        edge_style = "endArrow=classic;html=1;entryX=0;entryY=0.5;"
    
    # 追加のスタイル設定を適用
    style = modify_style(edge_style, **style_props)
    
    # 関係（エッジ）を追加
    diagram = client.add_edge(diagram, source_id, target_id, label, style)
    
    return diagram, diagram["cells"][-1]["id"]
```

### 3. カーディナリティの表現

関係性の多重度（カーディナリティ）を明確に示すために、さらに詳細なマーカーを使用することもできます：

```python
def add_cardinality_relationship(client, diagram, source_id, target_id, source_card, target_card, label="", **style_props):
    """カーディナリティを明示的に示す関係を追加する
    
    Args:
        source_card: ソース側のカーディナリティ（"1", "0..1", "0..n", "1..n", "n" など）
        target_card: ターゲット側のカーディナリティ
    """
    # 基本スタイル
    edge_style = "edgeStyle=orthogonalEdgeStyle;html=1;endArrow=none;startArrow=none;"
    
    # 追加のスタイル設定を適用
    style = modify_style(edge_style, **style_props)
    
    # 関係（エッジ）を追加
    diagram = client.add_edge(diagram, source_id, target_id, label, style)
    edge_id = diagram["cells"][-1]["id"]
    
    # ソース側のカーディナリティラベルを追加
    diagram = client.add_node(
        diagram, source_card, 0, 0, 20, 20,
        "resizable=0;html=1;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;"
    )
    
    # ラベルの位置調整
    source_label = diagram["cells"][-1]
    source_label["geometry"]["relative"] = True
    source_label["geometry"]["x"] = 0.1
    source_label["geometry"]["y"] = -10
    
    # エッジの子としてラベルを設定
    source_label["parent"] = edge_id
    
    # ターゲット側のカーディナリティラベルを追加
    diagram = client.add_node(
        diagram, target_card, 0, 0, 20, 20,
        "resizable=0;html=1;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;"
    )
    
    # ラベルの位置調整
    target_label = diagram["cells"][-1]
    target_label["geometry"]["relative"] = True
    target_label["geometry"]["x"] = 0.9
    target_label["geometry"]["y"] = -10
    
    # エッジの子としてラベルを設定
    target_label["parent"] = edge_id
    
    return diagram, edge_id
```

## データベース図のスタイリング

データベース図をより視覚的に魅力的でわかりやすくするために、様々なスタイリングテクニックを適用することができます。

### 1. エンティティの種類によるスタイル分け

エンティティの役割や種類によって、異なる色や形状を使い分けることで、視覚的な区別をつけることができます：

```python
def add_styled_entity(client, diagram, entity_name, entity_type, attributes=None, x=0, y=0, width=180, height=None):
    """エンティティの種類に基づいたスタイルを適用する"""
    # エンティティ種類ごとのスタイル設定
    type_styles = {
        "main": {
            "fillColor": "#dae8fc",
            "strokeColor": "#6c8ebf",
            "fontColor": "#000000"
        },
        "reference": {
            "fillColor": "#d5e8d4",
            "strokeColor": "#82b366",
            "fontColor": "#000000"
        },
        "junction": {
            "fillColor": "#fff2cc",
            "strokeColor": "#d6b656",
            "fontColor": "#000000"
        },
        "audit": {
            "fillColor": "#f8cecc",
            "strokeColor": "#b85450",
            "fontColor": "#000000"
        },
        "system": {
            "fillColor": "#e1d5e7",
            "strokeColor": "#9673a6",
            "fontColor": "#000000"
        }
    }
    
    # エンティティ種類のスタイルを取得
    style_props = type_styles.get(entity_type, type_styles["main"])
    
    # エンティティを追加
    return add_entity(client, diagram, entity_name, attributes, x, y, width, height, **style_props)
```

### 2. 関係性の視覚的強化

関係性の重要度や種類によって、線の太さや色を変えることができます：

```python
def add_styled_relationship(client, diagram, source_id, target_id, relationship_type, importance="normal", label=""):
    """関係性の重要度に基づいたスタイルを適用する"""
    # 重要度ごとのスタイル設定
    importance_styles = {
        "high": {
            "strokeWidth": "3",
            "strokeColor": "#b85450"
        },
        "normal": {
            "strokeWidth": "1",
            "strokeColor": "#000000"
        },
        "low": {
            "strokeWidth": "1",
            "strokeColor": "#999999",
            "dashed": "1"
        }
    }
    
    # 重要度のスタイルを取得
    style_props = importance_styles.get(importance, importance_styles["normal"])
    
    # 関係を追加
    return add_relationship(client, diagram, source_id, target_id, relationship_type, label, **style_props)
```

### 3. グループ化とクラスタリング

関連するエンティティをグループ化して、図をより構造化することができます：

```python
def create_entity_group(client, diagram, title, entities, x=0, y=0, padding=50, **style_props):
    """関連するエンティティをグループ化する"""
    # グループの境界を計算
    min_x = min(entity["x"] for entity in entities)
    min_y = min(entity["y"] for entity in entities)
    max_x = max(entity["x"] + entity["width"] for entity in entities)
    max_y = max(entity["y"] + entity["height"] for entity in entities)
    
    # パディングを追加
    min_x -= padding
    min_y -= padding
    max_x += padding
    max_y += padding
    
    # グループ（コンテナ）の幅と高さ
    width = max_x - min_x
    height = max_y - min_y
    
    # 基本スタイル
    base_style = "swimlane;whiteSpace=wrap;html=1;startSize=30;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;collapsible=0;"
    style = modify_style(base_style, **style_props)
    
    # グループを追加
    diagram = client.add_node(diagram, title, min_x, min_y, width, height, style)
    group_id = diagram["cells"][-1]["id"]
    
    # 各エンティティをグループの子として設定
    for entity in entities:
        entity_id = entity["id"]
        # エンティティの親をグループIDに設定
        for cell in diagram["cells"]:
            if cell["id"] == entity_id:
                cell["parent"] = group_id
                break
    
    return diagram, group_id
```

## 様々なデータベース図の作成

ここでは、様々なデータベース図の作成例を示します。

### 1. シンプルなER図

基本的なER図の作成例を示します：

```python
def create_simple_er_diagram():
    """シンプルなER図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="シンプルER図")
    
    # ユーザーエンティティ
    user_attrs = [
        "id INT (PK)",
        "username VARCHAR(50)",
        "email VARCHAR(100)",
        "created_at TIMESTAMP"
    ]
    diagram, user_id = add_entity(client, diagram, "User", user_attrs, 100, 100, 200, None,
                                  fillColor="#dae8fc", strokeColor="#6c8ebf")
    
    # 投稿エンティティ
    post_attrs = [
        "id INT (PK)",
        "user_id INT (FK)",
        "title VARCHAR(200)",
        "content TEXT",
        "published_at TIMESTAMP"
    ]
    diagram, post_id = add_entity(client, diagram, "Post", post_attrs, 400, 100, 200, None,
                                 fillColor="#d5e8d4", strokeColor="#82b366")
    
    # コメントエンティティ
    comment_attrs = [
        "id INT (PK)",
        "post_id INT (FK)",
        "user_id INT (FK)",
        "content TEXT",
        "created_at TIMESTAMP"
    ]
    diagram, comment_id = add_entity(client, diagram, "Comment", comment_attrs, 250, 300, 200, None,
                                    fillColor="#fff2cc", strokeColor="#d6b656")
    
    # 関係性の追加
    diagram, _ = add_relationship(client, diagram, user_id, post_id, "one-to-many", "creates")
    diagram, _ = add_relationship(client, diagram, post_id, comment_id, "one-to-many", "has")
    diagram, _ = add_relationship(client, diagram, user_id, comment_id, "one-to-many", "writes")
    
    return diagram
```

### 2. 詳細なデータモデル図

より詳細なデータ型や制約を含むデータモデル図の作成例：

```python
def create_detailed_data_model():
    """詳細なデータモデル図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="詳細データモデル")
    
    # 顧客テーブル
    customer_cols = [
        {"name": "customer_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "first_name", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "last_name", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "email", "type": "VARCHAR(100)", "constraints": "UNIQUE"},
        {"name": "phone", "type": "VARCHAR(20)", "constraints": ""},
        {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"}
    ]
    diagram, customer_id = add_detailed_entity(client, diagram, "Customer", customer_cols, 100, 100, 300,
                                              fillColor="#dae8fc", strokeColor="#6c8ebf")
    
    # 注文テーブル
    order_cols = [
        {"name": "order_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "customer_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "order_date", "type": "DATE", "constraints": "NOT NULL"},
        {"name": "status", "type": "VARCHAR(20)", "constraints": "DEFAULT 'pending'"},
        {"name": "total_amount", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"}
    ]
    diagram, order_id = add_detailed_entity(client, diagram, "Order", order_cols, 500, 100, 300,
                                           fillColor="#d5e8d4", strokeColor="#82b366")
    
    # 注文明細テーブル
    order_item_cols = [
        {"name": "item_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "order_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "product_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "quantity", "type": "INT", "constraints": "NOT NULL"},
        {"name": "unit_price", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"}
    ]
    diagram, order_item_id = add_detailed_entity(client, diagram, "OrderItem", order_item_cols, 300, 300, 300,
                                               fillColor="#fff2cc", strokeColor="#d6b656")
    
    # 製品テーブル
    product_cols = [
        {"name": "product_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "name", "type": "VARCHAR(100)", "constraints": "NOT NULL"},
        {"name": "description", "type": "TEXT", "constraints": ""},
        {"name": "price", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"},
        {"name": "stock", "type": "INT", "constraints": "DEFAULT 0"}
    ]
    diagram, product_id = add_detailed_entity(client, diagram, "Product", product_cols, 700, 300, 300,
                                             fillColor="#e1d5e7", strokeColor="#9673a6")
    
    # 関係性を追加
    diagram, _ = add_cardinality_relationship(client, diagram, customer_id, order_id, "1", "0..n", "places")
    diagram, _ = add_cardinality_relationship(client, diagram, order_id, order_item_id, "1", "1..n", "contains")
    diagram, _ = add_cardinality_relationship(client, diagram, product_id, order_item_id, "1", "0..n", "included in")
    
    return diagram
```

### 3. スキーマ関係図

データベーススキーマ間の関係を表現する図の作成例：

```python
def create_schema_diagram():
    """データベーススキーマ関係図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="スキーマ関係図")
    
    # スキーマを表現
    diagram, public_id = client.add_node(
        diagram, "public", 100, 100, 250, 250,
        "swimlane;whiteSpace=wrap;html=1;startSize=30;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    
    diagram, auth_id = client.add_node(
        diagram, "auth", 400, 100, 250, 250,
        "swimlane;whiteSpace=wrap;html=1;startSize=30;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    
    diagram, reporting_id = client.add_node(
        diagram, "reporting", 250, 400, 250, 250,
        "swimlane;whiteSpace=wrap;html=1;startSize=30;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    
    # 各スキーマ内にテーブルを追加
    # public スキーマのテーブル
    diagram, users_id = client.add_node(
        diagram, "users", 120, 150, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = public_id
    
    diagram, posts_id = client.add_node(
        diagram, "posts", 230, 150, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = public_id
    
    diagram, comments_id = client.add_node(
        diagram, "comments", 170, 250, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = public_id
    
    # auth スキーマのテーブル
    diagram, accounts_id = client.add_node(
        diagram, "accounts", 420, 150, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = auth_id
    
    diagram, sessions_id = client.add_node(
        diagram, "sessions", 530, 150, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = auth_id
    
    diagram, permissions_id = client.add_node(
        diagram, "permissions", 470, 250, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = auth_id
    
    # reporting スキーマのテーブル
    diagram, user_stats_id = client.add_node(
        diagram, "user_stats", 270, 450, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = reporting_id
    
    diagram, post_stats_id = client.add_node(
        diagram, "post_stats", 380, 450, 100, 50,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = reporting_id
    
    # スキーマ間の関係性を追加
    diagram, _ = client.add_edge(
        diagram, users_id, accounts_id, "関連",
        "endArrow=ERone;startArrow=ERone;html=1;edgeStyle=orthogonalEdgeStyle;curved=1;dashed=1;"
    )
    
    diagram, _ = client.add_edge(
        diagram, users_id, user_stats_id, "統計生成",
        "endArrow=ERmany;startArrow=ERone;html=1;edgeStyle=orthogonalEdgeStyle;curved=1;dashed=1;"
    )
    
    diagram, _ = client.add_edge(
        diagram, posts_id, post_stats_id, "統計生成",
        "endArrow=ERmany;startArrow=ERone;html=1;edgeStyle=orthogonalEdgeStyle;curved=1;dashed=1;"
    )
    
    return diagram
```

## データベース関連ユーティリティ

データベース図の作成をより効率的に行うためのユーティリティ関数を実装します。

### 1. データベーススキーマからER図を自動生成

既存のデータベーススキーマ情報からER図を自動生成する機能を実装します：

```python
def generate_er_from_schema(client, schema_data):
    """データベーススキーマ情報からER図を自動生成する
    
    Args:
        schema_data: {
            "tables": [
                {
                    "name": "テーブル名",
                    "columns": [
                        {"name": "列名", "type": "データ型", "constraints": "制約情報"}
                    ]
                }
            ],
            "relationships": [
                {
                    "source_table": "ソーステーブル名",
                    "target_table": "ターゲットテーブル名",
                    "type": "one-to-many",  # "one-to-one", "many-to-many"
                    "label": "関係ラベル"
                }
            ]
        }
    """
    # 新しいダイアグラムを作成
    diagram = client.create_diagram(title="自動生成ER図")
    
    # テーブル配置の計算用パラメータ
    table_width = 240
    table_padding = 50
    max_tables_per_row = 3
    
    # 各テーブルのID辞書
    table_ids = {}
    
    # テーブルの追加
    for i, table in enumerate(schema_data["tables"]):
        # テーブルの配置計算
        row = i // max_tables_per_row
        col = i % max_tables_per_row
        x = 100 + col * (table_width + table_padding)
        y = 100 + row * 300
        
        # テーブルの作成
        diagram, table_id = add_detailed_entity(
            client, diagram, table["name"], table["columns"], x, y, table_width
        )
        
        # IDを記録
        table_ids[table["name"]] = table_id
    
    # 関係の追加
    for rel in schema_data["relationships"]:
        source_id = table_ids.get(rel["source_table"])
        target_id = table_ids.get(rel["target_table"])
        
        if source_id and target_id:
            diagram, _ = add_relationship(
                client, diagram, source_id, target_id, rel["type"], rel["label"]
            )
    
    return diagram
```

### 2. SQL DDLからのデータベース図生成

SQL DDL（Data Definition Language）文からデータベース図を生成する機能も有用です：

```python
def parse_sql_ddl(ddl_string):
    """SQLのDDL文を解析してスキーマ情報を抽出する"""
    import re
    
    # 簡易的なスキーマ情報
    schema_data = {
        "tables": [],
        "relationships": []
    }
    
    # CREATE TABLE文を抽出
    table_pattern = r"CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);"
    table_matches = re.finditer(table_pattern, ddl_string, re.IGNORECASE)
    
    for match in table_matches:
        table_name = match.group(1)
        columns_str = match.group(2)
        
        # 列情報を抽出
        columns = []
        for line in columns_str.strip().split(",\n"):
            line = line.strip()
            if line.startswith("PRIMARY KEY") or line.startswith("FOREIGN KEY"):
                continue
                
            # 列名とデータ型を抽出
            col_match = re.match(r"(\w+)\s+([A-Za-z0-9()]+)(.*)$", line)
            if col_match:
                col_name = col_match.group(1)
                col_type = col_match.group(2)
                constraints = col_match.group(3).strip()
                
                columns.append({
                    "name": col_name,
                    "type": col_type,
                    "constraints": constraints
                })
        
        schema_data["tables"].append({
            "name": table_name,
            "columns": columns
        })
        
        # FOREIGN KEY制約を抽出
        fk_pattern = r"FOREIGN\s+KEY\s+\((\w+)\)\s+REFERENCES\s+(\w+)\s*\((\w+)\)"
        fk_matches = re.finditer(fk_pattern, columns_str, re.IGNORECASE)
        
        for fk_match in fk_matches:
            fk_column = fk_match.group(1)
            ref_table = fk_match.group(2)
            ref_column = fk_match.group(3)
            
            schema_data["relationships"].append({
                "source_table": table_name,
                "target_table": ref_table,
                "type": "one-to-many",  # デフォルトは1対多
                "label": f"{fk_column} -> {ref_column}"
            })
    
    return schema_data
```

### 3. データベース図の検証と分析

作成したデータベース図を検証し、潜在的な問題を特定するユーティリティも有用です：

```python
def analyze_er_diagram(schema_data):
    """ER図の潜在的な問題を分析する"""
    analysis = {
        "warnings": [],
        "suggestions": []
    }
    
    # テーブル名の命名規則チェック
    for table in schema_data["tables"]:
        if not table["name"].isalnum():
            analysis["warnings"].append(f"テーブル名 '{table['name']}' に特殊文字が含まれています。")
        if len(table["name"]) > 30:
            analysis["warnings"].append(f"テーブル名 '{table['name']}' は長すぎる可能性があります。")
    
    # 各テーブルに主キーがあるかチェック
    for table in schema_data["tables"]:
        has_pk = False
        for column in table["columns"]:
            if "PK" in column.get("constraints", ""):
                has_pk = True
                break
        
        if not has_pk:
            analysis["warnings"].append(f"テーブル '{table['name']}' に主キーが定義されていません。")
    
    # 多対多関係のチェック
    for rel in schema_data["relationships"]:
        if rel["type"] == "many-to-many":
            analysis["suggestions"].append(
                f"'{rel['source_table']}' と '{rel['target_table']}' の間の多対多関係は、"
                f"中間テーブルを使用して実装することをお勧めします。"
            )
    
    # 循環依存関係のチェック
    relationship_graph = {}
    for table in schema_data["tables"]:
        relationship_graph[table["name"]] = []
    
    for rel in schema_data["relationships"]:
        source = rel["source_table"]
        target = rel["target_table"]
        relationship_graph[source].append(target)
    
    # 簡易的なサイクル検出（完全ではない）
    for table in relationship_graph:
        if has_cycle(relationship_graph, table, set(), set()):
            analysis["warnings"].append(f"テーブル関係に循環依存関係が検出されました。テーブル '{table}' が関与しています。")
    
    return analysis

def has_cycle(graph, node, visited, recursion_stack):
    """グラフにサイクルがあるかDFSで検出する"""
    visited.add(node)
    recursion_stack.add(node)
    
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            if has_cycle(graph, neighbor, visited, recursion_stack):
                return True
        elif neighbor in recursion_stack:
            return True
    
    recursion_stack.remove(node)
    return False
```

## 実践例：オンラインショップのデータベース設計

ここでは、オンラインショップのデータベース設計をER図で表現する実践例を示します：

```python
def create_online_shop_database_diagram():
    """オンラインショップのデータベース設計図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="オンラインショップDB")
    
    # 各エンティティを配置
    # 1. 顧客テーブル
    customer_cols = [
        {"name": "customer_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "email", "type": "VARCHAR(100)", "constraints": "UNIQUE, NOT NULL"},
        {"name": "password_hash", "type": "VARCHAR(255)", "constraints": "NOT NULL"},
        {"name": "first_name", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "last_name", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "phone", "type": "VARCHAR(20)", "constraints": ""},
        {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"}
    ]
    diagram, customer_id = add_detailed_entity(client, diagram, "Customer", customer_cols, 100, 100, 300,
                                              fillColor="#dae8fc", strokeColor="#6c8ebf")
    
    # 2. 住所テーブル
    address_cols = [
        {"name": "address_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "customer_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "address_type", "type": "VARCHAR(20)", "constraints": "DEFAULT 'shipping'"},
        {"name": "street", "type": "VARCHAR(100)", "constraints": "NOT NULL"},
        {"name": "city", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "state", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "zip_code", "type": "VARCHAR(20)", "constraints": "NOT NULL"},
        {"name": "country", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "is_default", "type": "BOOLEAN", "constraints": "DEFAULT false"}
    ]
    diagram, address_id = add_detailed_entity(client, diagram, "Address", address_cols, 100, 350, 300,
                                             fillColor="#dae8fc", strokeColor="#6c8ebf")
    
    # 3. 製品カテゴリテーブル
    category_cols = [
        {"name": "category_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "name", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "description", "type": "TEXT", "constraints": ""},
        {"name": "parent_id", "type": "INT", "constraints": "FK NULL"}
    ]
    diagram, category_id = add_detailed_entity(client, diagram, "Category", category_cols, 500, 100, 300,
                                              fillColor="#d5e8d4", strokeColor="#82b366")
    
    # 4. 製品テーブル
    product_cols = [
        {"name": "product_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "name", "type": "VARCHAR(100)", "constraints": "NOT NULL"},
        {"name": "description", "type": "TEXT", "constraints": ""},
        {"name": "price", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"},
        {"name": "stock", "type": "INT", "constraints": "NOT NULL DEFAULT 0"},
        {"name": "image_url", "type": "VARCHAR(255)", "constraints": ""},
        {"name": "category_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"}
    ]
    diagram, product_id = add_detailed_entity(client, diagram, "Product", product_cols, 500, 350, 300,
                                             fillColor="#d5e8d4", strokeColor="#82b366")
    
    # 5. 注文テーブル
    order_cols = [
        {"name": "order_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "customer_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "order_date", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"},
        {"name": "status", "type": "VARCHAR(20)", "constraints": "DEFAULT 'pending'"},
        {"name": "shipping_address_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "billing_address_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "shipping_method", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "payment_method", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "total_amount", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"},
        {"name": "shipping_cost", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"}
    ]
    diagram, order_id = add_detailed_entity(client, diagram, "Order", order_cols, 900, 100, 300,
                                           fillColor="#fff2cc", strokeColor="#d6b656")
    
    # 6. 注文明細テーブル
    order_item_cols = [
        {"name": "item_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "order_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "product_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "quantity", "type": "INT", "constraints": "NOT NULL"},
        {"name": "unit_price", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"},
        {"name": "subtotal", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"}
    ]
    diagram, order_item_id = add_detailed_entity(client, diagram, "OrderItem", order_item_cols, 900, 350, 300,
                                                fillColor="#fff2cc", strokeColor="#d6b656")
    
    # 7. 支払いテーブル
    payment_cols = [
        {"name": "payment_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "order_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "amount", "type": "DECIMAL(10,2)", "constraints": "NOT NULL"},
        {"name": "payment_date", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"},
        {"name": "payment_method", "type": "VARCHAR(50)", "constraints": "NOT NULL"},
        {"name": "transaction_id", "type": "VARCHAR(100)", "constraints": ""},
        {"name": "status", "type": "VARCHAR(20)", "constraints": "DEFAULT 'pending'"}
    ]
    diagram, payment_id = add_detailed_entity(client, diagram, "Payment", payment_cols, 900, 550, 300,
                                             fillColor="#fff2cc", strokeColor="#d6b656")
    
    # 8. レビューテーブル
    review_cols = [
        {"name": "review_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "product_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "customer_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "rating", "type": "INT", "constraints": "NOT NULL"},
        {"name": "comment", "type": "TEXT", "constraints": ""},
        {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"}
    ]
    diagram, review_id = add_detailed_entity(client, diagram, "Review", review_cols, 500, 550, 300,
                                            fillColor="#e1d5e7", strokeColor="#9673a6")
    
    # 9. 買い物カゴテーブル
    cart_cols = [
        {"name": "cart_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "customer_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"},
        {"name": "updated_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"}
    ]
    diagram, cart_id = add_detailed_entity(client, diagram, "Cart", cart_cols, 100, 550, 300,
                                          fillColor="#e1d5e7", strokeColor="#9673a6")
    
    # 10. 買い物カゴアイテムテーブル
    cart_item_cols = [
        {"name": "item_id", "type": "INT", "constraints": "PK, AUTO"},
        {"name": "cart_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "product_id", "type": "INT", "constraints": "FK, NOT NULL"},
        {"name": "quantity", "type": "INT", "constraints": "NOT NULL"},
        {"name": "added_at", "type": "TIMESTAMP", "constraints": "DEFAULT NOW()"}
    ]
    diagram, cart_item_id = add_detailed_entity(client, diagram, "CartItem", cart_item_cols, 100, 700, 300,
                                               fillColor="#e1d5e7", strokeColor="#9673a6")
    
    # 関係性の追加
    # 顧客と住所
    diagram, _ = add_relationship(client, diagram, customer_id, address_id, "one-to-many", "has")
    
    # カテゴリと製品
    diagram, _ = add_relationship(client, diagram, category_id, product_id, "one-to-many", "categorizes")
    
    # カテゴリの自己参照
    diagram, _ = add_relationship(client, diagram, category_id, category_id, "one-to-many", "parent of")
    
    # 顧客と注文
    diagram, _ = add_relationship(client, diagram, customer_id, order_id, "one-to-many", "places")
    
    # 注文と注文明細
    diagram, _ = add_relationship(client, diagram, order_id, order_item_id, "one-to-many", "contains")
    
    # 製品と注文明細
    diagram, _ = add_relationship(client, diagram, product_id, order_item_id, "one-to-many", "ordered in")
    
    # 注文と支払い
    diagram, _ = add_relationship(client, diagram, order_id, payment_id, "one-to-many", "paid by")
    
    # 製品とレビュー
    diagram, _ = add_relationship(client, diagram, product_id, review_id, "one-to-many", "reviewed in")
    
    # 顧客とレビュー
    diagram, _ = add_relationship(client, diagram, customer_id, review_id, "one-to-many", "writes")
    
    # 顧客と買い物カゴ
    diagram, _ = add_relationship(client, diagram, customer_id, cart_id, "one-to-one", "has")
    
    # 買い物カゴと買い物カゴアイテム
    diagram, _ = add_relationship(client, diagram, cart_id, cart_item_id, "one-to-many", "contains")
    
    # 製品と買い物カゴアイテム
    diagram, _ = add_relationship(client, diagram, product_id, cart_item_id, "one-to-many", "added to")
    
    return diagram
```

## まとめ

この章では、Draw.ioを使ったデータベース図の作成とカスタマイズについて学びました。主なポイントは以下の通りです：

1. データベース図の種類（ER図、物理データモデル、論理データモデル、スキーマ図）とその用途
2. エンティティ、属性、関係、カーディナリティなどのER図の基本要素の表現方法
3. データベース図のスタイリング技術（エンティティの種類による色分け、関係性の視覚的強化など）
4. エンティティのグループ化とクラスタリング
5. シンプルなER図、詳細なデータモデル図、スキーマ関係図などの様々なデータベース図の作成方法
6. データベーススキーマからER図を自動生成するユーティリティ
7. SQL DDLからデータベース図を生成する機能
8. データベース図の検証と分析ツール
9. オンラインショップを例にした実践的なデータベース設計図の作成

これらの知識とテクニックを活用することで、データベース設計をより効果的に視覚化し、プロジェクトチーム内での共有や理解を促進することができます。適切なデータベース図は、システム開発の重要な基盤となり、データ構造に関する意思決定をサポートします。

次の章では、Draw.ioを使ったインタラクティブなダイアグラムの作成について学びます。ユーザーとの対話性を高めるための機能や、動的なビューワーの実装方法について詳しく解説します。

## 練習問題

1. シンプルなブログシステムのER図を作成してください。最低限、ユーザー、投稿、カテゴリ、コメントの各エンティティとその関係を含めてください。

2. 上で作成したER図に、タグ、いいね、メディア（画像/動画）の各エンティティを追加し、適切な関係を設定してください。

3. オンライン学習プラットフォームのデータモデルを設計し、ER図で表現してください。学生、講師、コース、レッスン、進捗状況、支払いなどのエンティティを含めてください。

4. 以下のSQL DDLを解析し、ER図を自動生成するためのスキーマデータを作成してください：
   ```sql
   CREATE TABLE departments (
     department_id INT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     location VARCHAR(100)
   );

   CREATE TABLE employees (
     employee_id INT PRIMARY KEY,
     first_name VARCHAR(50) NOT NULL,
     last_name VARCHAR(50) NOT NULL,
     email VARCHAR(100) UNIQUE,
     hire_date DATE NOT NULL,
     department_id INT,
     manager_id INT,
     salary DECIMAL(10,2),
     FOREIGN KEY (department_id) REFERENCES departments(department_id),
     FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
   );

   CREATE TABLE projects (
     project_id INT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     start_date DATE,
     end_date DATE,
     department_id INT,
     FOREIGN KEY (department_id) REFERENCES departments(department_id)
   );

   CREATE TABLE employee_projects (
     employee_id INT,
     project_id INT,
     role VARCHAR(50),
     join_date DATE,
     PRIMARY KEY (employee_id, project_id),
     FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
     FOREIGN KEY (project_id) REFERENCES projects(project_id)
   );
   ```

5. 病院管理システムのデータベース設計を行い、ER図を作成してください。患者、医師、予約、診断、処方箋、部門などのエンティティを含め、適切な関係とカーディナリティを設定してください。また、データベース図の各エンティティに適切なスタイリングを適用し、視覚的に区別しやすくしてください。