# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPOS is an AI-assisted Greek language tutor MVP focused on speaking practice with natural, supportive feedback. The AI acts as a **coach/conversational partner**, not a judge or authoritative evaluator.

**Target:** Soft beta of 30-50 users
**Success Metrics:** Engagement (15-min lesson completion, repeat usage, low drop-off)

## Current State

This repository is in the **planning-complete, pre-implementation** phase. All product decisions, scope, and architecture are defined in documentation. No source code exists yet. Implementation follows the milestone roadmap in `epos-github-milestones-issues.md`.

## Tech Stack (Planned)

- **Next.js App Router** — full-stack serverless, TypeScript, Tailwind CSS
- **ESLint + Prettier** for code quality
- **Google Sheets** as content source (manual import trigger)
- **STT (Speech-to-Text)** — provider TBD, integrated via API routes
- **LLM** — constrained via JSON schema / function calling, via API routes
- No separate backend until migration triggers are hit (streaming voice, heavy background jobs, queues)

## Core Architecture Principles

### AI Rails-Based Design
All LLM interactions follow strict rails:
- **JSON schema enforcement** / function calling for all LLM outputs
- **Role separation**: Analyzer (deterministic, rule-guided, no LLM) vs Coach (feedback, encouragement, LLM-based but constrained)
- AI **never** invents flow, grading, or questions
- AI **never** changes the pass/retry evaluation outcome
- Invalid LLM output is rejected with a safe fallback message
- Goal: predictable UX and debuggability

### Evaluation Strategy (Conservative)
Speaking practice checks are rule-based and limited:
- Required/missing words
- Basic word order
- Pronunciation via STT confidence
- Meaning checks **only in clear, unambiguous cases**
- False positives (passing) are preferred over false negatives (failing)

### Data Model (Minimal)
Four MVP entities: **Lesson**, **Exercise**, **Attempt**, **Session**. No analytics fields, scoring, or proficiency tracking.

## Feature Boundaries

### In Scope (MVP)
1. **Controlled Speaking Practice** — push-to-talk, pass/retry outcomes, deterministic analyzer
2. **Guided Conversational Practice** — 3-5 predefined questions, free responses, optional recast, no grading/scoring/branching
3. **Silent Memory** — full interaction logging for debugging/UX analysis, never presented as "error tracking" or student evaluation
4. **Usage Reports** — engagement metrics only (active users, sessions, time spent, drop-off points)
5. **Content Import** — Google Sheets → manual trigger, validation before publish, failed imports don't affect live content
6. **Landing Page** — already implemented, out of scope for further work
7. **Email Reminders** — simple opt-in daily/weekly

### Explicitly Out of Scope (MVP)
- Fully open conversational AI
- Semantic grading or meaning understanding (unqualified)
- Phoneme-level pronunciation analysis
- CMS / full admin dashboard
- Student performance reports or reports to teachers
- Payments / subscriptions
- Native mobile apps

## Critical Vocabulary Rules

When writing code, comments, UI copy, or documentation:

**Avoid:** "evaluation" (without qualifier), "assessment", "semantic correction", "meaning understanding" (unqualified), "correctness score", "reports to teachers", "free conversation", "error log" (for Silent Memory)

**Use instead:** guided, conservative, feedback, reinforcement, coach, try again, guided conversational practice, Silent Memory

## Development Roadmap (Milestones)

Implementation order is defined in `epos-github-milestones-issues.md`:

- **M0:** Foundations & Guardrails (scope docs, acceptance checklist)
- **M1:** Architecture Skeleton (Next.js bootstrap, domain model, demo lesson seed, thin slice with mocked evaluation)
- **M2:** Controlled Speaking Practice (recording UI, audio upload, STT, deterministic analyzer, UI wiring)
- **M3:** LLM Rails & Coach Layer (JSON schemas/validators, coach prompt, failure handling, golden tests) — highest risk
- **M4:** Silent Memory & Observability (logging, internal viewer)
- **M5:** Guided Conversational Practice (predefined flow, coach behavior)
- **M6:** Content Pipeline (Sheets schema, import pipeline, internal trigger page)
- **M7:** Users & Onboarding (auth for beta scale, lightweight onboarding)
- **M8:** Usage Metrics (collection, internal dashboard)
- **M9:** Reminders & Beta Hardening (email reminders, rate limiting, QA checklist)

## PR Workflow

All PRs must use `.github/pull_request_template.md` which includes:
- MVP guardrail confirmations (no semantic grading, no free chat, no payments, no CMS)
- Checklist mapping to the final review checklist (`MVP-final-review-checklist.md`)
- Mobile testing requirements (Safari, Chrome)

## Reference Documents

- `canonical-context.md` — Complete product specification
- `decision-log.md` — 15 key decisions with rationale and implications
- `MVP.md` — Product constitution (intent, boundaries, philosophy). **In conflicts, this document wins over implementation details.**
- `MVP-final-review-checklist.md` — Binary QA checklist for release readiness
- `epos-github-milestones-issues.md` — Canonical GitHub issues with Definitions of Done

## Guiding Principle

> In the MVP, prefer something stable that keeps learners engaged over something "smart" that judges unreliably.

Product validation (does it work?) comes before pedagogical accuracy (does it teach correctly?).
