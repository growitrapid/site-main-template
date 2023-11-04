"use server";

import clientPromise from "@/db/db";
import { matchPermissions } from "./auth";
import { Response, ServerFunctionResponse } from "./functions";
import config from "@/config";
import { roleType } from "@/types/auth";
import { ObjectId } from "mongodb";
import { PermissionsArrayType, operator_permissions, user_permissions } from "@/types/permissions";
import { revalidatePath } from "next/cache";

const default_roles: roleType[] = [
    {
        _id: '1',
        name: 'user',
        description: 'This role is assigned to all users by default',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '1',
        updatedBy: '1',
        permissions: user_permissions,
        rank: 1,
        status: 'active'
    },
    {
        _id: '2',
        name: 'operator',
        description: 'This role has the maximum permissions. Assigned to all operators.',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '1',
        updatedBy: '1',
        permissions: operator_permissions as any,
        rank: 2,
        status: 'active'
    },
];

/**
 * Get all roles
 */
export async function getRoles(): Promise<ServerFunctionResponse<roleType[] | null>> {
    try {
        // Match permissions to get if the user has the permission to edit user
        // If the user has the permission to edit user, then edit the user
        const t = await matchPermissions(["role_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to edit users");
        const { session, isMatched, matches } = t;

        // If the user is not an operator, then they can not assign roles to any user including self.
        // If the user is an operator, then they can edit any user's profile
        if (!matches.includes("role_view"))
            return Response("error", null, 401, "You don't have the permission to edit users");

        // If there is no match, then the user doesn't have the permission to edit any user including self.
        if (!isMatched) return Response("error", null, 401, "You don't have the permission to edit users");

        const client = await clientPromise;

        const db = client.db(config.db.root_name);
        const roles_collection = db.collection<roleType>("roles");

        const serverRoles = (await roles_collection.find().toArray()).map(role => ({
            ...role,
            _id: role._id.toString()
        }));

        const roles = [...default_roles, ...serverRoles];

        return Response("success", roles, 200, "Roles fetched");
    } catch (e) {
        console.error(e);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Get a role by id
 */
export async function getRoleById(id: string): Promise<ServerFunctionResponse<roleType | null>> {
    try {
        // Match permissions to get if the user has the permission to edit user
        // If the user has the permission to edit user, then edit the user
        const t = await matchPermissions(["role_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to edit users");
        const { session, isMatched, matches } = t;

        // If the user is not an operator, then they can not assign roles to any user including self.
        // If the user is an operator, then they can edit any user's profile
        if (!matches.includes("role_view"))
            return Response("error", null, 401, "You don't have the permission to edit users");

        // If there is no match, then the user doesn't have the permission to edit any user including self.
        if (!isMatched) return Response("error", null, 401, "You don't have the permission to edit users");

        const client = await clientPromise;

        const db = client.db(config.db.root_name);
        const roles_collection = db.collection<roleType>("roles");

        const role = await roles_collection.findOne({
            _id: new ObjectId(id),
        });

        return Response("success", role, 200, "Role fetched");
    } catch (e) {
        console.error(e);
        return Response("error", null, 500, "Internal server error");
    }
}

/**
 * Get Role by name
 */
export async function getRoleByName(name: string): Promise<ServerFunctionResponse<roleType | null>> {
    try {
        // Match permissions to get if the user has the permission to edit user
        // If the user has the permission to edit user, then edit the user
        const t = await matchPermissions(["role_view"]);
        if (!t) return Response("error", null, 401, "You don't have the permission to edit users");
        const { session, isMatched, matches } = t;

        // If the user is not an operator, then they can not assign roles to any user including self.
        // If the user is an operator, then they can edit any user's profile
        if (!matches.includes("role_view"))
            return Response("error", null, 401, "You don't have the permission to edit users");

        // If there is no match, then the user doesn't have the permission to edit any user including self.
        if (!isMatched) return Response("error", null, 401, "You don't have the permission to edit users");

        const client = await clientPromise;

        const db = client.db(config.db.root_name);
        const roles_collection = db.collection<roleType>("roles");

        const role = await roles_collection.findOne({
            name: name
        });

        // If the role doesn't exist, then check if the role is a default role
        if (!role) {
            const default_role = default_roles.find(role => role.name === name);
            if (!default_role) return Response("error", null, 400, "Role doesn't exist");
            return Response("success", default_role, 200, "Role fetched");
        }

        return Response("success", role, 200, "Role fetched");
    } catch (e) {
        console.error(e);
        return Response("error", null, 500, "Internal server error");
    }
}