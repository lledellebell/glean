# /learn - Learning Record Management

Record and track what you learn from sessions.

## Usage
```
/learn <command> [options]
```

## Subcommands

### add - Add Learning Record
```bash
/learn add "<content>" [--topic <topic>] [--source <source>]
```

### list - View Learning Records
```bash
/learn list [--topic <topic>] [--period <period>]
```

### review - Items Due for Review
```bash
/learn review [--count <n>]
```

### quiz - Quiz Mode
```bash
/learn quiz [--topic <topic>]
```

## Learning Record Structure

### Auto-collected (Session Analysis)
- Newly used APIs/libraries
- Errors resolved and solutions
- Discovered patterns and anti-patterns

### Manual Records
- Concept explanations
- Code snippets
- Reference links

## Learning Metadata

| Field | Description |
|-------|-------------|
| topic | Topic classification (react, typescript, git, etc.) |
| difficulty | Difficulty level (beginner, intermediate, advanced) |
| source | Source (docs, blog, experiment, etc.) |
| confidence | Understanding level (1-5) |
| lastReview | Last review date |

## Output Format

### Adding Learning
```
✅ Learning record added

📚 Difference between React Query staleTime vs cacheTime
🏷️ Topic: react-query
📊 Difficulty: intermediate
📅 Added: 2024-01-15

Related records:
- React Query basics (01-10)
- useQuery options (01-12)
```

### Learning List
```
## 📚 Learning Records

### This Week (5)

| Topic | Content | Confidence | Date |
|-------|---------|------------|------|
| react-query | staleTime vs cacheTime | ⭐⭐⭐⭐ | 01-15 |
| typescript | Conditional types | ⭐⭐⭐ | 01-14 |
| git | rebase vs merge | ⭐⭐⭐⭐⭐ | 01-13 |

### Distribution by Topic
- React (12)
- TypeScript (8)
- Git (5)
```

### Review Mode
```
## 🔄 Items Due for Review

### 1. TypeScript Conditional Types
📅 Last review: 7 days ago
📊 Confidence: ⭐⭐⭐

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

[Got it ✓] [Review again] [Show explanation]

---
Remaining items: 4
```

## Spaced Repetition

Auto-managed review schedule:
- Confidence 5: Review in 30 days
- Confidence 4: Review in 14 days
- Confidence 3: Review in 7 days
- Confidence 2: Review in 3 days
- Confidence 1: Review in 1 day

## Examples

```bash
# Add learning record
/learn add "React useCallback memoises function references" --topic react

# View by topic
/learn list --topic typescript

# This week's learnings
/learn list --period week

# Start review
/learn review

# Quiz mode
/learn quiz --topic react
```

## Data Storage
- Saved in `~/.glean/learn/`
- Classified by topic
- Markdown + JSON metadata

## Implementation Steps

### /learn add Implementation
```
1. Parse input (content, topic, difficulty, etc.)
2. Call learn-store.createLearnItem()
3. Set initial confidence 3, nextReview 7 days later
4. Save to ~/.glean/learn/learn-xxx.json
5. Output result
```

### /learn list Implementation
```
1. Call learn-store.getAllItems(filter)
2. Apply filters (topic, period, status)
3. Output in table format
4. Show stats by topic/difficulty
```

### /learn review Implementation
```
1. Call learn-store.getDueItems(limit)
2. Sort by priority (urgent → normal → low)
3. For each item:
   a. Display content
   b. Ask confidence with AskUserQuestion
   c. Call learn-store.completeReview(id, confidence)
   d. Show next review schedule
4. Show stats at session end
```

### /learn quiz Implementation
```
1. Filter items by topic
2. Present in random order
3. For each item:
   a. Show only title
   b. Ask "Explain" or "Code example?"
   c. Self-evaluate after revealing answer
4. Update confidence based on results
```

### Spaced Repetition Details

```javascript
// Using lib/spaced-repetition.js

// Calculate next schedule after review
const { nextReview, newEaseFactor } = calculateNextReview(
  newConfidence,  // 1-5
  lastReview,     // Last review date
  reviewCount,    // Review count
  easeFactor      // SM-2 difficulty factor
);

// Mastered condition
// 3 consecutive confidence 5 → status: 'mastered'
```

### Insight → Learning Conversion
```
With --to-learn option in /insight:
1. Filter learning type insights
2. Call learn-store.createFromInsight(insight)
3. insight-store.markAsConvertedToLearn(id, learnId)
```

## Related Commands
- `/harvest` - Auto-extract learnings from session
- `/insight` - Convert insights to learning records
- `/bridge` - External plugin integration
