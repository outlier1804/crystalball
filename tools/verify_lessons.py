#!/usr/bin/env python3
"""Run-check the shipped trading lessons in a REAL browser.

WHY THIS EXISTS: `npm run build` is a compile check, not a run check. Candle Quest
sat white-screened in production across two commits while every build passed (a
self-referential `let TC = { bg: TC.bg }` in sim.js). See memory/Lessons.md,
"A green build is not evidence the app runs" — the only thing that caught it was
the user's phone screenshot. This is that screenshot, automated.

What it proves, each one a hard failure:
  1. the page mounts (React root has children) and throws no pageerror
  2. the lesson shelf rendered with all 10 lesson buttons
  3. clicking lesson 01 opens a <video> that DECODES and whose currentTime
     ADVANCES (a frozen poster frame is not playback) at 1280x720
  4. no lesson-*.mp4 request 404s

Usage:
    # build first, then serve dist:
    npm run build && (npm run preview -- --port 4173 --host 127.0.0.1 &)
    python3 tools/verify_lessons.py [baseUrl]

Note: playwright on this machine is the PYTHON package — there is no node
`playwright` module, so this is deliberately not a .mjs script. Uses the
installed Google Chrome (channel="chrome") rather than downloading Chromium,
which this 8 GB box does not need another copy of.
"""
import sys
import pathlib
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173"
SHOTS = pathlib.Path("tools/verify-shots")
SHOTS.mkdir(parents=True, exist_ok=True)

fails = []


def note(ok, msg):
    print(("PASS  " if ok else "FAIL  ") + msg, flush=True)
    if not ok:
        fails.append(msg)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    page = browser.new_page(viewport={"width": 900, "height": 1400})

    page_errors, bad_requests = [], []
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    page.on("response", lambda r: bad_requests.append(f"{r.status} {r.url}") if r.status >= 400 else None)

    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1500)

    # 1. did React mount at all
    kids = page.evaluate("document.getElementById('root')?.childElementCount ?? -1")
    note(kids > 0, f"React mounted (#root children = {kids})")
    note(not page_errors, "no pageerror on load" + (f" :: {page_errors[0]}" if page_errors else ""))
    page.screenshot(path=str(SHOTS / "01-home.png"))

    # 2. reach the story map. Matched loosely so a copy tweak can't turn into a
    #    false negative; if the shelf is missing we dump the buttons that ARE on
    #    screen, so a failure is diagnosable without a second run.
    for pattern in ("story", "map", "academy", "course", "adventure"):
        btn = page.get_by_role("button", name=pattern).first
        if btn.count():
            btn.click()
            page.wait_for_timeout(1200)
            break

    shelf = page.locator(".lesson-shelf").count()
    if not shelf:
        labels = page.evaluate(
            "[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).slice(0,40)")
        print("  buttons on screen:", labels)
    note(shelf > 0, "lesson shelf is on the story map")

    lesson_btns = page.locator(".lesson-btn")
    n = lesson_btns.count()
    note(n == 10, f"10 lesson buttons rendered (found {n})")
    page.screenshot(path=str(SHOTS / "02-shelf.png"))

    # 3. open lesson 01 and prove the video actually PLAYS
    if n:
        lesson_btns.first.click()
        page.wait_for_timeout(1000)
        vid = page.locator("video").first
        note(vid.count() > 0, "a <video> element opened")
        if vid.count():
            t0 = vid.evaluate("v => { v.muted = true; v.play?.(); return v.currentTime }")
            page.wait_for_timeout(4000)
            info = vid.evaluate(
                "v => ({t: v.currentTime, dur: v.duration, err: v.error ? v.error.code : null,"
                " src: v.currentSrc, w: v.videoWidth, h: v.videoHeight})")
            note(info["err"] is None, f"video decodes (error code {info['err']})")
            note(info["t"] > t0 + 0.5,
                 f"playback advanced {t0:.2f}s -> {info['t']:.2f}s of {info['dur']:.1f}s")
            note(info["w"] == 1280 and info["h"] == 720,
                 f"720p frame ({info['w']}x{info['h']})")
            print("  src =", info["src"])
            page.screenshot(path=str(SHOTS / "03-playing.png"))

    # 4. nothing 404'd
    v404 = [r for r in bad_requests if "lesson-" in r and ".mp4" in r]
    note(not v404, "no lesson mp4 404s" + (f" :: {v404[0]}" if v404 else ""))
    if bad_requests:
        print("  other >=400 responses:", bad_requests[:5])

    browser.close()

print(f"\n{len(fails)} CHECK(S) FAILED" if fails else "\nALL CHECKS PASSED")
sys.exit(1 if fails else 0)
