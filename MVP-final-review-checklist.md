# **EPOS MVP \- Final Review Checklist**

## **🔐 Access & Basics**

- [ ] Login / Auth λειτουργεί (signup, login, logout)
- [ ] Landing page φορτώνει σωστά & CTA οδηγεί σε signup/login
- [ ] App είναι usable σε mobile (responsive)

---

## **📚 Lessons & Content**

- [ ] Google Sheets template είναι τελικό και documented
- [ ] Import από Google Sheets δουλεύει με **manual trigger**
- [ ] Validation απορρίπτει λάθος format με σαφή μηνύματα
- [ ] Failed import **δεν επηρεάζει** το ενεργό περιεχόμενο
- [ ] Υπάρχει import log (timestamp, success/fail)

---

## **🎙️ Speaking Practice (Controlled)**

- [ ] Push-to-talk λειτουργεί αξιόπιστα
- [ ] STT επιστρέφει transcript
- [ ] Υπάρχει σαφές outcome: **pass / retry**
- [ ] Retry δίνει σύντομη αιτία
- [ ] Χαμηλή ποιότητα ήχου → ζητά επανάληψη

---

## **🧠 Evaluation (MVP Scope)**

- [ ] Έλεγχος απαιτούμενων λέξεων
- [ ] Βασική σειρά λέξεων
- [ ] Προφορά μέσω STT confidence
- [ ] Meaning check **μόνο** σε ξεκάθαρες περιπτώσεις
- [ ] Το AI **δεν** αλλάζει το grading

---

## **💬 AI Feedback & Coaching**

- [ ] Feedback είναι σύντομο και σχετικό με τον στόχο
- [ ] Δεν υπάρχουν αναλυτικές εξηγήσεις στο guided convo
- [ ] Tone είναι φιλικό και σταθερό
- [ ] JSON/schema enforcement αποτρέπει “σπασμένες” απαντήσεις

---

## **🗣️ Guided Conversational Practice (Reinforcement)**

- [ ] 3–5 **προκαθορισμένες** ερωτήσεις ανά session
- [ ] Ο χρήστης απαντά ελεύθερα
- [ ] AI δίνει acknowledgement
- [ ] AI κάνει **recast** μόνο σε προφανή λάθη της ύλης
- [ ] **Χωρίς** grading / score / branching
- [ ] **Χωρίς** AI-generated νέες ερωτήσεις
- [ ] Σαφές κλείσιμο συνομιλίας

---

## **🧾 Logging & Silent Memory**

- [ ] Καταγράφεται κάθε turn (user input, outcome, feedback)
- [ ] Logs χρησιμοποιούνται μόνο εσωτερικά (debug/UX)
- [ ] **Δεν** παρουσιάζονται ως αξιολόγηση μαθητή

---

## **📊 Usage Reports (Engagement)**

- [ ] DAU/WAU ή αντίστοιχα βασικά metrics
- [ ] Χρόνος χρήσης / sessions
- [ ] Lesson completion
- [ ] Reports είναι **aggregated**
- [ ] Δεν υπάρχει per-student evaluation
- [ ] Founder read-only view ή weekly summary λειτουργεί

---

##

## **✉️ Email Reminders**

- [ ] Opt-in mechanism λειτουργεί
- [ ] Daily/weekly reminders στέλνονται σωστά
- [ ] Χωρίς σύνθετη προσωποποίηση

---

## **🛠️ Internal / Admin (Limited)**

- [ ] Κρυφή admin οθόνη προστατευμένη (allowlist)
- [ ] Περιλαμβάνει μόνο:  
       - [ ] Import trigger  
       - [ ] Usage reports
- [ ] **Δεν** μοιάζει με CMS / admin panel

---

## **⚙️ Stability & Quality**

- [ ] Βασικά error states καλύπτονται (STT fail, LLM fail)
- [ ] Timeouts / retries χειρίζονται σωστά
- [ ] No critical bugs σε βασικά flows
- [ ] Έτοιμο για 30–50 beta users

---

## **🚫 Out of Scope (Double-check)**

- [ ] Δεν υπάρχουν payments / subscriptions
- [ ] Δεν υπάρχει admin CMS
- [ ] Δεν υπάρχει semantic grading
- [ ] Δεν υπάρχει phoneme-level pronunciation
- [ ] Δεν υπάρχει fully open conversational AI

---

## **🏁 Final Sign-off**

- [ ] Acceptance Criteria έχουν καλυφθεί
- [ ] Known limitations είναι documented
- [ ] Founder έχει δει demo & συμφωνεί
- [ ] MVP χαρακτηρίζεται **“Ready for Soft Beta”**

---
