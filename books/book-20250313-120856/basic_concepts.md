---
title: Draw.ioの基本概念と内部構造
---

この章では、Draw.ioの基本的な概念と内部構造について詳しく解説します。効果的な図表を自動生成するためには、Draw.ioが内部でどのようにデータを表現しているかを理解することが重要です。

## Draw.ioとは何か

Draw.io（別名 diagrams.net）は、無料でオープンソースの図表作成ツールです。Web上で動作するバージョン、デスクトップアプリケーション、さらにはVSCodeやGoogle Drive、Microsoft Officeなどと統合されたバージョンもあります。

Draw.ioの主な特徴は以下の通りです：

- 直感的なドラッグ＆ドロップインターフェース
- 豊富なテンプレートと形状ライブラリ
- 複数の形式（XML、PNG、SVG、PDF、HTML）へのエクスポート機能
- オフラインでの使用も可能
- 複数ユーザーでの共同編集機能（一部の統合環境で）

Draw.ioはビジネスダイアグラム、フローチャート、ネットワーク図、UML図、組織図など、さまざまな種類の図表を作成するのに適しています。

## Draw.ioでの図表（ダイアグラム）の基本構造

Draw.ioのダイアグラムは、基本的に「セル」と呼ばれる要素の集合です。セルには主に2種類あります：

1. **頂点（Vertex）**: 図形や文字などの表示要素
2. **辺（Edge）**: 頂点間を接続する線や矢印

これらが組み合わさって複雑な図表を形成します。

### 基本的な用語

Draw.ioとそのAPIを扱う際に理解しておくべき基本的な用語を見ていきましょう：

- **ダイアグラム（Diagram）**: 図表全体を表すコンテナ
- **セル（Cell）**: ダイアグラム内の個々の要素（頂点または辺）
- **頂点（Vertex）**: ノード、形状、テキストボックスなどの視覚的要素
- **辺（Edge）**: 頂点間を結ぶ接続線や矢印
- **ジオメトリ（Geometry）**: セルの位置やサイズを定義するプロパティ
- **スタイル（Style）**: セルの視覚的な外観を定義するプロパティ
- **親子関係（Parent-Child）**: セル間の階層関係

## Draw.ioの内部データ形式

Draw.ioのネイティブファイル形式は`.drawio`ですが、これは特殊なXML構造を持っています。しかし、APIを通して操作する場合、多くはJSON形式でデータをやり取りします。

### JSON形式でのダイアグラム表現

JSONでダイアグラムを表現する基本的な構造は以下のようになります：

```json
{
  "title": "サンプルダイアグラム",
  "cells": [
    {
      "id": "node1",
      "value": "開始",
      "geometry": {
        "x": 100,
        "y": 50,
        "width": 120,
        "height": 40
      },
      "style": "ellipse;whiteSpace=wrap;html=1;",
      "vertex": true,
      "connectable": true
    },
    {
      "id": "node2",
      "value": "処理",
      "geometry": {
        "x": 100,
        "y": 150,
        "width": 120,
        "height": 60
      },
      "style": "rounded=1;whiteSpace=wrap;html=1;",
      "vertex": true,
      "connectable": true
    },
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2",
      "value": "",
      "style": "endArrow=classic;html=1;",
      "edge": true
    }
  ]
}
```

この例では、2つの頂点（「開始」と「処理」）と、それらを接続する1つの辺を持つシンプルなダイアグラムを表しています。

### 各フィールドの詳細説明

ダイアグラムのJSON表現における主要なフィールドについて詳しく見ていきましょう。

#### 1. ダイアグラムレベルのプロパティ

- **title**: ダイアグラムのタイトル
- **cells**: セル（頂点と辺）の配列

#### 2. 頂点（Vertex）のプロパティ

- **id**: 頂点の一意の識別子（UUID等）
- **value**: 頂点内に表示されるテキスト
- **geometry**: 位置とサイズ情報
  - **x**: X座標（頂点の中心位置）
  - **y**: Y座標（頂点の中心位置）
  - **width**: 幅
  - **height**: 高さ
- **style**: スタイル文字列（後述）
- **vertex**: 頂点であることを示すフラグ（常に`true`）
- **connectable**: 接続可能かどうかを示すフラグ
- **parent**: 親セルのID（グループ化されている場合）

#### 3. 辺（Edge）のプロパティ

- **id**: 辺の一意の識別子
- **source**: 接続元の頂点ID
- **target**: 接続先の頂点ID
- **value**: 辺に表示されるラベルテキスト
- **style**: スタイル文字列
- **edge**: 辺であることを示すフラグ（常に`true`）
- **parent**: 親セルのID（関連する場合）
- **points**: 辺の中間点の配列（複雑な経路の場合）

## スタイル文字列の理解

Draw.ioでセルの視覚的な外観を定義するのに重要な役割を果たすのが「スタイル文字列」です。これはセミコロン（`;`）で区切られたキーと値のペアのセットで、CSS風の構文を持っています。

### スタイル文字列の例

```
rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;
```

この例では、以下のスタイルプロパティが設定されています：

- `rounded=1`: 角の丸みを持たせる
- `whiteSpace=wrap`: テキストを折り返す
- `html=1`: HTML形式のテキストを許可する
- `fillColor=#dae8fc`: 背景色を水色に設定
- `strokeColor=#6c8ebf`: 枠線の色を青色に設定
- `fontSize=12`: フォントサイズを12ポイントに設定

### 主要なスタイルプロパティ

以下に、よく使用されるスタイルプロパティをカテゴリ別に示します。

#### 形状関連

- `shape`: 形状の種類（例: `cylinder`, `doubleEllipse`, `swimlane`）
- `rounded`: 角の丸み（0または1）
- `arcSize`: 角の丸みの程度（パーセンテージ）
- `perimeter`: 周囲の形状（例: `ellipsePerimeter`, `rectanglePerimeter`）

#### 色と塗りつぶし

- `fillColor`: 背景色（HEX形式）
- `strokeColor`: 枠線の色（HEX形式）
- `opacity`: 不透明度（0〜100）
- `gradientColor`: グラデーションの第二色
- `gradientDirection`: グラデーションの方向

#### 線のスタイル

- `strokeWidth`: 枠線の太さ
- `dashed`: 破線にするかどうか（0または1）
- `dashPattern`: 破線のパターン
- `shadow`: 影をつけるかどうか（0または1）

#### テキスト関連

- `fontFamily`: フォント名
- `fontSize`: フォントサイズ
- `fontColor`: テキストの色
- `fontStyle`: フォントスタイル（0: 標準, 1: 太字, 2: 斜体, 3: 太字+斜体）
- `align`: 水平方向の配置（left, center, right）
- `verticalAlign`: 垂直方向の配置（top, middle, bottom）
- `whiteSpace`: テキストの折り返し方法（wrap, nowrap）

#### 矢印と接続線（辺）

- `endArrow`: 終端の矢印スタイル（例: `classic`, `block`, `open`)
- `startArrow`: 始端の矢印スタイル
- `endFill`: 終端矢印を塗りつぶすかどうか（0または1）
- `startFill`: 始端矢印を塗りつぶすかどうか
- `edgeStyle`: 辺のルーティングスタイル（例: `orthogonalEdgeStyle`, `elbowEdgeStyle`）
- `curved`: 曲線にするかどうか（0または1）
- `elbow`: 折れ線スタイル（`horizontal`または`vertical`）
- `jumpStyle`: 辺の交差スタイル（例: `arc`, `gap`）

## 主要な図形の種類と特性

Draw.ioでは多くの種類の図形が利用可能です。ここでは、プログラムでよく使われる主要な図形とその特性について説明します。

### 基本図形

1. **長方形**
   ```
   rounded=0;whiteSpace=wrap;html=1;
   ```

2. **丸角長方形**
   ```
   rounded=1;whiteSpace=wrap;html=1;
   ```

3. **楕円形（開始/終了）**
   ```
   ellipse;whiteSpace=wrap;html=1;
   ```

4. **菱形（分岐・判断）**
   ```
   rhombus;whiteSpace=wrap;html=1;
   ```

5. **平行四辺形（データ）**
   ```
   shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;
   ```

6. **シリンダー（データベース）**
   ```
   shape=cylinder;whiteSpace=wrap;html=1;
   ```

7. **ドキュメント**
   ```
   shape=document;whiteSpace=wrap;html=1;
   ```

8. **ノート**
   ```
   shape=note;whiteSpace=wrap;html=1;
   ```

### フローチャート要素

フローチャートを作成する場合、一般的に以下のような図形が使用されます：

1. **開始/終了**: 楕円形
   ```
   ellipse;whiteSpace=wrap;html=1;
   ```

2. **処理**: 長方形
   ```
   rounded=0;whiteSpace=wrap;html=1;
   ```

3. **決定/分岐**: 菱形
   ```
   rhombus;whiteSpace=wrap;html=1;
   ```

4. **データ**: 平行四辺形
   ```
   shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;
   ```

5. **サブルーチン**: 短い側面が二重線の長方形
   ```
   shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;
   ```

6. **データストア**: シリンダー
   ```
   shape=cylinder;whiteSpace=wrap;html=1;
   ```

## Draw.ioの座標系と寸法

Draw.ioではデカルト座標系を使用し、左上が原点（0,0）となります。しかし、JSON形式で「頂点」を定義する場合、`x`と`y`の座標は図形の**中心**を表します。

### 座標系と寸法の例

例えば、幅が120、高さが60の長方形を位置（100, 100）に配置する場合、実際の長方形の範囲は以下のようになります：

- 左上: (40, 70)
- 右上: (160, 70)
- 左下: (40, 130)
- 右下: (160, 130)

これは、座標（100, 100）が長方形の中心を表し、幅120と高さ60が中心から各方向に半分ずつ広がるためです。

### 接続点の計算

辺を追加する際、自動的に最適な接続点が計算されますが、特定の接続点を指定することも可能です。接続点は図形の境界に沿って配置され、通常は以下のような相対座標で表されます：

- 上側中央: (0.5, 0)
- 右側中央: (1, 0.5)
- 下側中央: (0.5, 1)
- 左側中央: (0, 0.5)

## ダイアグラムの階層構造

Draw.ioでは、セルを階層的に構成することができます。これは、特にスイムレーン図や入れ子になった図形を作成する際に重要です。

### 親子関係の表現

親子関係は、子セルの`parent`プロパティに親セルのIDを設定することで表現されます：

```json
{
  "cells": [
    {
      "id": "parent1",
      "value": "グループ",
      "geometry": { "x": 100, "y": 100, "width": 300, "height": 200 },
      "style": "swimlane;whiteSpace=wrap;html=1;",
      "vertex": true
    },
    {
      "id": "child1",
      "value": "子要素",
      "geometry": { "x": 150, "y": 150, "width": 100, "height": 50 },
      "style": "rounded=1;whiteSpace=wrap;html=1;",
      "vertex": true,
      "parent": "parent1"
    }
  ]
}
```

この例では、「子要素」という頂点が「グループ」という親セルの中に配置されています。

## Pythonによる基本的なダイアグラム操作

これまでの知識を踏まえて、PythonでDraw.ioダイアグラムを操作する基本的な方法を見ていきましょう。

### 1. ダイアグラムの作成

```python
def create_diagram(title="New Diagram"):
    """新しいダイアグラムを作成する"""
    return {
        "title": title,
        "cells": []
    }
```

### 2. 頂点（ノード）の追加

```python
def add_node(diagram, label, x, y, width, height, style="rounded=0;whiteSpace=wrap;html=1;"):
    """ダイアグラムにノードを追加する"""
    node_id = str(uuid.uuid4())  # 一意のIDを生成
    
    node = {
        "id": node_id,
        "value": label,
        "geometry": {
            "x": x,
            "y": y,
            "width": width,
            "height": height
        },
        "style": style,
        "vertex": True,
        "connectable": True
    }
    
    diagram["cells"].append(node)
    return node_id  # 作成したノードのIDを返す
```

### 3. 辺（接続線）の追加

```python
def add_edge(diagram, source_id, target_id, label="", style="endArrow=classic;html=1;"):
    """二つのノード間に接続線を追加する"""
    edge_id = str(uuid.uuid4())  # 一意のIDを生成
    
    edge = {
        "id": edge_id,
        "source": source_id,
        "target": target_id,
        "value": label,
        "style": style,
        "edge": True
    }
    
    diagram["cells"].append(edge)
    return edge_id  # 作成した辺のIDを返す
```

### 4. ノードの検索

```python
def find_node_by_id(diagram, node_id):
    """IDでノードを検索する"""
    for cell in diagram["cells"]:
        if cell.get("id") == node_id and cell.get("vertex") is True:
            return cell
    return None
```

### 5. エッジの検索

```python
def find_edges_by_node_id(diagram, node_id):
    """指定されたノードに接続されているすべての辺を検索する"""
    edges = []
    for cell in diagram["cells"]:
        if cell.get("edge") is True and (cell.get("source") == node_id or cell.get("target") == node_id):
            edges.append(cell)
    return edges
```

### 6. ノードの更新

```python
def update_node_style(diagram, node_id, new_style):
    """ノードのスタイルを更新する"""
    node = find_node_by_id(diagram, node_id)
    if node:
        node["style"] = new_style
        return True
    return False
```

### 7. ダイアグラムのエクスポート

```python
def export_diagram_to_json(diagram, file_path):
    """ダイアグラムをJSONファイルにエクスポートする"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(diagram, f, indent=2, ensure_ascii=False)
```

## XMLとJSONの相互変換

Draw.ioのネイティブ形式はXMLベースですが、APIではJSONを使用するのが一般的です。両形式間の変換方法を理解しておくと便利です。

### JSONからXMLへの変換例

```python
import xml.etree.ElementTree as ET
import json
import base64
import zlib

def json_to_xml(json_diagram):
    """Draw.io JSON形式をXML形式に変換する"""
    root = ET.Element("mxfile")
    diagram = ET.SubElement(root, "diagram")
    
    # ダイアグラムのIDと名前を設定
    diagram.set("id", "diagram-id")
    diagram.set("name", json_diagram.get("title", "Diagram"))
    
    # mxGraphModelの作成
    graph_model = ET.SubElement(diagram, "mxGraphModel")
    root_node = ET.SubElement(graph_model, "root")
    
    # mxCellのデフォルト設定
    cell0 = ET.SubElement(root_node, "mxCell")
    cell0.set("id", "0")
    
    cell1 = ET.SubElement(root_node, "mxCell")
    cell1.set("id", "1")
    cell1.set("parent", "0")
    
    # 各セルをXML形式に変換
    for cell in json_diagram.get("cells", []):
        cell_element = ET.SubElement(root_node, "mxCell")
        cell_element.set("id", cell["id"])
        
        if "parent" in cell:
            cell_element.set("parent", cell["parent"])
        else:
            cell_element.set("parent", "1")
        
        if "value" in cell:
            cell_element.set("value", cell["value"])
        
        if "style" in cell:
            cell_element.set("style", cell["style"])
        
        if cell.get("vertex") is True:
            cell_element.set("vertex", "1")
            
            # ジオメトリ情報の設定
            if "geometry" in cell:
                geom = ET.SubElement(cell_element, "mxGeometry")
                geom.set("x", str(cell["geometry"].get("x", 0)))
                geom.set("y", str(cell["geometry"].get("y", 0)))
                geom.set("width", str(cell["geometry"].get("width", 0)))
                geom.set("height", str(cell["geometry"].get("height", 0)))
                geom.set("as", "geometry")
        
        elif cell.get("edge") is True:
            cell_element.set("edge", "1")
            cell_element.set("source", cell["source"])
            cell_element.set("target", cell["target"])
            
            # エッジのジオメトリ設定
            geom = ET.SubElement(cell_element, "mxGeometry")
            geom.set("relative", "1")
            geom.set("as", "geometry")
    
    # XMLを文字列として返す
    return ET.tostring(root, encoding='utf-8').decode('utf-8')
```

### Draw.io XMLファイルのデコード

Draw.ioのXMLファイル（.drawioファイル）には、しばしば圧縮されたダイアグラムデータが含まれています。そのようなデータを扱うための関数も用意しておくと便利です：

```python
def decode_drawio_xml(file_path):
    """Draw.ioファイルからXMLをデコードする"""
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    diagrams = []
    
    for diagram_elem in root.findall(".//diagram"):
        diagram_id = diagram_elem.get("id")
        diagram_name = diagram_elem.get("name")
        
        # ダイアグラムデータがある場合
        if diagram_elem.text:
            # URLセーフなBase64デコード
            decoded = base64.b64decode(diagram_elem.text.replace('-', '+').replace('_', '/'))
            
            # もし圧縮されていれば解凍
            try:
                inflated = zlib.decompress(decoded, -zlib.MAX_WBITS)
                xml_content = inflated.decode('utf-8')
            except:
                # 圧縮されていない場合は直接デコード
                xml_content = decoded.decode('utf-8')
            
            diagrams.append({
                "id": diagram_id,
                "name": diagram_name,
                "xml": xml_content
            })
        else:
            # ダイアグラムデータが直接XMLに含まれている場合
            xml_content = ET.tostring(diagram_elem.find(".//mxGraphModel"), encoding='utf-8').decode('utf-8')
            diagrams.append({
                "id": diagram_id,
                "name": diagram_name,
                "xml": xml_content
            })
    
    return diagrams
```

## 実践例：基本的なフローチャートの作成

ここまでの知識を使って、簡単なフローチャートを作成してみましょう。

```python
import uuid
import json

def create_simple_flowchart():
    """基本的なフローチャートを作成する例"""
    # 空のダイアグラムを作成
    diagram = {
        "title": "シンプルなフローチャート",
        "cells": []
    }
    
    # ノードの追加
    # 開始ノード
    start_id = str(uuid.uuid4())
    diagram["cells"].append({
        "id": start_id,
        "value": "開始",
        "geometry": {
            "x": 100,
            "y": 50,
            "width": 120,
            "height": 40
        },
        "style": "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;",
        "vertex": True,
        "connectable": True
    })
    
    # 入力ノード
    input_id = str(uuid.uuid4())
    diagram["cells"].append({
        "id": input_id,
        "value": "データ入力",
        "geometry": {
            "x": 100,
            "y": 140,
            "width": 120,
            "height": 60
        },
        "style": "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;",
        "vertex": True,
        "connectable": True
    })
    
    # 処理ノード
    process_id = str(uuid.uuid4())
    diagram["cells"].append({
        "id": process_id,
        "value": "データ処理",
        "geometry": {
            "x": 100,
            "y": 240,
            "width": 120,
            "height": 60
        },
        "style": "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;",
        "vertex": True,
        "connectable": True
    })
    
    # 分岐ノード
    decision_id = str(uuid.uuid4())
    diagram["cells"].append({
        "id": decision_id,
        "value": "条件判断",
        "geometry": {
            "x": 100,
            "y": 340,
            "width": 120,
            "height": 80
        },
        "style": "rhombus;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;",
        "vertex": True,
        "connectable": True
    })
    
    # 成功終了ノード
    success_id = str(uuid.uuid4())
    diagram["cells"].append({
        "id": success_id,
        "value": "処理成功",
        "geometry": {
            "x": 240,
            "y": 440,
            "width": 120,
            "height": 40
        },
        "style": "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;",
        "vertex": True,
        "connectable": True
    })
    
    # 失敗終了ノード
    failure_id = str(uuid.uuid4())
    diagram["cells"].append({
        "id": failure_id,
        "value": "処理失敗",
        "geometry": {
            "x": -40,
            "y": 440,
            "width": 120,
            "height": 40
        },
        "style": "ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;",
        "vertex": True,
        "connectable": True
    })
    
    # エッジの追加
    # 開始 -> 入力
    diagram["cells"].append({
        "id": str(uuid.uuid4()),
        "source": start_id,
        "target": input_id,
        "style": "endArrow=classic;html=1;rounded=0;",
        "edge": True
    })
    
    # 入力 -> 処理
    diagram["cells"].append({
        "id": str(uuid.uuid4()),
        "source": input_id,
        "target": process_id,
        "style": "endArrow=classic;html=1;rounded=0;",
        "edge": True
    })
    
    # 処理 -> 分岐
    diagram["cells"].append({
        "id": str(uuid.uuid4()),
        "source": process_id,
        "target": decision_id,
        "style": "endArrow=classic;html=1;rounded=0;",
        "edge": True
    })
    
    # 分岐 -> 成功終了（はい）
    diagram["cells"].append({
        "id": str(uuid.uuid4()),
        "source": decision_id,
        "target": success_id,
        "value": "はい",
        "style": "endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;entryX=0.5;entryY=0;fontColor=#009900;",
        "edge": True
    })
    
    # 分岐 -> 失敗終了（いいえ）
    diagram["cells"].append({
        "id": str(uuid.uuid4()),
        "source": decision_id,
        "target": failure_id,
        "value": "いいえ",
        "style": "endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;entryX=0.5;entryY=0;fontColor=#990000;",
        "edge": True
    })
    
    return diagram

# フローチャートを作成してJSONファイルに保存
flowchart = create_simple_flowchart()
with open("flowchart_example.json", "w", encoding="utf-8") as f:
    json.dump(flowchart, f, indent=2, ensure_ascii=False)

print("フローチャートをJSONファイルに保存しました。")
```

## Claude 3.7を活用したダイアグラム構造の理解

Claude 3.7のような高度なAIモデルは、既存のDraw.ioダイアグラムを解析して、その構造を理解し説明することができます。これはコードの移植や逆エンジニアリングに役立ちます。

以下は、Claude 3.7にダイアグラムの構造を説明させる例です：

```python
import anthropic
import json
import os
from dotenv import load_dotenv

def analyze_diagram_structure(json_path):
    """Claude 3.7を使ってダイアグラムの構造を分析する"""
    # APIキーの取得
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # JSON読み込み
    with open(json_path, 'r', encoding='utf-8') as f:
        diagram_data = json.load(f)
    
    # Anthropicクライアントの初期化
    client = anthropic.Anthropic(api_key=api_key)
    
    # プロンプトの構築
    prompt = f"""
    以下のJSON形式のDraw.ioダイアグラムを分析し、その構造と主要な要素を説明してください。
    特に、ノード間の関係性、処理の流れ、主要なパスやループ、分岐などに注目してください。
    
    ```json
    {json.dumps(diagram_data, ensure_ascii=False, indent=2)}
    ```
    
    次の項目について説明してください：
    1. ダイアグラムの種類（フローチャート、UML、ネットワーク図など）
    2. 主要なノードとその役割
    3. ノード間の接続パターンと処理の流れ
    4. ダイアグラムから読み取れるアルゴリズムやプロセスの概要
    5. ダイアグラムの改善点や注意点（もしあれば）
    """
    
    # Claude 3.7に分析を依頼
    response = client.messages.create(
        model="claude-3-7-sonnet-20240229",
        max_tokens=1500,
        temperature=0,
        system="あなたはダイアグラムとソフトウェア設計の専門家です。Draw.ioのダイアグラム構造を分析し、わかりやすく説明してください。",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.content[0].text

# 使用例
analysis = analyze_diagram_structure("flowchart_example.json")
print(analysis)
```

## まとめ

この章では、Draw.ioの基本概念と内部構造について詳しく学びました。具体的には：

1. Draw.ioダイアグラムの基本要素（セル、頂点、辺）
2. JSON形式でのデータ表現
3. スタイル文字列の構造と使用方法
4. 主要な図形の種類とその特性
5. 座標系と寸法の考え方
6. ダイアグラムの階層構造
7. Pythonでの基本的なダイアグラム操作
8. XMLとJSONの相互変換
9. 実践例としてのフローチャート作成
10. Claude 3.7を活用したダイアグラム分析

これらの知識は、次章以降でより複雑なダイアグラムを作成し、様々な形式にエクスポートする際の基礎となります。Draw.ioの内部形式を理解することで、より細かな制御が可能になり、高度なカスタマイズも実現できるようになります。

## 練習問題

1. 「基本的なフローチャートの作成」の例を拡張して、「データ検証」ステップを追加してみましょう。

2. スタイル文字列を解析して辞書形式に変換する関数と、逆に辞書からスタイル文字列を生成する関数を実装してみましょう。

3. ノードにカスタムプロパティを追加する方法を調査し、例えば「担当者」や「所要時間」などの追加情報を持たせる実装を試してみましょう。

4. 「シーケンス図」のような別の種類のダイアグラムを生成するコードを書いてみましょう。

5. Claude 3.7を使って、テキスト説明からフローチャートを自動生成する関数を実装してみましょう。