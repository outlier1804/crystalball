import { useState } from "react";
import { GLOSSARY } from "../engine/course-new.js";
import { Voice } from "../engine/voice.js";

// The dictionary. Always open, never a step on the path — you look a word up
// when you need it, which is exactly when it sticks.
export default function Words() {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const groups = GLOSSARY.map((g) => ({
    ...g,
    words: g.words.filter((w) => !needle || w.w.toLowerCase().includes(needle) || w.k.toLowerCase().includes(needle)),
  })).filter((g) => g.words.length);

  return (
    <section className="words">
      <header className="page-head">
        <h1>📖 Words</h1>
        <p>Every trader word, in one line. Look one up any time.</p>
      </header>
      <input className="words-search" placeholder="Search a word…" value={q} onChange={(e) => setQ(e.target.value)} />
      {groups.map((g) => (
        <div key={g.group} className="words-group">
          <h2 className="help-sub">{g.group}</h2>
          <div className="words-grid">
            {g.words.map((w) => (
              <div key={w.w} className="word-card">
                <div className="word-term">{w.w}</div>
                <div className="word-def">{Voice.pick(w.k, w.a)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {!groups.length && <p className="page-head">No word matches “{q}”.</p>}
    </section>
  );
}
