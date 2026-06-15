import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { BADGES, RANKS } from "../engine/data.js";
import { avatarSvg } from "../engine/characters.js";
import { LessonArt } from "../scenes/LessonArt.jsx";
import { rankArt, badgeArt } from "../engine/art.js";

export default function Profile() {
  const { game, go } = useApp();
  const s = game.state;
  const rank = game.rank();
  const rankIndex = Math.max(0, RANKS.findIndex((x) => x.name === rank.name));
  const r = s.record;
  return (
    <section className="screen">
      <h2 className="screen-title">🏅 My Trader Profile</h2>
      <div className="profile-card">
        <div className="profile-top">
          <span id="profile-avatar" className="profile-avatar"
            dangerouslySetInnerHTML={{ __html: avatarSvg(s.avatar) }} />
          <div>
            <div className="profile-name">{s.name}</div>
            <div className="rank-label big">
              <LessonArt src={rankArt(rankIndex)} className="rank-medal" wrapClassName="rank-medal-wrap">
                <span>{rank.emoji}</span>
              </LessonArt>
              {rank.name}
            </div>
            <div className="xp-text">{s.xp} XP total</div>
          </div>
        </div>
        <h3>🎖️ Badges</h3>
        <div id="badge-grid">
          {BADGES.map((b, i) => (
            <motion.div key={b.id} className={"badge" + (s.badges[b.id] ? "" : " locked")}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}>
              <div className="b-emoji">
                <LessonArt src={badgeArt(b.id)} className="b-medal" wrapClassName="b-medal-wrap">
                  <span>{b.emoji}</span>
                </LessonArt>
              </div>
              <div className="b-name">{b.name}</div>
              <div className="b-desc">{b.desc}</div>
            </motion.div>
          ))}
        </div>
        <h3>📊 Dojo Record</h3>
        <div className="profile-stats">
          <div className="stat"><span className="stat-label">Dojo days</span><span>{r.days}</span></div>
          <div className="stat"><span className="stat-label">Green days 🌞</span><span>{r.greenDays}</span></div>
          <div className="stat"><span className="stat-label">Trades closed</span><span>{r.trades}</span></div>
          <div className="stat"><span className="stat-label">Best day</span><span>{r.bestDay > 0 ? "+" + r.bestDay + " Koins" : "—"}</span></div>
        </div>
        <div className="profile-buttons">
          <button className="big-btn small" onClick={() => go("report")}>📊 Parent Report</button>
          <button className="ghost-btn danger" onClick={() => {
            if (confirm("Reset ALL progress? This cannot be undone!")) { Game.reset(); location.reload(); }
          }}>🔄 Reset all progress</button>
        </div>
      </div>
      <p className="parent-note">👨‍👩‍👧 <strong>Note for parents:</strong> Everything here is simulated with
        pretend coins. The course teaches that real futures trading uses leverage, is very risky,
        and is only for trained adults. The biggest lessons in this game are <em>risk management</em>
        and <em>patience</em>.</p>
    </section>
  );
}
