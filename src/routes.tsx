import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import { MainLayout } from "./layout/MainLayout";

const RosterPage = lazy(() =>
  import("./pages/RosterPage").then((module) => ({
    default: module.RosterPage,
  }))
);
const ArmoryPage = lazy(() =>
  import("./pages/ArmoryPage").then((module) => ({
    default: module.ArmoryPage,
  }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);
const CharacterGenerator = lazy(
  () => import("./mork_borg/components/CharacterGenerator")
);
const SheetPage = lazy(() => import("./components/SheetPage"));
const SystemSelectionPage = lazy(() =>
  import("./pages/SystemSelectionPage").then((module) => ({
    default: module.SystemSelectionPage,
  }))
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RosterPage />
          </Suspense>
        ),
      },
      {
        path: "armory",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ArmoryPage />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "generator",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CharacterGenerator />
          </Suspense>
        ),
      },
      {
        path: "sheet/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SheetPage />
          </Suspense>
        ),
      },
      {
        path: "select-system",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SystemSelectionPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
