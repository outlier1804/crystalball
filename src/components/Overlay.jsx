import { createPortal } from "react-dom";

/* A full-screen overlay that ACTUALLY covers the screen.
 *
 * WHY A PORTAL AND NOT JUST A BIG z-index: `.watch-overlay` is
 * `position: fixed; inset: 0; z-index: 90` and still got painted UNDER the quest
 * panels (2026-08-06). Its rect was the full viewport — the bug was stacking, not
 * geometry. `.guide-shelf` is `position: relative; z-index: 1`, which creates a
 * stacking context, so the child's 90 never competes with the rest of the page:
 * it is trapped at the shelf's own 1, which TIES with sibling `.one-thing` (also
 * z-index 1) and loses on DOM order. Any z-index number would have failed.
 *
 * Rendering into document.body removes every ancestor stacking context from the
 * equation, so no future `position: relative; z-index: N` wrapper anywhere up the
 * tree can bury a video again. Fixes the class, not the one clip — see
 * memory/Lessons.md.
 */
export default function Overlay({ className = "", children, ...rest }) {
  return createPortal(
    <div className={"watch-overlay " + className} {...rest}>{children}</div>,
    document.body,
  );
}
