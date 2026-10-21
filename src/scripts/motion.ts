// Site-wide motion: headline reveals, scroll reveals, parallax, magnetic buttons and a page wipe.
// Everything is skipped for visitors who ask for reduced motion, and the page works without it.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const wide = window.matchMedia("(min-width: 900px)").matches;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, scope: ParentNode = document) => Array.from(scope.querySelectorAll<T>(sel));

const ready = () => root.classList.add("motion-ready");

// ── page wipe: leaving ───────────────────────────────────────────────
const wipe = document.querySelector<HTMLElement>(".pt");
function setupPageWipe() {
  if (!wipe) return;
  // arriving: the lift-away is a pure CSS animation (see .pt-in in the stylesheet), so it cannot get stuck
  window.setTimeout(() => root.classList.remove("pt-in"), 1000);
  window.addEventListener("pageshow", (e) => { if ((e as PageTransitionEvent).persisted) gsap.set(wipe, { yPercent: 100 }); });

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
    if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /^(mailto|tel):/.test(a.href)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page or just a #hash
    e.preventDefault();
    try { sessionStorage.setItem("pt", "1"); } catch { /* ignore */ }
    gsap.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { location.href = url.href; } });
    window.setTimeout(() => { location.href = url.href; }, 1600);   // never get stuck
  });
}

if (reduce) {
  ready();
} else {
  setupPageWipe();

  // ── headlines: words rise out of a mask, line by line ───────────────
  const headings = $$("h1, .big, .final h2, .post-title, .hc-hero h1");
  headings.forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      maskClass: "split-mask",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 115,
          rotate: 2,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.1,
          delay: el.closest(".hero, .nf, .as-hero, .ct-hero, .wn-hero, .hc-hero, .blog-hero, .tp-hero, .hg-head, .post-head") ? 0.15 : 0,
          scrollTrigger: el.closest(".hero, .nf, .as-hero, .ct-hero, .wn-hero, .hc-hero, .blog-hero, .tp-hero, .hg-head, .post-head")
            ? undefined
            : { trigger: el, start: "top 88%", once: true },
        });
      },
    });
  });
  ready();

  // ── hero entrance (everything that isn't the headline) ──────────────
  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });
  tl.from(".nav-shell .nav", { y: -24, opacity: 0, duration: 0.8 }, 0)
    .from(".hero-tag, .kicker", { y: 16, opacity: 0, duration: 0.8, stagger: 0.05 }, 0.2)
    .from(".hero .lead, .nf .lead, .blog-hero .lead, .tp-hero .lead, .hc-hero .search", { y: 28, opacity: 0, duration: 0.9 }, 0.7)
    .from(".hero-cta > *, .hero-cta-2 > *, .nf-actions > *", { y: 30, opacity: 0, scale: 0.94, duration: 0.8, stagger: 0.09 }, 0.85);

  // headline drifts up and fades as you scroll past the hero
  const heroInner = document.querySelector<HTMLElement>(".hero-inner");
  if (heroInner && wide) {
    gsap.to(heroInner, { yPercent: -12, opacity: 0.25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  // ── scroll reveals ──────────────────────────────────────────────────
  const groups = [
    ".tool", ".pcard", ".hc-card", ".hc-card2", ".ct-card", ".wn-item", ".rows li", ".checks li", ".faq",
    ".as-list a", ".tpl-strip", ".price-card", ".as-card", ".callout", ".tp-note",
  ];
  groups.forEach((sel) => {
    const els = $$(sel).filter((el) => !el.closest(".hero"));
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 46 });
    ScrollTrigger.batch(els, {
      start: "top 92%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true }),
    });
  });

  // lead paragraphs and small labels follow their headings
  $$(".section .lead, .section .kicker, .sec-head, .priv > .lead").forEach((el) => {
    gsap.from(el, { y: 26, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
  });

  // the phone drifts against the scroll
  const phone = document.querySelector<HTMLElement>(".phone-img");
  if (phone && wide) {
    gsap.fromTo(phone, { y: 70, rotate: -2 }, { y: -50, rotate: 1.5, ease: "none", scrollTrigger: { trigger: phone, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  }

  // template cards slide in from the side as the row appears
  const tpls = $$(".tpl");
  if (tpls.length) {
    gsap.from(tpls, { xPercent: 28, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".tpl-track", start: "top 85%", once: true } });
  }

  // ── magnetic buttons (mouse only) ───────────────────────────────────
  if (fine) {
    $$(".btn-primary, .btn-white, .nav-cta, .as-badge, .gp, .btn-ghost").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
