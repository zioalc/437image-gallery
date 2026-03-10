import { useEffect, useState } from "react";
import { useParams } from "react-router";

export function ImageDetails() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadImage() {
            try {
                const response = await fetch("/api/images");
                if (!response.ok) {
                    throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                const foundImage = result.find((img) => img._id === imageId);
                setImage(foundImage || null);
                setError("");
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        }
        loadImage();
    }, [imageId]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    );
}
