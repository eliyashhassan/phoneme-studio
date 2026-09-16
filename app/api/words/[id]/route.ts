import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const word = await db.orm.public.Word
      .where({ id: wordId })
      .include("activity")
      .first();

    if (!word) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load word" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Word
      .where({ id: wordId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const englishWord =
      typeof body.englishWord === "string"
        ? body.englishWord.trim()
        : existing.englishWord;

    const hint =
      body.hint === null
        ? null
        : typeof body.hint === "string"
          ? body.hint.trim() || null
          : existing.hint;

    const phonemes = Array.isArray(body.phonemes)
      ? body.phonemes
          .filter((item: unknown) => typeof item === "string")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [...existing.phonemes];

    const activityId =
      body.activityId !== undefined
        ? Number(body.activityId)
        : existing.activityId;

    if (!englishWord || phonemes.length === 0) {
      return NextResponse.json(
        { error: "Word and at least one phoneme are required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activityId" },
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

    const word = await db.orm.public.Word
      .where({ id: wordId })
      .update({
        englishWord,
        hint,
        phonemes,
        activityId,
      });

    return NextResponse.json(word);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Word
      .where({ id: wordId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Word
      .where({ id: wordId })
      .delete();

    return NextResponse.json({
      message: "Word deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    );
  }
}
