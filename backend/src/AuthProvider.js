import crypto from "crypto";
import { getEnvVar } from "./getEnvVar.js";

function hashPassword(password, salt = crypto.randomBytes(16)) {
    const hash = crypto.scryptSync(password, salt, 64);
    return {
        salt: salt.toString("hex"),
        hash: hash.toString("hex")
    };
}

function verifyPassword(password, saltHex, hashHex) {
    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    const actualHash = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(expectedHash, actualHash);
}

export class AuthProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.dbName = getEnvVar("DB_NAME");
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME", false) || "users";
        this.tokenToUser = new Map();
    }

    async registerUser({ username, email, password }) {
        const usersCollection = this.mongoClient.db(this.dbName).collection(this.usersCollectionName);
        const existing = await usersCollection.findOne({ username });
        if (existing) {
            return { user: null, error: "Username already exists" };
        }
        const { salt, hash } = hashPassword(password);
        const result = await usersCollection.insertOne({
            username,
            email,
            passwordSalt: salt,
            passwordHash: hash
        });
        return {
            user: {
                _id: result.insertedId,
                username,
                email
            },
            error: null
        };
    }

    async loginUser({ username, password }) {
        const usersCollection = this.mongoClient.db(this.dbName).collection(this.usersCollectionName);
        const user = await usersCollection.findOne({ username });
        if (!user || !user.passwordSalt || !user.passwordHash) {
            return null;
        }
        const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
        if (!isValid) {
            return null;
        }
        return {
            _id: user._id,
            username: user.username,
            email: user.email
        };
    }

    issueToken(user) {
        const token = crypto.randomBytes(24).toString("hex");
        this.tokenToUser.set(token, user);
        return token;
    }

    getUserForToken(token) {
        return this.tokenToUser.get(token) ?? null;
    }
}
