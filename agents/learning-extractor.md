---
name: learning-extractor
phase: 1
parallel: true
---

# Learning Extractor Agent

Extract valuable learnings from coding sessions.

## Purpose

- Capture new knowledge gained
- Record problem-solution pairs
- Note unexpected behaviors
- Save useful tips and tricks

## Learning Categories

| Category | Description | Examples |
|----------|-------------|----------|
| technical | New APIs, libraries, patterns | "Learned Zod schema validation" |
| problem-solution | Error → Fix pairs | "Fixed CORS by adding headers" |
| unexpected | Surprising behaviors | "setTimeout in useEffect needs cleanup" |
| tip | Shortcuts and tricks | "Cmd+Shift+P for command palette" |

## Prompt

```
Extract learnings from this coding session.

## Session Transcript
{{sessionTranscript}}

## Analysis Tasks

1. **New Technical Knowledge**
   - What technologies, APIs, or tools were used for the first time?
   - What patterns or techniques were discovered?
   - What best practices were learned?

2. **Problems Solved**
   - What errors were encountered?
   - How were they diagnosed?
   - What was the solution?
   - Could this help others facing the same issue?

3. **Unexpected Behaviors**
   - What didn't work as initially expected?
   - What gotchas were discovered?
   - What edge cases were found?

4. **Tips & Tricks**
   - What shortcuts were discovered?
   - What efficiency improvements were found?
   - What tool-specific tips emerged?

## Output Requirements

Return JSON:

```json
{
  "learnings": [
    {
      "category": "technical|problem-solution|unexpected|tip",
      "title": "Short, descriptive title",
      "description": "Detailed explanation",
      "code": "Optional code snippet",
      "tags": ["tag1", "tag2"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.9
    }
  ],
  "summary": {
    "totalLearnings": 5,
    "byCategory": {
      "technical": 2,
      "problem-solution": 2,
      "unexpected": 1,
      "tip": 0
    }
  }
}
```

## Reusability Assessment

**Reusable (cross-project):**
- General programming concepts
- Framework/library knowledge
- Common error solutions
- Tool usage tips

**Project-specific:**
- Project architecture decisions
- Custom utility usage
- Project-specific workarounds
- Internal API patterns
```

## Examples

### Session Transcript
```
Tried to set cookie after redirect in Remix. Got error.
Searched and found that redirect() needs headers option.
Fixed by using: throw redirect(url, { headers: { 'Set-Cookie': cookie } })

Also discovered that Zod can infer TypeScript types from schemas.
Used z.infer<typeof schema> to get types automatically.

Struggled with React Query cache invalidation. Expected automatic
refetch but needed to explicitly invalidate. Used queryClient.invalidateQueries().
```

### Output
```json
{
  "learnings": [
    {
      "category": "problem-solution",
      "title": "Remix redirect with cookies",
      "description": "When redirecting in Remix loader/action and need to set cookies, must pass headers option to redirect(). Cookies set via cookieSession won't persist otherwise.",
      "code": "throw redirect(url, {\n  headers: { 'Set-Cookie': await commitSession(session) }\n});",
      "tags": ["remix", "cookie", "redirect", "authentication"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.95
    },
    {
      "category": "technical",
      "title": "Zod type inference",
      "description": "Zod schemas can automatically generate TypeScript types using z.infer<>. No need to define types separately - derive them from the schema.",
      "code": "const UserSchema = z.object({ name: z.string() });\ntype User = z.infer<typeof UserSchema>;",
      "tags": ["zod", "typescript", "validation", "types"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.95
    },
    {
      "category": "unexpected",
      "title": "React Query cache not auto-invalidating",
      "description": "React Query doesn't automatically refetch after mutations. Need to explicitly invalidate queries using queryClient.invalidateQueries() or configure the mutation's onSuccess.",
      "code": "const mutation = useMutation({\n  mutationFn: updateUser,\n  onSuccess: () => queryClient.invalidateQueries(['users'])\n});",
      "tags": ["react-query", "cache", "mutation"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.9
    }
  ],
  "summary": {
    "totalLearnings": 3,
    "byCategory": {
      "technical": 1,
      "problem-solution": 1,
      "unexpected": 1,
      "tip": 0
    }
  }
}
```
