---
title: 高度な図形の作成とカスタマイズ
---

前章までで、基本的なノードとエッジのスタイリング方法について学びました。この章では、より高度な図形の作成方法とカスタマイズについて詳しく解説します。Draw.ioではさまざまな専門的な図形が利用可能であり、それらを使いこなすことで、より表現力豊かなダイアグラムを作成することができます。

## 高度な図形の種類と用途

Draw.ioでは、基本的な長方形や楕円などの図形だけでなく、様々な特殊な図形が提供されています。これらの図形は、特定のドメインやダイアグラムタイプに適した形状をしており、視覚的な表現力を高めます。以下に、よく使われる高度な図形の種類を示します：

1. **UML関連図形**：クラス、インターフェース、パッケージなど
2. **ネットワーク図形**：サーバー、クラウド、ルーター、スイッチなど
3. **エンティティ図形**：人物、ユーザー、グループなど
4. **プロセス図形**：プロセス、決定、入出力など
5. **データストレージ図形**：データベース、ファイル、ストレージなど
6. **3D図形**：立方体、円柱、球など

## カスタム図形の実装方法

高度な図形を実装するには、適切なスタイル文字列を使用する必要があります。以下に、様々な高度な図形の実装方法を示します。

### 1. UML関連図形

UMLダイアグラムで使用される図形は、クラス図、シーケンス図、ユースケース図など、様々なUML図で重要な役割を果たします。以下に、主要なUML図形の実装方法を示します。

#### クラス図形

```python
def add_uml_class(client, diagram, class_name, attributes=None, methods=None, x=0, y=0, width=180, height=None, **style_props):
    """UMLクラス図形を追加する"""
    if attributes is None:
        attributes = []
    if methods is None:
        methods = []
    
    # テキストの構築
    text = f"<b>{class_name}</b>"
    
    if attributes:
        text += "<hr>"
        for attr in attributes:
            text += f"{attr}<br>"
    
    if methods:
        text += "<hr>"
        for method in methods:
            text += f"{method}<br>"
    
    # 高さの自動計算（属性とメソッドの数に基づいて）
    if height is None:
        line_count = 1 + len(attributes) + len(methods)
        # セパレータ行の分を追加
        if attributes:
            line_count += 1
        if methods:
            line_count += 1
        
        height = max(60, line_count * 20)  # 最低60px、1行あたり20px
    
    # 基本スタイル
    base_style = "shape=class;align=left;verticalAlign=top;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, text, x, y, width, height, style)
```

#### インターフェース図形

```python
def add_uml_interface(client, diagram, interface_name, methods=None, x=0, y=0, width=180, height=None, **style_props):
    """UMLインターフェース図形を追加する"""
    if methods is None:
        methods = []
    
    # テキストの構築
    text = f"<b>&lt;&lt;interface&gt;&gt;</b><br><b>{interface_name}</b>"
    
    if methods:
        text += "<hr>"
        for method in methods:
            text += f"{method}<br>"
    
    # 高さの自動計算
    if height is None:
        line_count = 2 + len(methods)  # インターフェース表記 + 名前 + メソッド
        if methods:
            line_count += 1  # セパレータ行
        
        height = max(60, line_count * 20)  # 最低60px、1行あたり20px
    
    # 基本スタイル
    base_style = "shape=class;align=left;verticalAlign=top;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, text, x, y, width, height, style)
```

#### パッケージ図形

```python
def add_uml_package(client, diagram, package_name, x=0, y=0, width=160, height=100, **style_props):
    """UMLパッケージ図形を追加する"""
    # 基本スタイル
    base_style = "shape=folder;align=center;verticalAlign=top;whiteSpace=wrap;html=1;tabWidth=60;tabHeight=20;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, package_name, x, y, width, height, style)
```

#### アクター図形

```python
def add_uml_actor(client, diagram, actor_name, x=0, y=0, width=40, height=80, **style_props):
    """UMLアクター図形を追加する"""
    # 基本スタイル
    base_style = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, actor_name, x, y, width, height, style)
```

### 2. ネットワーク図形

ネットワーク図は、コンピュータネットワークの構成やアーキテクチャを視覚化するのに役立ちます。以下に、ネットワーク図でよく使われる図形の実装方法を示します。

#### サーバー図形

```python
def add_server(client, diagram, label, x=0, y=0, width=60, height=90, **style_props):
    """サーバー図形を追加する"""
    # 基本スタイル
    base_style = "shape=mxgraph.rack.general.server_1;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### クラウド図形

```python
def add_cloud(client, diagram, label, x=0, y=0, width=120, height=80, **style_props):
    """クラウド図形を追加する"""
    # 基本スタイル
    base_style = "shape=cloud;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### ルーター/スイッチ図形

```python
def add_router(client, diagram, label, x=0, y=0, width=80, height=40, **style_props):
    """ルーター図形を追加する"""
    # 基本スタイル
    base_style = "shape=mxgraph.cisco.routers.router;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)

def add_switch(client, diagram, label, x=0, y=0, width=80, height=40, **style_props):
    """スイッチ図形を追加する"""
    # 基本スタイル
    base_style = "shape=mxgraph.cisco.switches.layer_3_switch;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### ファイアウォール図形

```python
def add_firewall(client, diagram, label, x=0, y=0, width=70, height=70, **style_props):
    """ファイアウォール図形を追加する"""
    # 基本スタイル
    base_style = "shape=mxgraph.cisco.security.firewall;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

しかしながら、これらのmxgraphベースの特殊図形は、直接APIでアクセスすると問題が生じる場合があります。そのため、より基本的な図形を組み合わせて表現することも重要です。以下に、基本図形を使ったネットワーク要素の表現方法を示します。

```python
def add_simplified_server(client, diagram, label, x=0, y=0, width=60, height=90, **style_props):
    """簡易化されたサーバー図形を追加する"""
    # 基本スタイル（長方形）
    base_style = "shape=rect;whiteSpace=wrap;html=1;verticalLabelPosition=bottom;verticalAlign=top;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)

def add_simplified_router(client, diagram, label, x=0, y=0, width=80, height=40, **style_props):
    """簡易化されたルーター図形を追加する"""
    # 基本スタイル（角丸長方形）
    base_style = "rounded=1;whiteSpace=wrap;html=1;verticalLabelPosition=bottom;verticalAlign=top;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 3. エンティティ図形

エンティティ図形は、人物やユーザーなどを表現するのに使用します。以下に、エンティティ図形の実装方法を示します。

#### 人物/ユーザー図形

```python
def add_person(client, diagram, label, x=0, y=0, width=40, height=80, **style_props):
    """人物図形を追加する"""
    # 基本スタイル
    base_style = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### ユーザーグループ図形

```python
def add_user_group(client, diagram, label, x=0, y=0, width=100, height=80, **style_props):
    """ユーザーグループ図形を追加する"""
    # 基本スタイル
    base_style = "shape=mxgraph.pid.users.cluster_of_users;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

これも同様に、mxgraphの特殊図形が使えない場合は、基本図形で代用できます：

```python
def add_simplified_user_group(client, diagram, label, x=0, y=0, width=100, height=80, **style_props):
    """簡易化されたユーザーグループ図形を追加する"""
    # 基本スタイル（雲形）
    base_style = "shape=cloud;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 4. プロセス図形

ビジネスプロセスや処理フローを表現するための図形です。

#### プロセス図形

```python
def add_process(client, diagram, label, x=0, y=0, width=120, height=60, **style_props):
    """プロセス図形を追加する"""
    # 基本スタイル
    base_style = "shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### 決定図形

```python
def add_decision(client, diagram, label, x=0, y=0, width=100, height=100, **style_props):
    """決定図形を追加する"""
    # 基本スタイル
    base_style = "rhombus;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### 入出力図形

```python
def add_io(client, diagram, label, x=0, y=0, width=120, height=60, **style_props):
    """入出力図形を追加する"""
    # 基本スタイル
    base_style = "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 5. データストレージ図形

データベースやファイルなどのデータストレージを表現するための図形です。

#### データベース図形

```python
def add_database(client, diagram, label, x=0, y=0, width=80, height=100, **style_props):
    """データベース図形を追加する"""
    # 基本スタイル
    base_style = "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### ファイル図形

```python
def add_file(client, diagram, label, x=0, y=0, width=80, height=100, **style_props):
    """ファイル図形を追加する"""
    # 基本スタイル
    base_style = "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### ドキュメント図形

```python
def add_document(client, diagram, label, x=0, y=0, width=80, height=100, **style_props):
    """ドキュメント図形を追加する"""
    # 基本スタイル
    base_style = "shape=document;whiteSpace=wrap;html=1;boundedLbl=1;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

### 6. 3D図形

3D効果を持つ図形も作成できます。

#### 立方体図形

```python
def add_cube(client, diagram, label, x=0, y=0, width=80, height=80, **style_props):
    """立方体図形を追加する"""
    # 基本スタイル
    base_style = "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;"
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

#### 円柱図形（改良版）

Draw.ioのデフォルトのシリンダー図形は、特定のビューでは少し平面的に見えることがあります。より3D効果の高い円柱を作成するための改良版を以下に示します：

```python
def add_enhanced_cylinder(client, diagram, label, x=0, y=0, width=80, height=100, **style_props):
    """強化された3D効果のある円柱図形を追加する"""
    # 基本スタイル（上部に楕円形の影を付けたシリンダー）
    base_style = "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;shadow=0;"
    
    # 上部の楕円部分の高さを調整（全体の15％程度）
    ellipse_height = int(height * 0.15)
    base_style += f"cylinderHead={ellipse_height};"
    
    style = modify_style(base_style, **style_props)
    
    return client.add_node(diagram, label, x, y, width, height, style)
```

## 複合図形の作成

複数の基本図形を組み合わせて、より複雑な図形を作成することもできます。ここでは、複数のノードを組み合わせて作成する複合図形のいくつかの例を示します。

### 1. サーバーラック

```python
def add_server_rack(client, diagram, title, server_count=3, x=0, y=0, rack_width=150, rack_height=250, **style_props):
    """サーバーラックを追加する（ラックと複数のサーバーユニットから成る）"""
    # ラックの背景を作成
    base_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    style = modify_style(base_style, **style_props)
    
    diagram = client.add_node(diagram, title, x, y, rack_width, rack_height, style)
    rack_id = diagram["cells"][-1]["id"]
    
    # サーバーユニットを追加
    server_height = (rack_height - 40) / server_count  # タイトル部分のスペースを除く
    
    server_ids = []
    for i in range(server_count):
        server_y = y + 30 + i * server_height  # タイトル部分の下から配置
        
        # サーバーユニットのスタイル
        server_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        
        # サーバーにはラックの親IDを設定
        diagram = client.add_node(
            diagram, f"Server {i+1}", x + 10, server_y, rack_width - 20, server_height - 10, server_style
        )
        server_id = diagram["cells"][-1]["id"]
        
        # 親子関係を設定
        diagram["cells"][-1]["parent"] = rack_id
        
        server_ids.append(server_id)
    
    return diagram, rack_id, server_ids
```

### 2. 多層アーキテクチャ図

```python
def add_layered_architecture(client, diagram, layers, x=0, y=0, width=600, height=500, **style_props):
    """多層アーキテクチャ図を作成する
    
    Args:
        layers: レイヤー情報のリスト。各レイヤーは {"name": "レイヤー名", "components": ["コンポーネント1", ...]} の形式
    """
    # 背景図形を作成
    base_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    style = modify_style(base_style, **style_props)
    
    diagram = client.add_node(diagram, "", x, y, width, height, style)
    background_id = diagram["cells"][-1]["id"]
    
    layer_count = len(layers)
    layer_height = height / layer_count
    
    layer_ids = []
    component_ids = []
    
    for i, layer in enumerate(layers):
        layer_y = y + i * layer_height
        
        # レイヤースタイル
        layer_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        
        # レイヤーノードを追加
        diagram = client.add_node(
            diagram, layer["name"], x + 10, layer_y + 10, width - 20, layer_height - 20, layer_style
        )
        layer_id = diagram["cells"][-1]["id"]
        layer_ids.append(layer_id)
        
        # 親子関係を設定
        diagram["cells"][-1]["parent"] = background_id
        
        # コンポーネントの追加
        components = layer.get("components", [])
        if components:
            comp_width = (width - 40) / len(components)
            
            for j, component in enumerate(components):
                comp_x = x + 20 + j * comp_width
                
                # コンポーネントスタイル
                comp_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
                
                # コンポーネントノードを追加
                diagram = client.add_node(
                    diagram, component, comp_x, layer_y + 40, comp_width - 10, layer_height - 80, comp_style
                )
                comp_id = diagram["cells"][-1]["id"]
                component_ids.append(comp_id)
                
                # 親子関係を設定（レイヤーの子として）
                diagram["cells"][-1]["parent"] = layer_id
    
    return diagram, background_id, layer_ids, component_ids
```

## 高度な図形のスタイルカスタマイズ

高度な図形のスタイルをさらにカスタマイズして、より視覚的に魅力的で情報量の多いダイアグラムを作成することができます。

### 1. グラデーションの適用

```python
def apply_gradient(style_str, gradient_color, direction="north"):
    """図形にグラデーションを適用する"""
    style_dict = parse_style_string(style_str)
    
    # 現在の塗りつぶし色をベース色として使用
    base_color = style_dict.get("fillColor", "#ffffff")
    
    style_dict["fillColor"] = base_color
    style_dict["gradientColor"] = gradient_color
    style_dict["gradientDirection"] = direction
    
    return build_style_string(style_dict)
```

### 2. 影の追加

```python
def add_shadow(style_str, shadow=True):
    """図形に影を追加する"""
    style_dict = parse_style_string(style_str)
    
    if shadow:
        style_dict["shadow"] = "1"
    else:
        if "shadow" in style_dict:
            del style_dict["shadow"]
    
    return build_style_string(style_dict)
```

### 3. ガラス効果の追加

```python
def add_glass_effect(style_str):
    """図形にガラス効果（光沢）を追加する"""
    style_dict = parse_style_string(style_str)
    style_dict["glass"] = "1"
    return build_style_string(style_dict)
```

### 4. スケッチ効果の追加

```python
def add_sketch_effect(style_str):
    """図形に手書き風のスケッチ効果を追加する"""
    style_dict = parse_style_string(style_str)
    style_dict["sketch"] = "1"
    return build_style_string(style_dict)
```

## 図形ライブラリの作成

高度な図形を簡単に再利用できるように、図形ライブラリを作成することができます。以下に、図形ライブラリの実装例を示します。

```python
class ShapeLibrary:
    """高度な図形を管理するライブラリ"""
    
    def __init__(self, client):
        self.client = client
        self.style_cache = {}
    
    def _create_style(self, base_style, **style_props):
        """スタイル文字列を作成する"""
        style_dict = parse_style_string(base_style)
        style_dict.update(style_props)
        return build_style_string(style_dict)
    
    # UML図形
    def add_class(self, diagram, class_name, attributes=None, methods=None, x=0, y=0, width=180, height=None, **style_props):
        """UMLクラス図形を追加する"""
        if attributes is None:
            attributes = []
        if methods is None:
            methods = []
        
        # テキストの構築
        text = f"<b>{class_name}</b>"
        
        if attributes:
            text += "<hr>"
            for attr in attributes:
                text += f"{attr}<br>"
        
        if methods:
            text += "<hr>"
            for method in methods:
                text += f"{method}<br>"
        
        # 高さの自動計算
        if height is None:
            line_count = 1 + len(attributes) + len(methods)
            if attributes:
                line_count += 1
            if methods:
                line_count += 1
            
            height = max(60, line_count * 20)
        
        # スタイルの作成
        base_style = "shape=class;align=left;verticalAlign=top;whiteSpace=wrap;html=1;"
        style = self._create_style(base_style, **style_props)
        
        # ノードの追加
        diagram = self.client.add_node(diagram, text, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    def add_interface(self, diagram, interface_name, methods=None, x=0, y=0, width=180, height=None, **style_props):
        """UMLインターフェース図形を追加する"""
        if methods is None:
            methods = []
        
        # テキストの構築
        text = f"<b>&lt;&lt;interface&gt;&gt;</b><br><b>{interface_name}</b>"
        
        if methods:
            text += "<hr>"
            for method in methods:
                text += f"{method}<br>"
        
        # 高さの自動計算
        if height is None:
            line_count = 2 + len(methods)
            if methods:
                line_count += 1
            
            height = max(60, line_count * 20)
        
        # スタイルの作成
        base_style = "shape=class;align=left;verticalAlign=top;whiteSpace=wrap;html=1;"
        style = self._create_style(base_style, **style_props)
        
        # ノードの追加
        diagram = self.client.add_node(diagram, text, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    def add_package(self, diagram, package_name, x=0, y=0, width=160, height=100, **style_props):
        """UMLパッケージ図形を追加する"""
        base_style = "shape=folder;align=center;verticalAlign=top;whiteSpace=wrap;html=1;tabWidth=60;tabHeight=20;"
        style = self._create_style(base_style, **style_props)
        
        diagram = self.client.add_node(diagram, package_name, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    # ネットワーク図形
    def add_server(self, diagram, label, x=0, y=0, width=60, height=90, **style_props):
        """サーバー図形を追加する"""
        base_style = "rounded=0;whiteSpace=wrap;html=1;verticalLabelPosition=bottom;verticalAlign=top;"
        style = self._create_style(base_style, **style_props)
        
        diagram = self.client.add_node(diagram, label, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    def add_cloud(self, diagram, label, x=0, y=0, width=120, height=80, **style_props):
        """クラウド図形を追加する"""
        base_style = "shape=cloud;whiteSpace=wrap;html=1;"
        style = self._create_style(base_style, **style_props)
        
        diagram = self.client.add_node(diagram, label, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    # データストレージ図形
    def add_database(self, diagram, label, x=0, y=0, width=80, height=100, **style_props):
        """データベース図形を追加する"""
        base_style = "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;"
        style = self._create_style(base_style, **style_props)
        
        diagram = self.client.add_node(diagram, label, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    def add_file(self, diagram, label, x=0, y=0, width=80, height=100, **style_props):
        """ファイル図形を追加する"""
        base_style = "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;"
        style = self._create_style(base_style, **style_props)
        
        diagram = self.client.add_node(diagram, label, x, y, width, height, style)
        return diagram, diagram["cells"][-1]["id"]
    
    # 複合図形
    def add_server_rack(self, diagram, title, server_count=3, x=0, y=0, rack_width=150, rack_height=250, **style_props):
        """サーバーラックを追加する"""
        # ラックの背景を作成
        base_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
        style = self._create_style(base_style, **style_props)
        
        diagram = self.client.add_node(diagram, title, x, y, rack_width, rack_height, style)
        rack_id = diagram["cells"][-1]["id"]
        
        # サーバーユニットを追加
        server_height = (rack_height - 40) / server_count
        
        server_ids = []
        for i in range(server_count):
            server_y = y + 30 + i * server_height
            
            # サーバーユニットのスタイル
            server_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
            
            # サーバーにはラックの親IDを設定
            diagram = self.client.add_node(
                diagram, f"Server {i+1}", x + 10, server_y, rack_width - 20, server_height - 10, server_style
            )
            server_id = diagram["cells"][-1]["id"]
            
            # 親子関係を設定
            diagram["cells"][-1]["parent"] = rack_id
            
            server_ids.append(server_id)
        
        return diagram, rack_id, server_ids
```

## Claude 3.7を活用した図形の生成

Claude 3.7を活用して、特定のダイアグラムタイプに必要な図形を自動的に提案したり、スタイル設定を生成することができます。以下に、Claude 3.7を使って図形のスタイル設定を生成する例を示します。

```python
import anthropic
import os
from dotenv import load_dotenv

def generate_shape_styles_with_claude(shape_type, theme=None):
    """Claude 3.7を使って図形のスタイル設定を生成する"""
    # APIキーの取得
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Anthropicクライアントの初期化
    client = anthropic.Anthropic(api_key=api_key)
    
    # プロンプトの構築
    prompt = f"""
    Draw.ioの図形スタイリングについて助言してください。以下の種類の図形に最適なスタイル設定を提案してください：
    
    図形の種類: {shape_type}
    """
    
    if theme:
        prompt += f"\n視覚的なテーマ: {theme}"
    
    prompt += """
    
    以下の項目を含めた詳細なスタイル設定を提案してください：
    
    1. 塗りつぶし色（16進数カラーコード）
    2. 枠線色（16進数カラーコード）
    3. 枠線の太さ
    4. その他の視覚効果（グラデーション、影など）
    5. テキストスタイル（フォントサイズ、色、配置など）
    
    また、このタイプの図形にお勧めのサイズ（幅と高さ）も教えてください。
    
    Draw.ioのスタイル文字列の完全な例も示してください。例：
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;"
    """
    
    # Claude 3.7に依頼
    response = client.messages.create(
        model="claude-3-7-sonnet-20240229",
        max_tokens=1000,
        temperature=0.2,
        system="あなたはビジュアルデザインとダイアグラム作成の専門家です。ユーザーが魅力的で効果的なダイアグラムを作成できるよう支援してください。",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.content[0].text

# 使用例
db_styles = generate_shape_styles_with_claude(
    "データベース図形",
    "モダンで平坦なデザイン"
)
print(db_styles)
```

## 実践例：システムアーキテクチャ図

これまでに学んだ高度な図形を使って、システムアーキテクチャ図を作成する例を見てみましょう。

```python
def create_system_architecture_diagram():
    """システムアーキテクチャ図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="システムアーキテクチャ")
    
    # 図形ライブラリを初期化
    shapes = ShapeLibrary(client)
    
    # クラウド（外部環境）
    diagram, cloud_id = shapes.add_cloud(
        diagram, "外部環境", 400, 50, 300, 100,
        fillColor="#f5f5f5", strokeColor="#666666"
    )
    
    # ユーザー
    diagram, user_id = shapes.add_server(
        diagram, "ユーザー", 250, 70, 40, 60,
        fillColor="#d5e8d4", strokeColor="#82b366"
    )
    
    # 外部API
    diagram, api_id = shapes.add_server(
        diagram, "外部API", 500, 70, 40, 60,
        fillColor="#d5e8d4", strokeColor="#82b366"
    )
    
    # ファイアウォール
    diagram, firewall_id = client.add_node(
        diagram, "ファイアウォール", 400, 200, 300, 30,
        "rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
    )
    
    # Webサーバー群
    diagram, rack_id, server_ids = shapes.add_server_rack(
        diagram, "Webサーバー", 3, 250, 280, 120, 240,
        fillColor="#dae8fc", strokeColor="#6c8ebf"
    )
    
    # アプリケーションサーバー群
    diagram, app_rack_id, app_server_ids = shapes.add_server_rack(
        diagram, "アプリケーションサーバー", 3, 450, 280, 120, 240,
        fillColor="#dae8fc", strokeColor="#6c8ebf"
    )
    
    # データベース
    diagram, db_id = shapes.add_database(
        diagram, "データベース", 400, 580, 80, 100,
        fillColor="#ffe6cc", strokeColor="#d79b00"
    )
    
    # 接続線の追加
    # ユーザー -> クラウド
    diagram = client.add_edge(
        diagram, user_id, cloud_id, "",
        "endArrow=classic;startArrow=classic;html=1;"
    )
    
    # 外部API -> クラウド
    diagram = client.add_edge(
        diagram, api_id, cloud_id, "",
        "endArrow=classic;startArrow=classic;html=1;"
    )
    
    # クラウド -> ファイアウォール
    diagram = client.add_edge(
        diagram, cloud_id, firewall_id, "",
        "endArrow=classic;startArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # ファイアウォール -> Webサーバー
    diagram = client.add_edge(
        diagram, firewall_id, rack_id, "",
        "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # ファイアウォール -> アプリケーションサーバー
    diagram = client.add_edge(
        diagram, firewall_id, app_rack_id, "",
        "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # Webサーバー -> アプリケーションサーバー
    diagram = client.add_edge(
        diagram, rack_id, app_rack_id, "",
        "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # アプリケーションサーバー -> データベース
    diagram = client.add_edge(
        diagram, app_rack_id, db_id, "",
        "endArrow=classic;startArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
    )
    
    return diagram
```

## 応用例：高度な表現力を持つシステム設計図

図形の高度なカスタマイズと複合図形を活用して、より表現力豊かなシステム設計図を作成する例を示します。

```python
def create_enhanced_system_design():
    """高度な表現力を持つシステム設計図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="拡張システム設計")
    
    # レイヤーを定義
    layers = [
        {
            "name": "プレゼンテーション層",
            "components": ["Web UI", "モバイルアプリ", "API Gateway"]
        },
        {
            "name": "ビジネスロジック層",
            "components": ["認証サービス", "ビジネスロジック", "通知サービス"]
        },
        {
            "name": "データアクセス層",
            "components": ["DAOサービス", "キャッシュサービス"]
        },
        {
            "name": "データストレージ層",
            "components": ["リレーショナルDB", "NoSQL DB", "ファイルストレージ"]
        }
    ]
    
    # 多層アーキテクチャを作成
    diagram, bg_id, layer_ids, component_ids = add_layered_architecture(
        client, diagram, layers, 100, 100, 600, 500,
        fillColor="#f9f9f9", strokeColor="#999999"
    )
    
    # 各コンポーネントのインデックスを管理
    component_index = 0
    
    # 各レイヤーのコンポーネント数をカウント
    component_counts = [len(layer["components"]) for layer in layers]
    
    # レイヤー間の接続を追加
    for i in range(len(layers) - 1):
        current_layer_components = component_counts[i]
        next_layer_components = component_counts[i + 1]
        
        for j in range(current_layer_components):
            current_comp_idx = component_index + j
            
            # 下位レイヤーの各コンポーネントに接続
            for k in range(next_layer_components):
                next_comp_idx = component_index + current_layer_components + k
                
                # 接続を作成
                if (j == 0 and k == 0) or (j == current_layer_components - 1 and k == next_layer_components - 1):
                    # 特定の接続だけ強調（例：最初と最後）
                    style = "endArrow=classic;html=1;strokeWidth=2;strokeColor=#FF0000;dashed=1;edgeStyle=orthogonalEdgeStyle;curved=1;"
                else:
                    # 通常の接続
                    style = "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;curved=1;"
                
                diagram = client.add_edge(
                    diagram, component_ids[current_comp_idx], component_ids[next_comp_idx], "", style
                )
        
        # 次のレイヤーのコンポーネントへインデックスを進める
        component_index += current_layer_components
    
    # 外部システムを追加
    diagram = client.add_node(
        diagram, "外部システム", 800, 150, 120, 80,
        "shape=cloud;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    external_id = diagram["cells"][-1]["id"]
    
    # 外部システムとの接続
    api_gateway_idx = 2  # API Gatewayのインデックス
    diagram = client.add_edge(
        diagram, component_ids[api_gateway_idx], external_id, "API呼び出し",
        "endArrow=classic;startArrow=classic;html=1;strokeWidth=2;strokeColor=#009900;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # データフローを示す矢印を追加
    diagram = client.add_node(
        diagram, "データフロー", 50, 350, 30, 200,
        "shape=singleArrow;whiteSpace=wrap;html=1;arrowWidth=0.4;arrowSize=0.4;fillColor=#d5e8d4;strokeColor=#82b366;rotation=90;"
    )
    
    # レジェンド（凡例）を追加
    diagram = client.add_node(
        diagram, "レジェンド", 800, 350, 150, 150,
        "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#ffffff;strokeColor=#000000;align=left;"
    )
    legend_id = diagram["cells"][-1]["id"]
    
    # レジェンドの内容
    diagram = client.add_node(
        diagram, "--- 通常フロー\n--- 重要フロー\n--- API接続", 800, 350, 150, 150,
        "whiteSpace=wrap;html=1;fillColor=none;strokeColor=none;align=left;"
    )
    diagram["cells"][-1]["parent"] = legend_id
    
    return diagram
```

## まとめ

この章では、Draw.ioを使った高度な図形の作成とカスタマイズについて学びました。主なポイントは以下の通りです：

1. UML関連図形（クラス、インターフェース、パッケージなど）の実装方法
2. ネットワーク図形（サーバー、クラウド、ルーターなど）の実装方法
3. エンティティ図形（人物、ユーザーグループなど）の実装方法
4. プロセス図形とデータストレージ図形の実装方法
5. 3D図形の作成とカスタマイズ
6. 複合図形の作成（サーバーラック、多層アーキテクチャなど）
7. 図形のスタイルカスタマイズ（グラデーション、影、ガラス効果など）
8. 再利用可能な図形ライブラリの作成
9. Claude 3.7を活用した図形スタイルの生成
10. 実践例としてのシステムアーキテクチャ図の作成

これらの知識とテクニックを活用することで、より表現力豊かで視覚的に魅力的なダイアグラムを作成することができます。高度な図形を適切に使用することで、複雑なシステムやプロセスをより分かりやすく視覚化することができます。

次の章では、データベース図形に特化した内容を掘り下げ、ER図やデータモデルの表現方法について学びます。

## 練習問題

1. UMLクラス図の作成：3つのクラスを持つ簡単な継承関係を表現するUMLクラス図を作成してみましょう。基底クラス、派生クラス、そして別の関連クラスを含めてください。

2. ネットワーク構成図の作成：クライアント、ファイアウォール、Webサーバー、データベースサーバーを含むシンプルなネットワーク構成図を作成してみましょう。適切な接続関係も設定してください。

3. カスタム図形の作成：基本図形を組み合わせて、マイクロサービスアーキテクチャの視覚的表現を作成してみましょう。各サービスを独自の色とアイコンで表現してください。

4. 図形ライブラリの拡張：ShapeLibraryクラスに「クラウドアーキテクチャ」用の新しい複合図形メソッドを追加してみましょう。この図形には、クラウドプロバイダー、仮想マシン、ロードバランサーなどの要素を含めてください。

5. Claude 3.7を活用して、「モバイルアプリケーションアーキテクチャ」に適した図形スタイルのセットを生成し、それを使って実際にモバイルアプリのアーキテクチャ図を作成してみましょう。