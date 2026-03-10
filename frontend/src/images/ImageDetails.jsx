import { useEffect, useState } from "react";
import { useParams } from "react-router";

export function ImageDetails({ authToken }) {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [renameValue, setRenameValue] = useState("");
    const [renameError, setRenameError] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        async function loadImage() {
            try {
                const response = await fetch("/api/images", {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
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

    async function handleRenameSubmit(event) {
        event.preventDefault();
        const trimmedName = renameValue.trim();
        if (!trimmedName) {
            setRenameError("Please enter a new name.");
            return;
        }

        setIsRenaming(true);
        setRenameError("");
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: trimmedName })
            });

            if (!response.ok) {
                let message = `Error: HTTP ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody?.message) {
                        message = errorBody.message;
                    }
                } catch {
                    // Ignore JSON parse errors for error responses.
                }
                setRenameError(message);
                return;
            }

            setImage((prev) => (prev ? { ...prev, name: trimmedName } : prev));
            setRenameValue("");
        } catch (err) {
            setRenameError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsRenaming(false);
        }
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
            <form className="LoginPage-form" onSubmit={handleRenameSubmit}>
                <label htmlFor="rename-input">Rename image</label>
                <input
                    id="rename-input"
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    disabled={isRenaming}
                />
                <input type="submit" value="Rename" disabled={isRenaming} />
            </form>
            <div aria-live="polite">
                {renameError && <p>{renameError}</p>}
            </div>
        </div>
    );
}
