import { motion, useMotionValue, useTransform } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { BADGES, RANKS } from "../engine/data.js";
import { avatarSvg } from "../engine/characters.js";
import { LessonArt } from "../scenes/LessonArt.jsx";
import { rankArt, badgeArt, avatarArt } from "../engine/art.js";

export default function Profile() {
  const { game, go } = useApp();
  const s = game.state;
  const rank = game.rank();
  const rankIndex = Math.max(0, RANKS.findIndex((x) => x.name === rank.name));
  const r = s.record;

  // 3D tilt effect on profile card
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const rotateX = useTransform(y, [0, 400], [6, -6]);
  const rotateY = useTransform(x, [0, 400], [-6, 6]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set((mouseX / width) * 400);
    y.set((mouseY / height) * 400);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  return (
    <section className="screen" style={{ perspective: 1000 }}>
      <h2 className="screen-title">Trader Profile</h2>
      <motion.div
        className="profile-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* animated shimmer border */}
        <div className="profile-card-shimmer" aria-hidden="true" />

        <div className="profile-top" style={{ transform: "translateZ(30px)" }}>
          <span id="profile-avatar" className="profile-avatar">
            <LessonArt src={avatarArt(s.avatar)} className="profile-avatar-img" wrapClassName="profile-avatar-wrap">
              <span dangerouslySetInnerHTML={{ __html: avatarSvg(s.avatar) }} />
            </LessonArt>
          </span>
          <div>
            <div className="profile-name">{s.name}</div>
            <div className="rank-label big">
              <motion.div
                className="rank-medal-spin-wrap"
                whileHover={{ rotateY: 360 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ display: "inline-block", verticalAlign: "middle", transformStyle: "preserve-3d" }}
              >
                <LessonArt src={rankArt(rankIndex)} className="rank-medal" wrapClassName="rank-medal-wrap">
                  <span>{rank.emoji}</span>
                </LessonArt>
              </motion.div>
              {rank.name}
            </div>
            <div className="xp-text">{s.xp} XP total</div>
          </div>
        </div>
        <h3 style={{ transform: "translateZ(20px)" }}>Badges Earned</h3>
        <div id="badge-grid" style={{ transform: "translateZ(20px)" }}>
          {BADGES.map((b, i) => {
            const unlocked = !!s.badges[b.id];
            return (
              <motion.div
                key={b.id}
                className={"badge" + (unlocked ? " unlocked" : " locked")}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={unlocked ? { scale: 1.1, y: -5, transition: { duration: 0.18 } } : {}}
              >
                <div className="b-emoji">
                  <LessonArt src={badgeArt(b.id)} className="b-medal" wrapClassName="b-medal-wrap">
                    <span>{b.emoji}</span>
                  </LessonArt>
                </div>
                <div className="b-name">{b.name}</div>
                <div className="b-desc">{b.desc}</div>
              </motion.div>
            );
          })}
        </div>
        <h3>Dojo Record</h3>
        <div className="profile-stats">
          <div className="stat"><span className="stat-label">Dojo days</span><span>{r.days}</span></div>
          <div className="stat"><span className="stat-label">Green days</span><span>{r.greenDays}</span></div>
          <div className="stat"><span className="stat-label">Trades closed</span><span>{r.trades}</span></div>
          <div className="stat"><span className="stat-label">Best day</span><span>{r.bestDay > 0 ? "+" + r.bestDay + " Koins" : "—"}</span></div>
        </div>
        <div className="profile-buttons">
          <button className="big-btn small" onClick={() => go("report")}>Parent Report</button>
          <button className="ghost-btn danger" onClick={() => {
            if (confirm("Reset ALL progress? This cannot be undone!")) { Game.reset(); location.reload(); }
          }}>🔄 Reset all progress</button>
        </div>
      </motion.div>
      <p className="parent-note">👨‍👩‍👧 <strong>Note for parents:</strong> Everything here is simulated with
        pretend coins. The course teaches that real futures trading uses leverage, is very risky,
        and is only for trained adults. The biggest lessons in this game are <em>risk management</em>
        and <em>patience</em>.</p>
    </section>
  );
}
