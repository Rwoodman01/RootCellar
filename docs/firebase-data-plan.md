# Firebase Data Plan

Rootcellar is currently deployed on Firebase Hosting, but household data is still stored in browser `localStorage`.

Do not move private household records into Firestore until the app has a basic account/household security model.

## Recommended Next Step

Use Firebase in this order:

1. **Hosting**: already live.
2. **Authentication**: sign in household members or at least one household owner.
3. **Firestore**: store shared household data behind security rules.
4. **Migration**: offer an import from the current local browser data.

## Firestore Shape

Suggested top-level structure:

```text
households/{householdId}
  profile
  members/{memberId}
  preservationPlans/{planId}
  pantryProducts/{productId}
  pantryBatches/{batchId}
  pantryLocations/{locationId}
  gardenBeds/{bedId}
  gardenPlantings/{plantingId}
  gardenHarvests/{harvestId}
  animalGroups/{groupId}
  animals/{animalId}
  animalEvents/{eventId}
  careReminders/{reminderId}
  chores/{choreId}
  choreCompletions/{completionId}
  seasonPriorities/{priorityId}
  pulseMetrics/{metricId}
  ownedWork/{workId}
  stuckItems/{itemId}
  dailyBreadEntries/{entryId}
  weeklyHuddleEntries/{entryId}
```

## Rule Posture

Until Authentication is wired, Firestore rules should stay closed:

```text
allow read, write: if false;
```

Once Authentication exists, rules should only allow signed-in members of a household to read/write that household's records.

## What Users Need To Do In Firebase

For the next data step, the Firebase console needs:

- Firestore Database enabled in Native mode.
- A region chosen once for the project.
- Authentication enabled with the first sign-in method.

After that, the app can add the Firebase SDK and move from local-only storage to household sync.
