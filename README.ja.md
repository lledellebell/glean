# Glean

> **AIコーディングセッションで学んだことを忘れない**

GleanはClaude Codeセッションから知識を自動的に収穫し、間隔反復学習で長期記憶に変換します。

[English](./README.md) | [Español](./README.es.md)

## なぜGlean？

AIコーディングセッションが終わると、貴重な情報が失われます：

- 発見したコードパターンと規約
- 犯したミスとその修正方法
- 学んだ概念（来週には忘れてしまう）

**Glean**はこれらすべてを自動的にキャプチャし、永続的に記憶するのを助けます。

## 主な機能

### `/glean` - セッションハーベスター

並列エージェントでセッションを分析し、価値ある知識を抽出します。

```bash
/glean              # 現在のセッションを収穫
/glean --verbose    # 詳細出力
```

### `/harvest` - 知識収集

コーディングセッションからインサイトを収集します。

```bash
/harvest            # クイック収穫
/harvest --full     # 包括的な分析
```

### 間隔反復学習

内蔵のSM-2アルゴリズムが最適な間隔で復習をスケジュール：

| 理解度 | 次の復習 |
|--------|----------|
| ⭐⭐⭐⭐⭐ | 30日後 |
| ⭐⭐⭐⭐ | 14日後 |
| ⭐⭐⭐ | 7日後 |
| ⭐⭐ | 3日後 |
| ⭐ | 1日後 |

## インストール

### Claude Codeマーケットプレイスから

```bash
/install glean
```

### 手動インストール

```bash
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

## クイックスタート

```bash
# 1. セッション終了時に知識を収穫
/glean

# 2. 提案を確認
# 3. 学んだことを適用
```

## データ保存場所

```
~/.glean/
├── harvests/     # セッション収穫データ
├── insights/     # 抽出されたインサイト
└── config.json   # 設定
```

## コントリビューション

ガイドラインは[CONTRIBUTING.md](./CONTRIBUTING.md)をご覧ください。

## ライセンス

MITライセンス - [LICENSE](./LICENSE)を参照

## 作者

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> 「昨日学んだことを今日も覚えていよう」 🧠
