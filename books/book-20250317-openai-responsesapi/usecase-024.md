---
title: "AIツール選択の精密制御：tool_choice機能の活用"
---

# AIツール選択の精密制御：tool_choice機能の活用

## 概要

AIアシスタントが外部ツールと連携する際、どのツールをいつ使用するかを適切に制御することは、効果的なAIシステム構築の鍵となります。OpenAI Responses APIの「ツール選択制御（tool_choice）」機能は、AIがツールを使用するかどうか、またどのツールを使用するかを明示的に制御できる強力な機能です。本ユースケースでは、この機能の仕組みと実装方法、そして様々なビジネスシーンでの活用例を紹介します。

従来のAIシステムでは、ツールの選択はAIモデル自身に委ねられていました。これは多くの場合で適切に機能しますが、特定のシナリオでは、より精密な制御が必要になることがあります。例えば、必ずデータベースから最新情報を取得したい場合や、特定のツールのみを使用して処理を行いたい場合などです。tool_choice機能を使用することで、開発者はAIのツール選択プロセスを細かく制御し、より予測可能で一貫性のあるシステムを構築できます。

この機能は4つの主要なモードを提供しています：
- **auto**: AIが状況に応じて自律的にツールを選択（デフォルト）
- **required**: 必ずいずれかのツールを使用するよう強制
- **none**: ツールを一切使用せず、AIの知識のみで応答
- **specific**: 特定の指定されたツールのみを使用

これらのモードを適切に組み合わせることで、様々なユースケースに対応した柔軟なAIシステムを構築できます。

## 技術的解説

### ツール選択制御の仕組み

tool_choice機能の基本的な仕組みは以下の通りです：

1. **ツールの定義**: 利用可能なツール（関数）とそのパラメータをJSON Schemaで定義
2. **ツール選択モードの設定**: `tool_choice`パラメータに適切な値を設定
3. **AIによるツール選択**: 設定されたモードに基づいて、AIが適切なツールを選択（または選択しない）
4. **ツールの実行**: 選択されたツールを実行し、結果を取得
5. **最終応答の生成**: ツールの実行結果に基づいて、AIが最終的な応答を生成

この流れにより、開発者はAIのツール選択プロセスを細かく制御し、特定のユースケースに最適化されたシステムを構築できます。

### 各モードの詳細と実装例

#### 1. auto モード（デフォルト）

AIモデルが状況に応じて自律的にツールを使用するかどうか、どのツールを使用するかを判断します。これはデフォルトの動作で、多くの場合に適切な選択をしますが、確実性は保証されません。

```python
response = client.responses.create(
    model="gpt-4o",
    instructions="ユーザーの質問に答えるため、必要に応じてツールを使用してください。",
    input=user_input,
    tools=tools,
    tool_choice="auto"  # または省略可能（デフォルト値）
)
```

このモードでは、例えば「東京の天気を教えて」という質問に対して、AIは自動的に天気情報を取得するツールを選択します。一方、「日本の首都はどこですか」のような一般的な知識に関する質問では、ツールを使用せずに直接回答します。

#### 2. required モード

AIモデルに対して、必ずいずれかのツールを使用するよう指示します。ツールを使用せずに直接回答することを防ぎたい場合に有用です。

```python
response = client.responses.create(
    model="gpt-4o",
    instructions="ユーザーの質問に答えるため、必要に応じてツールを使用してください。",
    input=user_input,
    tools=tools,
    tool_choice="required"
)
```

このモードでは、例えば「日本の首都はどこですか」という一般的な知識に関する質問でも、AIは何らかのツールを使用しようとします。データベースから最新情報を常に取得したい場合や、AIの知識ではなく外部システムの情報に基づいて回答したい場合に適しています。

#### 3. none モード

AIモデルにツールを使用せずに応答を生成するよう指示します。ツールを定義していても、それらを使用せずにモデルの知識のみで回答します。

```python
response = client.responses.create(
    model="gpt-4o",
    instructions="ユーザーの質問に答えるため、必要に応じてツールを使用してください。",
    input=user_input,
    tools=tools,
    tool_choice="none"
)
```

このモードでは、例えば「東京の天気を教えて」という質問に対しても、AIは天気情報を取得するツールを使用せず、一般的な知識に基づいて「東京は四季があり、現在の季節によって天気が異なります」のような回答をします。AIの一般知識のみで回答したい場合や、ツールの使用コストを節約したい場合に適しています。

#### 4. specific モード

特定のツールのみを使用するようAIモデルに指示します。複数のツールが定義されていても、指定されたツールのみが使用されます。

```python
response = client.responses.create(
    model="gpt-4o",
    instructions="ユーザーの質問に答えるため、必要に応じてツールを使用してください。",
    input=user_input,
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}}
)
```

このモードでは、例えば「東京について教えて」という幅広い質問に対しても、AIは指定された「get_weather」ツールのみを使用して、天気情報だけを取得します。特定の情報のみを取得したい場合や、ユーザーが明示的に特定のデータソースを指定した場合に適しています。

### 実装例：旅行情報アシスタント

以下は、ツール選択制御を活用した旅行情報アシスタントの実装例です：

```python
def process_tool_call(client, user_input, tools, tool_choice_mode, specific_tool=None):
    """
    ツール呼び出しを実行し、ツールの結果を集約して最終回答を生成します。
    """
    # ツール選択モードに応じてtool_choiceを設定
    if tool_choice_mode == ToolChoiceMode.AUTO:
        tool_choice = "auto"
    elif tool_choice_mode == ToolChoiceMode.REQUIRED:
        tool_choice = "required"
    elif tool_choice_mode == ToolChoiceMode.NONE:
        tool_choice = "none"
    elif tool_choice_mode == ToolChoiceMode.SPECIFIC and specific_tool:
        tool_choice = {"type": "function", "function": {"name": specific_tool}}
    else:
        tool_choice = "auto"  # デフォルト

    # 最初のリクエスト
    response = client.responses.create(
        model="gpt-4o",
        instructions="ユーザーの質問に答えるため、必要に応じてツールを使用してください。",
        input=user_input,
        tools=tools,
        tool_choice=tool_choice,
        parallel_tool_calls=False,
    )

    # ツール呼び出しがなければ初回応答を返す
    function_calls = [msg for msg in response.output if msg.type == "function_call"]
    if not function_calls:
        return response.output_text

    # ツール呼び出しがある場合は処理
    outputs = []
    for fc in function_calls:
        args = json.loads(fc.arguments)

        # ツール関数を実行
        if fc.name == "get_weather":
            result = get_weather(**args)
        elif fc.name == "get_attractions":
            result = get_attractions(**args)
        elif fc.name == "get_hotels":
            result = get_hotels(**args)
        elif fc.name == "get_restaurants":
            result = get_restaurants(**args)
        else:
            result = {"error": "未実装の関数"}

        # ツール呼び出し結果を追加
        outputs.append(
            {
                "type": "function_call_output",
                "call_id": fc.call_id,
                "output": json.dumps(result, ensure_ascii=False),
            }
        )

    # 最終応答の生成
    final_response = client.responses.create(
        model="gpt-4o",
        instructions="ツールから取得した情報を整理して最終回答を生成してください。",
        input=outputs,
        previous_response_id=response.id,
    )

    return final_response.output_text
```

この実装では、ユーザーが選択したツール選択モードに基づいて、AIのツール選択を制御しています。例えば、「東京の観光スポットについて教えて」という質問に対して：

- **auto**モードでは、AIが自動的に`get_attractions`ツールを選択
- **required**モードでは、AIが必ず何らかのツール（おそらく`get_attractions`）を選択
- **none**モードでは、AIがツールを使用せずに一般的な知識に基づいて回答
- **specific**モードで`get_weather`を指定した場合、AIは質問内容に関わらず天気情報のみを取得

## ビジネス活用シナリオ

ツール選択制御機能は、様々なビジネスシーンで革新的な価値を生み出します：

### 1. 多機能カスタマーサポートシステム

顧客からの問い合わせ内容に応じて、適切なツール選択モードを動的に切り替えるカスタマーサポートシステムを構築できます：

```python
def handle_customer_inquiry(client, inquiry, customer_id):
    """顧客からの問い合わせを処理します。"""
    # 問い合わせの種類を分類
    inquiry_type = classify_inquiry(inquiry)
    
    # 問い合わせの種類に応じてツール選択モードを設定
    if inquiry_type == "account_info":
        # アカウント情報の問い合わせには必ずデータベースから最新情報を取得
        tool_choice = "required"
        instructions = "顧客のアカウント情報を必ずデータベースから取得して回答してください。"
    elif inquiry_type == "product_info":
        # 製品情報の問い合わせには製品データベースツールのみを使用
        tool_choice = {"type": "function", "function": {"name": "get_product_info"}}
        instructions = "製品情報データベースから情報を取得して回答してください。"
    elif inquiry_type == "general_question":
        # 一般的な質問にはAIの知識を活用
        tool_choice = "none"
        instructions = "一般的な知識に基づいて丁寧に回答してください。"
    elif inquiry_type == "complex_issue":
        # 複雑な問題には複数のツールを自動選択
        tool_choice = "auto"
        instructions = "必要に応じて適切なツールを使用し、包括的な回答を提供してください。"
    else:
        # デフォルトはautoモード
        tool_choice = "auto"
        instructions = "顧客の問い合わせに適切に対応してください。"
    
    # 顧客情報を取得（コンテキスト用）
    customer_info = get_customer_info(customer_id)
    
    # 応答を生成
    response = client.responses.create(
        model="gpt-4o",
        instructions=instructions,
        input=f"顧客情報: {json.dumps(customer_info, ensure_ascii=False)}\n\n問い合わせ: {inquiry}",
        tools=support_tools,
        tool_choice=tool_choice
    )
    
    return process_response(response)
```

このシナリオでは、問い合わせの種類に応じて最適なツール選択モードを動的に切り替えることで、より効率的で正確なカスタマーサポートを実現しています。アカウント情報のような最新性が重要なデータには必ずデータベースを参照し、一般的な質問にはAIの知識を活用するなど、状況に応じた最適な対応が可能になります。

### 2. 医療診断支援システム

医療診断支援において、診断プロセスの各段階に応じて適切なツール選択モードを使い分けることで、より安全で効果的な診断支援が可能になります：

```python
def medical_diagnosis_assistant(client, patient_info, symptoms, stage):
    """医療診断支援を行います。"""
    # 診断ステージに応じてツール選択モードを設定
    if stage == "initial_assessment":
        # 初期評価段階では、症状から可能性のある疾患を広く検討
        tool_choice = {"type": "function", "function": {"name": "search_possible_conditions"}}
        instructions = "患者の症状から考えられる疾患を広く検索してください。"
    elif stage == "differential_diagnosis":
        # 鑑別診断段階では、複数のツールを組み合わせて詳細な分析
        tool_choice = "auto"
        instructions = "可能性のある疾患について、詳細な鑑別診断を行ってください。"
    elif stage == "test_recommendation":
        # 検査推奨段階では、必ず検査データベースを参照
        tool_choice = "required"
        instructions = "考えられる疾患を確認するための適切な検査を推奨してください。"
    elif stage == "treatment_planning":
        # 治療計画段階では、治療ガイドラインツールのみを使用
        tool_choice = {"type": "function", "function": {"name": "get_treatment_guidelines"}}
        instructions = "診断に基づいた治療計画を提案してください。"
    elif stage == "patient_explanation":
        # 患者説明段階では、ツールを使わず医学的知識に基づいて説明
        tool_choice = "none"
        instructions = "診断と治療計画を患者が理解しやすいように説明してください。"
    else:
        # デフォルトはautoモード
        tool_choice = "auto"
        instructions = "医学的知識と必要なツールを活用して支援を行ってください。"
    
    # 応答を生成
    response = client.responses.create(
        model="gpt-4o",
        instructions=instructions,
        input=f"患者情報: {json.dumps(patient_info, ensure_ascii=False)}\n\n症状: {symptoms}",
        tools=medical_tools,
        tool_choice=tool_choice
    )
    
    return process_medical_response(response)
```

このシナリオでは、診断プロセスの各段階に応じて最適なツール選択モードを使い分けることで、より体系的で安全な診断支援を実現しています。初期評価では幅広い可能性を検討し、鑑別診断では複数のツールを組み合わせ、治療計画では最新のガイドラインを参照するなど、各段階に適した情報源を活用できます。

### 3. パーソナライズされた教育アシスタント

学習者の特性や学習段階に応じて、適切なツール選択モードを切り替える教育アシスタントを構築できます：

```python
def educational_assistant(client, student_profile, question, learning_stage):
    """教育支援を行います。"""
    # 学習段階に応じてツール選択モードを設定
    if learning_stage == "concept_introduction":
        # 概念紹介段階では、基本的な説明をAIの知識で提供
        tool_choice = "none"
        instructions = "概念を初心者にもわかりやすく説明してください。"
    elif learning_stage == "guided_practice":
        # 誘導練習段階では、特定の問題解決ツールを使用
        tool_choice = {"type": "function", "function": {"name": "solve_step_by_step"}}
        instructions = "問題の解き方を段階的に説明してください。"
    elif learning_stage == "assessment":
        # 評価段階では、必ず問題データベースを参照
        tool_choice = "required"
        instructions = "学習者の理解度を評価するための適切な問題を提供してください。"
    elif learning_stage == "advanced_exploration":
        # 発展的探究段階では、複数のツールを自動選択
        tool_choice = "auto"
        instructions = "発展的な内容について、必要に応じて様々なリソースを活用して説明してください。"
    else:
        # デフォルトはautoモード
        tool_choice = "auto"
        instructions = "学習者の質問に適切に対応してください。"
    
    # 学習者の過去の学習履歴を取得（コンテキスト用）
    learning_history = get_learning_history(student_profile["id"])
    
    # 応答を生成
    response = client.responses.create(
        model="gpt-4o",
        instructions=instructions,
        input=f"学習者プロファイル: {json.dumps(student_profile, ensure_ascii=False)}\n\n学習履歴: {json.dumps(learning_history, ensure_ascii=False)}\n\n質問: {question}",
        tools=educational_tools,
        tool_choice=tool_choice
    )
    
    return process_educational_response(response)
```

このシナリオでは、学習段階に応じて最適なツール選択モードを切り替えることで、より効果的な教育支援を実現しています。概念紹介ではAIの説明能力を活用し、誘導練習では段階的な問題解決ツールを使用し、評価では適切な問題を提供するなど、学習プロセスの各段階に適したアプローチを採用できます。

### 4. インテリジェントな検索システム

ユーザーの検索意図に応じて、適切なツール選択モードを切り替える検索システムを構築できます：

```python
def intelligent_search(client, query, user_preferences):
    """インテリジェントな検索を行います。"""
    # 検索クエリを分析して意図を特定
    search_intent = analyze_search_intent(query)
    
    # 検索意図に応じてツール選択モードを設定
    if search_intent == "factual_query":
        # 事実確認クエリには、信頼性の高いデータベースを必ず参照
        tool_choice = "required"
        instructions = "信頼性の高い情報源から正確な事実を提供してください。"
    elif search_intent == "opinion_query":
        # 意見を求めるクエリには、AIの判断を活用
        tool_choice = "none"
        instructions = "様々な視点を考慮しながら、バランスの取れた見解を提供してください。"
    elif search_intent == "specific_source_query":
        # 特定の情報源を指定するクエリには、その情報源のみを使用
        source = extract_requested_source(query)
        tool_choice = {"type": "function", "function": {"name": f"search_{source}"}}
        instructions = f"{source}からの情報を提供してください。"
    elif search_intent == "comprehensive_query":
        # 包括的な情報を求めるクエリには、複数の情報源を自動選択
        tool_choice = "auto"
        instructions = "複数の情報源から包括的な情報を収集して提供してください。"
    else:
        # デフォルトはautoモード
        tool_choice = "auto"
        instructions = "ユーザーの検索クエリに最適な情報を提供してください。"
    
    # ユーザーの過去の検索履歴を取得（コンテキスト用）
    search_history = get_search_history(user_preferences["id"])
    
    # 応答を生成
    response = client.responses.create(
        model="gpt-4o",
        instructions=instructions,
        input=f"ユーザー設定: {json.dumps(user_preferences, ensure_ascii=False)}\n\n検索履歴: {json.dumps(search_history, ensure_ascii=False)}\n\n検索クエリ: {query}",
        tools=search_tools,
        tool_choice=tool_choice
    )
    
    return process_search_response(response)
```

このシナリオでは、検索意図に応じて最適なツール選択モードを切り替えることで、より関連性の高い検索結果を提供しています。事実確認には信頼性の高いデータベースを必ず参照し、意見を求める質問にはAIの判断を活用し、特定の情報源を指定する場合にはその情報源のみを使用するなど、検索意図に適した情報提供が可能になります。

## 実装上の注意点

ツール選択制御機能を実装する際の主な注意点は以下の通りです：

### 1. 適切なモード選択

各ツール選択モードには、それぞれ適した使用シナリオがあります。適切なモードを選択するための指針は以下の通りです：

```python
def determine_tool_choice_mode(query_context):
    """クエリコンテキストに基づいて適切なツール選択モードを決定します。"""
    # 最新のデータが必須の場合
    if query_context.get("requires_latest_data", False):
        return "required"
    
    # 特定のデータソースが指定されている場合
    if specific_source := query_context.get("specific_source"):
        return {"type": "function", "function": {"name": specific_source}}
    
    # AIの一般知識で十分な場合
    if query_context.get("general_knowledge_sufficient", False):
        return "none"
    
    # 複雑なクエリで複数のツールが必要な可能性がある場合
    if query_context.get("complexity", 0) > 7:
        return "auto"
    
    # デフォルトはautoモード
    return "auto"
```

### 2. エラーハンドリング

特に`required`モードと`specific`モードでは、適切なエラーハンドリングが重要です：

```python
def handle_tool_call_with_fallback(client, user_input, tools, tool_choice):
    """ツール呼び出しを実行し、エラー時にはフォールバック処理を行います。"""
    try:
        # 通常のツール呼び出し処理
        response = client.responses.create(
            model="gpt-4o",
            instructions="ユーザーの質問に答えるため、必要に応じてツールを使用してください。",
            input=user_input,
            tools=tools,
            tool_choice=tool_choice
        )
        
        # ツール呼び出しの処理
        function_calls = [msg for msg in response.output if msg.type == "function_call"]
        if function_calls:
            # ツール呼び出し結果の処理
            # ...
            return final_response
        else:
            # ツール呼び出しがない場合（requiredモードでエラーの可能性）
            if tool_choice == "required":
                # フォールバック処理
                return handle_required_mode_failure(client, user_input, tools)
            else:
                return response.output_text
    except Exception as e:
        # エラー発生時のフォールバック処理
        return handle_tool_call_error(client, user_input, tools, str(e))
```

### 3. ユーザー体験の最適化

ツール選択モードがユーザー体験に与える影響を考慮し、適切なフィードバックを提供することが重要です：

```python
def optimize_user_experience(response, tool_choice_mode):
    """ツール選択モードに応じてユーザー体験を最適化します。"""
    # 応答テキストを取得
    response_text = response.output_text
    
    # ツール選択モードに応じた追加情報
    if tool_choice_mode == "required" and not any(msg.type == "function_call" for msg in response.output):
        # requiredモードでツール呼び出しがない場合（エラー）
        response_text += "\n\n注: システムは最新のデータを取得しようとしましたが、現在利用できません。上記の情報はAIの一般的な知識に基づいています。"
    
    elif tool_choice_mode == "none":
        # noneモードの場合
        response_text += "\n\n注: この回答はAIの一般的な知識に基づいています。最新の情報については、公式情報源をご確認ください。"
    
    elif isinstance(tool_choice_mode, dict) and tool_choice_mode.get("type") == "function":
        # specificモードの場合
        tool_name = tool_choice_mode.get("function", {}).get("name", "")
        if tool_name:
            response_text += f"\n\n注: この回答は{get_tool_display_name(tool_name)}から取得した情報に基づいています。"
    
    return response_text
```

### 4. パフォーマンスの最適化

ツール選択モードがシステムのパフォーマンスに与える影響を考慮し、適切な最適化を行うことが重要です：

```python
def optimize_performance(query_context, available_tools):
    """クエリコンテキストに基づいてパフォーマンスを最適化します。"""
    # 必要なツールのみを含めることでパフォーマンスを向上
    if specific_source := query_context.get("specific_source"):
        # 特定のツールのみが必要な場合は、そのツールのみを含める
        required_tools = [tool for tool in available_tools if tool["name"] == specific_source]
        tool_choice = {"type": "function", "function": {"name": specific_source}}
    elif query_context.get("general_knowledge_sufficient", False):
        # AIの一般知識で十分な場合は、ツールを含めない（空のリスト）
        required_tools = []
        tool_choice = "none"
    else:
        # それ以外の場合は、すべてのツールを含める
        required_tools = available_tools
        tool_choice = "auto"
    
    return required_tools, tool_choice
```

### 5. 一貫性の確保

複数のリクエストにわたって一貫したツール選択モードを維持することが重要です：

```python
def maintain_consistency(session_context, query):
    """セッション全体で一貫したツール選択モードを維持します。"""
    # 現在のセッションコンテキストを取得
    current_mode = session_context.get("tool_choice_mode", "auto")
    
    # セッションの状態に基づいてモードを更新するかどうかを判断
    if "switch_to_database" in query.lower():
        # ユーザーがデータベース参照を明示的に要求
        new_mode = "required"
    elif "use_your_knowledge" in query.lower():
        # ユーザーがAIの知識を使用するよう明示的に要求
        new_mode = "none"
    elif "use_specific_tool" in query.lower():
        # ユーザーが特定のツールを使用するよう明示的に要求
        tool_name = extract_tool_name(query)
        if tool_name:
            new_mode = {"type": "function", "function": {"name": tool_name}}
        else:
            new_mode = current_mode
    else:
        # 明示的な要求がない場合は現在のモードを維持
        new_mode = current_mode
    
    # 更新されたセッションコンテキストを返す
    updated_context = session_context.copy()
    updated_context["tool_choice_mode"] = new_mode
    return updated_context
```

## まとめ

ツール選択制御（tool_choice）機能は、OpenAI Responses APIの強力な機能の一つです。この機能により：

- AIがツールを使用するかどうか、どのツールを使用するかを明示的に制御できる
- 特定のユースケースに最適化されたAIシステムを構築できる
- より予測可能で一貫性のあるユーザー体験を提供できる
- システムのパフォーマンスと効率を最適化できる

が実現できます。ビジネスコンテキストでは、この機能を活用することで：

- 多機能カスタマーサポートシステム
- 医療診断支援システム
- パーソナライズされた教育アシスタント
- インテリジェントな検索システム

などの革新的なアプリケーションを構築できます。

ツール選択制御機能は、AIと外部システムの連携をより精密に制御するための重要な技術です。適切なモード選択とエラーハンドリング、ユーザー体験の最適化を組み合わせることで、様々な業界やユースケースで革新的なソリューションを提供できるでしょう。

AIと外部システムの連携は、今後のAI活用の中心的なトレンドとなることが予想されます。ツール選択制御機能を活用することで、AIの可能性をさらに広げ、より実用的で価値のあるアプリケーションを構築できるようになります。
