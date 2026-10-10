// Which voice the lessons are written in for the active profile.
//
// The course is one curriculum told two ways: `kid` (Sensei, Kitsu, Koins) and
// `adult` (plain coach). data.js reads this through getters, so every screen
// that renders `line.t` or `arc.name` gets the right wording without knowing
// that two versions exist.
export const Voice = {
  mode: "kid",
  set(mode) {
    this.mode = mode === "adult" ? "adult" : "kid";
    if (typeof document !== "undefined") document.documentElement.dataset.mode = this.mode;
  },
  get adult() { return this.mode === "adult"; },
  /** pick(kidText, adultText) — adult wording when there is some, kid otherwise. */
  pick(kid, adult) { return this.mode === "adult" && adult ? adult : kid; },
};
