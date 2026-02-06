# PR Title
<!-- Use a clear, action-oriented title. Example: "Add Sheets importer validation + rollback" -->

## Summary
<!-- What does this PR change? Keep it short. -->

## Why
<!-- Why is this needed? Link to MVP scope / checklist item(s). -->

## Scope (What’s included)
- 

## Out of Scope (Explicitly NOT included)
- 

## Related Issues
- Closes #
- Related #

---

# MVP Guardrails (Must confirm)
- [ ] This PR does **not** introduce semantic grading or scoring.
- [ ] This PR does **not** expand into open-ended free chat.
- [ ] This PR does **not** add payments/subscriptions.
- [ ] This PR does **not** add a CMS-like admin panel.

---

# Checklist Mapping (tick what this PR touches)
## 🔐 Access & Basics
- [ ] Auth (signup/login/logout)
- [ ] Landing → CTA → signup/login
- [ ] Mobile responsiveness

## 📚 Lessons & Content (Sheets)
- [ ] Sheets template documented
- [ ] Manual import trigger
- [ ] Validation errors are clear
- [ ] Failed import does not affect active content
- [ ] Import log exists

## 🎙️ Speaking Practice (Controlled)
- [ ] Push-to-talk reliable
- [ ] STT returns transcript
- [ ] Clear outcome: pass/retry
- [ ] Retry has short reason
- [ ] Low-quality audio → asks retry

## 🧠 Evaluation (MVP Scope)
- [ ] Required words check
- [ ] Basic word order
- [ ] Pronunciation via STT confidence (proxy)
- [ ] Meaning check only in clear cases
- [ ] AI does not change grading

## 💬 AI Feedback & Coaching
- [ ] Feedback is short and relevant
- [ ] No detailed explanations in guided convo
- [ ] Tone is stable/friendly
- [ ] JSON/schema enforcement prevents broken replies

## 🗣️ Guided Conversational Practice
- [ ] 3–5 predefined questions per session
- [ ] User answers freely
- [ ] Acknowledgement
- [ ] Recast only for obvious taught-material errors
- [ ] No grading/score/branching
- [ ] No AI-generated new questions
- [ ] Clear conversation close

## 🧾 Logging & Silent Memory
- [ ] Every turn logged (input/outcome/feedback)
- [ ] Logs are internal only (debug/UX)
- [ ] Logs not presented as student evaluation

## 📊 Usage Reports
- [ ] DAU/WAU or basic metrics
- [ ] Time / sessions
- [ ] Lesson completion
- [ ] Aggregated reports only
- [ ] No per-student evaluation
- [ ] Founder read-only view or weekly summary

## ✉️ Email Reminders
- [ ] Opt-in mechanism
- [ ] Daily/weekly reminders
- [ ] No complex personalization

## 🛠️ Internal / Admin (Limited)
- [ ] Hidden admin screen protected (allowlist)
- [ ] Only includes: import trigger + usage reports
- [ ] Does not resemble CMS/admin panel

## ⚙️ Stability & Quality
- [ ] Error states covered (STT fail, LLM fail)
- [ ] Timeouts/retries handled
- [ ] No critical bugs in primary flows
- [ ] Ready for 30–50 beta users (if this was a release PR)

---

# Implementation Notes
<!-- Anything reviewers should know: migrations, env vars, breaking changes, etc. -->

## Env / Config Changes
- [ ] None
- [ ] Yes (describe below)

If yes:
- New env vars:
  - ``
- Updated env vars:
  - ``

## DB / Migrations
- [ ] None
- [ ] Yes (describe below)

If yes:
- Migration name(s):
  - ``

---

# Testing
## Automated
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Snapshot/Golden tests added/updated (LLM schema)

## Manual (required for UX changes)
- [ ] Mobile Safari
- [ ] Mobile Chrome
- [ ] Desktop Chrome
- [ ] Slow network / flaky mic scenario (if relevant)

## Evidence
<!-- Add screenshots, short screen recordings, or logs. -->
- 

---

# Rollback Plan
<!-- What happens if this goes wrong in prod? -->
- [ ] No rollback needed (safe change)
- [ ] Revert PR
- [ ] Disable feature flag / switch
- [ ] Other:

Details:
- 