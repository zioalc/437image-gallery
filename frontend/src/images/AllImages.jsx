import { useEffect, useState } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages() {
    const [imageData, setImageData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadImages() {
            try {
                const response = await fetch("/api/images");
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setImageData(result);
                setError("");
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        }
        loadImages();
    }, []);

    return (
        <div>
            <h2>All Images</h2>
            {isLoading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!isLoading && !error && <ImageGrid images={imageData} />}
        </div>
    );
}
