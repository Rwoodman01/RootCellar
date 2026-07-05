# Rootcellar Alpha

Rootcellar is a household memory and rhythm app for gardeners, homesteaders, and self-reliant families.

Core promise: **Your homestead finally remembers.**

This alpha is local-first and intentionally quiet. Preservation, Pantry, Garden, Animals, Chores, Daily Bread, and Weekly Huddle are functional; Ask Rootcellar remains a placeholder.

## V1 Module List

- Preservation
- Pantry
- Garden
- Animals
- Chores
- Daily Bread
- Weekly Huddle
- Ask Rootcellar (coming soon)

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
- Use Daily Bread for today's owned work, due chores, care reminders, garden work, pantry/use-soon notes, preservation work, carry-forward items, focus, and reflection
- Use Weekly Huddle for Pulse, season priorities, owned work, slipped module signals, stuck items, decisions, and next-week focus
- Persist plans in `localStorage`

## Intentionally Not Built Yet

- Login or user accounts
- Backend persistence
- Household sharing
- Payments
- AI or Ask Rootcellar
- Points, coins, streaks, allowance, parent approval queues, or push-notification nagging

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
