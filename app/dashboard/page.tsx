import PageTimeTracker from "@/components/PageTimeTracker";
import Link from "next/link";
import { Pool } from "pg";
import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const activities = await db.orm.public.Activity
    .include("words")
    .all();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  let metrics;
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'generation')::int AS generations,
        COUNT(*) FILTER (WHERE event_type = 'generation' AND success = true)::int AS successes,
        COUNT(*) FILTER (WHERE event_type = 'generation' AND success = false)::int AS failures,
        ROUND(AVG(duration_seconds) FILTER (WHERE event_type = 'page_view'), 1) AS avg_page_seconds
      FROM activity_metrics
    `);
    metrics = result.rows[0];
  } finally {
    await pool.end();
  }

  const total = activities.length;
  const wordle = activities.filter((a) => a.type === "wordle").length;
  const wordSearch = activities.filter((a) => a.type === "word-search").length;
  const words = activities.reduce((sum, a) => sum + a.words.length, 0);

  const cards = [
    { label: "Total Activities", value: total },
    { label: "Phoneme Wordle", value: wordle },
    { label: "Phoneme Word Search", value: wordSearch },
    { label: "Stored Words", value: words },
    { label: "Successful Generations", value: metrics.successes },
    { label: "Failed Generations", value: metrics.failures },
    {
      label: "Generation Success Rate",
      value: metrics.generations
        ? `${Math.round(metrics.successes / metrics.generations * 100)}%`
        : "N/A",
    },
    {
      label: "Average Time on Page",
      value: metrics.avg_page_seconds
        ? `${metrics.avg_page_seconds}s`
        : "N/A",
    },
  ];

  return (
    <main className="section-pad" style={{ maxWidth: 1200, margin: "auto" }}>
      <PageTimeTracker />
      <span className="eyebrow">Assessment 3 · Operational Analytics</span>
      <h1>Phoneme Studio Dashboard</h1>
      <p>Live statistics retrieved from the PostgreSQL database.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginTop: 32
      }}>
        {cards.map((metric) => (
          <article key={metric.label} className="feature-card">
            <p>{metric.label}</p>
            <h2 style={{ fontSize: 38 }}>{metric.value}</h2>
          </article>
        ))}
      </div>

      <section style={{ marginTop: 40 }}>
        <h2>Saved Activity Configurations</h2>
        {activities.length === 0 ? (
          <p>No activities saved yet. Create one in Teacher Manager.</p>
        ) : (
          <div className="feature-grid" style={{ marginTop: 20 }}>
            {activities.map((activity) => (
              <article className="feature-card" key={activity.id}>
                <h3>{activity.name}</h3>
                <p>Type: {activity.type}</p>
                <p>Difficulty: {activity.difficulty}</p>
                <p>Words: {activity.words.length}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div style={{ marginTop: 32 }}>
        <Link className="btn primary" href="/teacher">
          Manage Activities
        </Link>
      </div>
    </main>
  );
}
