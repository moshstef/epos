# 📌 Canonical Context — EPOS AI Greek Tutor (MVP)

## 1. Product Goal
MVP for an **AI-assisted Greek language tutor**, web-based (mobile-friendly), focused on:
- speaking practice
- natural, supportive feedback
- stability and clearly defined scope

The MVP is intended for a **soft beta of ~30–50 users**.

---

## 2. Core Product Philosophy
- The AI is **not a “teacher that judges”**.
- The AI acts as a **coach / conversational partner**.
- MVP goal:  
  **validate that the experience works**, not to prove full pedagogical assessment accuracy.

---

## 3. Speaking Practice — Controlled (Core)
- Push-to-talk interaction
- Speech-to-Text (STT) → transcript
- Clear outcome:
  - `pass`
  - `retry` (with short reason)

### MVP Checks
- required / missing words
- basic word order
- pronunciation via STT confidence
- **limited meaning checks only in clear, unambiguous cases**

The AI **does not change** the grading outcome.

---

## 4. AI Feedback & Prompt Architecture
- Rails-based design
- JSON schema enforcement / function calling
- Role separation:
  - **Analyzer**: limited, rule-guided
  - **Coach**: feedback, encouragement, hints

Goal: **predictable UX and debuggability**.

---

## 5. Guided Conversational Practice (Reinforcement)
(Replaces “open-ended practice”)

- 3–5 **predefined questions** per lesson or weekly cycle
- The user may respond freely
- The AI:
  - provides short acknowledgement
  - applies **recast** only for obvious grammatical or morphological errors related to the taught material
  - **no detailed explanations**
  - proceeds to the next predefined question
- There is no:
  - grading
  - scoring
  - branching
  - AI-generated questions

Goal: **reinforcement and natural flow**, not evaluation.

---

## 6. Silent Memory (Logging)
- **Full interaction logging**:
  - user transcript
  - system feedback / recasts
  - outcomes
- Used for:
  - debugging
  - UX analysis
  - AI prompt improvement

⚠️ In the MVP this is **not presented as an “official error log.”**  
The data may be analyzed **after the fact** to extract insights.

---

## 7. Student Logs & Reports (Usage / Engagement)
In the MVP we measure **whether the product works**, not learning outcomes.

### Included
- active users
- sessions
- time spent
- lesson completion
- drop-off points

### Explicitly Excluded
- language proficiency evaluation
- per-student reports
- reports sent to teachers

---

## 8. Success KPIs (MVP)
- Lesson completion around ~15 minutes
- Repeat usage
- Low drop-off

> In the MVP we measure whether learners **stay and return**.  
> Learning accuracy metrics come later.

---

## 9. Lessons & Content Management
- **Google Sheets** as the source of truth
- Predefined template
- **Manual import trigger** via a hidden/internal admin screen
- Validation before publishing
- Failed imports **do not affect** live content

❌ No live sync  
❌ No CMS  
❌ No in-app editing

---

## 10. Internal / Admin Views (Limited)
Internal views exist only for:
- triggering Google Sheets imports
- viewing usage reports

This is **not** a full admin panel.

---

## 11. Email Reminders
- Simple daily / weekly reminders
- Opt-in
- No advanced personalization

---

## 12. Landing Page
- Next.js landing page
- Copy sourced from `landing-copy.md`
- Images from `/public/landing`
- Scroll-based, lightweight animations
- Basic SEO and accessibility

---

## 13. Backend & Infrastructure
- **Next.js full-stack (serverless)** for the MVP
- Covers:
  - STT / LLM calls
  - logging
  - usage reports
  - Google Sheets import
  - email reminders (cron)

Spring Boot is **not required** for the MVP.

### Migration Triggers
- streaming voice
- heavy background jobs
- queues / orchestration needs

---

## 14. Explicitly Out of Scope (MVP)
- fully open conversational AI
- semantic grading
- phoneme-level pronunciation analysis
- CMS / admin dashboard
- student performance reports
- payments / subscriptions
- native mobile apps

---

## 15. Dangerous Words to Avoid
- “evaluation” (without qualifier)
- “semantic correction”
- “meaning understanding” (unqualified)
- “reports to teachers”
- “free conversation”

Preferred wording:
- guided
- conservative
- usage / engagement
- feedback / reinforcement

---

## 16. Guiding Principle
> In the MVP, we prefer something stable that keeps learners engaged  
> over something “smart” that judges unreliably.

---

## 17. Open Questions (Intentionally Open)
- Will text-based exercises return?
- When (and if) fully open conversational AI is introduced?
- Which reports provide real value in Phase 2?

---

**Status:** Stable canonical context — ready to reference in chats, proposals, and the repository.
