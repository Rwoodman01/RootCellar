# Rootcellar Simplification Audit

**Verdict: Simplify.**

The data spine is right. The module boundaries are right. The rhythm idea (Daily Bread / Weekly Huddle) is the product. But the surface is roughly 3× louder than it needs to be, and the loudness is measurable: 63 routes, an 8-item bottom nav, and a dashboard that answers "where do I go?" three different ways on one screen. Nothing here needs a rebuild. It needs a quieter house.

---

## 1. One-page diagnosis

**What Rootcellar actually is:** a daily table where the homestead's work shows up, five quiet rooms where its memory lives, and one weekly ritual where the family decides what's next. That's it. Three kinds of thing: **the table, the rooms, the ritual.**

**What the code currently says it is:** eight equal peer modules, each with its own overview page, its own stat strips, its own 8–12 subpages, all promoted equally in two navigation systems and a dashboard. The app is structured like the org chart of the codebase (`src/modules/*`), not like a day on a homestead.

**The core confusion:** Daily Bread and Weekly Huddle are registered in `moduleRegistry.ts` as modules alongside Pantry and Garden. They are not modules. They are the *rhythm* — the reason the modules exist. When the rhythm is listed as card #1 of 8, it competes with its own inputs. A homesteader opening the app at 6:40am with a coffee and 12 minutes doesn't want a map of the property. She wants to know what needs carrying today.

**The second confusion:** the app repeatedly answers "what's today?" in different places — Dashboard summary strips, Daily Bread, Chores Today (`/chores/today`), animal care reminders page. Four screens compete to be the morning screen. Pick one (Daily Bread), make the others feed it silently.

**What's genuinely good and must not be touched:**
- Single localStorage document (`rootcellar.alpha.v1`) with per-module `ensure*Data()` migration guards — clean spine, easy to sync later.
- `rhythmUtils.getDailyBreadItems()` and `getWeeklySignals()` already aggregate cross-module signals into the rhythm. This is the whole product in two functions. Everything else is furniture.
- Chore urgency model (fixed / decay / condition / season / burst). Differentiator. Keep the model, hide the vocabulary — the user should see "getting ripe," never a taxonomy lesson.
- Pantry as Product + Batch. Preservation plan → sessions → shopping list. Animals as timelines. All correct.

**The rule going forward:** every screen must answer exactly one question. If a screen answers two, split or cut. If two screens answer the same question, merge or cut.

---

## 2. Clutter list

Concrete, from the code:

1. **Bottom nav: 8 items** (`AppShell.tsx`). Home, Daily, Preserve, Pantry, Garden, Animals, Chores, Huddle. On a phone that's 8 thumb targets ~44px wide with 4-letter labels. Mobile nav caps at 5; good apps use 4.
2. **Side rail: 10 items**, including "Ask Rootcellar" — a coming-soon placeholder occupying permanent navigation. Vaporware in the nav erodes trust in everything else.
3. **Dashboard answers "where do I go?" three times** (`DashboardPage.tsx`): a focus band with **7 CTA buttons**, then up to **5 summary strips** (~20 stat boxes), then an **8-card module grid**. Triple redundancy. The Chores strip even renders marketing copy ("Decay / Ripe / Season / Frost") when there's no data — fake stats.
4. **63 routes** for a local-first alpha. Garden alone has nine subpages: beds, planner, plantings, harvests, varieties, seeds, targets, plan, fall-fit — and `/garden/targets` and `/garden/plan` mount **the same component twice**.
5. **Daily Bread is a daily check wearing a weekly report's clothes** (`DailyBreadPage.tsx`): header + 2 nav CTAs, focus band, 4-stat summary strip, an inline "add owned work" form with owner dropdown, up to **7 grouped signal sections** each with its own heading, and a persistent 4-field notes panel (Focus / Note / Gratitude / Prayer). That's a 10-minute screen for a 2-minute job.
6. **Weekly things visible daily.** `WeeklyHuddlePage.tsx` is 683 lines and reachable every day from three places. Chores has its own separate `WeeklyChoreReviewPage` — a second weekly review that duplicates the Huddle's job.
7. **Every module overview is a mini-dashboard.** Garden's overview alone has "Dates to notice," "Viability edges," "Rotation whispers," and "Bed load" — four insight panels before the user has planted anything. Chores overview: 6 CTAs. Animals: 4.
8. **Module cards carry two paragraphs each** (promise + detail in `moduleRegistry.ts`), so the module grid reads like a brochure, not a doorway.
9. **Duplicated "today":** Dashboard strips vs Daily Bread vs `/chores/today` vs `/animals/reminders`. Same question, four screens.
10. **Landing page → Dashboard → module** is two doors before any work happens, every visit.

---

## 3. Before → after table

| # | Before | After | Why |
|---|--------|-------|-----|
| 1 | Bottom nav: 8 tabs | 4 tabs: **Today · Homestead · Huddle · Add (+)** | Thumb-reachable; rhythm first, rooms behind one door |
| 2 | App opens to Landing → Dashboard | App opens to **Daily Bread** (Landing only pre-onboarding) | The morning question is "what needs carrying?", not "what is Rootcellar?" |
| 3 | Dashboard: 7 CTAs + 5 stat strips + 8 module cards | **Homestead page**: 5 quiet room links + one "needs attention" line | One answer per screen; rooms are doorways, not brochures |
| 4 | Daily Bread: stats + form + 7 sections + 4 notes fields | One flat carry list + one Focus line + collapsed "Evening note" | 2-minute check, not a report |
| 5 | Daily Bread + Weekly Huddle listed as module cards | Rhythm lives in nav only; never carded with rooms | The rhythm is the frame, not a peer of its inputs |
| 6 | "Ask Rootcellar" in nav and module grid | Gone from all UI (registry entry stays, `status: "hidden"`) | Never show a door that opens to "coming soon" |
| 7 | `WeeklyChoreReviewPage` + Huddle | Chore review absorbed into Huddle's signals step | One weekly ritual, not two |
| 8 | Garden: 9 subpages incl. duplicate route + fall-fit + bed planner | 4: Plan backward, Plantings, Harvest, Beds (varieties/seeds fold into plantings flow) | Plant → tend → harvest is the loop; the rest is drawers |
| 9 | Module cards with promise + detail paragraphs | Room name + icon + one live fact ("142 jars", "3 due") | Live data is the only marketing the user needs |
| 10 | Chores overview teaches recurrence taxonomy | Chores shows "ready / getting ripe / not yet"; taxonomy only inside the chore form | Users feel land-aware recurrence; they shouldn't have to study it |
| 11 | Stats strips on Dashboard, Daily Bread, module overviews | Pulse numbers appear **only** in Weekly Huddle | A scorecard reviewed daily is noise; reviewed weekly is a tool |
| 12 | 63 routes | ~40 routes | Every route is a place to get lost |

---

## 4. New home screen recommendation

**The app opens to Daily Bread.** Not a dashboard, not a module grid, not a landing page (landing shows only when `onboardingCompletedAt` is unset). Change the `*` redirect in `main.tsx` from `/dashboard` to `/daily-bread`.

The daily home screen, top to bottom:

```
  Tuesday, July 7          [Focus: one tap to set]
  ─────────────────────────────────────────────
  ● Water the starts            Garden    ✓ ↷
  ● Move broiler tractor        Chores    ✓ ↷
  ● Check bantam w/ limp        Animals   ✓ ↷
  ● 6 qt green beans — use soon Pantry    ✓ ↷
  ● Call hay supplier (carried) Owned     ✓ ↷
  ─────────────────────────────────────────────
  + Add something
  ▸ Evening note
```

One flat list, sorted by urgency, source shown as a small badge instead of seven section headings. Two actions per row: done (✓) and carry (↷); skip lives under a long-press/overflow, because "skip" should cost slightly more than "done." When the list is empty: "The day is quiet." — and nothing else. No stat strip; the list *is* the status.

The Dashboard becomes the **Homestead** page: five room links (Preserve, Pantry, Garden, Animals, Chores) each showing one live number, a single "Needs attention" line if anything is stuck, and the Settings link. That's the whole page.

---

## 5. New nav recommendation

Mobile bottom nav — 4 items:

| Tab | Route | Job |
|-----|-------|-----|
| **Today** | `/daily-bread` | The table. What needs carrying. |
| **Homestead** | `/homestead` (renamed dashboard) | The hallway to the 5 rooms. |
| **Huddle** | `/huddle` | The weekly ritual. |
| **＋ Add** | action sheet | Log harvest · Add to pantry · Log animal event · Add work |

Rooms (Preservation, Pantry, Garden, Animals, Chores) are **not** in the tab bar. They're one tap away through Homestead, and Daily Bread items deep-link straight into them, which is how rooms get visited most of the time anyway.

Desktop side rail mirrors it: Today, Homestead (with the 5 rooms nested beneath), Huddle, Settings. `AskUserQuestion` of taste: the rail can show the 5 rooms expanded since desktop has space — but the mobile tab bar stays at 4, non-negotiable.

The **＋ Add** tab is the one structural addition, and it earns its place by *deleting* clutter: it replaces the per-module "new" CTAs scattered across every overview page (7 on the dashboard alone) with one consistent gesture.

---

## 6. What to hide (keep the data/model, remove from view)

- **Pulse metrics everywhere except the Huddle.** All auto-derived numbers (low stock, use-soon, ripe chores, care due, signals count) vanish from Dashboard, Daily Bread, and module overviews. They surface once a week, in the Huddle, where they mean something.
- **Chore recurrence taxonomy.** Fixed/decay/condition/season/burst stays in the model and the chore form; list views show only ripeness state.
- **Gratitude / Prayer / Household note.** Keep in `DailyBreadEntry`; collapse behind one "Evening note" disclosure, closed by default.
- **Owned-work "add" form on Daily Bread.** Becomes a single "+ Add something" row that expands; owner defaults to active member, no dropdown until expanded.
- **Varieties and Seed Packets pages.** Keep the data; reach them from within the planting flow ("pick variety → manage varieties"), not as standalone nav destinations.
- **Pantry locations page.** Locations become a filter/selector inside Pantry, not a page.
- **Animal Feed & Production page.** Feed and production entries remain event types on the animal timeline; the dedicated analytics page waits.
- **Kid Mode.** Good idea, wrong decade of the product. Keep the route dormant, remove links to it.
- **Season Templates.** Keep the model; seed 3–4 built-in templates inside the chore form's season picker instead of a management page.
- **Module registry `detail` text.** Keep in the registry for onboarding copy; stop rendering it on cards.

---

## 7. What to cut (remove from V1 entirely)

- **The duplicate route.** `/garden/targets` and `/garden/plan` mount the same page. Delete one. (Two-minute fix; do it first as a statement of intent.)
- **Fall-Fit page.** Clever, seasonal, premature. Cut the route and links; keep the math in `calculations.ts` if it's shared.
- **Bed Planner (visual layout).** This is the "garden layout toy" the positioning explicitly rejects. Beds remain a simple list with dimensions; the planner page goes.
- **Pantry Import page.** Nobody migrating spreadsheets is in a 3-family alpha. Cut route + link; keep the parsing code in the repo.
- **`WeeklyChoreReviewPage`.** Absorbed by the Huddle. Cut the page and route.
- **"Ask Rootcellar"** from nav, module grid, and coming-soon route. It returns when it's real.
- **Fake-data marketing strips** (the Chores "Decay/Ripe/Season/Frost" placeholder stats on the dashboard). Empty states say one honest sentence, not fake numbers.
- **Landing page for returning users.** Route straight to Daily Bread once onboarded.
- **The dashboard focus band's 7 CTAs.** All of them. The nav is the nav.

Nothing on this list deletes data or models. It deletes doors, cards, and stat boxes.

---

## 8. Daily Bread — simplified flow

The morning question: **"What needs carrying today?"** Two minutes, one thumb.

1. **Open app → Daily Bread.** Date, optional Focus line (tap to set, one field).
2. **One flat list**, auto-gathered by `getDailyBreadItems()` (already built): due chores, care reminders, garden dates, use-soon pantry, preservation sessions, carried work. Source is a badge, not a section. Sorted: carried-forward first, then due, then soft signals.
3. **Tap ✓ done or ↷ carry.** Done on a chore completes the chore (already wired). Carry pushes it to tomorrow and flags it for the Huddle (already wired). Skip is in the overflow.
4. **"+ Add something"** — one line, becomes owned work for today.
5. **"Close today"** button appears after at least one interaction; closing rolls open items to carried.
6. **Evening (optional):** "▸ Evening note" disclosure opens Note / Gratitude / Reflection.

What does **not** appear daily: pulse numbers, stat strips, weekly signals, stuck list, season priorities, per-module summaries, links to module overviews (rows deep-link to the specific thing instead).

---

## 9. Weekly Huddle — simplified flow

The weekly question: **"What worked, what slipped, who owns what next?"** Family around the table, 20 minutes, one person driving the phone or laptop. Five steps, shown **one at a time** as a stepper — not 683 lines of simultaneous sections:

1. **Check in** (2 min) — last week's Focus lines and gratitude notes replay. This is the payoff for the daily crumbs; it's what "the homestead finally remembers" feels like.
2. **Pulse** (3 min) — the week's numbers appear here and only here: chores done vs due, care done, jars added, harvest logged, use-soon count, items carried more than twice. No editing, just reading.
3. **What slipped** (5 min) — `getWeeklySignals()` output plus everything carried 2+ times, merged with the stuck list. Each item gets one decision: *name it → sort it → decide* → becomes owned work, gets dropped, or stays stuck with a note. This absorbs the old Weekly Chore Review entirely.
4. **Who owns what** (5 min) — open owned work by person; reassign, complete, or carry. Add new owned work from decisions just made.
5. **Next week** (2 min) — set/confirm up to 3 Season Priorities and one household Focus for the week. Close the Huddle; a short summary is saved.

Pulse metrics, first six (all auto-derived, zero manual entry): chores completed / chores due · animal care completed · jars/batches added to pantry · harvest entries logged · use-soon count · carry-forward count. Hidden until the Huddle, all of them. Manual pulse entries (the current "Add a household number" form) get buried behind an "add a number" link inside step 2 — most families will never need it, and the ones who do will find it.

---

## 10. Next 5 build packets (for Sonnet)

Strictly simplification. No new features except the Add sheet, which exists to delete seven scattered CTAs.

**Packet 1 — Nav collapse & open-to-Today.**
`AppShell.tsx`: bottom nav → Today / Homestead / Huddle / Add(+); side rail to match. `main.tsx`: `*` redirect → `/daily-bread`; landing only when `onboardingCompletedAt` unset; delete `/garden/targets` duplicate route; remove `/ask` route and nav entries (registry entry gets `status: "hidden"`). Add sheet can be a simple action sheet linking to the four existing "new" forms.

**Packet 2 — Dashboard → Homestead.**
Rewrite `DashboardPage.tsx` as the Homestead page: 5 room links, each with icon + name + one live number (reuse existing util calls); one "Needs attention" line when stuck items exist; Settings link. Delete the focus band, all summary strips, the fake-data chore strip, and the module grid. `ModuleCard` shrinks to name + icon + one fact; Daily Bread and Huddle no longer render as cards.

**Packet 3 — Daily Bread flattening.**
`DailyBreadPage.tsx`: remove the summary strip and the two header CTAs; flatten the 7 grouped sections into one sorted list with source badges; move skip into an overflow; collapse the notes panel into an "Evening note" disclosure; shrink the add-work form to a single expanding row. No changes to `rhythmUtils` or data types.

**Packet 4 — Huddle as a 5-step ritual.**
Restructure `WeeklyHuddlePage.tsx` into the stepper (Check in → Pulse → What slipped → Who owns what → Next week). Move all pulse numbers here; bury manual pulse entry inside step 2. Absorb `WeeklyChoreReviewPage` (delete page + route + links). Persist step progress in the existing huddle entry so a family can pause mid-meeting.

**Packet 5 — Room quieting & route pruning.**
Module overviews drop insight panels and extra CTAs (Garden: cut fall-fit + bed planner routes/links; overview = Plan backward, Plantings, Harvest, Beds. Pantry: locations becomes a filter, cut Import route. Animals: cut Feed/Production page, keep events on timelines. Chores: overview shows ripeness only; cut Kid Mode + Season Templates links). Target ≤ ~40 routes. Every module overview: one heading, one primary action, one list.

---

## What would make this fail (kept from the long audit, because it matters)

Not simplifying. The spine is good, the loops are wired, the differentiators are real. The only visible failure mode right now is that the app keeps growing surface faster than it grows habit. If a tired parent can't clear Daily Bread in two minutes on a phone in a barn, nothing else in the codebase matters. Simplify first, then let three real families tell you what to build next.
