import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    const words = await db.orm.public.Word
      .include("activity")
      .all();

    return NextResponse.json(words);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load words" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const englishWord =
      typeof body.englishWord === "string"
        ? body.englishWord.trim()
        : "";

    const hint =
      typeof body.hint === "string" && body.hint.trim()
        ? body.hint.trim()
        : null;

    const phonemes = Array.isArray(body.phonemes)
      ? body.phonemes
          .filter((item: unknown) => typeof item === "string")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];

    const activityId = Number(body.activityId);

    if (!englishWord) {
      return NextResponse.json(
        { error: "English word is required" },
        { status: 400 }
      );
    }

    if (phonemes.length === 0) {
      return NextResponse.json(
        { error: "At least one phoneme is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Valid activityId is required" },
        { status: 400 }
      );
    }

    const activity = await db.orm.public.Activity
      .where({ id: activityId })
      .first();

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const word = await db.orm.public.Word.create({
      englishWord,
      hint,
      phonemes,
      activityId,
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}
