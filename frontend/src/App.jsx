import { Routes, Route } from "react-router";
import { useState } from "react";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

const toRelativeRoute = (path) => path.replace(/^\//, "");

function App() {
    const [authToken, setAuthToken] = useState("");

    return (
        <Routes>
            <Route path={VALID_ROUTES.HOME} element={<MainLayout />}>
                <Route
                    index
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={toRelativeRoute(VALID_ROUTES.IMAGE_DETAILS)}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={toRelativeRoute(VALID_ROUTES.UPLOAD)}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={toRelativeRoute(VALID_ROUTES.LOGIN)}
                    element={<LoginPage onAuthToken={setAuthToken} />}
                />
                <Route
                    path={toRelativeRoute(VALID_ROUTES.REGISTER)}
                    element={<LoginPage isRegistering={true} onAuthToken={setAuthToken} />}
                />
            </Route>
        </Routes>
    );
}

export default App;
