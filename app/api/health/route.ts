import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    await db.orm.public.Activity.select("id").limit(1).all();

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        service: "Phoneme Studio API",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
