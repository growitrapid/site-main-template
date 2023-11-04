"use server";

import config from "@/config";
import clientPromise from "@/db/db";
import { DBAuthType } from "@/types/auth";
import { ObjectId, WithId } from "mongodb";
import { matchPermissions } from "./auth";
import { Response, ServerFunctionResponse } from "./functions";
import { forced_operators } from "@/app/api/auth/[...nextauth]/session";

/**
 * Get a user by their ID
 */
export async function getUserByID(id: string): Promise<ServerFunctionResponse<WithId<DBAuthType> | null>> {
    try {
        // Match permissions to view user
        // If the user has the permission to view user, then return the user
        const t = await matchPermissions(["user_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to view users");
        const { session, isMatched, matches } = t;

        if (!isMatched) return Response("error", null, 401, "You don't have the permission to view users");

        const client = await clientPromise;

        const db = client.db(config.db.auth_name);
        const user_collection = db.collection<DBAuthType>("users");

        const user = await user_collection.findOne({ _id: new ObjectId(id) });

        // If the user is an forced operator, then add the operator role to the user
        if (forced_operators.includes(user?.email || "") && !user?.roles.includes("operator")) {
            user?.roles.push("operator");
        }

        return Response("success", user);
    } catch (error) {
        console.error(error);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Get users by their role
 */
export async function getUsersByRole(role: string): Promise<ServerFunctionResponse<WithId<DBAuthType>[] | null>> {
    try {
        // Match permissions to view user
        // If the user has the permission to view user, then return the user
        const t = await matchPermissions(["user_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to view users");
        const { session, isMatched, matches } = t;

        if (!isMatched) return Response("error", null, 401, "You don't have the permission to view users");

        const client = await clientPromise;

        const db = client.db(config.db.auth_name);
        const user_collection = db.collection<DBAuthType>("users");

        const users = await user_collection.find({ roles: role }).toArray();

        // If the user is an forced operator, then add the operator role to the user
        users.forEach(user => {
            if (forced_operators.includes(user?.email || "") && !user?.roles.includes("operator")) {
                user?.roles.push("operator");
            }
        });

        return Response("success", users);
    } catch (error) {
        console.error(error);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Search for users by name, email, phone, etc.
 */
export async function searchForUser(
    query: string,
    limit: number = 10,
    skip: number = 0,
): Promise<ServerFunctionResponse<{ users: Partial<DBAuthType>[]; total: number; } | null>> {
    try {
        if (!query || query === "") return Response("error", null, 400, "Query is required");

        // Match permissions to view user
        // If the user has the permission to view user, then return the user
        const t = await matchPermissions(["user_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to view users");
        const { session, isMatched, matches } = t;

        if (!isMatched) return Response("error", null, 401, "You don't have the permission to view users");

        const client = await clientPromise;

        const db = client.db(config.db.auth_name);
        const user_collection = db.collection<DBAuthType>("users");

        const users = await user_collection.find({
            $text: {
                $search: query,
                $caseSensitive: false,
                $diacriticSensitive: false,
            }
        }).skip(skip).limit(limit).toArray();

        const total = await user_collection.countDocuments({
            $text: {
                $search: query,
                $caseSensitive: false,
                $diacriticSensitive: false,
            }
        });

        const new_users = users.map<Partial<DBAuthType>>((user: WithId<DBAuthType>) => {
            if (forced_operators.includes(user?.email || "") && !user?.roles.includes("operator")) {
                user?.roles.push("operator");
            }

            return {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image,
                bio: user.bio,
                emailVerified: user.emailVerified,
                roles: user.roles,
                status: user.status,
            };
        });

        return Response("success", {
            users: new_users,
            total,
        }, 200, "Success");
    } catch (error) {
        console.error(error);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Filter users by any field
 */
export async function filterUsers(
    filter: Partial<DBAuthType>,
    limit: number = 10,
    skip: number = 0,
): Promise<ServerFunctionResponse<{ users: DBAuthType[]; total: number; } | null>> {
    try {
        // Match permissions to view user
        // If the user has the permission to view user, then return the user
        const t = await matchPermissions(["user_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to view users");
        const { session, isMatched, matches } = t;

        if (!isMatched) return Response("error", null, 401, "You don't have the permission to view users");

        const client = await clientPromise;

        const db = client.db(config.db.auth_name);
        const user_collection = db.collection<DBAuthType>("users");

        const users = (await user_collection.find(filter).skip(skip).limit(limit).toArray()).map(user => ({
            ...user,
            _id: user._id.toString(),
            // If the user is an forced operator, then add the operator role to the user
            ...((forced_operators.includes(user?.email || "") && !user?.roles.includes("operator")) ? { roles: [...user.roles, "operator"] } : {}),
        }));

        const total = await user_collection.countDocuments(filter);

        return Response("success", { users, total }, 200, "Success");
    } catch (error) {
        console.error(error);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Update a user by their ID
 */
export async function updateUserByID(
    id: string,
    update: Partial<DBAuthType>,
): Promise<ServerFunctionResponse<WithId<DBAuthType> | null>> {
    try {
        // Match permissions to edit other user or edit self
        // If this user has the permission to edit other user, then return the user
        const t = await matchPermissions(["user_edit", "user_edit_others"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to edit users");
        const { session, isMatched, matches } = t;

        // If the user is not an operator, then they can only edit their own profile
        // If the user is an operator, then they can edit any user's profile
        if (!matches.includes("user_edit_others")
            && (session?.user?.id !== id
                || !matches.includes("user_edit")))
            return Response("error", null, 401, "You don't have the permission to edit users");

        // If there is no match, then the user doesn't have the permission to edit any user including self.
        if (!isMatched) return Response("error", null, 401, "You don't have the permission to edit users");

        const client = await clientPromise;

        const db = client.db(config.db.auth_name);
        const user_collection = db.collection<DBAuthType>("users");

        const user = await user_collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: "after" });

        return Response("success", user);
    } catch (error) {
        console.error(error);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Create a new user
 * May be created by an operator or by the user themselves through the signup page
 * If the user is created by an operator, then the user will be created with the status "active"
 * If the user is created by the user themselves, then the user will be created with the status "pending"
 * Also the user will be created with the role "user" and a payload of created user will be received through
 * parameter of this function
 */
export async function createUser(
    user: Partial<DBAuthType>
): Promise<ServerFunctionResponse<WithId<DBAuthType> | null>> {
    try {
        // Match permissions to get if the user has the permission to create user
        // If the user has the permission to create user, then create the user as active
        const t = await matchPermissions(["user_add"]);
        const { session, isMatched, matches } = t!;
        const isCreatedFromOperator = matches.includes("user_add");

        const client = await clientPromise;
        const db = client.db(config.db.auth_name);
        const user_collection = db.collection<DBAuthType>("users");

        if (!user.email || user.email === "") return Response("error", null, 400, "Email is required");

        // Create a new user object
        const new_user: DBAuthType = {
            ...user as DBAuthType,
            roles: ["user", ...(user.roles || [])],
            status: user.status || (isCreatedFromOperator ? "active" : "pending"),
            createdAt: user.createdAt || new Date(),
        };

        // If user exists, then update the user
        // If user doesn't exist, then create a new user
        const result = await user_collection.updateOne({ email: user.email }, { $set: new_user }, { upsert: true });

        // Get the user from the database
        const created_user = await user_collection.findOne({
            $or: [
                { _id: result.upsertedId! },
                { email: user.email },
            ]
        });

        return Response("success", created_user, 200, "Success");

    } catch (error) {
        console.error(error);
        return Response("error", null, 500, "Internal server error");
    }
}