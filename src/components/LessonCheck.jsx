import { useMemo, useState } from "react";
import { Sound } from "../engine/audio.js";
import { checkFor } from "../engine/lesson-checks.js";

/* The one question asked right after a lesson part.
 *
 * NO STAKES. No XP, no pass mark, nothing recorded, no way to fail. Getting it
 * wrong shows the explanation and he carries on exactly as if he'd got it right.
 * Films are free and repeatable (VideoButton's rule); a scored gate would turn a
 * 25-second film into a test, and a kid who can fail a button stops pressing it.
 *
 * The answer is stored at index 0 in lesson-checks.js for authoring sanity, so
 * the options MUST be shuffled here — otherwise "always pick the top one" is the
 * whole game after three questions, and no retrieval happens at all.
 *
 * useMemo, not a shuffle on every render: the options must not rearrange under his
 * finger between reading them and tapping one.
 */
export default function LessonCheck({ partId, onDone }) {
  const check = checkFor(partId);
  const [picked, setPicked] = useState(null);

  // shuffle once per mount, remembering where the right answer landed
  const opts = useMemo(() => {
    if (!check) return [];
    const list = check.a.map((text, i) => ({ text, right: i === check.c }));
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [partId, check]);

  if (!check) {                       // no question written for this part — skip it
    onDone?.();
    return null;
  }

  const answered = picked !== null;
  const right = answered && opts[picked].right;

  function pick(i) {
    if (answered) return;
    setPicked(i);
    Sound.play(opts[i].right ? "correct" : "wrong");
  }

  return (
    <div className="lesson-check">
      <div className="lesson-check-q">{check.q}</div>

      <div className="lesson-check-opts">
        {opts.map((o, i) => {
          let cls = "lesson-check-opt";
          if (answered && o.right) cls += " right";
          else if (answered && i === picked) cls += " wrong";
          else if (answered) cls += " dim";
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={answered}>
              {o.text}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="lesson-check-fb">
          {/* "Not quite" rather than "Wrong" — and the explanation is identical
              either way, because the explanation is the part that teaches. */}
          <div className={"lesson-check-verdict " + (right ? "ok" : "no")}>
            {right ? "That's it ✅" : "Not quite — here's the bit:"}
          </div>
          <div className="lesson-check-e">{check.e}</div>
          <button className="big-btn" onClick={onDone}>Carry on</button>
        </div>
      )}
    </div>
  );
}
