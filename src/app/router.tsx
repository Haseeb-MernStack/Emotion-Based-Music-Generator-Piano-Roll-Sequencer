import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ComposerPage from "../features/composer/ComposerPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />
    },
    {
        path: "/composer",
        element: <ComposerPage />,
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);