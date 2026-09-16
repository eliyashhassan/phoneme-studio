"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Word = {
  id: number;
  englishWord: string;
  hint: string | null;
  phonemes: string[];
  activityId: number;
};

type Activity = {
  id: number;
  name: string;
  type: string;
  difficulty: string;
  maxGuesses: number;
  rows: number;
  columns: number;
  showHints: boolean;
  words: Word[];
};

const card: React.CSSProperties = {
  background: "var(--card, #fff)",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 20,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  font: "inherit",
  background: "transparent",
  color: "inherit",
};

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
};

export default function TeacherManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState("Loading database...");
  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState("wordle");
  const [word, setWord] = useState("");
  const [phonemes, setPhonemes] = useState("");
  const [hint, setHint] = useState("");
  const [editingWordId, setEditingWordId] = useState<number | null>(null);

  const selected = useMemo(
    () => activities.find((a) => a.id === selectedId) ?? null,
    [activities, selectedId]
  );

  const loadActivities = useCallback(async () => {
    try {
      const response = await fetch("/api/activities", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load activities");

      const data: Activity[] = await response.json();
      setActivities(data);

      setSelectedId((current) => {
        if (current && data.some((a) => a.id === current)) return current;
        return data[0]?.id ?? null;
      });

      setStatus(
        data.length
          ? `${data.length} stored configuration(s) loaded.`
          : "No activities yet. Create the first configuration."
      );
    } catch {
      setStatus("Could not connect to the backend.");
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  async function createActivity(e: FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: activityName,
        type: activityType,
        difficulty: "medium",
        maxGuesses: 6,
        rows: 10,
        columns: 10,
        showHints: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not create activity.");
      return;
    }

    setActivityName("");
    setSelectedId(data.id);
    setStatus("Activity configuration saved to PostgreSQL.");
    await loadActivities();
  }

  async function saveSettings() {
    if (!selected) return;

    const response = await fetch(`/api/activities/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: selected.name,
        type: selected.type,
        difficulty: selected.difficulty,
        maxGuesses: selected.maxGuesses,
        rows: selected.rows,
        columns: selected.columns,
        showHints: selected.showHints,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not save settings.");
      return;
    }

    setStatus("Activity settings updated in PostgreSQL.");
    await loadActivities();
  }

  async function deleteActivity() {
    if (!selected) return;
    if (!window.confirm(`Delete "${selected.name}" and its stored words?`)) return;

    const response = await fetch(`/api/activities/${selected.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not delete activity.");
      return;
    }

    setSelectedId(null);
    setStatus("Activity deleted.");
    await loadActivities();
  }

  async function saveWord(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;

    const payload = {
      englishWord: word,
      hint,
      phonemes: phonemes
        .split(/[\s,]+/)
        .map((p) => p.trim())
        .filter(Boolean),
      activityId: selected.id,
    };

    const url = editingWordId
      ? `/api/words/${editingWordId}`
      : "/api/words";

    const response = await fetch(url, {
      method: editingWordId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not save word.");
      return;
    }

    setWord("");
    setPhonemes("");
    setHint("");
    setEditingWordId(null);
    setStatus(editingWordId ? "Word updated." : "Word stored in PostgreSQL.");
    await loadActivities();
  }

  function editWord(item: Word) {
    setEditingWordId(item.id);
    setWord(item.englishWord);
    setPhonemes(item.phonemes.join(" "));
    setHint(item.hint ?? "");
    setStatus(`Editing "${item.englishWord}".`);
  }

  async function deleteWord(id: number) {
    const response = await fetch(`/api/words/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not delete word.");
      return;
    }

    if (editingWordId === id) {
      setEditingWordId(null);
      setWord("");
      setPhonemes("");
      setHint("");
    }

    setStatus("Word deleted.");
    await loadActivities();
  }

  function updateSelected(patch: Partial<Activity>) {
    if (!selected) return;

    setActivities((current) =>
      current.map((activity) =>
        activity.id === selected.id
          ? { ...activity, ...patch }
          : activity
      )
    );
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={card} className="teacher-manager-card">
        <p className="eyebrow">TEACHER MANAGEMENT</p>
        <h2 style={{ marginTop: 5 }}>Database activity manager</h2>
        <p>
          Create reusable activity configurations and manage phoneme words.
          Changes are stored through the backend API in PostgreSQL.
        </p>

        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#f3f4f6",
            marginTop: 12,
            color: "#111827",
          }}
          aria-live="polite"
          className="teacher-manager-status"
        >
          {status}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
          gap: 20,
        }}
      >
        <form onSubmit={createActivity} style={card} className="teacher-manager-card">
          <h3>Create activity configuration</h3>

          <label>
            Configuration name
            <input
              style={inputStyle}
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Year 7 Wordle"
              required
            />
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            Activity type
            <select
              style={inputStyle}
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
            >
              <option value="wordle">Wordle</option>
              <option value="word-search">Word Search</option>
            </select>
          </label>

          <button
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: 16,
              background: "#6d42f5",
              color: "white",
            }}
          >
            + Create configuration
          </button>
        </form>

        <div style={card} className="teacher-manager-card">
          <h3>Stored configurations</h3>

          <select
            style={inputStyle}
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            <option value="" disabled>
              Select activity
            </option>

            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name} — {activity.type}
              </option>
            ))}
          </select>

          {selected && (
            <div style={{ marginTop: 15, display: "grid", gap: 10 }}>
              <label>
                Name
                <input
                  style={inputStyle}
                  value={selected.name}
                  onChange={(e) =>
                    updateSelected({ name: e.target.value })
                  }
                />
              </label>

              <label>
                Difficulty
                <select
                  style={inputStyle}
                  value={selected.difficulty}
                  onChange={(e) =>
                    updateSelected({ difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              {selected.type === "wordle" && (
                <label>
                  Maximum guesses
                  <input
                    style={inputStyle}
                    type="number"
                    min={1}
                    max={20}
                    value={selected.maxGuesses}
                    onChange={(e) =>
                      updateSelected({
                        maxGuesses: Number(e.target.value),
                      })
                    }
                  />
                </label>
              )}

              {selected.type === "word-search" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <label>
                    Rows
                    <input
                      style={inputStyle}
                      type="number"
                      min={5}
                      max={30}
                      value={selected.rows}
                      onChange={(e) =>
                        updateSelected({ rows: Number(e.target.value) })
                      }
                    />
                  </label>

                  <label>
                    Columns
                    <input
                      style={inputStyle}
                      type="number"
                      min={5}
                      max={30}
                      value={selected.columns}
                      onChange={(e) =>
                        updateSelected({ columns: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
              )}

              <label>
                <input
                  type="checkbox"
                  checked={selected.showHints}
                  onChange={(e) =>
                    updateSelected({ showHints: e.target.checked })
                  }
                />{" "}
                Show hints
              </label>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={saveSettings}
                  style={{
                    ...buttonStyle,
                    background: "#111827",
                    color: "white",
                  }}
                >
                  Save settings
                </button>

                <button
                  type="button"
                  onClick={deleteActivity}
                  style={{
                    ...buttonStyle,
                    background: "#fee2e2",
                    color: "#991b1b",
                  }}
                >
                  Delete configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: 20,
          }}
        >
          <form onSubmit={saveWord} style={card} className="teacher-manager-card">
            <h3>{editingWordId ? "Edit word" : "Add phoneme word"}</h3>

            <label>
              English word
              <input
                style={inputStyle}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="chair"
                required
              />
            </label>

            <label style={{ display: "block", marginTop: 12 }}>
              Phonemes
              <input
                style={inputStyle}
                value={phonemes}
                onChange={(e) => setPhonemes(e.target.value)}
                placeholder="tʃ eə"
                required
              />
            </label>

            <small>
              Separate phonemes with spaces. Multi-character phonemes such as
              tʃ, dʒ and iː remain one phoneme.
            </small>

            <label style={{ display: "block", marginTop: 12 }}>
              Hint
              <input
                style={inputStyle}
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Something you sit on"
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  ...buttonStyle,
                  background: "#6d42f5",
                  color: "white",
                }}
              >
                {editingWordId ? "Save word changes" : "+ Add word"}
              </button>

              {editingWordId && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    setEditingWordId(null);
                    setWord("");
                    setPhonemes("");
                    setHint("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div style={card} className="teacher-manager-card">
            <h3>
              Stored words{" "}
              <span style={{ fontWeight: 400 }}>
                ({selected.words?.length ?? 0})
              </span>
            </h3>

            {!selected.words?.length && (
              <p>No words stored for this configuration yet.</p>
            )}

            <div style={{ display: "grid", gap: 9 }}>
              {selected.words?.map((item) => (
                <div
                  key={item.id}
                  className="teacher-manager-word"
                  style={{
                    border: "1px solid #334155",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <strong>{item.englishWord}</strong>
                  <div>/{item.phonemes.join(" ")}/</div>

                  {item.hint && (
                    <small style={{ display: "block", marginTop: 4 }}>
                      {item.hint}
                    </small>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      marginTop: 9,
                    }}
                  >
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => editWord(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      style={{
                        ...buttonStyle,
                        background: "#fee2e2",
                        color: "#991b1b",
                      }}
                      onClick={() => deleteWord(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={card} className="teacher-manager-card">
        <h3>Generate student activities</h3>
        <p>
          The builders below now load their activity configuration and words
          from the backend instead of using the original hardcoded word lists.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn primary" href="/wordle">
            Open database Wordle
          </Link>
          <Link className="btn secondary" href="/word-search">
            Open database Word Search
          </Link>
        </div>
      </div>
    </div>
  );
}
