import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./shared/components/AppShell";
import { PreservationProvider } from "./modules/preservation/usePreservationPlans";
import { PantryProvider } from "./modules/pantry/usePantry";
import { GardenProvider } from "./modules/garden/useGarden";
import { AnimalsProvider } from "./modules/animals/useAnimals";
import { ChoresProvider } from "./modules/chores/useChores";
import { HuddleProvider } from "./modules/huddle/useHuddle";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PreservationListPage } from "./modules/preservation/pages/PreservationListPage";
import { PreservationPlanFormPage } from "./modules/preservation/pages/PreservationPlanFormPage";
import { PreservationPlanDetailPage } from "./modules/preservation/pages/PreservationPlanDetailPage";
import { PreservationItemFormPage } from "./modules/preservation/pages/PreservationItemFormPage";
import { ShoppingListPage } from "./modules/preservation/pages/ShoppingListPage";
import { PrintablePlanPage } from "./modules/preservation/pages/PrintablePlanPage";
import { PantryOverviewPage } from "./modules/pantry/pages/PantryOverviewPage";
import { PantryProductListPage } from "./modules/pantry/pages/PantryProductListPage";
import { PantryProductDetailPage } from "./modules/pantry/pages/PantryProductDetailPage";
import { PantryProductFormPage } from "./modules/pantry/pages/PantryProductFormPage";
import { PantryBatchFormPage } from "./modules/pantry/pages/PantryBatchFormPage";
import { PantryEatFirstPage } from "./modules/pantry/pages/PantryEatFirstPage";
import { PantryLocationPage } from "./modules/pantry/pages/PantryLocationPage";
import { PantryImportPage } from "./modules/pantry/pages/PantryImportPage";
import { GardenOverviewPage } from "./modules/garden/pages/GardenOverviewPage";
import { BedsPage } from "./modules/garden/pages/BedsPage";
import { BedPlannerPage } from "./modules/garden/pages/BedPlannerPage";
import { PlantingsPage } from "./modules/garden/pages/PlantingsPage";
import { PlantingFormPage } from "./modules/garden/pages/PlantingFormPage";
import { HarvestLogPage } from "./modules/garden/pages/HarvestLogPage";
import { VarietiesPage } from "./modules/garden/pages/VarietiesPage";
import { SeedPacketsPage } from "./modules/garden/pages/SeedPacketsPage";
import { PlanBackwardPage } from "./modules/garden/pages/PlanBackwardPage";
import { FallFitPage } from "./modules/garden/pages/FallFitPage";
import { AnimalsOverviewPage } from "./modules/animals/pages/AnimalsOverviewPage";
import { AnimalGroupsPage } from "./modules/animals/pages/AnimalGroupsPage";
import { AnimalGroupFormPage } from "./modules/animals/pages/AnimalGroupFormPage";
import { AnimalGroupDetailPage } from "./modules/animals/pages/AnimalGroupDetailPage";
import { IndividualAnimalsPage } from "./modules/animals/pages/IndividualAnimalsPage";
import { IndividualAnimalFormPage } from "./modules/animals/pages/IndividualAnimalFormPage";
import { IndividualAnimalDetailPage } from "./modules/animals/pages/IndividualAnimalDetailPage";
import { AnimalTimelinePage } from "./modules/animals/pages/AnimalTimelinePage";
import { QuickLogPage } from "./modules/animals/pages/QuickLogPage";
import { FeedProductionPage } from "./modules/animals/pages/FeedProductionPage";
import { CareRemindersPage } from "./modules/animals/pages/CareRemindersPage";
import { ChoresOverviewPage } from "./modules/chores/pages/ChoresOverviewPage";
import { ChoresTodayPage } from "./modules/chores/pages/ChoresTodayPage";
import { ChoreListPage } from "./modules/chores/pages/ChoreListPage";
import { ChoreFormPage } from "./modules/chores/pages/ChoreFormPage";
import { ChoreDetailPage } from "./modules/chores/pages/ChoreDetailPage";
import { KidModePage } from "./modules/chores/pages/KidModePage";
import { WeeklyChoreReviewPage } from "./modules/chores/pages/WeeklyChoreReviewPage";
import { FamilyMembersPage } from "./modules/chores/pages/FamilyMembersPage";
import { SeasonTemplatesPage } from "./modules/chores/pages/SeasonTemplatesPage";
import { DailyBreadPage } from "./modules/huddle/pages/DailyBreadPage";
import { WeeklyHuddlePage } from "./modules/huddle/pages/WeeklyHuddlePage";
import "./styles.css";

document.title = "Rootcellar Alpha";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PreservationProvider>
        <PantryProvider>
          <GardenProvider>
            <AnimalsProvider>
              <ChoresProvider>
                <HuddleProvider>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route element={<AppShell />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/daily-bread" element={<DailyBreadPage />} />
                      <Route path="/preservation" element={<PreservationListPage />} />
                      <Route path="/preservation/new" element={<PreservationPlanFormPage />} />
                      <Route path="/preservation/:planId/edit" element={<PreservationPlanFormPage />} />
                      <Route path="/preservation/:planId" element={<PreservationPlanDetailPage />} />
                      <Route path="/preservation/:planId/items/new" element={<PreservationItemFormPage />} />
                      <Route path="/preservation/:planId/items/:itemId/edit" element={<PreservationItemFormPage />} />
                      <Route path="/preservation/:planId/shopping-list" element={<ShoppingListPage />} />
                      <Route path="/preservation/:planId/print" element={<PrintablePlanPage />} />
                      <Route path="/pantry" element={<PantryOverviewPage />} />
                      <Route path="/pantry/products" element={<PantryProductListPage />} />
                      <Route path="/pantry/products/new" element={<PantryProductFormPage />} />
                      <Route path="/pantry/products/:productId" element={<PantryProductDetailPage />} />
                      <Route path="/pantry/products/:productId/edit" element={<PantryProductFormPage />} />
                      <Route path="/pantry/batches/new" element={<PantryBatchFormPage />} />
                      <Route path="/pantry/batches/:batchId/edit" element={<PantryBatchFormPage />} />
                      <Route path="/pantry/locations" element={<PantryLocationPage />} />
                      <Route path="/pantry/locations/:locationId" element={<PantryLocationPage />} />
                      <Route path="/pantry/eat-first" element={<PantryEatFirstPage />} />
                      <Route path="/pantry/import" element={<PantryImportPage />} />
                      <Route path="/garden" element={<GardenOverviewPage />} />
                      <Route path="/garden/beds" element={<BedsPage />} />
                      <Route path="/garden/planner" element={<BedPlannerPage />} />
                      <Route path="/garden/plantings" element={<PlantingsPage />} />
                      <Route path="/garden/plantings/new" element={<PlantingFormPage />} />
                      <Route path="/garden/plantings/:plantingId/edit" element={<PlantingFormPage />} />
                      <Route path="/garden/harvests" element={<HarvestLogPage />} />
                      <Route path="/garden/varieties" element={<VarietiesPage />} />
                      <Route path="/garden/seeds" element={<SeedPacketsPage />} />
                      <Route path="/garden/targets" element={<PlanBackwardPage />} />
                      <Route path="/garden/plan" element={<PlanBackwardPage />} />
                      <Route path="/garden/fall-fit" element={<FallFitPage />} />
                      <Route path="/animals" element={<AnimalsOverviewPage />} />
                      <Route path="/animals/groups" element={<AnimalGroupsPage />} />
                      <Route path="/animals/groups/new" element={<AnimalGroupFormPage />} />
                      <Route path="/animals/groups/:groupId" element={<AnimalGroupDetailPage />} />
                      <Route path="/animals/groups/:groupId/edit" element={<AnimalGroupFormPage />} />
                      <Route path="/animals/individuals" element={<IndividualAnimalsPage />} />
                      <Route path="/animals/individuals/new" element={<IndividualAnimalFormPage />} />
                      <Route path="/animals/individuals/:animalId" element={<IndividualAnimalDetailPage />} />
                      <Route path="/animals/individuals/:animalId/edit" element={<IndividualAnimalFormPage />} />
                      <Route path="/animals/timeline" element={<AnimalTimelinePage />} />
                      <Route path="/animals/quick-log" element={<QuickLogPage />} />
                      <Route path="/animals/feed-production" element={<FeedProductionPage />} />
                      <Route path="/animals/reminders" element={<CareRemindersPage />} />
                      <Route path="/chores" element={<ChoresOverviewPage />} />
                      <Route path="/chores/today" element={<ChoresTodayPage />} />
                      <Route path="/chores/list" element={<ChoreListPage />} />
                      <Route path="/chores/new" element={<ChoreFormPage />} />
                      <Route path="/chores/kid-mode" element={<KidModePage />} />
                      <Route path="/chores/review" element={<WeeklyChoreReviewPage />} />
                      <Route path="/chores/members" element={<FamilyMembersPage />} />
                      <Route path="/chores/templates" element={<SeasonTemplatesPage />} />
                      <Route path="/chores/:choreId/edit" element={<ChoreFormPage />} />
                      <Route path="/chores/:choreId" element={<ChoreDetailPage />} />
                      <Route path="/huddle" element={<WeeklyHuddlePage />} />
                      <Route path="/ask" element={<ComingSoonPage moduleId="ask" />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </HuddleProvider>
              </ChoresProvider>
            </AnimalsProvider>
          </GardenProvider>
        </PantryProvider>
      </PreservationProvider>
    </BrowserRouter>
  </StrictMode>,
);
