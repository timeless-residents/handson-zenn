---
title: 環境構築とプロジェクトのセットアップ
---

この章では、Draw.io APIを活用したプロジェクトを開始するために必要な環境構築とセットアップ方法について詳しく解説します。最新のAIモデルであるClaude 3.7を活用したアプローチも紹介します。

## 開発環境の要件

Draw.io APIとPythonを組み合わせたプロジェクトを快適に進めるためには、以下の環境が必要です：

### 基本要件

- **Python**: バージョン3.7以上（3.9または3.10推奨）
- **仮想環境**: venv、virtualenv、Condaなどの仮想環境管理ツール
- **エディタ/IDE**: VS Code、PyCharm、Jupyterなど好みのエディタ
- **Git**: バージョン管理とサンプルコードの取得のため

### 追加ライブラリ（必要に応じて）

- **CairoSVG**: SVG形式からPNG、PDFなどのラスタ形式への変換
- **Pillow**: 画像処理ライブラリ
- **Anthropic Python SDK**: Claude 3.7 APIを利用する場合

## インストール手順

それでは、実際に環境を構築していきましょう。以下の手順に従って進めてください。

### Python環境のセットアップ

まず、Pythonがインストールされていることを確認します。ターミナルまたはコマンドプロンプトで以下のコマンドを実行してみましょう。

```bash
python --version
# または
python3 --version
```

バージョン3.7以上が表示されれば問題ありません。表示されないか、バージョンが古い場合は、[Python公式サイト](https://www.python.org/downloads/)から最新版をダウンロードしてインストールしてください。

### プロジェクトディレクトリの作成と仮想環境のセットアップ

プロジェクト用のディレクトリを作成し、その中に仮想環境を設定します。

```bash
# プロジェクトディレクトリを作成
mkdir drawio-api-project
cd drawio-api-project

# 仮想環境を作成
python -m venv venv

# 仮想環境を有効化
# Windows:
# venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

仮想環境が有効化されると、プロンプトの先頭に `(venv)` のように表示されます。

### 必要なライブラリのインストール

必要なライブラリをインストールします。まずは基本的なものから始めましょう。

```bash
# 基本的なライブラリをインストール
pip install requests jsonschema

# 画像変換用のライブラリをインストール（オプション）
pip install cairosvg Pillow

# Claude 3.7 APIを使用する場合（オプション）
pip install anthropic
```

必要なライブラリをインストールしたら、`requirements.txt` ファイルを作成して依存関係を記録しておくことをお勧めします。

```bash
# requirements.txtを作成
pip freeze > requirements.txt
```

### プロジェクト構造のセットアップ

効率的な開発のために、以下のようなプロジェクト構造を作成します。

```bash
# 必要なディレクトリ構造を作成
mkdir -p src/drawio_api
mkdir examples
mkdir tests
mkdir data
mkdir output
```

これで、以下のような構造が作成されます：

```
drawio-api-project/
├── venv/                  # 仮想環境
├── src/                   # ソースコード
│   └── drawio_api/        # メインパッケージ
├── examples/              # サンプルコード
├── tests/                 # テストコード
├── data/                  # 入力データ
├── output/                # 出力ファイル
└── requirements.txt       # 依存関係
```

## Claude 3.7の設定（オプション）

本書ではClaude 3.7のAPIを活用する例も紹介します。APIを利用するには、AnthropicのアカウントとAPIキーが必要です。

### APIキーの取得

1. [Anthropic公式サイト](https://www.anthropic.com/)にアクセスしてアカウントを作成します
2. APIキーの発行ページから新しいキーを生成します
3. 発行されたキーは安全な場所に保存してください（`.env`ファイルの使用を推奨）

### APIキーの管理

APIキーを安全に管理するために、`.env`ファイルを使用するのがおすすめです。

```bash
# .envファイルを作成
touch .env
```

`.env`ファイルに以下の内容を追加します：

```
ANTHROPIC_API_KEY=your_api_key_here
```

このファイルをバージョン管理から除外するために、`.gitignore`ファイルも作成しておきましょう：

```bash
# .gitignoreファイルを作成
echo ".env" > .gitignore
echo "venv/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pyc" >> .gitignore
echo "output/" >> .gitignore
```

### APIキーを読み込むユーティリティ関数

APIキーを安全に読み込むための簡単なユーティリティ関数を作成しておくと便利です。`src/utils.py`などのファイルを作成し、以下のコードを追加しましょう：

```python
"""ユーティリティ関数."""

import os
from dotenv import load_dotenv

def get_api_key():
    """環境変数からAnthropicのAPIキーを取得する."""
    load_dotenv()  # .envファイルから環境変数を読み込む
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "APIキーが見つかりません。.envファイルにANTHROPIC_API_KEYを設定してください。"
        )
    return api_key
```

この関数を使用するためには、`python-dotenv`ライブラリもインストールしておく必要があります：

```bash
pip install python-dotenv
pip freeze > requirements.txt  # requirements.txtを更新
```

## Draw.io APIクライアントの基本構造

Draw.ioは公式にAPIを公開しているわけではありませんが、内部形式を理解して操作するためのクライアントライブラリを作成することができます。以下に、基本的なAPIクライアントの構造を示します。

このコードを`src/drawio_api/__init__.py`に追加します：

```python
"""
Draw.io API package.
"""

__version__ = "0.1.0"
```

次に`src/drawio_api/client.py`ファイルを作成し、以下のコードを追加します：

```python
"""
Draw.io API client for programmatically creating and exporting diagrams.
"""

import json
import uuid
import base64
import os
from typing import Dict, List, Tuple, Union, Optional, Any


class DrawioAPIClient:
    """
    Client for working with Draw.io diagrams programmatically.
    """
    
    def __init__(self):
        """Initialize the Draw.io API client."""
        pass
    
    def create_diagram(self, title: str = "New Diagram") -> Dict[str, Any]:
        """
        Create a new empty diagram with the given title.
        
        Args:
            title: The title of the diagram
            
        Returns:
            A dictionary representing the diagram
        """
        # Create a basic diagram structure
        diagram = {
            "title": title,
            "cells": []
        }
        return diagram
    
    def add_node(self, diagram: Dict[str, Any], 
                 label: str, 
                 x: float, y: float, 
                 width: float, height: float,
                 style: str = "rounded=0;whiteSpace=wrap;html=1;") -> Dict[str, Any]:
        """
        Add a node to the diagram.
        
        Args:
            diagram: The diagram to add the node to
            label: The text to display in the node
            x: The x coordinate of the center of the node
            y: The y coordinate of the center of the node
            width: The width of the node
            height: The height of the node
            style: The style string for the node
            
        Returns:
            The updated diagram
        """
        # Generate a unique ID for the node
        node_id = str(uuid.uuid4())
        
        # Create the node
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
        
        # Add the node to the diagram
        diagram["cells"].append(node)
        
        return diagram
    
    def add_edge(self, diagram: Dict[str, Any], 
                 source_id: str, target_id: str, 
                 label: str = "", 
                 style: str = "endArrow=classic;html=1;") -> Dict[str, Any]:
        """
        Add an edge between two nodes in the diagram.
        
        Args:
            diagram: The diagram to add the edge to
            source_id: The ID of the source node
            target_id: The ID of the target node
            label: The text to display on the edge
            style: The style string for the edge
            
        Returns:
            The updated diagram
        """
        # Generate a unique ID for the edge
        edge_id = str(uuid.uuid4())
        
        # Create the edge
        edge = {
            "id": edge_id,
            "value": label,
            "style": style,
            "source": source_id,
            "target": target_id,
            "edge": True
        }
        
        # Add the edge to the diagram
        diagram["cells"].append(edge)
        
        return diagram
    
    def export_diagram(self, diagram: Dict[str, Any]) -> str:
        """
        Export the diagram to a JSON string.
        
        Args:
            diagram: The diagram to export
            
        Returns:
            A JSON string representing the diagram
        """
        return json.dumps(diagram, indent=2)
```

このAPIクライアントは、基本的な図表の作成と操作のための機能を提供します。これから本書を通じて、このクライアントに多くの機能を追加していきます。

## Pythonパッケージとしてのセットアップ

作成したコードをPythonパッケージとして使えるようにするために、`setup.py`ファイルを作成します。

```python
"""
Setup script for the drawio-api package.
"""

from setuptools import setup, find_packages

setup(
    name="drawio-api",
    version="0.1.0",
    description="A Python client for the Draw.io API.",
    author="Your Name",
    author_email="your.email@example.com",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "requests>=2.25.0",
        "jsonschema>=3.2.0",
    ],
    extras_require={
        "export": ["cairosvg>=2.5.2", "Pillow>=8.3.2"],
        "ai": ["anthropic>=0.5.0", "python-dotenv>=0.19.0"],
    },
    python_requires=">=3.7",
)
```

これで、開発モードでパッケージをインストールすることができます：

```bash
# 開発モードでパッケージをインストール
pip install -e .
```

## 簡単なテストスクリプト

環境が正しく設定されているかを確認するために、簡単なテストスクリプトを作成しましょう。`examples/hello_diagram.py`というファイルを作成し、以下のコードを追加します：

```python
"""
A simple test script to verify that the Draw.io API client is working.
"""

from drawio_api.client import DrawioAPIClient

def main():
    """Create a simple test diagram."""
    # Create a new client
    client = DrawioAPIClient()
    
    # Create a new diagram
    diagram = client.create_diagram(title="Hello Diagram")
    
    # Add a node
    diagram = client.add_node(
        diagram,
        "Hello, Draw.io API!",
        100,
        100,
        200,
        50,
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    
    # Export the diagram
    diagram_json = client.export_diagram(diagram)
    
    # Print the diagram JSON
    print(diagram_json)
    
    # Save to file
    with open("output/hello_diagram.json", "w") as f:
        f.write(diagram_json)
    
    print("Diagram saved to output/hello_diagram.json")


if __name__ == "__main__":
    main()
```

このスクリプトを実行して環境が正しく設定されているか確認しましょう：

```bash
python examples/hello_diagram.py
```

出力されたJSONファイルは、次の章で図表の視覚化に使用します。

## Claude 3.7を活用したコード生成（オプション）

環境構築ができたところで、Claude 3.7を使ってDraw.io APIのコードを生成する簡単な例を試してみましょう。まず、`examples/claude_code_generation.py`ファイルを作成し、以下のコードを追加します：

```python
"""
Example of using Claude 3.7 to generate code for Draw.io API.
"""

import os
import json
import anthropic
from dotenv import load_dotenv

def get_api_key():
    """Get the Anthropic API key from environment variables."""
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "API key not found. Please set ANTHROPIC_API_KEY in your .env file."
        )
    return api_key

def generate_flowchart_code(description):
    """Generate Python code for a flowchart based on a description."""
    # Initialize the Anthropic client
    client = anthropic.Anthropic(api_key=get_api_key())
    
    # Construct the prompt
    prompt = f"""
    Please generate Python code that creates a flowchart using the DrawioAPIClient.
    
    The flowchart should represent this process:
    {description}
    
    The code should:
    1. Create a new diagram
    2. Add appropriate nodes for each step in the process
    3. Connect the nodes with edges
    4. Add labels to the edges where appropriate
    5. Apply appropriate styles to make the diagram visually clear
    
    Use this DrawioAPIClient class interface:
    
    ```python
    class DrawioAPIClient:
        def create_diagram(self, title: str = "New Diagram") -> Dict[str, Any]:
            # Creates a new diagram with the given title
            
        def add_node(self, diagram: Dict[str, Any], 
                     label: str, 
                     x: float, y: float, 
                     width: float, height: float,
                     style: str = "rounded=0;whiteSpace=wrap;html=1;") -> Dict[str, Any]:
            # Adds a node to the diagram
            
        def add_edge(self, diagram: Dict[str, Any], 
                     source_id: str, target_id: str, 
                     label: str = "", 
                     style: str = "endArrow=classic;html=1;") -> Dict[str, Any]:
            # Adds an edge between two nodes
            
        def export_diagram(self, diagram: Dict[str, Any]) -> str:
            # Exports the diagram to a JSON string
    ```
    
    Please provide the full Python code to create this flowchart.
    """
    
    # Generate the response
    response = client.messages.create(
        model="claude-3-7-sonnet-20240229",
        max_tokens=1500,
        temperature=0.2,
        system="You are a Python expert specializing in data visualization and diagram generation.",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    # Extract the code from the response
    return response.content[0].text

def main():
    """Generate and test code for a flowchart."""
    description = """
    A data processing pipeline that:
    1. Receives user input
    2. Validates the input
    3. If validation fails, returns an error message to the user
    4. If validation passes, processes the data
    5. Stores the results in a database
    6. Sends a confirmation message to the user
    """
    
    generated_code = generate_flowchart_code(description)
    
    # Print the generated code
    print("=== Generated Code ===")
    print(generated_code)
    
    # Save the generated code to a file
    with open("output/generated_flowchart.py", "w") as f:
        f.write(generated_code)
    
    print("\nCode saved to output/generated_flowchart.py")


if __name__ == "__main__":
    main()
```

APIキーが設定されていれば、このスクリプトを実行することでClaude 3.7を使ったコード生成を試すことができます：

```bash
python examples/claude_code_generation.py
```

生成されたコードは、データ処理パイプラインを表現するフローチャートを作成するものになります。これは本書の後半で扱うAI支援開発の先行例です。

## トラブルシューティング

環境構築中に問題が発生した場合のために、一般的な問題と解決策をいくつか紹介します。

### 仮想環境の問題

**問題**: 仮想環境の有効化に失敗する

**解決策**:
- Windows: `venv\Scripts\activate.bat`を実行してみる
- macOS/Linux: 権限の問題がある場合は`chmod +x venv/bin/activate`を実行してから再度試す

### パッケージのインストール問題

**問題**: `pip install`でエラーが発生する

**解決策**:
- pipを最新バージョンに更新: `pip install --upgrade pip`
- ネットワーク接続を確認
- プロキシ設定が必要な場合は適切に設定

### CairoSVGのインストール問題

**問題**: CairoSVGのインストールに失敗する

**解決策**:
- **Windows**: `pip install cairosvg` の前に必要なライブラリをインストール:
  ```bash
  pip install cairocffi
  ```
- **macOS**: Homebrewを使ってCairoをインストール:
  ```bash
  brew install cairo
  pip install cairosvg
  ```
- **Linux**: 必要なシステムライブラリをインストール:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install libcairo2-dev
  # Fedora/RHEL/CentOS
  sudo dnf install cairo-devel
  ```

### Anthropic APIアクセス問題

**問題**: Anthropic APIにアクセスできない

**解決策**:
- APIキーの形式を確認（正しいプレフィックスで始まっているか）
- `.env`ファイルが正しい場所（プロジェクトのルートディレクトリ）にあるか確認
- `python-dotenv`がインストールされていることを確認

## まとめ

これで、Draw.io APIを使ったプロジェクトの環境構築と基本的なセットアップが完了しました。この章では：

1. Python環境のセットアップ方法
2. 必要なライブラリのインストール方法
3. プロジェクト構造の作成方法
4. 基本的なDraw.io APIクライアントの実装
5. Claude 3.7 APIの設定方法（オプション）
6. パッケージングの方法
7. 簡単なテストスクリプトの作成方法

について学びました。

次の章では、Draw.ioの内部形式や図表の基本概念について詳しく学び、より高度な図表を作成するための基礎を築いていきます。

## 練習問題

1. 環境構築を完了し、`hello_diagram.py`スクリプトを実行して、正しく動作することを確認してください。

2. APIクライアントに`get_node_by_id`メソッドを追加して、ノードIDからノードを取得する機能を実装してみてください。

3. （オプション）Claude 3.7を使って、シンプルな組織図を作成するためのコードを生成してみてください。

4. API形式と型ヒントの確認：APIクライアントの各メソッドのドキュメント文字列と型ヒントを確認し、不足している部分があれば補完してください。

5. JSONファイルの検証：作成された`hello_diagram.json`ファイルを開き、その構造を理解してみてください。JSONの構造とDraw.ioのダイアグラム要素がどのように対応しているかをメモしておくと、次章以降の理解に役立ちます。