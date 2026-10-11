import React from "react";
import { Log } from "../engine/log.js";

/* If one screen throws, he gets a way back instead of a blank page — and the
 * error is recorded. Keyed by screen in App.jsx, so leaving the broken screen
 * clears it. */
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) {
    Log.error("render", error, { where: String(info?.componentStack || "").split("\n").slice(1, 4).map((s) => s.trim()).join(" < ").slice(0, 200) });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="screen">
        <div className="home-card home-finished oops-card">
          <div className="home-kicker">That was not you</div>
          <h1 className="home-title">This screen tripped up 🙈</h1>
          <p className="home-coach">Nothing is lost. Your progress is saved. Go back and carry on — the problem has been written down so it can be fixed.</p>
          <div className="home-actions">
            <button className="play-btn" onClick={() => { this.setState({ failed: false }); this.props.onHome?.(); }}>▶ Back to home</button>
          </div>
        </div>
      </section>
    );
  }
}
