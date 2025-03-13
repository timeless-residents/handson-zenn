---
title: ノードのスタイリングと高度なカスタマイズ
---

前章では、基本的なフローチャートの作成方法について学びました。この章では、ノードのスタイリングに焦点を当て、より視覚的に魅力的で情報豊かなダイアグラムを作成するための高度なカスタマイズテクニックを紹介します。また、Claude 3.7を活用して効果的なノードデザインを生成する方法も解説します。

## ノードスタイリングの基本

ノードのスタイリングは、図表の可読性、理解しやすさ、そして美観に大きく影響します。Draw.ioのノードスタイリングは主に以下の要素から構成されています：

1. **形状**: 長方形、楕円、菱形、シリンダーなど
2. **サイズ**: 幅と高さ
3. **塗りつぶし**: 背景色、グラデーション、パターン
4. **枠線**: 色、太さ、スタイル（実線、点線など）
5. **テキスト**: フォント、サイズ、色、配置
6. **エフェクト**: 影、透明度、回転

これらの要素を適切に組み合わせることで、情報の種類や重要度を視覚的に表現できます。

## スタイル文字列の構造と操作

前章でも触れたように、Draw.ioではスタイルをセミコロン区切りの文字列として表現します。これをより効率的に扱うためのユーティリティ関数を作成しましょう。

```python
def parse_style_string(style_str):
    """スタイル文字列を辞書に変換する"""
    style_dict = {}
    if not style_str:
        return style_dict
    
    pairs = style_str.split(';')
    for pair in pairs:
        if pair and '=' in pair:
            key, value = pair.split('=', 1)
            style_dict[key] = value
    
    return style_dict

def build_style_string(style_dict):
    """辞書からスタイル文字列を構築する"""
    return ';'.join([f"{key}={value}" for key, value in style_dict.items()]) + ';'

def modify_style(style_str, **kwargs):
    """既存のスタイル文字列の特定のプロパティを変更する"""
    style_dict = parse_style_string(style_str)
    style_dict.update(kwargs)
    return build_style_string(style_dict)
```

これらのユーティリティ関数を使うと、既存のスタイルを簡単に変更できます：

```python
# 例: 塗りつぶし色と枠線色を変更
original_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
new_style = modify_style(original_style, fillColor="#f8cecc", strokeColor="#b85450")
```

## 豊富な形状バリエーション

Draw.ioではさまざまな形状が利用可能です。ここでは、代表的な形状とそのスタイル設定を紹介します。

### 1. 基本的な形状

```python
def add_rect_node(client, diagram, label, x, y, width=120, height=60, **style_props):
    """長方形ノードの追加"""
    base_style = "rounded=0;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_rounded_rect_node(client, diagram, label, x, y, width=120, height=60, **style_props):
    """角丸長方形ノードの追加"""
    base_style = "rounded=1;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_ellipse_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """楕円形ノードの追加"""
    base_style = "ellipse;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_diamond_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """菱形ノードの追加"""
    base_style = "rhombus;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 2. 特殊形状

```python
def add_cylinder_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """シリンダー形ノードの追加（データストア）"""
    base_style = "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_document_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """ドキュメント形ノードの追加"""
    base_style = "shape=document;whiteSpace=wrap;html=1;boundedLbl=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_process_node(client, diagram, label, x, y, width=120, height=60, **style_props):
    """プロセス形ノードの追加（二重線四角形）"""
    base_style = "shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_cloud_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """クラウド形ノードの追加"""
    base_style = "ellipse;shape=cloud;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 3. その他の形状

```python
def add_hexagon_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """六角形ノードの追加"""
    base_style = "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_actor_node(client, diagram, label, x, y, width=40, height=80, **style_props):
    """人形ノードの追加（アクター）"""
    base_style = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_note_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """ノート形ノードの追加"""
    base_style = "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)

def add_callout_node(client, diagram, label, x, y, width=120, height=80, **style_props):
    """吹き出し形ノードの追加"""
    base_style = "shape=callout;whiteSpace=wrap;html=1;perimeter=calloutPerimeter;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)
```

## カラースキームとビジュアルテーマ

効果的なダイアグラムには、一貫性のあるカラースキームが欠かせません。以下に、よく使われるカラースキームとその実装方法を紹介します。

### 1. 標準的なカラースキームの定義

```python
# 標準カラーパレット
COLOR_SCHEME = {
    # 基本色
    "primary": {"fill": "#dae8fc", "stroke": "#6c8ebf"},
    "success": {"fill": "#d5e8d4", "stroke": "#82b366"},
    "warning": {"fill": "#fff2cc", "stroke": "#d6b656"},
    "danger": {"fill": "#f8cecc", "stroke": "#b85450"},
    "info": {"fill": "#e1d5e7", "stroke": "#9673a6"},
    "neutral": {"fill": "#f5f5f5", "stroke": "#666666"},
    
    # 特殊色（形状別）
    "start_end": {"fill": "#d5e8d4", "stroke": "#82b366"},
    "process": {"fill": "#dae8fc", "stroke": "#6c8ebf"},
    "decision": {"fill": "#fff2cc", "stroke": "#d6b656"},
    "data": {"fill": "#f5f5f5", "stroke": "#666666"},
    "database": {"fill": "#d0cee2", "stroke": "#7a7a7a"}
}

def apply_color_scheme(style_str, color_key):
    """カラースキームを適用する"""
    if color_key not in COLOR_SCHEME:
        return style_str
    
    color_dict = COLOR_SCHEME[color_key]
    return modify_style(
        style_str, 
        fillColor=color_dict["fill"], 
        strokeColor=color_dict["stroke"]
    )
```

### 2. カスタムカラースキームの作成

特定のプロジェクトやブランドに合わせたカスタムカラースキームを作成することもできます：

```python
def create_custom_color_scheme(primary_color, secondary_color, accent_color):
    """カスタムカラースキームを作成する"""
    # 16進数カラーコードからRGB形式に変換する関数
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    # RGB形式を16進数カラーコードに変換する関数
    def rgb_to_hex(rgb):
        return '#{:02x}{:02x}{:02x}'.format(
            max(0, min(255, rgb[0])),
            max(0, min(255, rgb[1])),
            max(0, min(255, rgb[2]))
        )
    
    # 色を明るく/暗くする関数
    def adjust_color(hex_color, factor):
        rgb = hex_to_rgb(hex_color)
        new_rgb = tuple(int(c * factor) for c in rgb)
        return rgb_to_hex(new_rgb)
    
    # カスタムカラースキームの作成
    scheme = {
        "primary": {
            "fill": primary_color,
            "stroke": adjust_color(primary_color, 0.7)  # 30%暗く
        },
        "secondary": {
            "fill": secondary_color,
            "stroke": adjust_color(secondary_color, 0.7)
        },
        "accent": {
            "fill": accent_color,
            "stroke": adjust_color(accent_color, 0.7)
        },
        "light_primary": {
            "fill": adjust_color(primary_color, 1.3),  # 30%明るく
            "stroke": primary_color
        },
        "light_secondary": {
            "fill": adjust_color(secondary_color, 1.3),
            "stroke": secondary_color
        }
    }
    
    return scheme
```

### 3. ノードタイプに基づく自動スタイル適用

ノードの種類に基づいて自動的にスタイルを適用する関数を作成すると便利です：

```python
def add_typed_node(client, diagram, node_type, label, x, y, width=None, height=None, **style_props):
    """ノードタイプに基づいてスタイルを自動適用する"""
    # デフォルトのサイズ設定
    if width is None or height is None:
        if node_type in ["start", "end"]:
            width = width or 120
            height = height or 40
        elif node_type == "decision":
            width = width or 120
            height = height or 80
        elif node_type == "database":
            width = width or 120
            height = height or 60
        else:
            width = width or 120
            height = height or 60
    
    # ノードタイプに基づくベーススタイル
    base_style = ""
    color_key = ""
    
    if node_type in ["start", "end"]:
        base_style = "ellipse;whiteSpace=wrap;html=1;"
        color_key = "start_end"
    elif node_type == "process":
        base_style = "rounded=1;whiteSpace=wrap;html=1;"
        color_key = "process"
    elif node_type == "decision":
        base_style = "rhombus;whiteSpace=wrap;html=1;"
        color_key = "decision"
    elif node_type == "input" or node_type == "output":
        base_style = "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;"
        color_key = "primary"
    elif node_type == "database":
        base_style = "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;"
        color_key = "database"
    elif node_type == "document":
        base_style = "shape=document;whiteSpace=wrap;html=1;boundedLbl=1;"
        color_key = "neutral"
    elif node_type == "subroutine":
        base_style = "shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;"
        color_key = "primary"
    else:
        # デフォルトは処理ノード
        base_style = "rounded=0;whiteSpace=wrap;html=1;"
        color_key = "primary"
    
    # カラースキームを適用
    style = apply_color_scheme(base_style, color_key)
    
    # 追加のスタイルプロパティを適用
    if style_props:
        style = modify_style(style, **style_props)
    
    # ノードを追加
    return client.add_node(diagram, label, x, y, width, height, style)
```

## テキストのフォーマットとHTML

Draw.ioでは、ノード内のテキストをHTMLを使ってフォーマットすることができます。これを活用すると、テキストの一部を強調したり、複数行のテキストを配置したりできます。

### 1. 基本的なテキスト書式設定

```python
def format_node_text(text, bold=False, italic=False, underline=False, color=None, size=None):
    """ノードのテキストに書式を適用する"""
    formatted = text
    
    if bold:
        formatted = f"<b>{formatted}</b>"
    
    if italic:
        formatted = f"<i>{formatted}</i>"
    
    if underline:
        formatted = f"<u>{formatted}</u>"
    
    style_parts = []
    if color:
        style_parts.append(f"color:{color}")
    
    if size:
        style_parts.append(f"font-size:{size}px")
    
    if style_parts:
        style_attr = f" style=\"{';'.join(style_parts)}\""
        formatted = f"<font{style_attr}>{formatted}</font>"
    
    return formatted
```

### 2. 複数行テキストと改行

```python
def create_multiline_text(lines):
    """複数行テキストを作成する"""
    return "<br>".join(lines)

# 使用例
label = create_multiline_text([
    format_node_text("ユーザー登録", bold=True, color="#0000FF", size=14),
    format_node_text("入力フォーム", italic=True)
])
```

### 3. リストの作成

```python
def create_bullet_list(items):
    """箇条書きリストを作成する"""
    list_items = "".join([f"<li>{item}</li>" for item in items])
    return f"<ul>{list_items}</ul>"

def create_numbered_list(items):
    """番号付きリストを作成する"""
    list_items = "".join([f"<li>{item}</li>" for item in items])
    return f"<ol>{list_items}</ol>"
```

## アイコンとシンボル

Draw.ioでは、FontAwesomeなどのアイコンライブラリからアイコンを使用することができます。これにより、ノードの情報を視覚的に補強できます。

### 1. FontAwesomeアイコンの追加

```python
def add_icon_to_text(text, icon_name):
    """テキストにFontAwesomeアイコンを追加する"""
    return f"<i class=\"fa fa-{icon_name}\"></i> {text}"

# 使用例
label = add_icon_to_text("ユーザー登録", "user-plus")
```

ただし、この方法はDraw.ioのネイティブ環境でのみ正しく表示されるため、SVGエクスポートなどでは別のアプローチが必要になります。

### 2. 画像を含むノードの作成

SVG出力時にもアイコンを表示したい場合は、画像を埋め込む方法があります：

```python
def create_image_node(client, diagram, label, image_url, x, y, width=120, height=60, **style_props):
    """画像を含むノードを作成する"""
    base_style = "shape=image;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;verticalAlign=top;aspect=fixed;imageAspect=0;image=" + image_url + ";"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)
```

この関数は、オンラインの画像URLや、Base64エンコードされた画像データを使用できます。

## ノードのグループ化とコンテナ

複雑なダイアグラムでは、関連するノードをグループ化すると理解しやすくなります。Draw.ioでは、スイムレーンやグループなどのコンテナ要素を使用できます。

### 1. グループノードの作成

```python
def create_group_node(client, diagram, label, x, y, width, height, **style_props):
    """グループノードを作成する"""
    base_style = "swimlane;whiteSpace=wrap;html=1;startSize=23;"
    style = modify_style(base_style, **style_props)
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 2. 親子関係の設定

ノードをグループに追加するには、ノードの作成時に親ノードのIDを指定します：

```python
def add_node_to_group(client, diagram, group_id, label, x, y, width, height, style):
    """ノードをグループに追加する"""
    diagram = client.add_node(diagram, label, x, y, width, height, style)
    node_id = diagram["cells"][-1]["id"]
    
    # 親子関係を設定
    diagram["cells"][-1]["parent"] = group_id
    
    return diagram, node_id
```

### 3. 垂直/水平スイムレーンの作成

スイムレーンは、プロセスの担当者や部門などを表現するのに便利です：

```python
def create_vertical_swimlanes(client, diagram, titles, x, y, lane_width, total_height, **style_props):
    """垂直方向のスイムレーンを作成する"""
    swimlane_ids = []
    current_x = x
    
    base_style = "swimlane;html=1;whiteSpace=wrap;horizontal=0;startSize=60;"
    style = modify_style(base_style, **style_props)
    
    for title in titles:
        diagram = client.add_node(
            diagram, 
            title, 
            current_x, 
            y, 
            lane_width, 
            total_height, 
            style
        )
        swimlane_ids.append(diagram["cells"][-1]["id"])
        current_x += lane_width
    
    return diagram, swimlane_ids

def create_horizontal_swimlanes(client, diagram, titles, x, y, total_width, lane_height, **style_props):
    """水平方向のスイムレーンを作成する"""
    swimlane_ids = []
    current_y = y
    
    base_style = "swimlane;html=1;whiteSpace=wrap;startSize=60;"
    style = modify_style(base_style, **style_props)
    
    for title in titles:
        diagram = client.add_node(
            diagram, 
            title, 
            x, 
            current_y, 
            total_width, 
            lane_height, 
            style
        )
        swimlane_ids.append(diagram["cells"][-1]["id"])
        current_y += lane_height
    
    return diagram, swimlane_ids
```

## 高度なスタイルエフェクト

ノードをより魅力的に見せるためのエフェクトを適用する方法を見ていきましょう。

### 1. 影エフェクト

```python
def add_shadow_effect(style_str, shadow=True):
    """影エフェクトを追加または削除する"""
    return modify_style(style_str, shadow=1 if shadow else 0)
```

### 2. グラデーション

```python
def add_gradient_effect(style_str, gradient_color, direction=None):
    """グラデーションエフェクトを追加する"""
    style_dict = parse_style_string(style_str)
    style_dict["gradientColor"] = gradient_color
    
    if direction:
        style_dict["gradientDirection"] = direction
    
    return build_style_string(style_dict)
```

### 3. 不透明度

```python
def set_opacity(style_str, opacity):
    """不透明度を設定する (0-100)"""
    return modify_style(style_str, opacity=opacity)
```

### 4. グラスエフェクト（光沢効果）

```python
def add_glass_effect(style_str):
    """ガラス効果（光沢）を追加する"""
    return modify_style(style_str, glass=1)
```

## 実践例：スタイル付きの組織図

これまでに学んだノードスタイリング技術を活用して、組織図を作成してみましょう。

```python
def create_organization_chart():
    """スタイル付きの組織図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="組織図")
    
    # カスタムカラースキームの作成
    corporate_colors = create_custom_color_scheme("#4472C4", "#ED7D31", "#70AD47")
    
    # ベースのスタイルを定義
    exec_style = "rounded=1;whiteSpace=wrap;html=1;shadow=1;"
    exec_style = modify_style(exec_style, 
                              fillColor=corporate_colors["primary"]["fill"],
                              strokeColor=corporate_colors["primary"]["stroke"],
                              fontStyle=1)  # 太字
    
    director_style = "rounded=1;whiteSpace=wrap;html=1;shadow=1;"
    director_style = modify_style(director_style,
                                 fillColor=corporate_colors["secondary"]["fill"],
                                 strokeColor=corporate_colors["secondary"]["stroke"])
    
    manager_style = "rounded=1;whiteSpace=wrap;html=1;"
    manager_style = modify_style(manager_style,
                                fillColor=corporate_colors["light_secondary"]["fill"],
                                strokeColor=corporate_colors["light_secondary"]["stroke"])
    
    team_style = "rounded=1;whiteSpace=wrap;html=1;"
    team_style = modify_style(team_style,
                             fillColor=corporate_colors["light_primary"]["fill"], 
                             strokeColor=corporate_colors["light_primary"]["stroke"])
    
    # ノードの配置
    # 経営層
    diagram = client.add_node(
        diagram,
        format_node_text("代表取締役社長", bold=True, size=14),
        400, 50, 160, 60,
        exec_style
    )
    ceo_id = diagram["cells"][-1]["id"]
    
    # 取締役層
    positions = [
        ("取締役CTO", 200, 150),
        ("取締役CFO", 400, 150),
        ("取締役COO", 600, 150)
    ]
    
    director_ids = []
    for title, x, y in positions:
        diagram = client.add_node(
            diagram,
            format_node_text(title, bold=True),
            x, y, 140, 50,
            director_style
        )
        director_ids.append(diagram["cells"][-1]["id"])
    
    cto_id, cfo_id, coo_id = director_ids
    
    # 部門マネージャー層
    manager_positions = [
        ("開発部長", 100, 250, cto_id),
        ("インフラ部長", 300, 250, cto_id),
        ("財務部長", 400, 250, cfo_id),
        ("営業部長", 500, 250, coo_id),
        ("顧客サポート部長", 700, 250, coo_id)
    ]
    
    manager_ids = []
    for title, x, y, parent_id in manager_positions:
        diagram = client.add_node(
            diagram,
            title,
            x, y, 120, 40,
            manager_style
        )
        current_id = diagram["cells"][-1]["id"]
        manager_ids.append(current_id)
        
        # 上位との接続
        diagram = client.add_edge(
            diagram,
            parent_id,
            current_id,
            style="endArrow=blockThin;html=1;rounded=0;endFill=1;strokeWidth=2;strokeColor=" + corporate_colors["primary"]["stroke"] + ";"
        )
    
    dev_mgr_id, infra_mgr_id, finance_mgr_id, sales_mgr_id, support_mgr_id = manager_ids
    
    # チーム層
    team_positions = [
        ("フロントエンド\nチーム", 50, 350, dev_mgr_id),
        ("バックエンド\nチーム", 150, 350, dev_mgr_id),
        ("ネットワーク\nチーム", 250, 350, infra_mgr_id),
        ("クラウド\nチーム", 350, 350, infra_mgr_id),
        ("経理チーム", 400, 350, finance_mgr_id),
        ("国内営業\nチーム", 500, 350, sales_mgr_id),
        ("海外営業\nチーム", 600, 350, sales_mgr_id),
        ("カスタマー\nサポートチーム", 700, 350, support_mgr_id)
    ]
    
    for title, x, y, parent_id in team_positions:
        diagram = client.add_node(
            diagram,
            title,
            x, y, 100, 60,
            team_style
        )
        current_id = diagram["cells"][-1]["id"]
        
        # 上位との接続
        diagram = client.add_edge(
            diagram,
            parent_id,
            current_id,
            style="endArrow=blockThin;html=1;rounded=0;endFill=1;strokeColor=" + corporate_colors["secondary"]["stroke"] + ";"
        )
    
    # 社長と取締役の接続
    for director_id in director_ids:
        diagram = client.add_edge(
            diagram,
            ceo_id,
            director_id,
            style="endArrow=blockThin;html=1;rounded=0;endFill=1;strokeWidth=3;strokeColor=" + corporate_colors["primary"]["stroke"] + ";"
        )
    
    return diagram
```

## Claude 3.7を活用したノードスタイルの生成

複雑なノードスタイリングやカラースキームの選定には、Claude 3.7の支援が役立ちます。以下に、AIを活用してスタイリングを行う例を示します。

```python
import anthropic
import os
from dotenv import load_dotenv

def generate_node_styles_with_claude(diagram_type, color_theme=None):
    """Claude 3.7を使ってノードスタイルを生成する"""
    # APIキーの取得
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Anthropicクライアントの初期化
    client = anthropic.Anthropic(api_key=api_key)
    
    # プロンプトの構築
    prompt = f"""
    Draw.ioのノードスタイリングについて助言してください。以下の種類のダイアグラムに最適なノードスタイルを提案してください：
    
    ダイアグラムの種類: {diagram_type}
    """
    
    if color_theme:
        prompt += f"\nカラーテーマの要望: {color_theme}"
    
    prompt += """
    
    以下のノードタイプのそれぞれについて、最適なスタイル設定を提案してください：
    1. 開始/終了ノード
    2. 処理ノード
    3. 決定（分岐）ノード
    4. 入力/出力ノード
    5. データストアノード
    
    それぞれのノードタイプに対して、以下の情報を含めてください：
    - 推奨される形状
    - 塗りつぶし色（16進数カラーコード）
    - 枠線色（16進数カラーコード）
    - その他の推奨スタイル設定（例：角の丸み、影、フォントスタイルなど）
    - Draw.ioのスタイル文字列の完全な例
    
    また、全体的なカラースキームの提案と、このダイアグラムタイプに特化したスタイリングのベストプラクティスについても教えてください。
    """
    
    # Claude 3.7に依頼
    response = client.messages.create(
        model="claude-3-7-sonnet-20240229",
        max_tokens=1500,
        temperature=0.2,
        system="あなたはビジュアルデザインとダイアグラム作成の専門家です。ユーザーが魅力的で効果的なダイアグラムを作成できるよう支援してください。",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.content[0].text

# 使用例
styles_suggestion = generate_node_styles_with_claude(
    "プロセスフローダイアグラム", 
    "企業向けの落ち着いたブルートーンベース"
)
print(styles_suggestion)
```

この関数は、特定のダイアグラム種類とカラーテーマの要望に基づいて、Claude 3.7から最適なノードスタイルの提案を得ることができます。返された提案を元に、スタイル文字列を実際のコードに統合できます。

## シンプルなスタイルライブラリの作成

頻繁に使用するスタイルを再利用しやすくするために、簡単なスタイルライブラリを作成しましょう。

```python
class StyleLibrary:
    """Draw.ioのスタイルを管理するライブラリ"""
    
    def __init__(self):
        # 基本的なノードスタイルのプリセット
        self.node_presets = {
            "default": "rounded=0;whiteSpace=wrap;html=1;",
            "start_end": "ellipse;whiteSpace=wrap;html=1;",
            "process": "rounded=1;whiteSpace=wrap;html=1;",
            "decision": "rhombus;whiteSpace=wrap;html=1;",
            "input_output": "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;",
            "database": "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;",
            "document": "shape=document;whiteSpace=wrap;html=1;boundedLbl=1;",
            "note": "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;",
            "cloud": "ellipse;shape=cloud;whiteSpace=wrap;html=1;",
            "actor": "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;"
        }
        
        # カラースキーム
        self.color_schemes = {
            "default": {
                "primary": {"fill": "#dae8fc", "stroke": "#6c8ebf"},
                "success": {"fill": "#d5e8d4", "stroke": "#82b366"},
                "warning": {"fill": "#fff2cc", "stroke": "#d6b656"},
                "danger": {"fill": "#f8cecc", "stroke": "#b85450"},
                "info": {"fill": "#e1d5e7", "stroke": "#9673a6"},
                "neutral": {"fill": "#f5f5f5", "stroke": "#666666"}
            },
            "dark": {
                "primary": {"fill": "#2D5B8E", "stroke": "#1A365D"},
                "success": {"fill": "#2D6E3E", "stroke": "#1A452A"},
                "warning": {"fill": "#8E6C2D", "stroke": "#5D461A"},
                "danger": {"fill": "#8E2D2D", "stroke": "#5D1A1A"},
                "info": {"fill": "#5B2D8E", "stroke": "#3A1A5D"},
                "neutral": {"fill": "#3D3D3D", "stroke": "#1A1A1A"}
            },
            "pastel": {
                "primary": {"fill": "#B3CFF7", "stroke": "#7B9EC9"},
                "success": {"fill": "#B3F7CF", "stroke": "#7BC99E"},
                "warning": {"fill": "#F7E5B3", "stroke": "#C9B57B"},
                "danger": {"fill": "#F7B3B3", "stroke": "#C97B7B"},
                "info": {"fill": "#E5B3F7", "stroke": "#B57BC9"},
                "neutral": {"fill": "#E6E6E6", "stroke": "#ADADAD"}
            }
        }
        
        # テキストスタイルのプリセット
        self.text_presets = {
            "normal": "",
            "bold": "fontStyle=1;",
            "italic": "fontStyle=2;",
            "bold_italic": "fontStyle=3;",
            "small": "fontSize=10;",
            "large": "fontSize=14;",
            "xlarge": "fontSize=18;"
        }
        
        # エッジスタイルのプリセット
        self.edge_presets = {
            "default": "endArrow=classic;html=1;",
            "bidirectional": "endArrow=classic;startArrow=classic;html=1;",
            "dashed": "endArrow=classic;html=1;dashed=1;",
            "thick": "endArrow=classic;html=1;strokeWidth=2;",
            "orthogonal": "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;",
            "curved": "endArrow=classic;html=1;curved=1;",
            "entity_relation": "endArrow=ERmany;html=1;startArrow=ERone;startFill=0;"
        }
    
    def get_node_style(self, preset_name, color_scheme="default", color_key="primary", **extra_props):
        """指定されたプリセットとカラースキームでノードスタイルを取得する"""
        if preset_name not in self.node_presets:
            preset_name = "default"
        
        if color_scheme not in self.color_schemes:
            color_scheme = "default"
        
        if color_key not in self.color_schemes[color_scheme]:
            color_key = "primary"
        
        base_style = self.node_presets[preset_name]
        colors = self.color_schemes[color_scheme][color_key]
        
        style_dict = parse_style_string(base_style)
        style_dict.update({
            "fillColor": colors["fill"],
            "strokeColor": colors["stroke"]
        })
        
        # 追加のプロパティを適用
        style_dict.update(extra_props)
        
        return build_style_string(style_dict)
    
    def get_edge_style(self, preset_name, color_scheme="default", color_key="primary", **extra_props):
        """指定されたプリセットとカラースキームでエッジスタイルを取得する"""
        if preset_name not in self.edge_presets:
            preset_name = "default"
        
        if color_scheme not in self.color_schemes:
            color_scheme = "default"
        
        if color_key not in self.color_schemes[color_scheme]:
            color_key = "primary"
        
        base_style = self.edge_presets[preset_name]
        colors = self.color_schemes[color_scheme][color_key]
        
        style_dict = parse_style_string(base_style)
        style_dict.update({
            "strokeColor": colors["stroke"]
        })
        
        # 追加のプロパティを適用
        style_dict.update(extra_props)
        
        return build_style_string(style_dict)
    
    def add_custom_preset(self, category, name, style):
        """カスタムプリセットを追加する"""
        if category == "node":
            self.node_presets[name] = style
        elif category == "edge":
            self.edge_presets[name] = style
        elif category == "text":
            self.text_presets[name] = style
    
    def add_custom_color_scheme(self, name, scheme):
        """カスタムカラースキームを追加する"""
        self.color_schemes[name] = scheme
```

このスタイルライブラリを使用すると、一貫性のあるダイアグラムを簡単に作成できます：

```python
# スタイルライブラリの使用例
def create_styled_flowchart_with_library():
    """スタイルライブラリを使ったフローチャートの作成"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="スタイル付きフローチャート")
    
    # スタイルライブラリのインスタンス化
    style_lib = StyleLibrary()
    
    # スタイルの取得
    start_style = style_lib.get_node_style("start_end", color_key="success")
    process_style = style_lib.get_node_style("process", color_key="primary")
    decision_style = style_lib.get_node_style("decision", color_key="warning")
    output_style = style_lib.get_node_style("input_output", color_key="info")
    end_style = style_lib.get_node_style("start_end", color_key="success")
    
    # カスタムスタイルの追加
    style_lib.add_custom_preset("node", "important_process", 
                              "rounded=1;whiteSpace=wrap;html=1;fontStyle=1;shadow=1;")
    important_style = style_lib.get_node_style("important_process", color_key="primary")
    
    # ノードの追加
    # ... 以下省略 ...
```

## まとめ

この章では、Draw.ioにおけるノードのスタイリングと高度なカスタマイズ方法について詳しく解説しました。主なポイントは以下の通りです：

1. スタイル文字列の構造と操作方法
2. 様々な形状とその特性
3. カラースキームとビジュアルテーマの作成
4. HTMLを使ったテキストのフォーマッティング
5. アイコンとシンボルの活用
6. ノードのグループ化とコンテナの使用
7. 高度なスタイルエフェクトの適用
8. 組織図などの実践的な例
9. Claude 3.7を活用したスタイル生成
10. 再利用可能なスタイルライブラリの作成

これらの技術を活用することで、単に機能的なだけでなく、視覚的にも魅力的で情報を効果的に伝えるダイアグラムを作成することができます。

次の章では、エッジ（接続線）のスタイリングに焦点を当て、より複雑な関係を表現する方法を学びます。

## 練習問題

1. この章で紹介したStyleLibraryクラスを拡張して、「モノクロ」と「高コントラスト」のカラースキームを追加してみましょう。

2. 以下の情報を持つマインドマップ風のノードデザインを作成してみましょう：
   - 中央に「プロジェクト計画」という主要ノード
   - 周囲に「スコープ」「スケジュール」「予算」「リソース」「リスク」という5つのサブノード
   - 各サブノードから2-3個のより詳細な項目を示す小さなノード

3. HTMLフォーマットを活用して、以下の情報を一つのノード内に表示してみましょう：
   - タイトル（太字、大きめのフォント）
   - 担当者名（斜体）
   - 完了予定日（赤色テキスト）
   - 優先度を示す星アイコン（★★★）

4. Claude 3.7を活用して、あなた自身のブランドや好みに合わせたカスタムカラースキームを生成し、それをStyleLibraryに統合してみましょう。

5. スイムレーンを使用して、複数部門が関わるビジネスプロセスのダイアグラムを作成してみましょう。各部門は異なる色で識別できるようにしてください。