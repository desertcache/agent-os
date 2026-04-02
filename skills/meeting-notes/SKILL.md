---
name: meeting-notes
description: Process meeting notes into structured format with action items
---

# Meeting Notes Skill

When invoked with `/meeting-notes`, transform meeting transcripts or rough notes into structured documentation with extracted action items.

## When to Use

- After a meeting with stakeholders
- Processing voice memo transcripts
- Converting rough notes into actionable items
- Preparing meeting summaries for follow-up

## Input Types Supported

1. **Voice transcripts** - Raw transcription text
2. **Rough notes** - Bullet points or stream of consciousness
3. **Chat logs** - Copied from video calls
4. **Memory** - Summarize from conversation context

## Output Template

```markdown
---
date: YYYY-MM-DD
tags: [meeting, project-name]
related: [[Projects/ProjectName/README]]
---

# Meeting Notes: [Meeting Title]

**Date:** [date]
**Attendees:** [names]
**Project:** [project name]
**Duration:** [if known]

---

## Summary
[2-3 sentence overview of what was discussed and decided]

## Key Discussions

### [Topic 1]
- [Point discussed]
- [Decision made or question raised]
- [Outcome]

### [Topic 2]
- [Point discussed]
- [Decision made or question raised]
- [Outcome]

## Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| [what was decided] | [why] | [who owns it] |

## Action Items

### Immediate (This Week)
- [ ] **[Owner]:** [Action item]
- [ ] **[Owner]:** [Action item]

### Waiting On Others
- [ ] **[Person]:** [What they need to provide]
- [ ] **[Person]:** [What they need to provide]

### Future (Can Wait)
- [ ] [Action item for later]

## Credentials/Access Needed
[If any credentials or access was discussed]

| Item | From Whom | For What |
|------|-----------|----------|
| [credential] | [person] | [purpose] |

## Follow-Up Required

**Email to send:**
- To: [recipients]
- Subject: [suggested subject]
- Include: [key points to mention]

**Next Meeting:** [date/time if scheduled]

## Questions/Clarifications Needed
- [Question that came up but wasn't resolved]
- [Thing that needs verification]

## Raw Notes
<details>
<summary>Original input (click to expand)</summary>

[Paste original transcript/notes here for reference]

</details>
```

## Execution Steps

1. **Parse input** - Accept transcript, notes, or summarize from conversation

2. **Extract entities:**
   - People mentioned
   - Dates and deadlines
   - Technical terms or project names
   - Credentials or access discussed

3. **Identify action items:**
   - Tasks assigned to specific people
   - Things waiting on external input
   - Decisions that need to be made

4. **Categorize urgency:**
   - Immediate (this week)
   - Waiting on others
   - Future/can wait

5. **Generate output** in template format

6. **Save to vault** at appropriate location:
   - `Sessions/YYYY-MM-DD-meeting-project.md` for session-type meetings
   - `Projects/Name/meetings/YYYY-MM-DD.md` for project-specific meetings

7. **Update related STATUS.md** if blockers or deadlines changed

## Follow-Up Actions

After processing meeting notes, offer to:

1. **Draft follow-up email** summarizing action items
2. **Update project STATUS.md** with new blockers/deadlines
3. **Create tasks** in relevant tracking system
4. **Update CREDENTIALS_NEEDED.md** if new credentials mentioned

## Email Draft Format

When drafting follow-up emails:

```
Subject: [Meeting] - Summary & Action Items - [Date]

Hi [names],

Thanks for meeting today. Here's a quick summary:

**Discussed:**
- [Key point 1]
- [Key point 2]

**Action Items:**
- [Person]: [Task]
- [Person]: [Task]

**Waiting on:**
- [Item needed from someone]

**Next Steps:**
[What happens next]

Let me know if I missed anything.

Best,
[Your name]
```

Keep emails:
- Plain text (Gmail-ready)
- Concise but complete
- Action-oriented
- Professional but friendly
