# Rootcellar Alpha

Rootcellar is a household memory and rhythm app for gardeners, homesteaders, and self-reliant families.

Core promise: **Your homestead finally remembers.**

This alpha is local-first and intentionally quiet. Preservation, Pantry, Garden, Animals, Chores, Daily Bread, and Weekly Huddle are functional; Ask Rootcellar remains a placeholder and is not surfaced in navigation.

Navigation is four tabs: **Today** (Daily Bread), **Homestead** (the rooms), **Huddle** (Weekly Huddle), and **Add** (quick links into every room).

## V1 Room List

Homestead rooms:

- Preservation
- Pantry
- Garden
- Animals
- Chores

Rhythm flows (not rooms — these live outside Homestead):

- Daily Bread (Today)
- Weekly Huddle

Not surfaced in V1: Ask Rootcellar (coming soon, reachable only by direct URL), Documents, Equipment.

## What Works Now

- Create and edit preservation season plans
- Add and edit preservation items
- Choose product type, preservation method, target quantity, unit, and notes
- See conservative planning estimates for jars, lids, freezer bags, produce, and supplies
- Review produce and prep assumptions
- Create kitchen session plans
- Generate a shopping list
- Print or save the printable plan as PDF from the browser
- Export plan JSON
- Track pantry products, batches, locations, and one-tap deductions
- Plan garden beds, plantings, harvests, varieties, seed packets, and frost-aware targets
- Keep animal groups, individuals, care reminders, production, feed, and timeline events
- Create local household members for visible chore ownership
- Create chores with five recurrence types: fixed, elapsed decay, condition-based, season-anchored, and burst/project
- Complete chores with one tap or skip with a reason
- Use Kid Mode for one member's trust-based chore board
- Review by-person load, unowned chores, slipping chores, skip reasons, seasonal work, and burst projects in Weekly Chore Review
- Use Daily Bread for a single flat list of today's owned work, due chores, care reminders, garden work, pantry/use-soon notes, preservation work, carry-forward items, focus, and reflection
- Walk Weekly Huddle as a five-step ritual: Pulse, Priorities, Owned work, Stuck list, and Close
- First-run onboarding: choose your rooms, add household basics, create a first real record, and land on Daily Bread
- Load (and clear) a sample homestead for a quick look around
- Persist plans in `localStorage`

## Intentionally Not Built Yet

- Login or user accounts
- Backend persistence
- Household sharing
- Payments
- AI or Ask Rootcellar
- Points, coins, streaks, allowance, parent approval queues, or push-notification nagging

## Onboarding

A first-time visitor is sent to `/onboarding`, a five-step flow:

1. **Welcome** — start setup, skip for now, or load the sample homestead.
2. **Choose your rooms** — select which Homestead rooms to start with (Pantry, Garden, and Chores are pre-selected).
3. **Household basics** — optional household name, household members, and last/first frost dates.
4. **First useful memory** — one quick-add form per selected room (pantry item, garden bed, animal group, chore, or preservation plan). Adding one real record is enough; everything is skippable.
5. **Finish** — a summary of what was created, then on to Daily Bread.

Onboarding is skippable and resumable. Skipping shows a quiet "Finish setting up Rootcellar" banner on Daily Bread and Homestead until it's resumed or dismissed. Visiting any other route before onboarding is complete redirects back to `/onboarding`.

Onboarding state lives inside the same `rootcellar.alpha.v1` localStorage blob, under an `onboarding` key:

```ts
{
  hasCompletedOnboarding: boolean;
  completionKind?: "finished" | "skipped";
  step: 1 | 2 | 3 | 4 | 5;
  selectedRooms: OnboardingRoomId[];
  householdBasics: { householdName: string; lastFrostDate: string; firstFrostDate: string };
  resumeBannerDismissed: boolean;
  sampleDataLoaded: boolean;
}
```

**Resetting onboarding**: Settings → Onboarding → "Reset onboarding" clears this state and sends you back to `/onboarding`.

### Sample Homestead

From the Welcome or Finish step, Daily Bread's empty state, or Settings, you can load a sample homestead: two household members, a few chores, pantry locations/products/batches, garden beds and plantings, an animal group, a preservation plan, and a Daily Bread/Weekly Huddle entry. Loading always confirms first and only adds records — it never overwrites anything you've already entered.

Every sample record uses a `sample_`-prefixed id (see `src/shared/storage/sampleHomestead.ts`). Settings → "Clear sample data" removes exactly those records and leaves everything else untouched.

## Documents and Equipment Decision

Documents and Equipment are not standalone V1 modules. Photos, notes, receipts, labels, recipe links, process notes, seed packet photos, bed photos, vet receipts, medication labels, butcher sheets, and similar attachments live inside the modules they belong to.

Equipment maintenance lives mostly inside Chores. Work like cleaning the chimney, servicing a pressure canner gasket, checking freezer temperature, changing mower oil, sharpening a chainsaw, cleaning dehydrator trays, draining hoses before frost, checking the generator, or cleaning a brooder heat plate should be represented as chores with notes, recurrence, location, and optional linked equipment context.

## Chores Model

Chores V1 is built around one visible owner per chore. A chore can have an optional backup, linked entity placeholder, location/zone, season window, effort, minimum age, verification mode, notes, and active/paused/archived status.

The five recurrence types are:

- **Fixed**: daily, weekly, or monthly schedules.
- **Elapsed decay**: urgency is `elapsed days / interval days`; it surfaces at `>= 0.8`, can exceed `1.0`, and uses calm labels like “Ready soon,” “Ready,” and “Getting ripe.”
- **Condition-based**: simple V1 manual state for no rain for N days, frost warning, or a state note.
- **Season-anchored**: offsets from manual first frost, last frost, or a custom date.
- **Burst/project**: date-window checklists with assignable line items.

Completions are append-only local events. Kid Mode shows only the selected member's chores with one-tap completion and skip reasons. Weekly Chore Review exposes by-person load, unowned chores, slipping chores, skipped reasons, upcoming seasonal work, burst projects, and Fix-It candidates.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Firebase Hosting

The app is configured for Firebase Hosting as a Vite single-page app.

Build locally:

```bash
npm run build
```

Deploy after selecting a Firebase project:

```bash
firebase deploy --only hosting
```

Firebase serves the generated `dist/` folder and rewrites routes like `/daily-bread` and `/huddle` back to `index.html`.

Household data is not synced to Firebase yet. The proposed Firestore path is documented in `docs/firebase-data-plan.md`.

## Data Model

Alpha data is stored in the browser under the `rootcellar.alpha.v1` localStorage key.

The local data shape is centralized in:

- `src/shared/storage/rootcellarStorage.ts`
- `src/modules/preservation/types.ts`
- `src/modules/pantry/types.ts`
- `src/modules/garden/types.ts`
- `src/modules/animals/types.ts`
- `src/modules/chores/types.ts`
- `src/modules/huddle/types.ts`

The storage boundary is deliberately small so the same plan, item, and session records can later move to a backend.

Known limitations: data is local to one browser, there is no backend sync or household account, attachment/photo fields are text placeholders rather than uploaded files, condition recurrence is manual-only, season dates are local settings rather than a full weather engine, linked Animal/Garden/Pantry records are placeholders, equipment maintenance is represented through Chores rather than a dedicated equipment inventory, and Fix-It is only surfaced as a future seam.

## App Structure

```text
src/
  onboarding/
    steps/
  modules/
    preservation/
    pantry/
    garden/
    animals/
    chores/
    huddle/
    ask/
  shared/
    components/
    storage/
    types/
    utils/
```

## Safety Note

Preservation estimates are planning estimates only. Always follow tested preservation recipes and current safe canning guidelines.
