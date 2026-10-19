# FreelanceDesk website

Static marketing site for FreelanceDesk: home page, free invoice and quotation
generators (2 free of each per verified account), blog, privacy and terms.

Built with [Astro](https://astro.build) (static output), a small Supabase backend for
accounts and the free-limit counter, and jsPDF to make PDFs in the browser.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs ./dist
```

Until Supabase is connected the whole site works, but the tools show
"Accounts aren't connected" and downloads are switched off.

---

## 1. Connect Supabase (accounts + free limit)

1. Create a free project at https://supabase.com.
2. **SQL Editor → New query**, paste everything from `supabase/schema.sql`, **Run**.
   This creates the usage table and the three functions. The free limit lives there
   (change the `2` in `get_usage` and `consume_credit` to change it).
3. **Project Settings → API**: copy the *Project URL* and the *anon public* key.
   Copy `.env.example` to `.env` and fill both in. (Never use the `service_role` key here.)
4. **Authentication → Providers → Email**: keep *Email* enabled, keep **Confirm email ON**
   (this is what makes the free limit meaningful), set minimum password length to 8.
5. **Authentication → URL Configuration**:
   - Site URL: `https://freelancedesk.lygenexlabs.com`
   - Redirect URLs: `https://freelancedesk.lygenexlabs.com/**` and `http://localhost:4321/**`
6. **Authentication → Emails → SMTP**: add a custom sender (Resend, Brevo, etc.) so
   confirmation and reset emails reach inboxes. Supabase's built-in sender is only for testing
   and is heavily rate-limited. Add the SPF and DKIM records the email service gives you in Spaceship DNS.
7. **Authentication → Rate limits / Attack protection**: leave the defaults on. If bots become a
   problem, turn on CAPTCHA protection (Cloudflare Turnstile) and add the widget to the sign-up form.

## 2. Deploy (free) on Cloudflare Pages

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command `npm run build`, output directory `dist`.
4. Environment variables: add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.
5. Custom domain: add `freelancedesk.lygenexlabs.com`, then in Spaceship → DNS add a
   **CNAME** with host `freelancedesk` pointing to the `*.pages.dev` address Cloudflare shows.
   Do not touch the MX or TXT records used for email.

## 3. After launch

- Add the site to Google Search Console and submit `https://freelancedesk.lygenexlabs.com/sitemap-index.xml`.
- Use the site's `/privacy/` and `/terms/` pages wherever a public link is needed (for example Play Console).
- Replace `public/logo-mark.png` as the share image with a 1200x630 image when you have one.

## Adding a blog post

Open `src/content/posts.ts` and add an object to the list (slug, title, description, date, minutes, body in HTML).
The page, the blog index, the sitemap and the structured data are generated automatically.

## How the free limit works

- Sign-up needs a verified email. `consume_credit()` refuses unverified users.
- Each download calls `consume_credit('invoice' | 'quotation')`, which counts rows in
  `doc_usage` for that user inside the database and refuses at the limit. Row level security
  means a browser can only read its own rows and can never write them directly.
- The PDF is built in the browser *before* the credit is spent, so a failure never costs a free document.

Known limits: someone who creates a brand-new verified email each time gets new free documents, and
because the PDF is built in the browser a technically skilled person could skip the counter.
Stopping both completely would need server-side PDF rendering. For a marketing tool this is accepted.
PDFs support Latin letters and numbers only (standard PDF fonts).
