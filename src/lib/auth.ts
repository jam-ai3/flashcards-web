"use server";

import { jwtVerify, SignJWT } from "jose";
import { headers } from "next/headers";
import { Session } from "./types";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: Session) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as Session;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const arrayBuffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password)
  );
  return Buffer.from(arrayBuffer).toString("hex");
}

export async function verifyPassword(password: string, hash: string) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function getSession() {
  const head = await headers();
  const jwt = head
    .get("cookie")
    ?.split("; ")
    .filter((v) => v.startsWith(process.env.JWT_KEY!));
  if (jwt === undefined || jwt.length === 0) {
    return null;
  }
  const token = jwt[0].split("=")[1];
  if (token) {
    const decoded = await verifyToken(token);
    return decoded;
  }
  return null;
}
