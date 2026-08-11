"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw, Eye, RotateCcw } from "lucide-react";

type WordEntry = {
  label: string;
  phonemes: string[];
};

type Coord = {
  r: number;
  c: number;
};

type PlacedWord = WordEntry & {
  coords: Coord[];
};

const DEFAULT_WORDS: WordEntry[] = [
  { label: "chin", phonemes: ["tʃ", "ɪ", "n"] },
  { label: "jam", phonemes: ["dʒ", "æ", "m"] },
  { label: "bad", phonemes: ["b", "æ", "d"] },
  { label: "van", phonemes: ["v", "æ", "n"] },
  { label: "sun", phonemes: ["s", "ɐ", "n"] },
];

const FILLERS = [
  "p","t","k","b","d","ɡ","n","m","ŋ","f","s","θ","ʃ","v","z","ð","ʒ",
  "l","ɹ","w","j","h","tʃ","dʒ","iː","ɪ","e","eː","æ","ɐ","ɐː","ɜː",
  "ʉː","ɔ","oː","ʊ","æɪ","ɑe","oɪ","əʉ","æɔ","ɪə","ə"
];

const HINTS: Record<string, string> = {
  θ: "TH (as in thin)",
  ð: "TH (as in then)",
  ɪ: "I (as in sit)",
  æ: "A (as in cat)",
  ɐ: "U (as in cup)",
  "ɜː": "IR (as in bird)",
  "ɐː": "AR (as in bark)",
  ʊ: "OO (as in book)",
  "ʉː": "OO (as in boot)",
  əʉ: "OA (as in boat)",
  ɑe: "I (as in bike)",
  æɪ: "AI (as in bait)",
  oɪ: "OI (as in boil)",
  ɪə: "EAR (as in beard)",
  tʃ: "CH (as in chin)",
  dʒ: "J (as in jam)",
  ʃ: "SH (as in ship)",
  ŋ: "NG (as in ring)",
  ɹ: "R (as in ring)",
  ɔ: "O (as in log)",
  e: "E (as in bed)",
  b: "B (as in bed)",
  d: "D (as in dog)",
  f: "F (as in fan)",
  v: "V (as in van)",
  s: "S (as in sun)",
  z: "Z (as in zip)",
  n: "N (as in thin)",
  m: "M (as in jam)",
  t: "T (as in top)",
  k: "K (as in key)",
  p: "P (as in pen)",
  ɡ: "G (as in gum)",
  h: "H (as in hat)",
  l: "L (as in log)",
  w: "W (as in win)",
  j: "Y (as in yes)",
};

function coordKey(r: number, c: number) {
  return `${r}-${c}`;
}

function getLinePath(start: Coord, end: Coord): Coord[] | null {
  const dr = end.r - start.r;
  const dc = end.c - start.c;

  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
    return null;
  }

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;

  const path: Coord[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push({
      r: start.r + stepR * i,
      c: start.c + stepC * i,
    });
  }

  return path;
}

function buildPuzzle(rows: number, cols: number, words: WordEntry[]) {
  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
  ];

  const placed: PlacedWord[] = [];

  const canPlace = (
    units: string[],
    r: number,
    c: number,
    dr: number,
    dc: number
  ) => {
    const endR = r + dr * (units.length - 1);
    const endC = c + dc * (units.length - 1);

    if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) return false;

    for (let i = 0; i < units.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      if (grid[rr][cc] && grid[rr][cc] !== units[i]) return false;
    }

    return true;
  };

  words.forEach((word) => {
    let success = false;

    for (let attempt = 0; attempt < 500 && !success; attempt++) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      if (
        canPlace(
          word.phonemes,
          r,
          c,
          direction.dr,
          direction.dc
        )
      ) {
        const coords: Coord[] = [];

        word.phonemes.forEach((phoneme, i) => {
          const rr = r + direction.dr * i;
          const cc = c + direction.dc * i;
          grid[rr][cc] = phoneme;
          coords.push({ r: rr, c: cc });
        });

        placed.push({ ...word, coords });
        success = true;
      }
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        grid[r][c] = FILLERS[Math.floor(Math.random() * FILLERS.length)];
      }
    }
  }

  return {
    grid: grid as string[][],
    placed,
  };
}

export default function WordSearchBuilder() {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [version, setVersion] = useState(0);
  const [startCell, setStartCell] = useState<Coord | null>(null);
  const [hoverCell, setHoverCell] = useState<Coord | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [message, setMessage] = useState(
    "Drag across a phoneme word to select it."
  );

  const puzzle = useMemo(
    () => buildPuzzle(rows, cols, DEFAULT_WORDS),
    [rows, cols, version]
  );

  const activePath = useMemo(() => {
    if (!startCell || !hoverCell) return [];
    return getLinePath(startCell, hoverCell) ?? [];
  }, [startCell, hoverCell]);

  const foundCellKeys = useMemo(() => {
    const keys = new Set<string>();

    puzzle.placed.forEach((word) => {
      if (foundWords.includes(word.label)) {
        word.coords.forEach((coord) => keys.add(coordKey(coord.r, coord.c)));
      }
    });

    return keys;
  }, [foundWords, puzzle.placed]);

  const answerCellKeys = useMemo(() => {
    const keys = new Set<string>();

    if (showAnswers) {
      puzzle.placed.forEach((word) =>
        word.coords.forEach((coord) => keys.add(coordKey(coord.r, coord.c)))
      );
    }

    return keys;
  }, [showAnswers, puzzle.placed]);

  function refreshPuzzle() {
    setVersion((value) => value + 1);
    setFoundWords([]);
    setStartCell(null);
    setHoverCell(null);
    setShowAnswers(false);
    setMessage("New puzzle generated.");
  }

  function resetProgress() {
    setFoundWords([]);
    setStartCell(null);
    setHoverCell(null);
    setShowAnswers(false);
    setMessage("Progress reset.");
  }

  function completeSelection(end: Coord) {
    if (!startCell) return;

    const path = getLinePath(startCell, end);

    setStartCell(null);
    setHoverCell(null);

    if (!path || path.length < 2) {
      setMessage("Select a straight horizontal, vertical or diagonal word.");
      return;
    }

    const selected = path.map(({ r, c }) => puzzle.grid[r][c]).join("");
    const reversed = [...path]
      .reverse()
      .map(({ r, c }) => puzzle.grid[r][c])
      .join("");

    const match = puzzle.placed.find((word) => {
      const target = word.phonemes.join("");
      return target === selected || target === reversed;
    });

    if (!match) {
      setMessage("That selection is not one of the target words.");
      return;
    }

    if (foundWords.includes(match.label)) {
      setMessage(`${match.label.toUpperCase()} is already found.`);
      return;
    }

    const next = [...foundWords, match.label];
    setFoundWords(next);

    if (next.length === puzzle.placed.length) {
      setMessage("Excellent — all phoneme words found!");
    } else {
      setMessage(`Found ${match.label.toUpperCase()}!`);
    }
  }

  function generateHTML() {
    const words = DEFAULT_WORDS.map((word) => ({
      label: word.label,
      phonemes: word.phonemes,
    }));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Phoneme Word Search</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  padding:30px 16px;
  min-height:100vh;
  font-family:"Arial Unicode MS","Segoe UI Symbol","Lucida Sans Unicode",Arial,sans-serif;
  background:#f5f7fb;
  color:#111827;
}
.game{
  width:min(900px,100%);
  margin:auto;
  background:white;
  border:1px solid #e5e7eb;
  border-radius:24px;
  padding:26px;
  box-shadow:0 20px 60px rgba(15,23,42,.10);
}
h1{text-align:center;margin:0 0 8px}
.subtitle{text-align:center;color:#64748b;margin-bottom:22px}
.grid{
  display:grid;
  gap:5px;
  justify-content:center;
  touch-action:none;
  user-select:none;
}
.cell{
  width:46px;
  height:46px;
  border:1px solid #dbe0e8;
  border-radius:9px;
  background:#f8fafc;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:800;
  font-size:16px;
  cursor:pointer;
}
.cell.active{background:#ede9fe;border-color:#8b5cf6}
.cell.found{background:#dcfce7;border-color:#22c55e;color:#166534}
.cell.answer{background:#fef3c7;border-color:#eab308}
.words{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:8px;
  margin-top:20px;
}
.word{
  padding:7px 11px;
  border:1px solid #e5e7eb;
  border-radius:999px;
  font-size:13px;
  font-weight:700;
}
.word.found{text-decoration:line-through;background:#dcfce7;color:#166534}
#message{text-align:center;font-weight:700;min-height:26px;margin:16px 0}
.actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}
button{
  border:0;
  border-radius:10px;
  padding:11px 16px;
  font-weight:700;
  cursor:pointer;
}
.primary{background:#6d42f5;color:white}
.secondary{background:#e5e7eb;color:#111827}
@media(max-width:600px){
  .game{padding:18px 10px}
  .cell{width:34px;height:34px;font-size:13px}
}
</style>
</head>
<body>
<main class="game">
<h1>Phoneme Word Search</h1>
<p class="subtitle">Drag across each phoneme word. Words may appear in any straight direction.</p>
<div id="grid" class="grid"></div>
<div id="message" aria-live="polite">Find all five phoneme words.</div>
<div id="words" class="words"></div>
<div class="actions">
<button id="answers" class="secondary">Show Answers</button>
<button id="reset" class="primary">New Puzzle</button>
</div>
</main>
<script>
const rows=${rows};
const cols=${cols};
const words=${JSON.stringify(words)};
const fillers=${JSON.stringify(FILLERS)};
const gridEl=document.getElementById("grid");
const wordsEl=document.getElementById("words");
const messageEl=document.getElementById("message");
let grid=[];
let placed=[];
let found=[];
let start=null;
let current=null;
let showing=false;

function key(r,c){return r+"-"+c}

function pathBetween(a,b){
  const dr=b.r-a.r, dc=b.c-a.c;
  if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return null;
  const steps=Math.max(Math.abs(dr),Math.abs(dc));
  const sr=steps===0?0:dr/steps;
  const sc=steps===0?0:dc/steps;
  const path=[];
  for(let i=0;i<=steps;i++)path.push({r:a.r+sr*i,c:a.c+sc*i});
  return path;
}

function build(){
  grid=Array.from({length:rows},()=>Array(cols).fill(null));
  placed=[];
  found=[];
  showing=false;

  const dirs=[
    {dr:0,dc:1},{dr:1,dc:0},{dr:1,dc:1},{dr:1,dc:-1},
    {dr:0,dc:-1},{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1}
  ];

  function canPlace(units,r,c,d){
    const er=r+d.dr*(units.length-1);
    const ec=c+d.dc*(units.length-1);
    if(er<0||er>=rows||ec<0||ec>=cols)return false;
    for(let i=0;i<units.length;i++){
      const rr=r+d.dr*i,cc=c+d.dc*i;
      if(grid[rr][cc]&&grid[rr][cc]!==units[i])return false;
    }
    return true;
  }

  words.forEach(word=>{
    let done=false;
    for(let attempt=0;attempt<500&&!done;attempt++){
      const d=dirs[Math.floor(Math.random()*dirs.length)];
      const r=Math.floor(Math.random()*rows);
      const c=Math.floor(Math.random()*cols);
      if(canPlace(word.phonemes,r,c,d)){
        const coords=[];
        word.phonemes.forEach((p,i)=>{
          const rr=r+d.dr*i,cc=c+d.dc*i;
          grid[rr][cc]=p;
          coords.push({r:rr,c:cc});
        });
        placed.push({...word,coords});
        done=true;
      }
    }
  });

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(!grid[r][c])grid[r][c]=fillers[Math.floor(Math.random()*fillers.length)];
    }
  }

  render();
}

function render(){
  gridEl.innerHTML="";
  gridEl.style.gridTemplateColumns="repeat("+cols+",46px)";

  const active=current&&start?pathBetween(start,current)||[]:[];
  const activeKeys=new Set(active.map(x=>key(x.r,x.c)));
  const foundKeys=new Set();
  placed.forEach(w=>{
    if(found.includes(w.label))w.coords.forEach(x=>foundKeys.add(key(x.r,x.c)));
  });
  const answerKeys=new Set();
  if(showing)placed.forEach(w=>w.coords.forEach(x=>answerKeys.add(key(x.r,x.c))));

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell=document.createElement("div");
      cell.className="cell";
      const k=key(r,c);
      if(activeKeys.has(k))cell.classList.add("active");
      if(foundKeys.has(k))cell.classList.add("found");
      else if(answerKeys.has(k))cell.classList.add("answer");
      cell.textContent=grid[r][c];
      cell.dataset.r=r;
      cell.dataset.c=c;
      gridEl.appendChild(cell);
    }
  }

  wordsEl.innerHTML="";
  words.forEach(w=>{
    const span=document.createElement("span");
    span.className="word"+(found.includes(w.label)?" found":"");
    span.textContent=w.phonemes.join(" ");
    wordsEl.appendChild(span);
  });
}

function coordsFromEvent(e){
  const el=document.elementFromPoint(e.clientX,e.clientY);
  if(!el||!el.classList.contains("cell"))return null;
  return {r:Number(el.dataset.r),c:Number(el.dataset.c)};
}

gridEl.addEventListener("pointerdown",e=>{
  const cell=e.target.closest(".cell");
  if(!cell)return;
  start={r:Number(cell.dataset.r),c:Number(cell.dataset.c)};
  current=start;
  gridEl.setPointerCapture(e.pointerId);
  render();
});

gridEl.addEventListener("pointermove",e=>{
  if(!start)return;
  const point=coordsFromEvent(e);
  if(point){current=point;render();}
});

gridEl.addEventListener("pointerup",()=>{
  if(!start||!current){start=null;current=null;return;}
  const path=pathBetween(start,current);
  if(!path){messageEl.textContent="Select a straight line.";start=null;current=null;render();return;}

  const str=path.map(x=>grid[x.r][x.c]).join("");
  const rev=[...path].reverse().map(x=>grid[x.r][x.c]).join("");
  const match=placed.find(w=>{
    const target=w.phonemes.join("");
    return target===str||target===rev;
  });

  if(match&&!found.includes(match.label)){
    found.push(match.label);
    messageEl.textContent=found.length===placed.length?"Excellent — all words found!":"Found "+match.label.toUpperCase()+"!";
  }else{
    messageEl.textContent=match?"Already found.":"Not a target word.";
  }

  start=null;
  current=null;
  render();
});

document.getElementById("answers").onclick=()=>{
  showing=!showing;
  document.getElementById("answers").textContent=showing?"Hide Answers":"Show Answers";
  render();
};

document.getElementById("reset").onclick=()=>{
  build();
  messageEl.textContent="New puzzle generated.";
};

build();
</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "phoneme-word-search.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  const activeKeys = new Set(
    activePath.map((coord) => coordKey(coord.r, coord.c))
  );

  return (
    <div className="builder-grid">
      <aside className="builder-panel">
        <h2>Puzzle settings</h2>

        <label>Phoneme words</label>
        <textarea
          value={DEFAULT_WORDS.map((word) => word.phonemes.join(" ")).join("\n")}
          readOnly
          aria-label="Phoneme word list"
        />

        <div className="two-col">
          <label>
            Rows
            <input
              type="number"
              min={6}
              max={14}
              value={rows}
              onChange={(e) =>
                setRows(Math.max(6, Math.min(14, Number(e.target.value) || 10)))
              }
            />
          </label>

          <label>
            Columns
            <input
              type="number"
              min={6}
              max={14}
              value={cols}
              onChange={(e) =>
                setCols(Math.max(6, Math.min(14, Number(e.target.value) || 10)))
              }
            />
          </label>
        </div>

        <button className="secondary-game-button" style={{ width: "100%", marginTop: 12 }} onClick={refreshPuzzle}>
          <RefreshCw size={17} />
          Refresh Preview
        </button>

        <button className="primary-button" onClick={generateHTML}>
          <Download size={18} />
          Generate HTML
        </button>
      </aside>

      <section className="preview-panel">
        <div className="preview-topbar">
          <div>
            <strong>Live Preview</strong>
            <span>Drag across phonemes to find each word</span>
          </div>
          <span className="status-pill">Touch ready</span>
        </div>

        <div className="word-search-playable">
          <p className="eyebrow">WORD SEARCH</p>
          <h2>Find the phoneme words</h2>
          <p className="game-description">
            Drag horizontally, vertically or diagonally. Words can also appear backwards.
          </p>

          <div
            className="interactive-search-grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(34px, 46px))` }}
            onPointerLeave={() => {
              if (startCell) setHoverCell(null);
            }}
          >
            {puzzle.grid.map((row, r) =>
              row.map((phoneme, c) => {
                const key = coordKey(r, c);
                const isActive = activeKeys.has(key);
                const isFound = foundCellKeys.has(key);
                const isAnswer = answerCellKeys.has(key);

                return (
                  <button
                    type="button"
                    key={key}
                    className={`search-cell ${
                      isActive ? "search-cell-active" : ""
                    } ${isFound ? "search-cell-found" : ""} ${
                      isAnswer && !isFound ? "search-cell-answer" : ""
                    }`}
                    title={`/${phoneme}/ — ${HINTS[phoneme] ?? "Phoneme"}`}
                    aria-label={`/${phoneme}/ ${
                      HINTS[phoneme] ?? "phoneme"
                    }`}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setStartCell({ r, c });
                      setHoverCell({ r, c });
                    }}
                    onPointerEnter={() => {
                      if (startCell) setHoverCell({ r, c });
                    }}
                    onPointerUp={() => completeSelection({ r, c })}
                  >
                    {phoneme}
                  </button>
                );
              })
            )}
          </div>

          <div className="game-message" aria-live="polite">
            {message}
          </div>

          <div className="word-pills">
            {DEFAULT_WORDS.map((word) => (
              <span
                key={word.label}
                className={
                  foundWords.includes(word.label) ? "word-pill-found" : ""
                }
                title={word.label}
              >
                {word.phonemes.join(" ")}
              </span>
            ))}
          </div>

          <div className="wordle-actions">
            <button
              type="button"
              className="secondary-game-button"
              onClick={() => setShowAnswers((value) => !value)}
            >
              <Eye size={17} />
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>

            <button
              type="button"
              className="secondary-game-button"
              onClick={resetProgress}
            >
              <RotateCcw size={17} />
              Reset Progress
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
