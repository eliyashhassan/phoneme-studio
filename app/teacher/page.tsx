import TeacherManager from "@/components/TeacherManager";

export default function TeacherPage() {
  return (
    <main className="section-pad">
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <p className="eyebrow">PHONEME STUDIO</p>
        <h1>Teacher Activity Manager</h1>
        <p style={{ maxWidth: 760, marginBottom: 24 }}>
          Manage reusable Wordle and Word Search configurations, phoneme
          word lists, hints and activity settings stored in PostgreSQL.
        </p>
        <TeacherManager />
      </div>
    </main>
  );
}
