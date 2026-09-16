import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

const TYPES = ["wordle", "word-search"];
const DIFFICULTIES = ["easy", "medium", "hard"];

export async function GET() {
  try {
    const activities = await db.orm.public.Activity
      .include("words")
      .all();

    return NextResponse.json(activities);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const type =
      typeof body.type === "string" ? body.type.trim() : "";
    const difficulty =
      typeof body.difficulty === "string"
        ? body.difficulty.trim()
        : "medium";

    if (!name) {
      return NextResponse.json(
        { error: "Activity name is required" },
        { status: 400 }
      );
    }

    if (!TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Type must be wordle or word-search" },
        { status: 400 }
      );
    }

    if (!DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be easy, medium or hard" },
        { status: 400 }
      );
    }

    const maxGuesses = Number(body.maxGuesses ?? 6);
    const rows = Number(body.rows ?? 10);
    const columns = Number(body.columns ?? 10);

    if (
      !Number.isInteger(maxGuesses) ||
      maxGuesses < 1 ||
      maxGuesses > 20
    ) {
      return NextResponse.json(
        { error: "maxGuesses must be between 1 and 20" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 5 ||
      rows > 30 ||
      columns < 5 ||
      columns > 30
    ) {
      return NextResponse.json(
        { error: "Rows and columns must be between 5 and 30" },
        { status: 400 }
      );
    }

    const activity = await db.orm.public.Activity.create({
      name,
      type,
      difficulty,
      maxGuesses,
      rows,
      columns,
      showHints:
        typeof body.showHints === "boolean"
          ? body.showHints
          : true,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
