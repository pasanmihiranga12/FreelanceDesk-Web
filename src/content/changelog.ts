// "What's new" entries, newest first. Add a new object at the top for each release.

export interface Release {
  version: string;
  date: string;      // shown as written, e.g. "October 2026"
  title: string;
  items: string[];
}

export const releases: Release[] = [
  {
    version: "1.1.0",
    date: "October 2026",
    title: "20 invoice templates and a lot of polish",
    items: [
      "10 new invoice templates: Holo, Eclipse, Pop, Aurora, Silk, Neon, Blossom, Midnight, Orbit and Mosaic.",
      "4 of them (Aurora, Silk, Blossom and Orbit) are also available for quotations.",
      "Long invoices now flow onto a second page more neatly, keeping totals and payment details together.",
      "The app no longer asks for photo access. Your logo and profile photo are chosen with the Android photo picker.",
      "Fixed a crash that could happen on some phones when opening certain screens.",
      "Analytics now shows all 12 months and clearer comparisons with last month.",
      "A new look for the dashboard, onboarding, paywall, settings and tab bar.",
    ],
  },
  {
    version: "1.0.0",
    date: "First release",
    title: "FreelanceDesk arrives on Google Play",
    items: [
      "Invoices and quotations as PDF, with logo and signature.",
      "Clients and orders, including recurring orders.",
      "Full and part payments, with what you are owed always visible.",
      "Income analytics, monthly and yearly recaps.",
      "Private and offline: no account, no ads, no tracking.",
      "Optional app lock with PIN or fingerprint, plus backup and restore.",
    ],
  },
];
