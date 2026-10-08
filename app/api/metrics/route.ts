import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT event_type, activity_type, duration_seconds,
             success, created_at
      FROM activity_metrics
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventType = String(body.event_type ?? "").trim();
    const activityType = body.activity_type ?? null;
    const duration = body.duration_seconds ?? null;
    const success = body.success ?? null;

    if (!["page_view", "generation"].includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO activity_metrics
       (event_type, activity_type, duration_seconds, success)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [eventType, activityType, duration, success]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save metric" },
      { status: 500 }
    );
  }
}
