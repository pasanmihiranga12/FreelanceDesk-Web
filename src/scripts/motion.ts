// Site-wide motion: headline reveals, scroll reveals, parallax, magnetic buttons and a page wipe.
// Everything is skipped for visitors who ask for reduced motion, and the page works without it.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

  // ── headlines: a soft fade up, the whole heading at once ────────────
  const HEAD_SCOPE = ".hero, .nf, .as-hero, .ct-hero, .wn-hero, .hc-hero, .blog-hero, .tp-hero, .hg-head, .post-head";
  const headings = $$("h1, .big, .final h2, .post-title, .hc-hero h1");
  headings.forEach((el) => {
    const inHead = !!el.closest(HEAD_SCOPE);
    gsap.from(el, {
      y: 22,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      delay: inHead ? 0.1 : 0,
      clearProps: "transform",
      scrollTrigger: inHead ? undefined : { trigger: el, start: "top 88%", once: true },
    });
  });
  ready();

  // ── hero entrance (each thing is animated once) ─────────────────────
  const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.1 });
  tl.from(".nav-shell .nav", { y: -16, opacity: 0, duration: 0.6 }, 0)
    .from(".hero-tag", { y: 14, opacity: 0, duration: 0.7 }, 0.2)
    .from(".hero .lead, .nf .lead, .blog-hero .lead, .tp-hero .lead, .hc-hero .search", { y: 20, opacity: 0, duration: 0.7 }, 0.45)
    .from(".hero-cta, .nf-actions", { y: 20, opacity: 0, duration: 0.7 }, 0.6);

  // ── scroll reveals: one gentle fade-up, once ────────────────────────
  const groups = [
    ".tool", ".pcard", ".hc-card", ".hc-card2", ".ct-card", ".wn-item", ".feat", ".tpl", ".checks li", ".faq",
    ".as-list a", ".tpl-strip", ".price-card", ".as-card", ".callout", ".tp-note", ".feat-title",
    ".section .lead", ".section .kicker", ".sec-head", ".tpl-cta",
  ];
  const seen = new Set<Element>();
  groups.forEach((sel) => {
    const els = $$(sel).filter((el) => !el.closest(".hero") && !seen.has(el));
    if (!els.length) return;
    els.forEach((el) => seen.add(el));
    gsap.set(els, { opacity: 0, y: 24 });
    ScrollTrigger.batch(els, {
      start: "top 94%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.05, overwrite: true, clearProps: "transform" }),
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
