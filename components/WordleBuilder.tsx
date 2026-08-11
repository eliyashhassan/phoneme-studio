"use client";

import { useMemo, useState } from "react";

type WordItem = {
  word: string;
  phonemes: string[];
};

type TileState = "correct" | "present" | "absent";

const WORDS: WordItem[] = [
  { word: "thin", phonemes: ["θ", "ɪ", "n"] },
  { word: "then", phonemes: ["ð", "e", "n"] },
  { word: "bad", phonemes: ["b", "æ", "d"] },
  { word: "bed", phonemes: ["b", "e", "d"] },
  { word: "boot", phonemes: ["b", "ʉː", "t"] },
  { word: "chin", phonemes: ["tʃ", "ɪ", "n"] },
  { word: "jam", phonemes: ["dʒ", "æ", "m"] },
  { word: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
  { word: "fan", phonemes: ["f", "æ", "n"] },
  { word: "van", phonemes: ["v", "æ", "n"] },
  { word: "sun", phonemes: ["s", "ɐ", "n"] },
];

const KEYBOARD = [
  "p", "t", "k", "b", "d", "ɡ", "n", "m", "ŋ",
  "f", "s", "θ", "ʃ", "v", "z", "ð", "ʒ",
  "l", "ɹ", "w", "j", "h", "tʃ", "dʒ",
  "iː", "ɪ", "e", "eː", "æ", "ɐ", "ɐː", "ɜː",
  "ʉː", "ɔ", "oː", "ʊ", "æɪ", "ɑe", "oɪ", "əʉ",
  "æɔ", "ɪə", "ə",
];

const HINTS: Record<string, string> = {
  θ: "TH (as in thin)",
  ð: "TH (as in then)",
  ɪ: "I (as in sit)",
  æ: "A (as in cat)",
  ɐ: "U (as in cup)",
  "ʉː": "OO (as in boot)",
  tʃ: "CH (as in chin)",
  dʒ: "J (as in jam)",
  ŋ: "NG (as in ring)",
  ɹ: "R (as in ring)",
  e: "E (as in bed)",
  n: "N sound",
  b: "B sound",
  d: "D sound",
  f: "F sound",
  v: "V sound",
  s: "S sound",
};

function evaluateGuess(guess: string[], answer: string[]): TileState[] {
  const result: TileState[] = Array(answer.length).fill("absent");
  const remaining = [...answer];

  guess.forEach((phoneme, index) => {
    if (phoneme === answer[index]) {
      result[index] = "correct";
      remaining[index] = "";
    }
  });

  guess.forEach((phoneme, index) => {
    if (result[index] === "correct") return;
    const foundIndex = remaining.indexOf(phoneme);
    if (foundIndex !== -1) {
      result[index] = "present";
      remaining[foundIndex] = "";
    }
  });

  return result;
}

export default function WordleBuilder() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("Easy");
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [results, setResults] = useState<TileState[][]>([]);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);

  const target = WORDS[targetIndex];

  const maxAttempts = useMemo(() => {
    if (difficulty === "Hard") return 4;
    if (difficulty === "Medium") return 5;
    return 6;
  }, [difficulty]);

  function resetGame() {
    setCurrentGuess([]);
    setGuesses([]);
    setResults([]);
    setMessage("");
    setFinished(false);
  }

  function changeTarget(index: number) {
    setTargetIndex(index);
    setCurrentGuess([]);
    setGuesses([]);
    setResults([]);
    setMessage("");
    setFinished(false);
  }

  function addPhoneme(phoneme: string) {
    if (finished || guesses.length >= maxAttempts) return;
    if (currentGuess.length < target.phonemes.length) {
      setCurrentGuess((old) => [...old, phoneme]);
      setMessage("");
    }
  }

  function removePhoneme() {
    if (finished) return;
    setCurrentGuess((old) => old.slice(0, -1));
    setMessage("");
  }

  function submitGuess() {
    if (finished) return;

    if (currentGuess.length !== target.phonemes.length) {
      setMessage(`Choose ${target.phonemes.length} phonemes before submitting.`);
      return;
    }

    const evaluation = evaluateGuess(currentGuess, target.phonemes);
    const nextGuesses = [...guesses, currentGuess];

    setGuesses(nextGuesses);
    setResults((old) => [...old, evaluation]);

    const correct = currentGuess.every(
      (phoneme, index) => phoneme === target.phonemes[index]
    );

    if (correct) {
      setFinished(true);
      setMessage(`Correct! The English word is “${target.word.toUpperCase()}”.`);
    } else if (nextGuesses.length >= maxAttempts) {
      setFinished(true);
      setMessage(`Game over. The word was “${target.word.toUpperCase()}”.`);
    } else {
      setMessage("Not quite. Use the feedback and try again.");
    }

    setCurrentGuess([]);
  }

  function generateHTML() {
    const data = JSON.stringify({
      answer: target.phonemes,
      keyboard: KEYBOARD,
      hints: HINTS,
      word: target.word,
      maxAttempts,
    });

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phoneme Wordle</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:30px 16px;background:#f5f7fb;color:#111827;font-family:"Arial Unicode MS","Segoe UI Symbol","Lucida Sans Unicode",Arial,sans-serif}
.game{max-width:760px;margin:auto;background:#fff;padding:28px;border:1px solid #e5e7eb;border-radius:22px;box-shadow:0 20px 50px rgba(15,23,42,.1)}
h1{text-align:center;margin:0 0 8px}.sub{text-align:center;color:#64748b;margin-bottom:24px}
.board{display:flex;flex-direction:column;gap:8px;align-items:center;margin:24px 0}.row{display:flex;gap:8px}
.tile{width:58px;height:58px;border:2px solid #e5e7eb;border-radius:12px;display:grid;place-items:center;font-size:24px;font-weight:800}
.correct{background:#22c55e;border-color:#16a34a;color:#fff}.present{background:#eab308;border-color:#ca8a04;color:#fff}.absent{background:#64748b;border-color:#475569;color:#fff}
.keyboard{display:flex;flex-wrap:wrap;justify-content:center;gap:7px}.key{min-width:44px;min-height:42px;border:1px solid #e5e7eb;border-radius:9px;background:#f8fafc;font-weight:700;cursor:pointer}
.actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}.actions button{border:0;border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer}.submit{background:#6d42f5;color:#fff}.secondary{background:#e5e7eb}
#message{text-align:center;min-height:28px;margin:16px 0;font-weight:700}
</style>
</head>
<body>
<main class="game">
<h1>Phoneme Wordle</h1>
<p class="sub">Find the word. Each tile represents one phoneme.</p>
<div id="board" class="board"></div>
<div id="message" aria-live="polite"></div>
<div id="keyboard" class="keyboard"></div>
<div class="actions">
<button id="delete" class="secondary">Delete</button>
<button id="submit" class="submit">Submit Guess</button>
<button id="reset" class="secondary">Reset</button>
</div>
</main>
<script>
const DATA=${data};
let current=[], guesses=[], results=[], finished=false;

function evaluate(guess){
  const result=Array(DATA.answer.length).fill("absent");
  const remaining=[...DATA.answer];
  guess.forEach((p,i)=>{if(p===DATA.answer[i]){result[i]="correct";remaining[i]="";}});
  guess.forEach((p,i)=>{if(result[i]==="correct")return;const found=remaining.indexOf(p);if(found!==-1){result[i]="present";remaining[found]="";}});
  return result;
}

function render(){
  const board=document.getElementById("board");
  board.innerHTML="";
  for(let r=0;r<DATA.maxAttempts;r++){
    const row=document.createElement("div"); row.className="row";
    const values=r<guesses.length?guesses[r]:(r===guesses.length?current:[]);
    const states=r<results.length?results[r]:[];
    for(let c=0;c<DATA.answer.length;c++){
      const tile=document.createElement("div"); tile.className="tile";
      if(states[c]) tile.classList.add(states[c]);
      tile.textContent=values[c]||"";
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function addPhoneme(p){
  if(finished||current.length>=DATA.answer.length)return;
  current.push(p); document.getElementById("message").textContent=""; render();
}
function removePhoneme(){if(finished)return;current.pop();render();}
function submitGuess(){
  if(finished)return;
  const message=document.getElementById("message");
  if(current.length!==DATA.answer.length){message.textContent="Choose "+DATA.answer.length+" phonemes first.";return;}
  const evaluation=evaluate(current);
  const correct=current.every((p,i)=>p===DATA.answer[i]);
  guesses.push([...current]); results.push(evaluation); current=[];
  if(correct){finished=true;message.textContent="Correct! The English word is "+DATA.word.toUpperCase()+".";}
  else if(guesses.length>=DATA.maxAttempts){finished=true;message.textContent="Game over. The word was "+DATA.word.toUpperCase()+".";}
  else{message.textContent="Not quite. Try again.";}
  render();
}
function resetGame(){current=[];guesses=[];results=[];finished=false;document.getElementById("message").textContent="";render();}

DATA.keyboard.forEach((p)=>{
  const button=document.createElement("button");
  button.className="key"; button.textContent=p;
  button.title="/"+p+"/ — "+(DATA.hints[p]||"Phoneme");
  button.onclick=()=>addPhoneme(p);
  document.getElementById("keyboard").appendChild(button);
});

document.getElementById("delete").onclick=removePhoneme;
document.getElementById("submit").onclick=submitGuess;
document.getElementById("reset").onclick=resetGame;
render();
</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phoneme-wordle-${target.word}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="builder-grid">
      <aside className="builder-panel">
        <h2>Game settings</h2>

        <label htmlFor="target-word">Target word</label>
        <select
          id="target-word"
          value={targetIndex}
          onChange={(e) => changeTarget(Number(e.target.value))}
        >
          {WORDS.map((item, index) => (
            <option key={item.word} value={index}>
              {item.word} — /{item.phonemes.join(" ")}/
            </option>
          ))}
        </select>

        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            resetGame();
          }}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <div className="hint-card">
          <strong>Phoneme hint</strong>
          <p>
            Hover or focus on a phoneme to see its English equivalence.
            Example: /θ/ → TH (as in thin).
          </p>
        </div>

        <button type="button" className="primary-button" onClick={generateHTML}>
          ↓ Generate HTML
        </button>
      </aside>

      <section className="preview-panel">
        <div className="preview-topbar">
          <div>
            <strong>Live Preview</strong>
            <span>Student-facing playable activity</span>
          </div>
          <span className="status-pill">Responsive</span>
        </div>

        <div className="wordle-game">
          <p className="eyebrow">PHONEME WORDLE</p>
          <h2>Find the word</h2>
          <p className="game-description">
            Each tile represents one phoneme.
          </p>

          <div className="wordle-board" aria-label="Wordle board">
            {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
              const values =
                guesses[rowIndex] ??
                (rowIndex === guesses.length ? currentGuess : []);
              const states = results[rowIndex] ?? [];

              return (
                <div className="wordle-row" key={rowIndex}>
                  {target.phonemes.map((_, columnIndex) => (
                    <div
                      key={columnIndex}
                      className={`wordle-tile ${
                        states[columnIndex] ? `tile-${states[columnIndex]}` : ""
                      }`}
                    >
                      {values[columnIndex] ?? ""}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="game-message" aria-live="polite">
            {message}
          </div>

          <div className="phoneme-keyboard" aria-label="Phoneme keyboard">
            {KEYBOARD.map((phoneme) => (
              <button
                type="button"
                key={phoneme}
                className="phoneme-key"
                title={`/${phoneme}/ — ${HINTS[phoneme] ?? "Phoneme"}`}
                onClick={() => addPhoneme(phoneme)}
              >
                {phoneme}
              </button>
            ))}
          </div>

          <div className="game-actions">
            <button
              type="button"
              className="secondary-game-button"
              onClick={removePhoneme}
            >
              Delete
            </button>
            <button
              type="button"
              className="submit-game-button"
              onClick={submitGuess}
            >
              ✓ Submit Guess
            </button>
            <button
              type="button"
              className="secondary-game-button"
              onClick={resetGame}
            >
              ↻ Reset
            </button>
          </div>

          <div className="game-legend">
            <span><i className="legend-box legend-correct" /> Correct position</span>
            <span><i className="legend-box legend-present" /> Wrong position</span>
            <span><i className="legend-box legend-absent" /> Not in word</span>
          </div>
        </div>
      </section>
    </div>
  );
}
