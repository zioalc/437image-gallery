import express from "express";

export function registerAuthRoutes(app, authProvider) {
    const router = express.Router();

    router.post("/register", async (req, res) => {
        const { username, email, password } = req.body ?? {};
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Username, email, and password are required"
            });
        }

        try {
            const { user, error } = await authProvider.registerUser({ username, email, password });
            if (error) {
                return res.status(409).json({
                    error: "Conflict",
                    message: error
                });
            }
            const token = authProvider.issueToken(user);
            return res.json({ token });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to register user." });
        }
    });

    router.post("/login", async (req, res) => {
        const { username, password } = req.body ?? {};
        if (!username || !password) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Username and password are required"
            });
        }

        try {
            const user = await authProvider.loginUser({ username, password });
            if (!user) {
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "Incorrect username or password"
                });
            }
            const token = authProvider.issueToken(user);
            return res.json({ token });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to login." });
        }
    });

    app.use("/api", router);
}
