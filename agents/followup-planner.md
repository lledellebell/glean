---
name: followup-planner
phase: 1
parallel: true
---

# Followup Planner Agent

Plan next steps and identify follow-up tasks.

## Purpose

- Identify incomplete work
- Prioritize next actions
- Track technical debt
- Suggest related improvements

## Priority Levels

| Priority | Description | Action |
|----------|-------------|--------|
| Critical | Blocking or broken | Must fix immediately |
| High | Important for next session | Do first next time |
| Medium | Should be done soon | Schedule within week |
| Low | Nice to have | When time permits |

## Prompt

```
Plan follow-up tasks based on this session.

## Session Summary
{{sessionSummary}}

## Completed Tasks
{{completedTasks}}

## TODOs Found in Code
{{todosInCode}}

## Analysis Tasks

1. **Incomplete Work**
   - What was started but not finished?
   - What features are partially implemented?
   - What tests need to be written?

2. **Next Priorities**
   - What should be done first next session?
   - What is blocking other work?
   - What are the quick wins?

3. **Technical Debt**
   - What code needs refactoring?
   - What workarounds were added?
   - What performance issues were noted?

4. **Related Improvements**
   - What features would complement this work?
   - What edge cases need handling?
   - What documentation should be added?

## Output Requirements

Return JSON:

```json
{
  "followups": [
    {
      "task": "Clear task description",
      "priority": "critical|high|medium|low",
      "reason": "Why this priority",
      "context": "Additional context",
      "estimate": "Rough time estimate",
      "blockedBy": ["other task"] | null,
      "blocks": ["dependent task"] | null,
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": {
    "total": 8,
    "byPriority": {
      "critical": 0,
      "high": 2,
      "medium": 4,
      "low": 2
    },
    "quickWins": ["task1", "task2"],
    "blockers": ["blocker1"]
  }
}
```

## Task Quality Guidelines

**Good task:**
- Specific and actionable
- Clear completion criteria
- Appropriate scope (not too big/small)

**Bad task:**
- Vague ("improve code")
- Too large ("rewrite everything")
- No clear end state
```

## Examples

### Session Context
```
Implemented user authentication with JWT.
- Login/logout working
- Cookie storage done
- Protected routes added

Noted:
- TODO: Add refresh token logic
- Password reset not implemented
- No rate limiting on login
- Tests not written
```

### Output
```json
{
  "followups": [
    {
      "task": "Add refresh token rotation",
      "priority": "high",
      "reason": "Security best practice, JWT expires in 15min without it",
      "context": "Current implementation uses single access token with 15min expiry",
      "estimate": "1-2 hours",
      "blockedBy": null,
      "blocks": null,
      "tags": ["auth", "security", "jwt"]
    },
    {
      "task": "Implement password reset flow",
      "priority": "high",
      "reason": "Essential user feature, currently no recovery option",
      "context": "Need email service integration",
      "estimate": "2-3 hours",
      "blockedBy": ["email service setup"],
      "blocks": null,
      "tags": ["auth", "feature"]
    },
    {
      "task": "Add rate limiting to auth endpoints",
      "priority": "medium",
      "reason": "Prevent brute force attacks",
      "context": "Consider using upstash/ratelimit or similar",
      "estimate": "1 hour",
      "blockedBy": null,
      "blocks": null,
      "tags": ["security", "auth"]
    },
    {
      "task": "Write authentication tests",
      "priority": "medium",
      "reason": "No test coverage for critical auth flow",
      "context": "Test login, logout, protected routes, token refresh",
      "estimate": "2 hours",
      "blockedBy": null,
      "blocks": null,
      "tags": ["testing", "auth"]
    },
    {
      "task": "Set up email service for transactional emails",
      "priority": "medium",
      "reason": "Needed for password reset and notifications",
      "context": "Consider Resend, SendGrid, or AWS SES",
      "estimate": "1 hour",
      "blockedBy": null,
      "blocks": ["password reset flow"],
      "tags": ["infrastructure", "email"]
    },
    {
      "task": "Add remember me functionality",
      "priority": "low",
      "reason": "Nice UX improvement",
      "context": "Extend token expiry or use persistent sessions",
      "estimate": "30 min",
      "blockedBy": null,
      "blocks": null,
      "tags": ["auth", "ux"]
    }
  ],
  "summary": {
    "total": 6,
    "byPriority": {
      "critical": 0,
      "high": 2,
      "medium": 3,
      "low": 1
    },
    "quickWins": ["Add rate limiting to auth endpoints"],
    "blockers": ["Set up email service for transactional emails"]
  }
}
```
