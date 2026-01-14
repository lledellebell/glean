# Glean 🌾

> **AIコーディングセッションで学んだことを忘れない**

GleanはClaude Codeセッションから自動的に知識を収穫し、間隔反復を使って長期記憶に変換します。

[English](./README.md) | [Español](./README.es.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-61%20passing-brightgreen.svg)]()

## 問題

AIコーディングセッションが終わると、貴重な情報が消えてしまいます：

- 💡 発見したコードパターンと規約
- ⚠️ 犯したミスとその修正方法
- 📚 学んだコンセプト（来週には忘れる）
- 🔧 便利なコマンドとワークフロー

**Glean**はこれらすべてを自動的にキャプチャし、永続的に保持する手助けをします。

## 機能

### 🌾 セッションハーベスト

8つの専門AIエージェントが並列で実行し、コーディングセッションを分析：

| エージェント | 目的 |
|-------------|------|
| Session Analyzer | コアハーベストデータ生成 |
| Doc Analyzer | ドキュメント更新の提案 |
| Automation Finder | 自動化機会の検出 |
| Learning Extractor | 学習ポイントの抽出 |
| Followup Planner | 次のタスク計画 |
| Pattern Recognizer | コードパターン検出 |
| Mistake Analyzer | エラー/ミス分析 |
| Dedup Validator | 結果の重複排除 |

### 🧠 間隔反復

内蔵SM-2アルゴリズムが最適な間隔でレビューをスケジュール：

| 自信度 | 次のレビュー |
|--------|-------------|
| ⭐⭐⭐⭐⭐ | 30日 |
| ⭐⭐⭐⭐ | 14日 |
| ⭐⭐⭐ | 7日 |
| ⭐⭐ | 3日 |
| ⭐ | 1日 |

### 🔌 プラグインエコシステム

包括的なセッション管理のための12の機能プラグイン：

| プラグイン | 説明 |
|-----------|------|
| `/harvest` | セッション知識のハーベスト |
| `/insight` | パターンとインサイトの抽出 |
| `/learn` | 間隔反復学習 |
| `/memory` | 永続メモリ（remember/recall） |
| `/context` | セッションコンテキストの保存/復元 |
| `/plan` | タスクの計画と追跡 |
| `/pr` | プルリクエストワークフロー自動化 |
| `/review` | コードレビューヘルパー |
| `/history` | セッション履歴検索 |
| `/sync` | 外部ツール同期 |
| `/notify` | 通知管理 |
| `/stats` | セッション統計 |

### 🌉 ブリッジ連携

外部ツールと接続：

- **Obsidian** - インサイトをvaultにエクスポート
- **GitHub** - タスクからissueを作成
- **Notion** - 学習をデータベースに同期

## インストール

### 手動インストール

```bash
# プラグインディレクトリにクローン
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# または任意の場所にクローンして設定で参照
git clone https://github.com/lledellebell/glean.git ~/glean
```

### 設定

Claude Code設定に追加：

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## クイックスタート

```bash
# 1. Claude Codeでセッション開始
claude

# 2. 作業する...

# 3. セッション終了時に知識をハーベスト
/glean

# 4. 後で学習をレビュー
/learn review
```

## コマンド

### コアコマンド

```bash
/glean              # 現在のセッションをハーベスト（並列エージェント）
/glean --verbose    # 全エージェント結果を含む詳細出力

/harvest            # クイックナレッジハーベスト
/harvest --full     # 包括的分析

/insight            # インサイト抽出
/insight --type pattern   # パターンのみ
/insight --type mistake   # ミスのみ
```

### 学習コマンド

```bash
/learn add "React Queryはquery keyでキャッシュする"  # 学習追加
/learn list                                          # 学習一覧
/learn review                                        # レビューセッション開始
/learn quiz --topic react                            # クイズモード
```

### メモリコマンド

```bash
/remember "APIはレスポンスにcamelCaseを使用"  # メモリに保存
/recall api                                    # メモリを検索
```

## データストレージ

```
~/.glean/
├── harvests/     # セッションハーベストデータ（JSON）
├── insights/     # 抽出されたインサイト
├── learn/        # レビュースケジュール付き学習アイテム
├── contexts/     # 保存されたセッションコンテキスト
├── history/      # セッション履歴
└── config.json   # 設定
```

## コントリビュート

コントリビューションを歓迎します！[CONTRIBUTING.md](./CONTRIBUTING.md)を参照。

## ライセンス

MITライセンス - [LICENSE](./LICENSE)を参照

## 作者

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "昨日学んだことを今日覚えておく" 🧠

**Gleanが学習に役立ったら⭐をください！**
