---
allowed-tools: Read, Glob, Grep
description: Recall saved information from memory
---

# /recall - Retrieve from Memory

Search and retrieve previously saved information.

## Usage

```bash
/recall                      # Show recent memories
/recall react                # Search for "react"
/recall --tag=typescript     # Filter by tag
/recall --project            # Project-specific only
```

## Arguments

- `<query>` - Search term (optional)
- `--tag=<tag>` - Filter by tag
- `--project` - Only project-specific memories
- `--limit=<n>` - Max results (default: 10)
- `--all` - Show all memories

## Search Behavior

1. Exact match in content
2. Tag match
3. Fuzzy search in content
4. Sorted by relevance and access frequency

## Output

```
🧠 Memory Recall

Query: "react query"
Found: 3 memories

┌────────────────────────────────────────────────────┐
│ 1. React Query needs explicit invalidation         │
│    Tags: react-query, cache                        │
│    Created: 2 days ago │ Accessed: 5 times         │
├────────────────────────────────────────────────────┤
│ 2. Use queryClient.invalidateQueries() after mut.. │
│    Tags: react-query                               │
│    Created: 1 week ago │ Accessed: 3 times         │
├────────────────────────────────────────────────────┤
│ 3. React Query v5 changed the API signature        │
│    Tags: react-query, migration                    │
│    Created: 2 weeks ago │ Accessed: 1 time         │
└────────────────────────────────────────────────────┘

💡 Tip: Use /remember to add new memories
```

## Related Commands

- `/remember` - Save new memory
- `/forget` - Remove a memory
- `/memory stats` - Memory statistics
