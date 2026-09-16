import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await db.orm.public.Activity
      .where({ id: activityId })
      .include("words")
      .first();

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load activity" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await db.orm.public.Activity
      .where({ id: activityId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existing.name;

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : existing.type;

    const difficulty =
      typeof body.difficulty === "string"
        ? body.difficulty.trim()
        : existing.difficulty;

    if (!name) {
      return NextResponse.json(
        { error: "Activity name cannot be empty" },
        { status: 400 }
      );
    }

    if (!["wordle", "word-search"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 }
      );
    }

    const activity = await db.orm.public.Activity
      .where({ id: activityId })
      .update({
        name,
        type,
        difficulty,
        maxGuesses:
          body.maxGuesses !== undefined
            ? Number(body.maxGuesses)
            : existing.maxGuesses,
        rows:
          body.rows !== undefined
            ? Number(body.rows)
            : existing.rows,
        columns:
          body.columns !== undefined
            ? Number(body.columns)
            : existing.columns,
        showHints:
          typeof body.showHints === "boolean"
            ? body.showHints
            : existing.showHints,
      });

    return NextResponse.json(activity);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Activity
      .where({ id: activityId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Activity
      .where({ id: activityId })
      .delete();

    return NextResponse.json({
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
