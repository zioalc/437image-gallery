import { useParams } from "react-router";
import { fetchById } from "./ImageFetcher.js";

export function ImageDetails() {
    const { imageId } = useParams();
    const image = fetchById(imageId);
    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    )
}
