# Chores Module

Chores V1 is the Rootcellar family-work module: visible ownership, calm recurrence, trust-based completion, and a Weekly Huddle review. It deliberately avoids points, coins, streaks, allowance, approval queues, and push-notification nagging.

## Recurrence Types

- **Fixed**: daily, weekly, or monthly work like feed and water.
- **Elapsed decay**: interval work that gets ripe over time, like mucking a coop every roughly 10 days.
- **Condition-based**: V1 manual/weather-placeholder signals such as no rain for N days, frost warning, or manual state notes.
- **Season-anchored**: offsets from first frost, last frost, or a custom date.
- **Burst/project**: checklist work inside a date window, such as canning weekend or butcher day.

## Data Shape

The module stores:

- `members`: local household members with initials, role, optional age, and color.
- `chores`: one owner, optional backup, recurrence type and params, linked entity placeholder, zone, effort, min age, verification, notes, and status.
- `completions`: append-only completed/skipped events with member attribution and optional skip reason.
- `burstItems`: checklist lines for burst/project chores.
- `settings`: active member, manual frost/custom dates, and manual condition state.

## Utility Contract

Core scheduler functions live in `choreUtils.ts`:

- `getDueChores(data, date)`
- `getTodayChores(data, date)`
- `getChoreUrgency(chore, completions, date, data)`
- `getWeeklyChoreReview(data, date)`
- `getChoresByPerson(data)`
- `getSlippingChores(data, date)`
- `getUnownedChores(data)`
- `getCompletionStats(data, date)`

Decay math is `elapsed days / interval days`. Chores surface at `>= 0.8`, can exceed `1.0`, and render as calm states like “Ready soon,” “Ready,” or “Getting ripe.”

## Seams

Chores can link to animal records, garden beds, pantry/preservation work, equipment maintenance notes, or other placeholders. Animal events already support `linkedChoreId`; future work can write a chore completion into an animal timeline without changing the Chore model.
