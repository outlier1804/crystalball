import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { Game } from "../engine/game.js";
import { askSensei, localHelp, tierAt, tierCount, TIER_LABEL, TIER_INTRO } from "../engine/help.js";

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
  const used = steps.length;
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
    });
    const text = live || localHelp(topic, step, fallback);

    setSteps((s) => [...s, { tier, text }]);
    setLoading(false);
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
              <span className="help-tier-name">{TIER_INTRO[s.tier]}</span>
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

      {exhausted && (
        <div className="help-exhausted">
          Still fuzzy? That's completely fine — some ideas need a night's sleep. 🌙
          <br />Ask Dad about this one, and come back to it tomorrow.
        </div>
      )}
    </div>
  );
}
