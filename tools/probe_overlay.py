#!/usr/bin/env python3
"""One-off diagnostic: why does page content paint OVER the lesson video overlay?"""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173"

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    pg = b.new_page(viewport={"width": 900, "height": 1400})
    pg.goto(BASE, wait_until="networkidle")
    pg.wait_for_timeout(1500)
    # the lesson shelf lives on the Story Map, not the landing screen
    for pat in ("story", "map"):
        b2 = pg.get_by_role("button", name=pat).first
        if b2.count():
            b2.click()
            pg.wait_for_timeout(1200)
            break
    pg.locator(".lesson-btn").first.click()
    pg.wait_for_timeout(1200)

    print(pg.evaluate("""() => {
      const out = {};
      const ov = document.querySelector('.watch-overlay');
      const cs = ov && getComputedStyle(ov);
      out.overlay = ov ? {
        rect: ov.getBoundingClientRect().toJSON(),
        position: cs.position, zIndex: cs.zIndex, inset: cs.inset,
        parent: ov.parentElement.className,
        parentPos: getComputedStyle(ov.parentElement).position,
        parentZ: getComputedStyle(ov.parentElement).zIndex,
        parentTransform: getComputedStyle(ov.parentElement).transform,
      } : null;

      // what is actually painted at the point where the video got covered
      const hit = document.elementFromPoint(450, 800);
      out.atCoveredPoint = hit && {
        cls: hit.className, tag: hit.tagName,
        z: getComputedStyle(hit).zIndex, pos: getComputedStyle(hit).position,
        chain: (() => { const c=[]; let e=hit; while(e && c.length<6){
          const s=getComputedStyle(e); c.push(`${e.tagName}.${e.className}|z=${s.zIndex}|pos=${s.position}|tf=${s.transform!=='none'}`); e=e.parentElement;} return c; })(),
      };

      // every ancestor of the overlay that creates a stacking context
      out.overlayChain = (() => { const c=[]; let e=ov; while(e && e!==document.body){
        const s=getComputedStyle(e);
        c.push(`${e.tagName}.${e.className}|z=${s.zIndex}|pos=${s.position}|tf=${s.transform!=='none'}|filter=${s.filter!=='none'}|contain=${s.contain}`);
        e=e.parentElement;} return c; })();
      return out;
    }"""))
    b.close()
