# EPOS AI Greek Tutor — GitHub Milestones & Issues (Canonical)

Landing Page: OUT OF SCOPE (already implemented)

---

## GLOBAL SCOPE GUARDS (READ FIRST)

- Landing page work is explicitly OUT OF SCOPE.
- MVP principles:
  - AI is a coach, not a judge
  - Conservative, rule-based checks only
  - Rails + JSON schema enforcement for all LLM output
  - Guided conversational practice (no free conversation)
  - Silent Memory logging (not “error logs”)
  - Google Sheets as content source (manual import)
  - Usage/engagement metrics only (no learning evaluation)
- Forbidden concepts:
  - semantic grading
  - authoritative evaluation
  - free-form chat
  - student performance reports
  - teacher dashboards

Each issue below includes its own Definition of Done (DoD).  
Claude should copy titles and descriptions verbatim into GitHub issues.

---

## Milestone 0 — Foundations & Guardrails (Non-Negotiable)

### Issue 0.1 — Create MVP scope document and non-goals

**Description**
Create `MVP.md` in the repo root defining:

- What EPOS is
- What EPOS is NOT
- Explicit non-goals
- Forbidden behaviors and “dangerous words” (judge, evaluate, semantic grading, free conversation)

**Definition of Done**

- `MVP.md` exists
- Non-goals section included
- Forbidden behaviors explicitly listed

---

### Issue 0.2 — Create MVP acceptance checklist

**Description**
Create `ACCEPTANCE_CHECKLIST.md` with binary (yes/no) items enforcing:

- Rails-based prompts
- Conservative evaluation
- Guided conversational practice
- Silent Memory logging
- Google Sheets manual import
- Engagement-only metrics

**Definition of Done**

- Checklist exists
- Each item is unambiguous and binary
- Used as merge gate for PRs

---

## Milestone 1 — Architecture Skeleton (Thin Slice First)

### Issue 1.1 — Project bootstrap (Next.js + TS + Tailwind + tooling)

**Description**
Initialize production-ready baseline:

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- `.env.example`
- Preview deployment works

**Definition of Done**

- App runs locally
- Lint and format pass
- Preview deploy succeeds

---

### Issue 1.2 — Define minimal domain model

**Description**
Create MVP-only data models:

- Lesson
- Exercise
- Attempt
- Session

Avoid analytics, scoring, or reporting fields.

**Definition of Done**

- DB schema/migrations applied
- Relations defined
- No extra fields beyond MVP needs

---

### Issue 1.3 — Create demo lesson seed

**Description**
Seed one demo lesson with:

- One speaking exercise
- Expected phrase
- Required words
- Allowed variants

**Definition of Done**

- Seed runs cleanly
- Demo lesson loads in app

---

### Issue 1.4 — Thin slice lesson flow (mocked evaluation)

**Description**
Implement end-to-end flow:
Lesson → exercise → submit → mocked pass/retry → persist attempt.

No audio, STT, or LLM yet.

**Definition of Done**

- User completes one exercise
- Attempt saved in DB
- Deterministic behavior

---

## Milestone 2 — Controlled Speaking Practice (Core)

## Issue 2.1 — Push-to-talk audio recording UI

**Description**
Implement a mobile-first push-to-talk recording experience that allows users to:

- start / stop recording
- optionally play back audio
- submit audio for evaluation

The UI must clearly communicate recording state and retry flows.

**Definition of Done**

- Works reliably on mobile Safari and Chrome
- Audio blob is available client-side
- Repeat recordings do not crash or leak resources

---

## Issue 2.2 — Audio upload API (forward audio to Deepgram, no storage)

**Description**
Create an API route that accepts recorded audio from the client and forwards the audio bytes directly to Deepgram for transcription.

**Requirements**

- Accept `multipart/form-data` or raw binary audio
- Enforce size and duration limits
- Handle timeouts and safe retries
- Forward audio **in-memory only** (no disk persistence by default)
- Return a stable response shape for downstream evaluation and logging

**Definition of Done**

- Upload works reliably on mobile Safari & Chrome
- Audio bytes are successfully forwarded to Deepgram
- Clear error responses for:
  - request too large
  - unsupported format
  - Deepgram timeout or failure
- No raw audio is stored server-side by default

**Notes**

- If debugging later requires audio retention, add a **separate opt-in issue** for short-lived storage (e.g. 24h) behind an environment flag.

---

## Issue 2.3 — Deepgram STT integration (bytes → transcript)

**Description**  
Integrate Deepgram pre-recorded transcription by sending uploaded audio bytes from the API route and returning:

- transcript text
- confidence score (if available)
- language metadata (if available)

Implement transcript normalization suitable for Greek evaluation:

- case normalization
- accent / diacritics handling
- punctuation stripping (as appropriate)

**Definition of Done**

- Same audio input → same normalized transcript
- Handles failure cases gracefully (silence, noise, partial speech)
- Latency acceptable for MVP UX (with retries/timeouts)
- Raw transcript and normalized transcript are both available, or normalization is deterministic and shared via a utility

---

## Issue 2.4 — Deterministic evaluation engine

**Description**  
Implement a rule-based evaluation engine that checks:

- required words
- allowed variants
- basic word order
- pronunciation proxy via STT confidence

Output must be strictly:

```json
{ "result": "pass" | "retry", "reason": "..." }
```

**Definition of Done**

- Deterministic behavior
- Unit tests for edge cases
- Output schema enforced
- AI feedback does not override evaluation

---

## Issue 2.5 — Audio upload limits, rate limiting, and cost protection

**Description**
Add safeguards to protect the STT pipeline from abuse, excessive cost, and accidental overload when forwarding audio directly to Deepgram.

**Requirements**

- Enforce maximum audio duration (e.g. 10–15 seconds)
- Enforce maximum payload size
- Rate-limit STT requests per user / IP
- Reject silent or near-silent audio early (if detectable)
- Ensure failures are fast and user-friendly

**Definition of Done**

- Large or long audio is rejected with a clear message
- Repeated rapid submissions are throttled
- Deepgram is not called for obviously invalid payloads
- Cost exposure is bounded for beta usage (30–50 users)

**Notes**

- Limits should be conservative for MVP
- Exact thresholds can be adjusted via environment variables

## Milestone 3 — LLM Rails & Coach Layer (Highest Risk)

### Issue 3.1 — Define JSON schemas and validators

**Description**
Create strict schemas for all LLM outputs and validation utilities.

**Definition of Done**

- Schemas defined centrally
- Invalid LLM output blocked
- Validation used in all LLM routes

---

### Issue 3.2 — Coach prompt and API route

**Description**
Implement Coach behavior:

- Encouragement and hints
- Optional recast
- Never changes pass/retry
- Never asks new questions

**Definition of Done**

- Output conforms to schema
- Cannot override analyzer
- Tone matches “coach, not judge”

---

### Issue 3.3 — LLM failure handling and fallback

**Description**
Handle:

- Timeouts
- Invalid schema
- Provider errors

Fallback must never block user progress.

**Definition of Done**

- Safe fallback message shown
- User can continue/retry
- Errors logged internally

---

### Issue 3.4 — Golden tests for rails

**Description**
Add regression tests:

- Pass case
- Retry case
- Ambiguous utterance
- Hallucination attempt

**Definition of Done**

- Tests run in CI
- Coach never overrides outcome

---

## Milestone 4 — Silent Memory & Observability

### Issue 4.1 — Silent Memory logging

**Description**
Log all interactions:

- Transcript
- Analyzer output
- Coach feedback
- Lesson/exercise IDs
- Timestamps

Never label as “errors”.

**Definition of Done**

- All attempts logged
- Terminology is “Silent Memory”
- No user-facing judgment language

---

### Issue 4.2 — Internal attempts viewer

**Description**
Minimal internal page:

- List/filter attempts
- View transcripts and outputs
- CSV export

**Definition of Done**

- Protected access
- Read-only
- Export works

---

## Milestone 5 — Guided Conversational Practice

### Issue 5.1 — Predefined conversation flow

**Description**
Implement guided conversation:

- 3–5 predefined questions
- Linear progression
- No AI-generated questions

**Definition of Done**

- Fixed flow
- Each turn logged
- No branching

---

### Issue 5.2 — Conversation coach behavior

**Description**
For each response:

- Short acknowledgement
- Optional recast (taught material only)
- Move to next question
- No grading

**Definition of Done**

- No correct/incorrect language
- No retry mechanics
- No chat loops

---

## Milestone 6 — Content Pipeline (Google Sheets)

### Issue 6.1 — Define Sheets schema

**Description**
Document Google Sheets template:

- Lessons
- Exercises
- Required words
- Variants
- Conversation prompts

**Definition of Done**

- Schema documented
- Sample sheet provided

---

### Issue 6.2 — Manual Sheets import pipeline

**Description**
Implement import:

- Manual trigger only
- Validation before publish
- Upsert + versioning
- Rollback on failure

**Definition of Done**

- Failed imports do not affect live content
- Validation feedback shown
- Versions tracked

---

### Issue 6.3 — Internal import trigger page

**Description**
Internal page with:

- “Run import” button
- Status and validation results

**Definition of Done**

- Protected route
- Clear success/failure feedback
- No CMS features

---

## Milestone 7 — Users & Onboarding (Delayed)

### Issue 7.1 — Authentication (beta-scale)

**Description**
Implement simple auth (magic link or OAuth) suitable for 30–50 users.

**Definition of Done**

- Users can sign in/out
- Internal routes protected
- No complex roles system

---

### Issue 7.2 — Lightweight onboarding

**Description**
Minimal onboarding so new users reach first spoken attempt in <2 minutes.

**Definition of Done**

- Fast path to first lesson
- Mobile-friendly
- No long forms

---

## Milestone 8 — Usage Metrics (Engagement Only)

### Issue 8.1 — Usage metrics collection

**Description**
Track:

- Active users
- Sessions
- Time spent
- Lesson completion
- Drop-offs

**Definition of Done**

- Metrics stored
- No learning or performance scoring

---

### Issue 8.2 — Internal usage dashboard

**Description**
Internal page showing engagement summaries.

**Definition of Done**

- Protected access
- Simple tables/charts
- Actionable insights

---

## Milestone 9 — Reminders & Beta Hardening

### Issue 9.1 — Opt-in email reminders

**Description**
Implement daily/weekly reminders with unsubscribe.

**Definition of Done**

- Opt-in respected
- Sends logged
- Easy unsubscribe

---

### Issue 9.2 — Rate limiting & cost protection

**Description**
Add rate limiting for:

- Audio uploads
- STT calls
- LLM calls

**Definition of Done**

- Limits enforced
- Friendly error messaging
- Cost protection in place

---

### Issue 9.3 — Beta QA checklist and rollback plan

**Description**
Document:

- Mobile QA matrix
- Common failure modes
- Rollback steps

**Definition of Done**

- `BETA_QA.md` exists
- Rollback steps documented
- Known issues tracked

---

## Notes for Claude (gh CLI Execution)

- Create milestones in the order listed.
- Create issues with the exact titles and descriptions.
- Apply labels as appropriate:
  `core`, `risk-high`, `rails`, `stt`, `content`, `logging`, `admin`, `analytics`, `onboarding`, `hardening`.
- Do NOT create landing page issues.

```

```
