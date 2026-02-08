# 🧭 Decision Log — EPOS AI Greek Tutor (MVP)

This document records key product and technical decisions made for the MVP, including rationale and scope implications.  
It serves as a reference to avoid scope drift and repeated discussions.

---

## D-001 — MVP Focus on Product Viability, Not Pedagogical Accuracy

**Decision:**  
The MVP measures whether the learning experience works (engagement, completion), not whether learning outcomes are objectively correct.

**Rationale:**  
Accurate language evaluation requires mature models and extensive validation. Early value comes from retention and usability.

**Implication:**  
Learning accuracy metrics are deferred to Phase 2.

---

## D-002 — AI Acts as Coach, Not Judge

**Decision:**  
The AI provides guidance, feedback, and encouragement, but does not act as the sole authority on correctness.

**Rationale:**  
LLMs are not deterministic or consistently accurate enough for authoritative grading in an MVP.

**Implication:**  
All evaluation is conservative and rule-assisted.

---

## D-003 — Conservative Evaluation Strategy

**Decision:**  
Evaluation is limited to:

- missing/required words
- basic word order
- pronunciation confidence via STT
- meaning checks only in clear, unambiguous cases

**Rationale:**  
Reduces false negatives and user frustration.

**Replaces:**  
Any notion of full semantic understanding in the MVP.

---

## D-004 — Rails-Based Prompt Architecture

**Decision:**  
All LLM outputs are constrained via rails:

- predefined roles (Analyzer / Coach)
- JSON schema enforcement / function calling

**Rationale:**  
Ensures predictable UX, debuggability, and safety.

**Implication:**  
LLM is never allowed to invent flow, grading, or questions.

---

## D-005 — Replace “Open-Ended Practice” with Guided Conversational Practice

**Decision:**  
Fully open-ended conversation is removed from the MVP.  
It is replaced with **Guided Conversational Practice**.

**Definition:**

- 3–5 predefined questions
- free user responses
- short acknowledgement
- optional recast for obvious errors
- no grading, scoring, or branching

**Rationale:**  
Preserves conversational feel without open-ended AI risk.

---

## D-006 — No Grading in Conversational Practice

**Decision:**  
Guided conversational practice has no pass/fail, score, or retry logic.

**Rationale:**  
The purpose is reinforcement and confidence, not assessment.

**Implication:**  
No correctness guarantees are implied.

---

## D-007 — Silent Memory Instead of “Error Logging”

**Decision:**  
All interactions are logged as **Silent Memory**, not as “recorded errors”.

**Rationale:**  
Avoids implying authoritative evaluation or pedagogical judgment.

**Implication:**  
Data can be analyzed later for insights, but is not presented as official error tracking.

---

## D-008 — Usage Reports Over Student Performance Reports

**Decision:**  
Reports focus on usage and engagement metrics only.

**Included:**

- active users
- session duration
- lesson completion
- drop-off points

**Excluded:**

- per-student evaluation
- learning performance reports
- reports to teachers

**Rationale:**  
Product validation precedes educational assessment.

---

## D-009 — Success Defined by Engagement KPIs

**Decision:**  
MVP success is defined by:

- ~15-minute lesson completion
- repeat usage
- low drop-off

**Rationale:**  
If learners stay and return, the experience works.

---

## D-010 — Google Sheets as Content Source

**Decision:**  
Lessons and exercises are managed via Google Sheets.

**Details:**

- predefined template
- manual import trigger
- validation before publish

**Rationale:**  
Avoids CMS complexity while giving full content control.

---

## D-011 — Manual Import, No Live Sync

**Decision:**  
Content import is manual-triggered only.

**Rationale:**  
Prevents accidental production breakage and reduces scope.

**Replaces:**  
Any expectation of real-time syncing or live editing.

---

## D-012 — Limited Internal Admin Views Only

**Decision:**  
Internal views exist only for:

- triggering imports
- viewing usage reports

**Rationale:**  
Supports operations without creating an admin product.

---

## D-013 — Next.js Full-Stack Backend for MVP

**Decision:**  
Use Next.js (serverless) as the backend for the MVP.

**Rationale:**  
Faster iteration, lower cost, sufficient for MVP scale.

**Migration Triggers:**

- streaming voice
- heavy background jobs
- queue-based workflows

---

## D-014 — Explicit MVP Exclusions

**Decision:**  
The following are explicitly excluded from the MVP:

- fully open conversational AI
- semantic grading
- phoneme-level pronunciation analysis
- CMS / admin dashboard
- payments / subscriptions
- native mobile apps

**Rationale:**  
Prevents scope creep and misaligned expectations.

---

## D-015 — English as Internal Working Language

**Decision:**  
Canonical context, decision log, and technical documentation are maintained in English.

**Rationale:**  
Supports tooling, future expansion, and collaboration.

---

## Status

This decision log is **active** and applies to the MVP.  
Any new feature or change must reference whether it:

- extends an existing decision, or
- introduces a new one.
