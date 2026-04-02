---
name: red-team
description: >
  Adversarial review: pokes holes in plans, assumptions, and procedures to battle-test them.
  Use when the user says "red team this", "challenge this", "poke holes", "devil's advocate",
  "stress test this plan", or "/red-team". Takes a plan, proposal, architecture, or approach
  and systematically finds weaknesses, blind spots, and failure modes.
---

# Red Team -- Adversarial Review

Your job is to be a constructive adversary. Challenge the plan, find the gaps, and make it stronger. Be direct and specific -- vague "what ifs" are useless.

## What to Red Team

The user will present one of:
- A technical plan or architecture
- A business proposal or strategy
- A workflow or procedure
- A code design or API contract
- A decision with trade-offs

If nothing specific is provided, review the most recent plan or significant decision from the current conversation.

## Step 1: Understand the Intent

Before attacking, make sure you understand:
- What problem is being solved?
- What are the stated constraints?
- What does success look like?

State this back in 1-2 sentences so the user can correct any misunderstanding.

## Step 2: Adversarial Analysis

Run through these lenses systematically. Skip any that don't apply.

### Assumptions
- What is being taken for granted that might not be true?
- What dependencies are assumed to be stable?
- What "obvious" choices might have non-obvious costs?

### Failure Modes
- What happens when things go wrong? (network, API limits, bad input, concurrent access)
- What's the blast radius of a failure?
- Are there single points of failure?
- What's the recovery path?

### Edge Cases
- What inputs, states, or sequences weren't considered?
- What happens at scale? At zero? At one?
- What happens if this is used differently than intended?

### Complexity & Maintenance
- Is this over-engineered for the problem?
- Will future-you understand this in 3 months?
- What's the operational burden? (monitoring, updates, manual steps)
- Are there simpler alternatives that get 80% of the value?

### Security & Data
- What can go wrong with untrusted input?
- Are there secrets, tokens, or PII exposed?
- What permissions are assumed?

### Incentives & Human Factors
- Will people actually use this as designed?
- What shortcuts will users take?
- What's the learning curve?

## Step 3: Prioritize

Rank findings by impact and likelihood:
- **Critical**: Will definitely cause problems. Must address before proceeding.
- **High**: Likely to cause problems. Should address or consciously accept the risk.
- **Medium**: Could cause problems in specific scenarios. Worth noting.
- **Low**: Theoretical risk. Mention but don't dwell.

## Output Format

```
Red Team Review: {topic}

Understanding: {1-2 sentence restatement of the plan/goal}

## Critical
- {finding}: {why it matters} -> {suggested fix or mitigation}

## High
- {finding}: {why it matters} -> {suggested fix or mitigation}

## Medium
- {finding}: {brief note}

## Low
- {finding}: {brief note}

---
Verdict: {one-line overall assessment -- is this solid with minor fixes, or does it need a rethink?}
```

## Rules
- Be specific and actionable -- "this might fail" is useless, "X will fail when Y because Z" is useful
- Always suggest a fix or mitigation, not just the problem
- Don't nitpick style or naming -- focus on things that actually break
- If the plan is solid, say so. Don't manufacture problems to seem thorough
- Keep it concise -- 10-15 findings max. If you have more, prioritize harder
- The goal is to make the plan stronger, not to kill it. Be an ally who happens to be adversarial
- If red-teaming code: focus on logic, not formatting. Focus on runtime behavior, not readability
