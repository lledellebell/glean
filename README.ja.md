# Glean

> **AIコーディングセッションで学んだことを忘れない**

GleanはClaude Codeセッションから自動的に知識を収穫し、間隔反復を使って長期記憶に変換します。

[English](./README.md) | [Español](./README.es.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@lledellebell/glean.svg)](https://www.npmjs.com/package/@lledellebell/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 問題

AIコーディングセッションが終わると、貴重な情報が消えてしまいます：

- 発見したコードパターンと規約
- 犯したミスとその修正方法
- 学んだコンセプト（来週には忘れる）
- 便利なコマンドとワークフロー

**Glean**はこれらすべてを自動的にキャプチャし、永続的に保持する手助けをします。

## 機能

### セッションハーベスト

専門AIエージェントが並列で実行し、コーディングセッションを分析：

| エージェント | 目的 |
|-------------|------|
| Doc Analyzer | ドキュメント更新の提案 |
| Automation Finder | 自動化機会の検出 |
| Learning Extractor | 学習ポイントの抽出 |
| Followup Planner | 次のタスク計画 |
| Dedup Validator | 結果の重複排除 |

### 間隔反復

内蔵SM-2アルゴリズムが最適な間隔でレビューをスケジュール：

| 自信度 | 次のレビュー |
|--------|-------------|
| 5/5 | 30日 |
| 4/5 | 14日 |
| 3/5 | 7日 |
| 2/5 | 3日 |
| 1/5 | 1日 |

### プラグインエコシステム

包括的なセッション管理のための14の機能プラグイン：

| プラグイン | 説明 |
|-----------|------|
| `/harvest` | セッション知識のハーベスト |
| `/insight` | パターンとインサイトの抽出 |
| `/learn` | 間隔反復学習 |
| `/flashcard` | フラッシュカード復習（what/how/why） |
| `/growth` | 学習進捗の可視化 |
| `/memory` | 永続メモリ（remember/recall） |
| `/context` | セッションコンテキストの保存/復元 |
| `/plan` | タスクの計画と追跡 |
| `/pr` | プルリクエストワークフロー自動化 |
| `/review` | コードレビューヘルパー |
| `/history` | セッション履歴検索 |
| `/sync` | 外部ツール同期 |
| `/notify` | 通知管理 |
| `/stats` | セッション統計 |

### 自動アラート（Hooks）

Gleanは自動的にトリガーするインテリジェントなフックを提供：

| フック | トリガー | 説明 |
|--------|----------|------|
| **Deja-vu Alert** | セッション開始 | 類似エラーを検出し、過去の解決策を表示 |
| **Daily One-liner** | セッション終了 | 今日最も重要な学びを保存するよう促す |
| **Context Review** | セッション開始 | 現在のプロジェクトに関連する過去の学びを表示 |

### ブリッジ連携

外部ツールと接続：

- **Obsidian** - インサイトをvaultにエクスポート
- **GitHub** - タスクからissueを作成

## インストール

### npm（GitHub Packages）

```bash
npm install @lledellebell/glean
```

### 手動インストール

```bash
# プラグインディレクトリにクローン
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

## クイックスタート

```bash
# 1. Claude Codeでセッション開始
claude

# 2. 作業する...

# 3. セッション終了時に知識をハーベスト
/glean

# 4. 学習をレビュー
/learn review
# または
/flashcard
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

/flashcard                    # フラッシュカード復習
/flashcard --topic react      # トピックでフィルター
/flashcard --stats            # 統計を表示

/growth                       # 成長可視化
/growth --period=week         # 今週の進捗
/growth --quick               # クイックサマリー
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
├── daily/        # 日々の学び（one-liners）
├── contexts/     # 保存されたセッションコンテキスト
├── history/      # セッション履歴
└── config/       # 設定
```

## コントリビュート

コントリビューションを歓迎します！[CONTRIBUTING.md](./CONTRIBUTING.md)を参照。

## ライセンス

MITライセンス - [LICENSE](./LICENSE)を参照

## 作者

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "昨日学んだことを今日覚えておく"

**Gleanが学習に役立ったらスターをください！**
