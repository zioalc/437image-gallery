import { ObjectId } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.dbName = getEnvVar("DB_NAME");
        this.imagesCollectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME", false) || "users";
    }

    async getAllImages() {
        const db = this.mongoClient.db(this.dbName);
        const imagesCollection = db.collection(this.imagesCollectionName);

        const pipeline = [
            {
                $lookup: {
                    from: this.usersCollectionName,
                    localField: "authorId",
                    foreignField: "username",
                    as: "author"
                }
            },
            {
                $unwind: "$author"
            },
            {
                $project: {
                    _id: { $toString: "$_id" },
                    src: 1,
                    name: 1,
                    author: {
                        _id: { $toString: "$author._id" },
                        username: "$author.username",
                        email: "$author.email"
                    }
                }
            }
        ];
        return imagesCollection.aggregate(pipeline).toArray();
    }

    async getOneImage(imageId) {
        if (!ObjectId.isValid(imageId)) {
            return null;
        }
        const db = this.mongoClient.db(this.dbName);
        const imagesCollection = db.collection(this.imagesCollectionName);
        const pipeline = [
            {
                $match: { _id: new ObjectId(imageId) }
            },
            {
                $lookup: {
                    from: this.usersCollectionName,
                    localField: "authorId",
                    foreignField: "username",
                    as: "author"
                }
            },
            {
                $unwind: "$author"
            },
            {
                $project: {
                    _id: { $toString: "$_id" },
                    src: 1,
                    name: 1,
                    author: {
                        _id: { $toString: "$author._id" },
                        username: "$author.username",
                        email: "$author.email"
                    }
                }
            }
        ];
        const results = await imagesCollection.aggregate(pipeline).toArray();
        return results[0] ?? null;
    }

    async updateImageName(imageId, newName) {
        if (!ObjectId.isValid(imageId)) {
            return 0;
        }
        const db = this.mongoClient.db(this.dbName);
        const imagesCollection = db.collection(this.imagesCollectionName);
        const result = await imagesCollection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }
}
