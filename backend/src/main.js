import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "./shared/example.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";

function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();
app.use(express.static(STATIC_DIR));

const mongoClient = connectMongo();
await mongoClient.connect();

const imageProvider = new ImageProvider(mongoClient);

app.get("/api/hello", (req, res) => {
    res.send("Hello, World " + SHARED_TEST);
});

app.get("/api/images", async (req, res) => {
    try {
        await waitDuration(1000);
        const images = await imageProvider.getAllImages();
        res.json(images);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch images." });
    }
});

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
