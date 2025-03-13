---
title: プログラム解析手法
---

## はじめに

前章では、Draw.io形式の内部構造について詳しく学び、XMLとJSONの変換、スタイル文字列の解析、および高度な図表操作技術を習得しました。本章では、これらの知識を基にして、プログラムコードを解析し、その構造を図表化するための手法に焦点を当てます。プログラム解析は、コードの可視化、理解、およびドキュメント作成において非常に重要なステップです。

## プログラム解析の基本概念

プログラム解析とは、ソースコードを体系的に調査し、その構造、制御フロー、データフロー、依存関係などを抽出するプロセスです。これにより、コードの理解、デバッグ、最適化、およびドキュメント作成が容易になります。

### 解析の種類

プログラム解析には主に以下の種類があります：

1. **静的解析**：実行せずにソースコードを解析
   - 構文解析（パーシング）
   - 抽象構文木（AST）の解析
   - コード構造の分析

2. **動的解析**：プログラム実行中のデータを収集して解析
   - プロファイリング
   - 実行トレース解析
   - カバレッジ分析

本章では主に静的解析の手法に焦点を当て、Pythonコードから構造情報を抽出し、Draw.io APIを使用して視覚化する方法を検討します。

## Pythonでの静的コード解析

Pythonは、コードを解析するための強力なツールを標準ライブラリで提供しています。ここでは、最も一般的なツールとその使用方法を紹介します。

### astモジュールを使った構文解析

`ast`（Abstract Syntax Tree）モジュールは、Pythonコードを構文解析して抽象構文木を生成します。これにより、コードの構造を階層的に表現できます。

```python
import ast

def parse_python_file(file_path):
    """Pythonファイルを解析してASTを取得"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return ast.parse(content, filename=file_path)

# 使用例
ast_tree = parse_python_file("examples/main.py")
```

ASTを探索するには、`ast.NodeVisitor`クラスを継承するビジタークラスを作成し、各ノードタイプに対応するメソッドを実装します。

```python
class FunctionVisitor(ast.NodeVisitor):
    """関数定義を収集するビジター"""
    
    def __init__(self):
        self.functions = []
    
    def visit_FunctionDef(self, node):
        """関数定義ノードを処理"""
        self.functions.append({
            'name': node.name,
            'line': node.lineno,
            'args': [arg.arg for arg in node.args.args],
            'docstring': ast.get_docstring(node)
        })
        # 子ノードも訪問
        self.generic_visit(node)

# 使用例
visitor = FunctionVisitor()
visitor.visit(ast_tree)
print(f"見つかった関数: {len(visitor.functions)}")
for func in visitor.functions:
    print(f"関数名: {func['name']}, 行: {func['line']}")
```

### inspectモジュールを使ったコード解析

`inspect`モジュールは、実行時のオブジェクト（モジュール、クラス、関数など）の情報を調査するためのツールを提供します。静的解析と組み合わせて使用することで、より包括的な情報を得ることができます。

```python
import inspect
import sys
import importlib.util

def analyze_module(module_path):
    """モジュールを動的にロードして解析"""
    # モジュールのパスからスペックを作成
    spec = importlib.util.spec_from_file_location("dynamic_module", module_path)
    module = importlib.util.module_from_spec(spec)
    
    # モジュールをロード
    spec.loader.exec_module(module)
    
    # 関数を取得
    functions = inspect.getmembers(module, inspect.isfunction)
    
    # クラスを取得
    classes = inspect.getmembers(module, inspect.isclass)
    
    return {
        'functions': functions,
        'classes': classes
    }

# 使用例
module_info = analyze_module("examples/main.py")
```

## プログラムフロー解析

プログラムの制御フローを解析することで、実行経路の視覚化が可能になります。制御フロー解析は、条件分岐、ループ、関数呼び出しなどを特定し、それらの関係を図示します。

### 制御フロー解析の基本手順

1. コードからASTを生成
2. 制御構造（if-else、for、while、try-exceptなど）を特定
3. 各制御構造のブロックを抽出
4. ブロック間の遷移関係を特定
5. フローグラフを構築

### main.pyの制御フロー解析

例として、前章で扱った`main.py`のフロー解析と可視化を行います。このコードをASTベースで解析してみましょう。

```python
import ast

class ControlFlowVisitor(ast.NodeVisitor):
    """制御フロー情報を収集するビジター"""
    
    def __init__(self):
        self.nodes = []  # 制御フローノード
        self.edges = []  # 制御フローエッジ
        self.current_node = None  # 現在処理中のノード
        self.node_counter = 0  # ノードIDのカウンター
    
    def create_node(self, label, node_type="generic"):
        """新しいノードを作成"""
        node_id = f"node_{self.node_counter}"
        self.node_counter += 1
        
        node = {
            'id': node_id,
            'label': label,
            'type': node_type,
            'ast_node': self.current_node
        }
        
        self.nodes.append(node)
        return node_id
    
    def create_edge(self, source, target, label=""):
        """ノード間のエッジを作成"""
        edge = {
            'source': source,
            'target': target,
            'label': label
        }
        
        self.edges.append(edge)
    
    def visit_If(self, node):
        """If文の制御フローを解析"""
        prev_node = self.current_node
        
        # 条件ノードを作成
        condition_text = ast.unparse(node.test)
        condition_id = self.create_node(f"条件: {condition_text}", "condition")
        
        if prev_node:
            self.create_edge(prev_node, condition_id)
        
        # Trueブロック
        true_body_id = None
        if node.body:
            self.current_node = condition_id
            for stmt in node.body:
                self.visit(stmt)
            # 最後のノードをキャプチャ
            true_body_id = self.current_node
        
        # Falseブロック
        false_body_id = None
        if node.orelse:
            self.current_node = condition_id
            for stmt in node.orelse:
                self.visit(stmt)
            # 最後のノードをキャプチャ
            false_body_id = self.current_node
        
        # エッジに条件ラベルを追加
        if true_body_id:
            self.create_edge(condition_id, true_body_id, "True")
        
        if false_body_id:
            self.create_edge(condition_id, false_body_id, "False")
        
        # 現在のノードを最後に処理したノードに更新
        self.current_node = true_body_id or false_body_id or condition_id
    
    def visit_Call(self, node):
        """関数呼び出しを解析"""
        func_name = ast.unparse(node.func)
        call_id = self.create_node(f"呼び出し: {func_name}", "call")
        
        if self.current_node:
            self.create_edge(self.current_node, call_id)
        
        self.current_node = call_id
        
        # 引数の解析はここでは省略
        self.generic_visit(node)
    
    # 他のノードタイプに対する処理も追加
```

## main_flowchart.pyの解析

`main_flowchart.py`は、プログラムの流れを手動で図表化した良い例です。このファイルを解析して、図表作成のパターンを理解しましょう。

```python
def analyze_flowchart_creation(file_path):
    """フローチャート作成コードを解析"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ASTを生成
    tree = ast.parse(content)
    
    # ノード作成パターンを特定
    node_patterns = []
    
    class NodeCreationVisitor(ast.NodeVisitor):
        def visit_Call(self, node):
            # client.add_nodeの呼び出しを検索
            if isinstance(node.func, ast.Attribute) and node.func.attr == 'add_node':
                if len(node.args) >= 7:  # 引数の数でadd_nodeを特定
                    node_info = {
                        'label': ast.literal_eval(node.args[1]) if isinstance(node.args[1], ast.Constant) else "変数",
                        'x': ast.literal_eval(node.args[2]) if isinstance(node.args[2], ast.Constant) else 0,
                        'y': ast.literal_eval(node.args[3]) if isinstance(node.args[3], ast.Constant) else 0,
                        'width': ast.literal_eval(node.args[4]) if isinstance(node.args[4], ast.Constant) else 0,
                        'height': ast.literal_eval(node.args[5]) if isinstance(node.args[5], ast.Constant) else 0,
                        'style': ast.literal_eval(node.args[6]) if isinstance(node.args[6], ast.Constant) else ""
                    }
                    node_patterns.append(node_info)
            
            self.generic_visit(node)
    
    visitor = NodeCreationVisitor()
    visitor.visit(tree)
    
    return node_patterns

# 使用例
node_patterns = analyze_flowchart_creation("main_flowchart.py")
```

### フローチャート作成パターンの抽出

`main_flowchart.py`から抽出したパターンを使って、プログラム解析と図表生成を自動化する方法を考えましょう。


## ASTによるコード構造からDraw.io図への変換

Pythonコードを解析してDraw.io図に変換する一般的なプロセスを実装します。

```python
import ast
import os
import sys
from src.drawio_api.client import DrawioAPIClient

def create_program_flowchart(python_file):
    """Pythonファイルを解析してフローチャートを生成"""
    # コードを解析
    with open(python_file, 'r', encoding='utf-8') as f:
        code = f.read()
    
    tree = ast.parse(code)
    
    # クライアントを初期化
    client = DrawioAPIClient()
    diagram = client.create_diagram(title=f"{os.path.basename(python_file)} フローチャート")
    
    # ASTを解析して図を生成するクラス
    flow_visitor = FlowChartGenerator(client, diagram)
    flow_visitor.visit(tree)
    
    # 更新されたダイアグラムを取得
    final_diagram = flow_visitor.get_diagram()
    
    # ファイル名を生成
    base_name = os.path.splitext(os.path.basename(python_file))[0]
    output_file = f"{base_name}_flow.drawio"
    
    # Draw.io形式で出力
    drawio_data = client.export_diagram(final_diagram, format="drawio")
    with open(output_file, "w") as f:
        f.write(drawio_data)
    
    return output_file, final_diagram

class FlowChartGenerator(ast.NodeVisitor):
    """ASTノードをDraw.io図形に変換するビジター"""
    
    def __init__(self, client, diagram):
        self.client = client
        self.diagram = diagram
        self.nodes = {}  # AST Node -> diagram node IDのマッピング
        self.last_node = None  # 最後に処理したノードID
        self.x = 300  # 初期X座標
        self.y = 50   # 初期Y座標
        
        # 開始ノードを追加
        self.diagram = self.client.add_node(
            self.diagram,
            "Start",
            self.x,
            self.y,
            120,
            40,
            "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
        )
        self.start_id = self.diagram["cells"][-1]["id"]
        self.last_node = self.start_id
        self.y += 80  # Y座標を更新
    
    def get_diagram(self):
        """最終的なダイアグラムを取得"""
        # 終了ノードを追加
        self.diagram = self.client.add_node(
            self.diagram,
            "End",
            self.x,
            self.y,
            120,
            40,
            "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
        )
        end_id = self.diagram["cells"][-1]["id"]
        
        # 最後のノードから終了ノードへエッジを追加
        if self.last_node:
            self.diagram = self.client.add_edge(
                self.diagram,
                self.last_node,
                end_id,
                style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            )
        
        return self.diagram
    
    def add_node_and_edge(self, label, style, width=180, height=60):
        """ノードを追加し、前のノードからエッジを接続"""
        self.diagram = self.client.add_node(
            self.diagram,
            label,
            self.x,
            self.y,
            width,
            height,
            style
        )
        node_id = self.diagram["cells"][-1]["id"]
        
        if self.last_node:
            self.diagram = self.client.add_edge(
                self.diagram,
                self.last_node,
                node_id,
                style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            )
        
        self.last_node = node_id
        self.y += height + 30  # Y座標を更新
        return node_id
    
    def visit_FunctionDef(self, node):
        """関数定義を処理"""
        # 関数名とパラメータを取得
        params = [arg.arg for arg in node.args.args]
        param_str = ", ".join(params)
        label = f"関数: {node.name}({param_str})"
        
        # 関数ノードを追加
        node_id = self.add_node_and_edge(
            label,
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        )
        
        # ノードマッピングを保存
        self.nodes[node] = node_id
        
        # 本体をさらに訪問
        old_last = self.last_node
        for stmt in node.body:
            self.visit(stmt)
        
        # 最後のノードを関数ノードに戻す
        self.last_node = old_last
    
    def visit_If(self, node):
        """条件分岐を処理"""
        # 条件テキストを取得
        condition = ast.unparse(node.test)
        label = f"条件: {condition}"
        
        # 条件ノードを追加
        condition_id = self.add_node_and_edge(
            label,
            "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
        )
        
        # Trueブランチの開始ノード
        true_last = self.last_node
        true_branch_x = self.x + 200
        true_y = self.y
        
        # Trueブランチを処理
        self.x = true_branch_x
        self.y = true_y
        self.last_node = condition_id
        
        if node.body:
            # Trueラベルを持つエッジを追加
            self.diagram = self.client.add_node(
                self.diagram,
                "True分岐",
                self.x,
                self.y,
                120,
                40,
                "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
            )
            true_start_id = self.diagram["cells"][-1]["id"]
            
            self.diagram = self.client.add_edge(
                self.diagram,
                condition_id,
                true_start_id,
                "True",
                "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;align=center;verticalAlign=middle;"
            )
            
            self.last_node = true_start_id
            self.y += 70
            
            # Trueブランチのステートメントを処理
            for stmt in node.body:
                self.visit(stmt)
        
        true_end = self.last_node
        
        # Falseブランチ
        false_last = condition_id
        false_branch_x = self.x - 400  # 左側にFalseブランチを配置
        false_y = true_y
        
        # Falseブランチを処理
        self.x = false_branch_x
        self.y = false_y
        self.last_node = condition_id
        
        if node.orelse:
            # Falseラベルを持つエッジを追加
            self.diagram = self.client.add_node(
                self.diagram,
                "False分岐",
                self.x,
                self.y,
                120,
                40,
                "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
            )
            false_start_id = self.diagram["cells"][-1]["id"]
            
            self.diagram = self.client.add_edge(
                self.diagram,
                condition_id,
                false_start_id,
                "False",
                "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;align=center;verticalAlign=middle;"
            )
            
            self.last_node = false_start_id
            self.y += 70
            
            # Falseブランチのステートメントを処理
            for stmt in node.orelse:
                self.visit(stmt)
        
        false_end = self.last_node
        
        # マージポイントを作成
        self.x = 300  # 元のX座標に戻る
        self.y = max(self.y, true_y) + 100  # 両方のブランチの下に配置
        
        self.diagram = self.client.add_node(
            self.diagram,
            "分岐終了",
            self.x,
            self.y,
            120,
            40,
            "rounded=1;whiteSpace=wrap;html=1;"
        )
        merge_id = self.diagram["cells"][-1]["id"]
        
        # 両方のブランチからマージポイントへエッジを接続
        if true_end:
            self.diagram = self.client.add_edge(
                self.diagram,
                true_end,
                merge_id,
                style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            )
        
        if false_end and false_end != condition_id:
            self.diagram = self.client.add_edge(
                self.diagram,
                false_end,
                merge_id,
                style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            )
        elif false_end == condition_id and not node.orelse:
            # Falseブランチが空の場合、条件から直接マージポイントへ
            self.diagram = self.client.add_edge(
                self.diagram,
                condition_id,
                merge_id,
                "False",
                "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;align=center;verticalAlign=middle;"
            )
        
        self.last_node = merge_id
        self.y += 70
        
        # ノードマッピングを保存
        self.nodes[node] = condition_id
    
    def visit_Call(self, node):
        """関数呼び出しを処理"""
        call_str = ast.unparse(node)
        
        # 親が式文の場合のみ独立したノードとして追加
        parent = getattr(node, 'parent', None)
        if parent and isinstance(parent, ast.Expr):
            node_id = self.add_node_and_edge(
                f"呼び出し: {call_str}",
                "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
            )
            self.nodes[node] = node_id
        
        # 子ノードを訪問
        self.generic_visit(node)
    
    def visit_Assign(self, node):
        """代入文を処理"""
        # 代入の左辺と右辺を取得
        targets = [ast.unparse(target) for target in node.targets]
        value = ast.unparse(node.value)
        label = f"代入: {', '.join(targets)} = {value}"
        
        node_id = self.add_node_and_edge(
            label,
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;"
        )
        self.nodes[node] = node_id
        
        # 子ノードを訪問
        self.generic_visit(node)
    
    def visit_Return(self, node):
        """return文を処理"""
        if node.value:
            value = ast.unparse(node.value)
            label = f"戻り値: {value}"
        else:
            label = "戻り値: None"
        
        node_id = self.add_node_and_edge(
            label,
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
        )
        self.nodes[node] = node_id
        
        # 子ノードを訪問
        self.generic_visit(node)
    
    # 必要に応じて他のノードタイプも処理

# 使用例
if __name__ == "__main__":
    if len(sys.argv) > 1:
        python_file = sys.argv[1]
        output_file, diagram = create_program_flowchart(python_file)
        print(f"フローチャートを {output_file} に生成しました")
    else:
        print("解析するPythonファイルを指定してください")
```

## 関数呼び出しグラフの作成

プログラム解析の重要な側面の1つは、関数呼び出し関係の可視化です。以下の例では、Pythonモジュール内の関数呼び出し関係を抽出して図として表現します。

```python
import ast
import os
from src.drawio_api.client import DrawioAPIClient

class FunctionCallVisitor(ast.NodeVisitor):
    """関数呼び出し関係を抽出するビジター"""
    
    def __init__(self):
        self.current_function = None
        self.functions = {}  # 関数名 -> 情報のマッピング
        self.calls = []  # 関数呼び出し関係のリスト
    
    def visit_FunctionDef(self, node):
        """関数定義を処理"""
        prev_function = self.current_function
        self.current_function = node.name
        
        # 関数情報を記録
        self.functions[node.name] = {
            'name': node.name,
            'line': node.lineno,
            'args': [arg.arg for arg in node.args.args],
            'calls': []  # この関数内で呼び出される関数
        }
        
        # 関数本体を処理
        self.generic_visit(node)
        
        # 現在の関数をリセット
        self.current_function = prev_function
    
    def visit_Call(self, node):
        """関数呼び出しを処理"""
        # 呼び出される関数名を取得
        if isinstance(node.func, ast.Name):
            called_func = node.func.id
        elif isinstance(node.func, ast.Attribute):
            called_func = node.func.attr  # メソッド呼び出しの場合
        else:
            called_func = ast.unparse(node.func)
        
        # 現在の関数内にいる場合
        if self.current_function:
            # 呼び出し関係を記録
            self.calls.append((self.current_function, called_func))
            self.functions.get(self.current_function, {}).get('calls', []).append(called_func)
        
        # 子ノードを訪問
        self.generic_visit(node)

def create_function_call_diagram(python_file):
    """関数呼び出し関係を図として生成"""
    # コードを解析
    with open(python_file, 'r', encoding='utf-8') as f:
        code = f.read()
    
    tree = ast.parse(code)
    
    # 関数呼び出し関係を抽出
    visitor = FunctionCallVisitor()
    visitor.visit(tree)
    
    # クライアントを初期化
    client = DrawioAPIClient()
    diagram = client.create_diagram(title=f"{os.path.basename(python_file)} 関数呼び出し図")
    
    # 関数ノードを追加
    function_nodes = {}
    y_pos = 50
    x_pos = 300
    
    for func_name, func_info in visitor.functions.items():
        diagram = client.add_node(
            diagram,
            func_name,
            x_pos,
            y_pos,
            160,
            60,
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        )
        
        function_nodes[func_name] = diagram["cells"][-1]["id"]
        y_pos += 100
    
    # 呼び出し関係のエッジを追加
    for caller, callee in visitor.calls:
        if caller in function_nodes and callee in function_nodes:
            diagram = client.add_edge(
                diagram,
                function_nodes[caller],
                function_nodes[callee],
                "",
                "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            )
    
    # ファイル名を生成
    base_name = os.path.splitext(os.path.basename(python_file))[0]
    output_file = f"{base_name}_call_graph.drawio"
    
    # Draw.io形式で出力
    drawio_data = client.export_diagram(diagram, format="drawio")
    with open(output_file, "w") as f:
        f.write(drawio_data)
    
    return output_file, diagram
```

## クラス構造の解析と可視化

オブジェクト指向プログラムでは、クラス構造の可視化が特に重要です。以下は、クラス階層、属性、メソッドを解析して図として表現する例です。

```python
import ast
import os
from src.drawio_api.client import DrawioAPIClient

class ClassVisitor(ast.NodeVisitor):
    """クラス構造を抽出するビジター"""
    
    def __init__(self):
        self.classes = {}  # クラス名 -> 情報のマッピング
        self.current_class = None
    
    def visit_ClassDef(self, node):
        """クラス定義を処理"""
        prev_class = self.current_class
        self.current_class = node.name
        
        # 継承関係
        bases = [
            base.id if isinstance(base, ast.Name) else ast.unparse(base)
            for base in node.bases
        ]
        
        # クラス情報を記録
        self.classes[node.name] = {
            'name': node.name,
            'bases': bases,
            'line': node.lineno,
            'methods': [],
            'attributes': []
        }
        
        # クラス本体を処理
        self.generic_visit(node)
        
        # 現在のクラスをリセット
        self.current_class = prev_class
    
    def visit_FunctionDef(self, node):
        """メソッド定義を処理"""
        if self.current_class:
            # メソッド情報を記録
            method = {
                'name': node.name,
                'line': node.lineno,
                'args': [arg.arg for arg in node.args.args]
            }
            
            self.classes[self.current_class]['methods'].append(method)
        
        # 子ノードを訪問
        self.generic_visit(node)
    
    def visit_Assign(self, node):
        """属性の代入を処理"""
        if self.current_class:
            for target in node.targets:
                if isinstance(target, ast.Name):
                    # クラス属性を記録
                    attr = {
                        'name': target.id,
                        'line': node.lineno
                    }
                    self.classes[self.current_class]['attributes'].append(attr)
        
        # 子ノードを訪問
        self.generic_visit(node)

def create_class_diagram(python_file):
    """クラス構造を図として生成"""
    # コードを解析
    with open(python_file, 'r', encoding='utf-8') as f:
        code = f.read()
    
    tree = ast.parse(code)
    
    # クラス構造を抽出
    visitor = ClassVisitor()
    visitor.visit(tree)
    
    # クライアントを初期化
    client = DrawioAPIClient()
    diagram = client.create_diagram(title=f"{os.path.basename(python_file)} クラス図")
    
    # クラスノードを追加
    class_nodes = {}
    y_pos = 50
    x_pos = 300
    
    for class_name, class_info in visitor.classes.items():
        # クラス名とメソッド、属性をフォーマット
        attrs = "\n".join([f"- {attr['name']}" for attr in class_info['attributes']])
        methods = "\n".join([f"+ {method['name']}()" for method in class_info['methods']])
        
        label = f"{class_name}\n\n{attrs}\n\n{methods}"
        
        # 高さを動的に計算
        lines = label.count('\n') + 1
        height = max(100, lines * 20)
        
        diagram = client.add_node(
            diagram,
            label,
            x_pos,
            y_pos,
            200,
            height,
            "rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;align=left;verticalAlign=top;spacing=10;"
        )
        
        class_nodes[class_name] = diagram["cells"][-1]["id"]
        y_pos += height + 50
    
    # 継承関係のエッジを追加
    for class_name, class_info in visitor.classes.items():
        for base in class_info['bases']:
            if base in class_nodes:
                diagram = client.add_edge(
                    diagram,
                    class_nodes[class_name],
                    class_nodes[base],
                    "extends",
                    "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=0;"
                )
    
    # ファイル名を生成
    base_name = os.path.splitext(os.path.basename(python_file))[0]
    output_file = f"{base_name}_class_diagram.drawio"
    
    # Draw.io形式で出力
    drawio_data = client.export_diagram(diagram, format="drawio")
    with open(output_file, "w") as f:
        f.write(drawio_data)
    
    return output_file, diagram
```

## 実践例：main.pyの解析と可視化

これまで学んだ技術を使って、`examples/main.py`を解析し、その制御フローを可視化しましょう。

```python
def analyze_main_py():
    """examples/main.pyを解析して可視化"""
    main_py_path = "examples/main.py"
    
    # 制御フロー図を生成
    flow_diagram_file, flow_diagram = create_program_flowchart(main_py_path)
    
    # 関数呼び出し図を生成
    call_diagram_file, call_diagram = create_function_call_diagram(main_py_path)
    
    # Draw.ioクライアントを初期化
    client = DrawioAPIClient()
    
    # フローチャートをPNGとSVGでエクスポート
    client.export_to_image(flow_diagram, f"main_flow.png", format="png")
    client.export_to_image(flow_diagram, f"main_flow.svg", format="svg")
    
    # 呼び出し図をPNGとSVGでエクスポート
    client.export_to_image(call_diagram, f"main_calls.png", format="png")
    client.export_to_image(call_diagram, f"main_calls.svg", format="svg")
    
    print(f"main.pyの解析が完了しました。")
    print(f"制御フロー図: {flow_diagram_file}, main_flow.png, main_flow.svg")
    print(f"関数呼び出し図: {call_diagram_file}, main_calls.png, main_calls.svg")

# 実行
if __name__ == "__main__":
    analyze_main_py()
```

この実装では、`examples/main.py`のコードを解析して以下の図を生成します：

1. プログラムの制御フロー図（条件分岐、関数呼び出し、実行パスなど）
2. 関数呼び出し関係図（どの関数がどの関数を呼び出すか）

これらの図は、コードの理解、ドキュメント作成、およびコードレビューに役立ちます。

## 解析データの保存と共有

プログラム解析の結果は、Draw.io形式だけでなく、様々な形式で保存し共有できます。以下は、解析結果をJSON形式で保存し、後で再利用するための例です。

```python
import json

def save_analysis_data(python_file, output_file=None):
    """プログラム解析データをJSON形式で保存"""
    # コードを解析
    with open(python_file, 'r', encoding='utf-8') as f:
        code = f.read()
    
    tree = ast.parse(code)
    
    # 関数情報を抽出
    function_visitor = FunctionVisitor()
    function_visitor.visit(tree)
    
    # クラス情報を抽出
    class_visitor = ClassVisitor()
    class_visitor.visit(tree)
    
    # 呼び出し関係を抽出
    call_visitor = FunctionCallVisitor()
    call_visitor.visit(tree)
    
    # 解析データを構築
    analysis_data = {
        'file': python_file,
        'functions': function_visitor.functions,
        'classes': class_visitor.classes,
        'calls': call_visitor.calls
    }
    
    # 出力ファイル名を生成
    if not output_file:
        base_name = os.path.splitext(os.path.basename(python_file))[0]
        output_file = f"{base_name}_analysis.json"
    
    # JSONとして保存
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_data, f, indent=2)
    
    return output_file, analysis_data

def load_analysis_data(json_file):
    """保存された解析データをロード"""
    with open(json_file, 'r', encoding='utf-8') as f:
        analysis_data = json.load(f)
    
    return analysis_data

def create_diagram_from_analysis(analysis_data):
    """解析データから図を生成"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title=f"{os.path.basename(analysis_data['file'])} 解析")
    
    # ここでは解析データを使って各種図を生成
    # ...
    
    return diagram
```

このアプローチは、解析とビジュアライゼーションを分離し、同じ解析データから異なる視覚化を生成する場合に特に有用です。

## プログラム解析の実用的な応用

プログラム解析とDraw.ioによる可視化の組み合わせは、多くの実用的なシナリオで役立ちます。

### コードドキュメントの自動生成

プログラム解析を利用して、ソースコードから自動的にドキュメントを生成できます。

```python
def generate_code_documentation(python_file, output_dir=None):
    """ソースコードからドキュメントを生成"""
    # 出力ディレクトリの設定
    if not output_dir:
        output_dir = f"{os.path.splitext(os.path.basename(python_file))[0]}_docs"
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 解析データを取得
    analysis_file, analysis_data = save_analysis_data(python_file)
    
    # クラス図、フロー図、呼び出し図を生成
    class_diagram_file, class_diagram = create_class_diagram(python_file)
    flow_diagram_file, flow_diagram = create_program_flowchart(python_file)
    call_diagram_file, call_diagram = create_function_call_diagram(python_file)
    
    # Draw.ioクライアントを初期化
    client = DrawioAPIClient()
    
    # 各図をSVGでエクスポート
    svg_class = os.path.join(output_dir, "class_diagram.svg")
    svg_flow = os.path.join(output_dir, "flow_diagram.svg")
    svg_call = os.path.join(output_dir, "call_diagram.svg")
    
    client.export_to_image(class_diagram, svg_class, format="svg")
    client.export_to_image(flow_diagram, svg_flow, format="svg")
    client.export_to_image(call_diagram, svg_call, format="svg")
    
    # HTMLドキュメントの生成
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{os.path.basename(python_file)} ドキュメント</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1, h2, h3 {{ color: #333; }}
            .diagram {{ margin: 20px 0; border: 1px solid #ddd; padding: 10px; }}
            .code {{ font-family: monospace; background-color: #f5f5f5; padding: 10px; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <h1>{os.path.basename(python_file)} コードドキュメント</h1>
        
        <h2>概要</h2>
        <p>このドキュメントは自動生成されており、コードの構造と動作を視覚的に表現しています。</p>
        
        <h2>クラス構造</h2>
        <div class="diagram">
            <img src="class_diagram.svg" alt="クラス図" style="max-width: 100%;">
        </div>
        
        <h2>制御フロー</h2>
        <div class="diagram">
            <img src="flow_diagram.svg" alt="フロー図" style="max-width: 100%;">
        </div>
        
        <h2>関数呼び出し関係</h2>
        <div class="diagram">
            <img src="call_diagram.svg" alt="呼び出し図" style="max-width: 100%;">
        </div>
        
        <h2>クラス一覧</h2>
    """
    
    # クラス情報を追加
    for class_name, class_info in analysis_data.get('classes', {}).items():
        html_content += f"""
        <h3>{class_name}</h3>
        <p>継承: {', '.join(class_info.get('bases', []))}</p>
        
        <h4>属性:</h4>
        <ul>
        """
        
        for attr in class_info.get('attributes', []):
            html_content += f"<li>{attr['name']}</li>"
        
        html_content += "</ul><h4>メソッド:</h4><ul>"
        
        for method in class_info.get('methods', []):
            args = ', '.join(method.get('args', []))
            html_content += f"<li>{method['name']}({args})</li>"
        
        html_content += "</ul>"
    
    # 関数情報を追加
    html_content += "<h2>関数一覧</h2>"
    
    for func in analysis_data.get('functions', []):
        html_content += f"""
        <h3>{func['name']}</h3>
        <p>行: {func['line']}</p>
        <p>引数: {', '.join(func['args'])}</p>
        """
        
        if func.get('docstring'):
            html_content += f"<p>説明: {func['docstring']}</p>"
    
    # HTMLを閉じる
    html_content += """
    </body>
    </html>
    """
    
    # HTMLファイルに保存
    html_file = os.path.join(output_dir, "index.html")
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return html_file
```

### コード品質の可視化

静的解析ツールとDraw.ioを組み合わせて、コードの品質を視覚化できます。

```python
def visualize_code_quality(python_file):
    """コードの品質指標を可視化"""
    # 解析データを取得
    _, analysis_data = save_analysis_data(python_file)
    
    # クライアントを初期化
    client = DrawioAPIClient()
    diagram = client.create_diagram(title=f"{os.path.basename(python_file)} 品質指標")
    
    # 関数の複雑さを計算
    complexity_data = {}
    for func_info in analysis_data.get('functions', []):
        func_name = func_info['name']
        # 簡易的な複雑さの計算
        complexity = len(func_info.get('args', [])) + func_info.get('calls', [])
        complexity_data[func_name] = complexity
    
    # 複雑さをノードとして視覚化
    y_pos = 50
    for func_name, complexity in complexity_data.items():
        # 複雑さに基づいて色を決定
        if complexity < 3:
            color = "#d5e8d4"  # 緑（低複雑度）
            stroke = "#82b366"
        elif complexity < 6:
            color = "#fff2cc"  # 黄色（中複雑度）
            stroke = "#d6b656"
        else:
            color = "#f8cecc"  # 赤（高複雑度）
            stroke = "#b85450"
        
        # ノードを追加
        diagram = client.add_node(
            diagram,
            f"{func_name}\n複雑度: {complexity}",
            300,
            y_pos,
            180,
            60,
            f"rounded=1;whiteSpace=wrap;html=1;fillColor={color};strokeColor={stroke};"
        )
        
        y_pos += 80
    
    # 出力ファイル名を生成
    base_name = os.path.splitext(os.path.basename(python_file))[0]
    output_file = f"{base_name}_quality.drawio"
    
    # Draw.io形式で出力
    drawio_data = client.export_diagram(diagram, format="drawio")
    with open(output_file, "w") as f:
        f.write(drawio_data)
    
    # SVGでも出力
    client.export_to_image(diagram, f"{base_name}_quality.svg", format="svg")
    
    return output_file, diagram
```

## まとめ

本章では、プログラム解析の基本概念と、Pythonでのプログラム解析手法について学びました。特に、`ast`モジュールと`inspect`モジュールを使用したコード解析と、Draw.io APIを使用した解析結果の可視化に焦点を当てました。

主なポイントは以下の通りです：

1. プログラム解析の基本概念と種類（静的解析と動的解析）
2. Pythonの`ast`モジュールを使用した構文解析
3. 制御フロー解析と図表化の手法
4. 関数呼び出し関係の抽出と可視化
5. クラス構造の解析と図表化
6. 解析データの保存と共有
7. プログラム解析の実用的応用（コードドキュメントの自動生成、コード品質の可視化）

これらの技術を組み合わせることで、コードの理解、ドキュメント作成、品質管理、およびリファクタリングを支援する強力なツールを構築できます。次章では、これらの解析結果を使ってより高度なプログラム可視化技術を探求します。