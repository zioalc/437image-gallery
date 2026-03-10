import express from "express";

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

function requireAuth(authProvider) {
    return (req, res, next) => {
        const authHeader = req.get("Authorization") ?? "";
        const match = authHeader.match(/^Bearer (.+)$/);
        if (!match) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Missing or invalid Authorization header"
            });
        }

        const user = authProvider.getUserForToken(match[1]);
        if (!user) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Invalid or expired token"
            });
        }

        req.authUser = user;
        return next();
    };
}

export function registerImageRoutes(app, imageProvider, authProvider) {
    const router = express.Router();
    const ensureAuth = requireAuth(authProvider);

    router.get("/images", ensureAuth, async (req, res) => {
        try {
            await waitDuration(1000);
            const images = await imageProvider.getAllImages();
            res.json(images);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch images." });
        }
    });

    router.get("/images/:imageId", ensureAuth, async (req, res) => {
        try {
            const image = await imageProvider.getOneImage(req.params.imageId);
            if (!image) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "No image with that ID"
                });
            }
            return res.json(image);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch image." });
        }
    });

    router.patch("/images/:imageId", ensureAuth, async (req, res) => {
        const { name } = req.body ?? {};
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Request body must include a non-empty name string"
            });
        }
        if (name.length > 100) {
            return res.status(413).json({
                error: "Content Too Large",
                message: "Image name exceeds 100 characters"
            });
        }

        try {
            const image = await imageProvider.getOneImage(req.params.imageId);
            if (!image) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }
            if (image.author?.username !== req.authUser.username) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "You do not own this image"
                });
            }

            const matchedCount = await imageProvider.updateImageName(req.params.imageId, name.trim());
            if (matchedCount === 0) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }
            return res.status(204).send();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update image." });
        }
    });

    app.use("/api", router);
}
