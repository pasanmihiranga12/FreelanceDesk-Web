// Blog posts. To publish a new article: add a file in ./posts/ that default-exports the HTML body,
// import it here and add an entry to the list. `cover` picks the generated cover art (see Cover.astro).

import invoiceVsQuotation from "./posts/invoice-vs-quotation";
import whatToInclude from "./posts/what-to-include-on-a-freelance-invoice";
import writeQuotation from "./posts/how-to-write-a-quotation-that-wins-the-job";
import chaseLate from "./posts/how-to-chase-a-late-payment";
import taxes from "./posts/how-to-set-aside-money-for-taxes-as-a-freelancer";
import numbering from "./posts/how-to-number-your-invoices";
import pricing from "./posts/how-to-price-freelance-work";
import terms from "./posts/payment-terms-explained";
import scope from "./posts/how-to-handle-scope-creep";
import international from "./posts/get-paid-by-international-clients";
import contract from "./posts/freelance-contract-basics";
import mistakes from "./posts/freelance-invoicing-mistakes";
import startFreelancing from "./posts/how-to-start-freelancing-with-no-experience";
import firstClients from "./posts/how-to-find-your-first-freelance-clients";
import proposal from "./posts/how-to-write-a-freelance-proposal";
import portfolio from "./posts/how-to-build-a-freelance-portfolio";
import vsJob from "./posts/freelancing-vs-full-time-job";
import timeMgmt from "./posts/freelance-time-management-tips";

export interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  cover: string;
  date: string;     // ISO yyyy-mm-dd
  minutes: number;  // reading time
  body: string;     // HTML
}

const read = (html: string) => Math.max(3, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 210));

const raw: Omit<Post, "minutes">[] = [
  { slug: "how-to-start-freelancing-with-no-experience", title: "How to start freelancing with no experience", description: "A practical step-by-step plan for starting as a freelancer from zero: choose a skill, build proof, set a price and land your first clients.", category: "Getting started", cover: "invoice", date: "2026-10-18", body: startFreelancing },
  { slug: "how-to-find-your-first-freelance-clients", title: "How to find your first freelance clients", description: "Seven ways to find your first freelance clients, from warm referrals to targeted outreach, with a simple weekly routine and message templates.", category: "Getting started", cover: "invoice", date: "2026-10-18", body: firstClients },
  { slug: "how-to-write-a-freelance-proposal", title: "How to write a freelance proposal that wins clients", description: "What to put in a freelance proposal, a simple structure to copy, and the mistakes that get proposals ignored.", category: "Clients", cover: "invoice", date: "2026-10-18", body: proposal },
  { slug: "how-to-build-a-freelance-portfolio", title: "How to build a freelance portfolio (even with no clients)", description: "How to build a portfolio that wins work: choose quality over quantity, tell each project as a story, and create proof when you have no clients yet.", category: "Getting started", cover: "invoice", date: "2026-10-18", body: portfolio },
  { slug: "freelancing-vs-full-time-job", title: "Freelancing vs a full-time job: an honest comparison", description: "Income, security, freedom, tax and admin compared side by side, plus questions to ask yourself before you decide.", category: "Getting started", cover: "invoice", date: "2026-10-18", body: vsJob },
  { slug: "freelance-time-management-tips", title: "Freelance time management: habits that actually work", description: "Practical time management habits for freelancers: plan your week, block your time, set working hours, estimate with a buffer and keep admin small.", category: "Productivity", cover: "invoice", date: "2026-10-18", body: timeMgmt },
  { slug: "invoice-vs-quotation", title: "Invoice vs quotation: what's the difference?", description: "A quotation is a priced offer before the work. An invoice is a request for payment. Here is when to use each, a side-by-side comparison, and how one leads to the other.", category: "Basics", cover: "quote", date: "2026-10-18", body: invoiceVsQuotation },
  { slug: "what-to-include-on-a-freelance-invoice", title: "What to include on a freelance invoice", description: "A complete checklist of everything a professional freelance invoice needs, so clients can pay you quickly and your records stay clean.", category: "Invoicing", cover: "invoice", date: "2026-10-18", body: whatToInclude },
  { slug: "how-to-write-a-quotation-that-wins-the-job", title: "How to write a quotation that wins the job", description: "A clear, well-priced quotation helps you win freelance work and avoid scope fights later. Here is how to write one, with a structure you can copy.", category: "Quotations", cover: "tag", date: "2026-10-18", body: writeQuotation },
  { slug: "how-to-chase-a-late-payment", title: "How to chase a late payment politely", description: "Late payments are common and fixable. A calm, step-by-step way to chase an overdue invoice, with short messages you can adapt.", category: "Getting paid", cover: "clock", date: "2026-10-18", body: chaseLate },
  { slug: "how-to-set-aside-money-for-taxes-as-a-freelancer", title: "How to set aside money for taxes as a freelancer", description: "A simple habit for freelancers: set aside a share of every payment for tax so there are no nasty surprises. General guidance, not tax advice.", category: "Money", cover: "coins", date: "2026-10-18", body: taxes },
  { slug: "how-to-number-your-invoices", title: "How to number your invoices (without making a mess)", description: "Invoice numbering rules, four common formats, and what to do when you make a mistake, so your records stay clean and your accountant stays calm.", category: "Invoicing", cover: "invoice", date: "2026-10-18", body: numbering },
  { slug: "how-to-price-freelance-work", title: "How to price your freelance work", description: "Hourly, fixed or value-based? How to work out your minimum rate, turn hours into a fixed price, and raise your rates with confidence.", category: "Money", cover: "chart", date: "2026-10-18", body: pricing },
  { slug: "payment-terms-explained", title: "Payment terms explained: net 14, net 30, deposits and milestones", description: "What common payment terms mean, which to use for which kind of job, and how to word them so clients pay on time.", category: "Getting paid", cover: "clock", date: "2026-10-18", body: terms },
  { slug: "how-to-handle-scope-creep", title: "How to handle scope creep without losing the client", description: "Stop 'just one small thing' from eating your profit. How to prevent scope creep, spot it early, and say yes with a price.", category: "Clients", cover: "chat", date: "2026-10-18", body: scope },
  { slug: "get-paid-by-international-clients", title: "How to get paid by international clients", description: "Currency, fees, payment methods and invoice details for freelancers who work with clients in other countries.", category: "Getting paid", cover: "coins", date: "2026-10-18", body: international },
  { slug: "freelance-contract-basics", title: "Freelance contract basics: what to put in a one-page agreement", description: "The ten things a simple freelance agreement should cover, in plain language, plus how it works with your quote and invoice.", category: "Clients", cover: "pen", date: "2026-10-18", body: contract },
  { slug: "freelance-invoicing-mistakes", title: "12 invoicing mistakes that delay your payment", description: "The small, avoidable habits that make freelancers wait for their money, with a simple fix for each and a 60-second pre-send checklist.", category: "Invoicing", cover: "shield", date: "2026-10-18", body: mistakes },
];

export const posts: Post[] = raw.map((p) => ({ ...p, minutes: read(p.body) }));

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

/** Adds ids to h2 headings and returns the table of contents. */
export function withToc(html: string) {
  const toc: { id: string; text: string }[] = [];
  const body = html.replace(/<h2>(.*?)<\/h2>/g, (_m, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const id = text.toLowerCase().replace(/&amp;/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { body, toc };
}
