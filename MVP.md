# EPOS AI Greek Tutor — MVP Definition

## Purpose of This Document

This document defines the **intent, boundaries, and philosophy** of the EPOS AI Greek Tutor MVP.

It exists to:

- prevent scope drift
- align humans and AI agents on _what kind of product EPOS is_
- resolve ambiguity when a feature technically “works” but feels wrong

This is **not** a feature spec.
This is a **product constitution**.

If there is a conflict between this document and an implementation detail,
**this document wins**.

---

## 1. MVP Goal

The goal of the EPOS MVP is to **validate the learning experience**, not to prove pedagogical accuracy.

Success is measured by:

- whether users complete lessons
- whether they return
- whether the experience feels supportive, predictable, and motivating

The MVP does **not** aim to:

- accurately measure language proficiency
- fully understand user intent or meaning
- act as an authoritative evaluator of Greek

> In the MVP, we prefer something _stable and encouraging_
> over something _smart but unreliable_.

---

## 2. Core Product Philosophy

### Coach, Not Judge

The AI in EPOS acts as a **coach and practice partner**, not a teacher that judges correctness.

This means:

- the system avoids authoritative language
- feedback is conservative and supportive
- ambiguity is resolved in favor of the learner

The AI should never feel like an examiner, grader, or authority.

---

## 3. Speaking Practice — Core Experience

Speaking practice is **controlled and structured**.

The flow is:

1. The user is given a clear speaking prompt
2. The user speaks (push-to-talk)
3. The system returns one of two outcomes:
   - `pass`
   - `retry` (with a short, factual reason)

### Evaluation Philosophy

Evaluation in the MVP is intentionally **conservative**.

Allowed checks:

- required / missing words
- basic word order
- pronunciation proxies via STT confidence
- _limited meaning checks only in clear, unambiguous cases_

Important principles:

- False positives (passing) are preferred over false negatives (failing)
- If the system is unsure, it should **not fail the learner**
- The AI does not “understand Greek” in a human sense and should not imply that it does

The AI **never changes** the pass/retry outcome.

---

## 4. AI Architecture Principles

### Rails-Based Design

All AI behavior is constrained via **explicit rails**, including:

- role separation (Analyzer vs Coach)
- strict JSON schema enforcement
- deterministic logic where possible

LLMs are **not allowed** to:

- invent new questions
- change exercise flow
- introduce grading or scoring
- contradict deterministic evaluation logic

Predictability and debuggability are more important than creativity.

---

## 5. Guided Conversational Practice (Reinforcement)

The MVP includes **guided conversational practice**, not free conversation.

Characteristics:

- 3–5 predefined questions per lesson or cycle
- users may respond freely
- the AI provides:
  - short acknowledgement
  - optional recast for obvious errors related to taught material

- the system then proceeds to the next predefined question

Explicitly excluded:

- grading or scoring
- pass/fail logic
- branching conversations
- AI-generated questions

The purpose is **confidence and reinforcement**, not assessment.

---

## 6. Silent Memory (Logging)

All interactions are logged as **Silent Memory**.

This includes:

- user transcripts
- system feedback and recasts
- outcomes and timestamps

Silent Memory is used for:

- debugging
- UX analysis
- improving prompts and flows

Silent Memory is **not**:

- an official error record
- a student performance report
- something presented to learners as evaluation history

The system must avoid framing logs as “mistakes” or “errors.”

---

## 7. Metrics and Success Criteria

The MVP measures **engagement**, not learning outcomes.

Included metrics:

- active users
- sessions
- time spent
- lesson completion
- drop-off points

Explicitly excluded:

- proficiency scores
- accuracy percentages
- per-student performance reports
- reports to teachers or third parties

---

## 8. Content Management

Lessons and exercises are managed via **Google Sheets**.

Key principles:

- predefined template
- manual import only
- validation before publishing
- failed imports must not affect live content

Explicitly excluded:

- live sync
- CMS
- in-app lesson editing

---

## 9. Explicitly Out of Scope (MVP)

The following are **not part of the MVP**, even if technically feasible:

- fully open conversational AI
- semantic grading or deep meaning analysis
- phoneme-level pronunciation analysis
- student performance reports
- teacher dashboards
- CMS or admin systems beyond basic internal tools
- payments or subscriptions
- native mobile apps

These may be explored in later phases.

---

## 10. Language & Framing Rules

Certain words and framings are intentionally avoided in the MVP because they imply authority or accuracy the system does not guarantee.

Avoid:

- “evaluation” (without qualification)
- “assessment”
- “semantic understanding”
- “correctness score”
- “free conversation”

Prefer:

- guided
- conservative
- feedback
- reinforcement
- try again

---

## 11. Relationship to the Acceptance Checklist

The acceptance checklist enforces the rules described in this document.

- The checklist is used to approve or reject implementations
- This document defines the _spirit and intent_ behind those rules

If there is ambiguity:

- this document should be consulted first
- when in doubt, default to **supportive, conservative behavior**

---

## 12. Guiding Principle (Summary)

> EPOS MVP is not about proving how smart the AI is.
> It is about creating a learning experience where users feel safe, encouraged,
> and motivated to keep speaking Greek.

---
