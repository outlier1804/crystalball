import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { Game } from "../engine/game.js";
import { askSensei, localHelp, tierAt, tierCount, TIER_LABEL, TIER_INTRO } from "../engine/help.js";

import { Voice } from "../engine/voice.js";

// The "I don't get it" button. Present on every lesson and every question.
//
// Each press escalates one tier (simpler → analogy → worked example) and KEEPS
// the previous explanations on screen rather than replacing them — three angles
// on one idea are more useful side by side than one at a time, and it means
// pressing again never costs him the explanation he was halfway through reading.
//
// Every tier tries Sensei (question-specific, needs network + key) and falls back
// to the authored offline bank. There is no path where pressing this shows nothing.
export default function HelpButton({
  topic,             // arc id or foundation stage id — keys the offline bank
  topicName,         // human label, sent to Sensei for context
  question,          // the question he's stuck on (omit on lesson screens)
  options,           // the answer choices
  correctAnswer,
  chosenAnswer,      // the wrong one he actually picked, if any
  lessonText,        // the text he was just shown, for lesson screens
  fallback,          // question's own explanation, last-resort help text
  label = "🤔 I don't get it",
}) {
  const [steps, setSteps] = useState([]);   // [{ tier, text }]
  const [loading, setLoading] = useState(false);
  // "Ask your own question": the three buttons re-explain the lesson; this is for
  // the question the lesson did not think of. Needs the online tutor — when that
  // is off or unreachable it says so plainly rather than pretending to answer.
  const [ask, setAsk] = useState("");
  const [asking, setAsking] = useState(false);
  const used = steps.filter((s) => !s.mine).length;
  const exhausted = used >= tierCount();

  async function escalate() {
    if (loading || exhausted) return;
    Sound.play("click");
    const step = used;
    const tier = tierAt(step);
    setLoading(true);
    Game.recordHelpUsed(topic);

    // Sensei first (knows the exact question and his exact wrong answer),
    // authored bank second. Either way we always end up with text.
    const live = await askSensei({
      topic: topicName || topic,
      question,
      options,
      correctAnswer,
      chosenAnswer,
      tier,
      lessonText,
      adult: Voice.adult,
    });
    const text = live || localHelp(topic, step, fallback);

    setSteps((s) => [...s, { tier, text }]);
    setLoading(false);
    Sound.play("coo");
    if (Speak.on) Speak.say(text, { pitch: 0.8, rate: 0.88 });
  }

  async function askOwn(e) {
    e.preventDefault();
    const q = ask.trim();
    if (!q || asking) return;
    Sound.play("click");
    setAsking(true);
    Game.recordHelpUsed(topic);
    const live = await askSensei({ topic: topicName || topic, question, options, correctAnswer, lessonText, ask: q, adult: Voice.adult });
    const text = live || (Voice.adult
      ? "The live tutor is not available right now. Use the buttons above for another explanation, and note your question to come back to."
      : "I can't answer typed questions right now. Tap the buttons above for another way to say it — and ask Dad this one!");
    setSteps((s) => [...s, { tier: "own", text, mine: q }]);
    setAsk("");
    setAsking(false);
    Sound.play("coo");
    if (Speak.on) Speak.say(text, { pitch: 0.8, rate: 0.88 });
  }

  const nextTier = tierAt(used);

  return (
    <div className="help-block">
      <AnimatePresence initial={false}>
        {steps.map((s, i) => (
          <motion.div key={i} className="help-panel"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            transition={{ duration: 0.28 }}>
            <div className="help-panel-head">
              <span className="help-owl">🦉</span>
              <span className="help-tier-name">{s.mine ? `You asked: “${s.mine}”` : TIER_INTRO[s.tier]}</span>
              <button className="help-replay" title="Read this out loud"
                onClick={() => { Sound.play("click"); Speak.say(s.text, { pitch: 0.8, rate: 0.88 }); }}>
                🔊
              </button>
            </div>
            <div className="help-panel-text">{s.text}</div>
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && <div className="help-loading">🦉 Sensei is thinking of another way to say it<span className="dots">…</span></div>}

      {!exhausted && !loading && (
        <motion.button className="help-btn" whileTap={{ scale: 0.96 }} onClick={escalate}>
          {used === 0 ? label : TIER_LABEL[nextTier]}
        </motion.button>
      )}

      {(used > 0 || exhausted) && (
        <form className="help-ask" onSubmit={askOwn}>
          <input value={ask} maxLength={200} onChange={(e) => setAsk(e.target.value)}
            placeholder={Voice.adult ? "Still unclear? Type your own question…" : "Still stuck? Type your own question…"} />
          <button type="submit" className="help-ask-btn" disabled={!ask.trim() || asking}>{asking ? "…" : "Ask"}</button>
        </form>
      )}

      {exhausted && (
        <div className="help-exhausted">
          {Voice.adult
            ? "Still unclear? That is normal — some ideas take a second pass. Come back to this one tomorrow."
            : <>Still fuzzy? That's completely fine — some ideas need a night's sleep. 🌙<br />Ask Dad about this one, and come back to it tomorrow.</>}
        </div>
      )}
    </div>
  );
}
