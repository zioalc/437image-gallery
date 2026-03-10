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
}
