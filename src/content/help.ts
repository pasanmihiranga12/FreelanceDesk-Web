// Help guides for the FreelanceDesk app. Add an entry to publish a new one.
// `body` is plain HTML (h2, h3, p, ul, ol, strong). Screens can differ slightly between app versions.

export interface HelpGuide {
  slug: string;
  title: string;
  description: string;
  group: "Getting started" | "Invoices and quotations" | "Clients and money" | "Your data and account";
  body: string;
}

export const helpGroups: HelpGuide["group"][] = ["Getting started", "Invoices and quotations", "Clients and money", "Your data and account"];

export const guides: HelpGuide[] = [
  {
    slug: "getting-started",
    title: "Getting started with FreelanceDesk",
    description: "Install the app, set up your business profile, add your first client and send your first invoice.",
    group: "Getting started",
    body: `
<p>FreelanceDesk keeps your clients, orders, invoices and payments on your phone. There is no account to create and nothing to sign in to. Here is the quickest way to get set up.</p>

<h2>1. Install and open the app</h2>
<p>Install FreelanceDesk from Google Play. The first time you open it, a short setup walks you through the basics. You can start with a 7-day free trial if you are a new subscriber.</p>

<h2>2. Fill in your business profile</h2>
<p>Add the details that appear on your invoices:</p>
<ul>
  <li>Your business or personal name, email, phone and address</li>
  <li>Your logo (optional)</li>
  <li>Your bank details, so clients know how to pay you</li>
  <li>Your tax or VAT ID, if you have one</li>
</ul>
<p>You can change any of this later in the app's settings.</p>

<h2>3. Add your first client</h2>
<p>Use the add-client button on the dashboard. Save their name and contact details once, and they are ready for every future order and invoice.</p>

<h2>4. Create an order</h2>
<p>Tap <strong>New Order</strong> on the dashboard, choose the client, then add the price and the deadline. An order is the job you are doing for the client.</p>

<h2>5. Make an invoice</h2>
<p>From the order, create an invoice, pick a template and share the PDF. Our guide to creating an invoice has the details.</p>

<h2>6. Record payments</h2>
<p>When the client pays, record the payment so the app always knows what is still owed.</p>

<p>That is it. Everything stays on your phone, and the app works without an internet connection.</p>
`,
  },
  {
    slug: "create-an-invoice",
    title: "How to create and send an invoice",
    description: "Create an invoice from an order or from scratch, choose a template, preview it and share the PDF.",
    group: "Invoices and quotations",
    body: `
<p>You can make an invoice from an existing order, or start from a blank one. Either way the steps are the same.</p>

<h2>Create the invoice</h2>
<ol>
  <li>Open an order and choose to create an invoice, or start a new invoice from scratch.</li>
  <li>Check the client and add your items with a quantity and a price.</li>
  <li>Add a discount or tax if you need to. The totals update as you type.</li>
  <li>Set the invoice date and the due date.</li>
</ol>

<h2>Choose a template</h2>
<p>FreelanceDesk has many invoice templates, from clean and professional to bold and colourful. Tap a template to select it and use <strong>Preview this template</strong> to see exactly how your invoice will look before you create the PDF.</p>

<h2>Add your logo and signature</h2>
<p>Your logo comes from your business profile. You can also attach a saved signature to the invoice. See the guide on templates, logo and signature.</p>

<h2>Share it</h2>
<p>Create the PDF, then share it with any app on your phone, such as WhatsApp or email. In your invoice list you can open an invoice again, preview it, share it, mark it as sent or paid, or delete it.</p>

<h2>Tips</h2>
<ul>
  <li>Use clear item descriptions, so clients don't have to ask what they are paying for.</li>
  <li>Put the due date on every invoice.</li>
  <li>Keep your bank details in your business profile so they appear automatically.</li>
</ul>
`,
  },
  {
    slug: "create-a-quotation",
    title: "How to create a quotation and turn it into an invoice",
    description: "Send a priced quotation with a valid-until date and convert it to an invoice once the client says yes.",
    group: "Invoices and quotations",
    body: `
<p>A quotation is a priced offer you send before the work starts. FreelanceDesk lets you create one in the same way as an invoice, then turn it into an invoice later.</p>

<h2>Create the quotation</h2>
<ol>
  <li>Create a new quotation and choose the client.</li>
  <li>Add your items with quantities and prices, plus any discount or tax.</li>
  <li>Set a <strong>valid until</strong> date.</li>
  <li>Add notes and terms, such as a deposit or how many revisions are included.</li>
  <li>Pick a template, preview it and create the PDF.</li>
</ol>

<h2>Send it and track it</h2>
<p>Share the PDF with the client. In your quotation list you can see its status and mark it as sent or accepted.</p>

<h2>Turn it into an invoice</h2>
<p>When the client accepts, convert the quotation to an invoice in one tap. The items and prices carry over, so the numbers on the invoice match the quote exactly.</p>

<h2>Tips</h2>
<ul>
  <li>Break the price into clear deliverables.</li>
  <li>Say what is not included, to avoid scope arguments later.</li>
  <li>Always include a valid-until date.</li>
</ul>
<p>Our blog has a guide on writing a quotation that wins the job.</p>
`,
  },
  {
    slug: "templates-logo-signature",
    title: "Templates, your logo and your signature",
    description: "Pick an invoice or quotation template, add your business logo and attach a signature.",
    group: "Invoices and quotations",
    body: `
<h2>Templates</h2>
<p>The app has 20 invoice templates and 6 quotation templates. The fancy ones are at the top of the list. Tap one to select it, and use <strong>Preview this template</strong> to see your own details in it before you create the PDF.</p>
<p>Different templates suit different clients. A clean template feels formal, and a bold one feels creative. You can use a different template for every invoice.</p>

<h2>Your logo</h2>
<p>Add your logo to your business profile once, and it appears on your invoices and quotations. You can choose to show or hide it on each document.</p>

<h2>Your signature</h2>
<p>Draw your signature with your finger and save it. FreelanceDesk keeps a signature library, so you can pick one for each document. A signature adds a personal touch and makes a quotation or invoice look finished.</p>

<h2>Long invoices</h2>
<p>If an invoice has many items, it may continue on a second page. The totals and payment details stay together.</p>
`,
  },
  {
    slug: "record-payments",
    title: "How to record payments and see what you're owed",
    description: "Record full or partial payments and keep track of what is still outstanding.",
    group: "Clients and money",
    body: `
<p>Recording payments is what keeps your numbers honest. It takes a few seconds when the money arrives.</p>

<h2>Record a payment</h2>
<ol>
  <li>Tap <strong>Payment</strong> on the dashboard, or open the order or invoice that was paid.</li>
  <li>Choose the client and the order.</li>
  <li>Enter the amount, then save.</li>
</ol>

<h2>Part payments</h2>
<p>Clients often pay in pieces, such as a deposit and then the balance. Record each one as it arrives. The app keeps a running total and shows the amount still outstanding.</p>

<h2>See what you're owed</h2>
<p>The dashboard shows what you have earned this month and what is pending. Your invoices list shows which are sent, paid or overdue, so you know which one to chase first.</p>

<h2>Mark an invoice as paid</h2>
<p>When an invoice has been paid in full, mark it as paid from the invoice list.</p>

<h2>Currencies</h2>
<p>You can work in your own currency and create orders in other currencies. The app converts them for your totals and keeps the original amount on the invoice.</p>
`,
  },
  {
    slug: "clients-and-orders",
    title: "Managing clients and orders",
    description: "Keep client profiles, create orders with deadlines and set up recurring orders.",
    group: "Clients and money",
    body: `
<h2>Clients</h2>
<p>Each client has a profile with a photo, a category, notes and contact details. Open a client to see their full history: orders, invoices and payments.</p>

<h2>Orders</h2>
<p>An order is a job for a client. Create one with the <strong>New Order</strong> button on the dashboard:</p>
<ul>
  <li>Choose a client.</li>
  <li>Choose whether it is a fixed-fee order or a campaign-based one.</li>
  <li>Set the price and the due date.</li>
</ul>
<p>Use the order's status to keep track of where it stands.</p>

<h2>Deadlines</h2>
<p>Upcoming deadlines appear on the dashboard so you can see what is due next, and what is due today.</p>

<h2>Recurring orders</h2>
<p>For work that repeats, such as a monthly retainer, set up a recurring order. The app creates the next order for you on the schedule you choose, so regular work never slips.</p>
`,
  },
  {
    slug: "reminders-and-deadlines",
    title: "Reminders and notifications",
    description: "Get payment reminders and deadline alerts on your phone, without any account or server.",
    group: "Clients and money",
    body: `
<p>FreelanceDesk can remind you about payments and deadlines with notifications on your phone.</p>

<h2>What you can be reminded about</h2>
<ul>
  <li>Upcoming and overdue deadlines</li>
  <li>Payments that are due or late</li>
</ul>

<h2>How it works</h2>
<p>The reminders are created on your phone. They don't come from a server, so they work without an account.</p>

<h2>If you don't see notifications</h2>
<ol>
  <li>Check that notifications are allowed for FreelanceDesk in your phone's settings.</li>
  <li>Check that battery saving isn't stopping the app from running in the background.</li>
  <li>Open the app once after changing these settings.</li>
</ol>

<p>Reminders are for you. To nudge a client, send them a short, polite message. Our blog has examples you can copy in the guide to chasing a late payment.</p>
`,
  },
  {
    slug: "analytics-recaps-badges",
    title: "Analytics, recaps and badges",
    description: "Understand your income with the dashboard and charts, and share a monthly or yearly recap.",
    group: "Clients and money",
    body: `
<h2>Dashboard</h2>
<p>The dashboard shows your total earned, this month and what is pending. Below that you will see your upcoming deadlines.</p>

<h2>Analytics</h2>
<p>The analytics screen has an income chart you can swipe through, monthly breakdowns, your best months and client statistics. You can look at all twelve months at once and compare a month with the one before.</p>

<h2>Client scores</h2>
<p>Each client gets a score, so you can see who your best clients are.</p>

<h2>Recaps</h2>
<p>At the end of a month or a year, open a recap: a look back at your freelance work that you can share as an image.</p>

<h2>Badges</h2>
<p>You earn badges as your client list and income grow. They are a small reward for keeping going.</p>
`,
  },
  {
    slug: "tax-and-export",
    title: "Tax settings and exporting your data",
    description: "Add tax to invoices, store your tax ID, estimate how much to set aside and export to CSV.",
    group: "Clients and money",
    body: `
<h2>Tax on invoices</h2>
<p>You can add a tax rate to an invoice or quotation. It appears as its own line with the amount, and the total updates automatically. Store your tax or VAT ID in your business profile and it appears on your documents.</p>

<h2>Tax set-aside estimate</h2>
<p>Enter a percentage and the app shows that share of your earnings, so you can see roughly how much to keep aside. It is an estimate to help you build the habit.</p>
<p><strong>It is not tax advice.</strong> Rules differ by country, so check with your tax authority or an accountant.</p>

<h2>Export to CSV</h2>
<p>Export your financial data as a CSV file. You can open it in a spreadsheet or give it to your accountant.</p>
`,
  },
  {
    slug: "backup-and-restore",
    title: "Backing up and restoring your data",
    description: "Make a full backup of your clients, invoices, signatures and settings, and restore it on a new phone.",
    group: "Your data and account",
    body: `
<p>Because your data lives only on your phone, a backup is how you protect it. Back up before you change phones or reset anything.</p>

<h2>Make a backup</h2>
<p>Use the backup option in the app's settings. It creates one file with your clients, orders, invoices, payments, signatures, photos and settings. Save the file somewhere safe, such as your cloud storage or your email.</p>

<h2>Restore on a new phone</h2>
<ol>
  <li>Install FreelanceDesk on the new phone.</li>
  <li>Move your backup file to that phone.</li>
  <li>Use the restore option in settings and choose the file.</li>
</ol>

<h2>Reset all data</h2>
<p>The app can erase all of its data. This cannot be undone, so make a backup first.</p>

<h2>How often to back up</h2>
<p>After any big change, and at least once a month if you use the app daily.</p>
`,
  },
  {
    slug: "app-lock-and-privacy",
    title: "App lock and your privacy",
    description: "Lock the app with a PIN or fingerprint, and understand what stays on your phone.",
    group: "Your data and account",
    body: `
<h2>What stays on your phone</h2>
<p>FreelanceDesk has no accounts and no cloud. Your clients, invoices, payments and signatures are stored on your phone. The app has no ads and no analytics. It works offline, and only needs a connection to confirm your subscription with Google Play.</p>

<h2>App lock</h2>
<p>You can protect the app with a PIN, or with your fingerprint or face if your phone supports it. When the lock is on, you need to unlock FreelanceDesk each time you open it.</p>

<h2>If you forget your PIN</h2>
<p>Because nothing is stored on a server, we cannot reset it for you. Keep your PIN somewhere safe, and make regular backups.</p>

<h2>Our policies</h2>
<p>You can read the full <a href="/app-privacy/">app privacy policy</a> and <a href="/app-terms/">app terms</a>.</p>
`,
  },
  {
    slug: "subscription-and-trial",
    title: "Subscription, free trial and cancelling",
    description: "How the 7-day free trial and the monthly subscription work, and how to cancel in Google Play.",
    group: "Your data and account",
    body: `
<h2>The free trial</h2>
<p>New subscribers can try FreelanceDesk free for 7 days. Google Play decides who is eligible for the trial.</p>

<h2>The subscription</h2>
<p>After the trial it costs $1.99 per month, billed by Google Play. Prices may vary by country. The subscription includes unlimited clients, orders, invoices and quotations.</p>

<h2>Cancel</h2>
<p>You manage the subscription in Google Play, not in the app:</p>
<ol>
  <li>Open the Google Play Store app.</li>
  <li>Tap your profile picture, then <strong>Payments and subscriptions</strong>, then <strong>Subscriptions</strong>.</li>
  <li>Choose FreelanceDesk and tap <strong>Cancel subscription</strong>.</li>
</ol>
<p>Cancel before the trial ends if you don't want to be charged.</p>

<h2>Refunds and billing problems</h2>
<p>Google Play handles payments and refunds. Use Google Play's help for billing questions. For anything else, write to us at <a href="mailto:media@lygenexlabs.com">media@lygenexlabs.com</a>.</p>
`,
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
