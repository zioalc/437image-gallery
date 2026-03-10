import { Routes, Route } from "react-router";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

const toRelativeRoute = (path) => path.replace(/^\//, "");

function App() {
    return (
        <Routes>
            <Route path={VALID_ROUTES.HOME} element={<MainLayout />}>
                <Route index element={<AllImages />} />
                <Route
                    path={toRelativeRoute(VALID_ROUTES.IMAGE_DETAILS)}
                    element={<ImageDetails />}
                />
                <Route path={toRelativeRoute(VALID_ROUTES.UPLOAD)} element={<UploadPage />} />
                <Route path={toRelativeRoute(VALID_ROUTES.LOGIN)} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;
