#!/usr/bin/env node
/* =============================================================================
 * Dawikk — static subpage generator
 * -----------------------------------------------------------------------------
 * Reads the catalog in public/apps.js and, for every app, writes a consistent
 * set of subpages into public/<slug>/ :
 *   - privacyPolicy.html   (always regenerated from the branded template)
 *   - termsOfUse.html      (always regenerated)
 *   - deleteAccount.html   (always regenerated)
 *   - app-ads.txt          (copied from public/app-ads.txt if present)
 *   - index.html           (landing) — only generated when one is MISSING or is
 *                           a stray privacy policy. Hand-made landings are kept.
 *
 * Generated landings carry the marker below so re-runs can safely refresh them
 * without ever clobbering a hand-authored page.
 *
 * Usage:  node scripts/generate.js
 * ========================================================================== */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const GEN_MARKER = "<!-- dawikk:generated-landing -->";

// ---- load the catalog (apps.js defines browser globals) --------------------
function loadCatalog() {
  const src = fs.readFileSync(path.join(PUBLIC, "apps.js"), "utf8") +
    "\nmodule.exports = { DAWIKK_PROFILE, DAWIKK_CATEGORIES, DAWIKK_APPS, DAWIKK_DEFAULT_EFFECTIVE_DATE };";
  const m = { exports: {} };
  new Function("module", "exports", src)(m, m.exports);
  return m.exports;
}

const { DAWIKK_PROFILE: P, DAWIKK_CATEGORIES: CATS, DAWIKK_APPS: APPS, DAWIKK_DEFAULT_EFFECTIVE_DATE: DEF_DATE } = loadCatalog();

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const IMG_RE = /\.(png|jpe?g|svg|webp)$/i;
const iconMarkup = (app) =>
  app.icon && IMG_RE.test(app.icon)
    ? `<img src="${esc(app.icon)}" alt="${esc(app.name)} icon" />`
    : esc(app.icon || "📱");

// ---- shared chrome ---------------------------------------------------------
function head(title, desc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="icon" href="../favicon.ico" />
  <link rel="stylesheet" href="../assets/site.css" />
</head>
<body>`;
}

function header(app) {
  return `  <header>
    <div class="wrap nav">
      <a class="brand" href="../"><span class="dot"></span>${esc(P.name)}</a>
      <nav class="nav-links">
        <a class="hide-sm" href="index.html">${esc(app.name)}</a>
        <a href="../">All apps</a>
        <a href="../#apps">Browse</a>
      </nav>
    </div>
  </header>`;
}

function storeButtons(app) {
  const play = app.play
    ? `<a class="btn btn-primary" href="${esc(app.play)}" target="_blank" rel="noopener">▶ Google Play</a>`
    : `<span class="btn btn-ghost" style="opacity:.45;cursor:default" title="Coming soon">▶ Google Play</span>`;
  const ios = app.appStore
    ? `<a class="btn btn-ghost" href="${esc(app.appStore)}" target="_blank" rel="noopener"> App Store</a>`
    : `<span class="btn btn-ghost" style="opacity:.45;cursor:default" title="Coming soon"> App Store</span>`;
  return play + "\n          " + ios;
}

function footer() {
  const yr = new Date().getFullYear();
  return `  <footer>
    <div class="wrap">
      <div class="links">
        <a href="../">All apps</a>
        <a href="${esc(P.playDeveloper)}" target="_blank" rel="noopener">Google Play</a>
        <a href="${esc(P.appStoreDeveloper)}" target="_blank" rel="noopener">App Store</a>
        <a href="mailto:${esc(P.email)}">Contact</a>
      </div>
      <div>© ${yr} ${esc(P.author)} (${esc(P.name)}). All rights reserved.</div>
    </div>
  </footer>
</body>
</html>
`;
}

function pageLinks(active) {
  const items = [
    ["index.html", "Overview"],
    ["privacyPolicy.html", "Privacy Policy"],
    ["termsOfUse.html", "Terms of Use"],
    ["deleteAccount.html", "Delete Account"],
  ];
  return `<div class="pagelinks">` +
    items.map(([h, l]) => h === active ? `<a aria-current="page" style="border-color:var(--accent)">${l}</a>` : `<a href="${h}">${l}</a>`).join("") +
    `</div>`;
}

// ---- landing ---------------------------------------------------------------
function defaultFeatures(app) {
  const byCat = {
    chess: [["♟️", "Sharpen your skills", "Thoughtfully designed training and play to help you improve every session."],
            ["📈", "Track your progress", "See yourself get better over time with clear, motivating feedback."],
            ["📵", "Play anywhere", "Enjoy a smooth experience on the go, at your own pace."]],
    board: [["🎲", "Classic, done right", "A faithful, polished take on a timeless board game."],
            ["🤖", "Play vs AI or friends", "Challenge a smart opponent or share the fun locally."],
            ["✨", "Clean & intuitive", "Beautiful visuals and controls anyone can pick up."]],
    puzzle: [["🧩", "Easy to learn", "Simple rules, endless depth — just pick up and play."],
             ["🔥", "Hard to put down", "Addictive gameplay that keeps you coming back."],
             ["🏆", "Beat your best", "Chase high scores and personal records."]],
    fitness: [["💪", "Build a habit", "Progressive challenges that grow with you."],
              ["⏱️", "Quick sessions", "Effective workouts that fit any schedule."],
              ["🏠", "No equipment", "Train anywhere, anytime, at your own pace."]],
    word: [["💬", "Grow your words", "Learn and have fun at the same time."],
           ["🎯", "Bite-sized fun", "Perfect for a quick mental workout."],
           ["🌍", "For everyone", "Designed to be friendly and approachable."]],
    tools: [["⚡", "Fast & focused", "Does one thing, and does it well."],
            ["🎛️", "Just what you need", "Thoughtful options without the clutter."],
            ["📱", "Always handy", "A reliable companion right in your pocket."]],
    lifestyle: [["✨", "Simple & delightful", "Made to be genuinely pleasant to use."],
                ["⚡", "Save time", "Get to what matters with zero fuss."],
                ["😊", "For everyday", "A little app that makes daily life easier."]],
  };
  return byCat[app.category] || byCat.tools;
}

function landingPage(app) {
  const feats = defaultFeatures(app).map(([fi, h, p]) =>
    `        <div class="feature"><span class="fi">${fi}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`
  ).join("\n");
  return head(`${app.name} — by ${P.name}`, app.tagline || app.description) + "\n" +
    GEN_MARKER + "\n" +
    header(app) + `
  <main>
    <section class="app-hero">
      <div class="wrap">
        <div class="app-icon">${iconMarkup(app)}</div>
        <h1>${esc(app.name)}</h1>
        <p class="tag">${esc(app.tagline || app.description)}</p>
        <div class="cta-row">
          ${storeButtons(app)}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head"><h2>About ${esc(app.name)}</h2><p>${esc(app.description)}</p></div>
        <div class="features-grid">
${feats}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap" style="text-align:center">
        ${pageLinks("index.html")}
      </div>
    </section>
  </main>
` + footer();
}

// ---- legal documents -------------------------------------------------------
function docPage(app, kind, title, bodyHtml) {
  const date = app.effectiveDate || DEF_DATE;
  return head(`${title} — ${app.name}`, `${title} for ${app.name} by ${P.name}.`) + "\n" +
    header(app) + `
  <main class="subpage-main">
    <div class="doc-head">
      <div class="crumbs"><a href="../">${esc(P.name)}</a> / <a href="index.html">${esc(app.name)}</a> / ${esc(title)}</div>
      <h1>${esc(title)}</h1>
      <div class="eff">Effective date: ${esc(date)}</div>
    </div>
    <div class="doc">
${bodyHtml}
    </div>
    ${pageLinks(kind)}
  </main>
` + footer();
}

function privacyBody(app) {
  const ads = app.hasAds;
  const acc = app.hasAccounts;
  return `      <p>This Privacy Policy describes how the <strong>${esc(app.name)}</strong> application ("the App"),
      provided by ${esc(P.author)} ("${esc(P.name)}", "we", "us"), handles information. The App is provided
      ${ads ? "as an ad-supported service " : ""}and is intended for use "as is".</p>

      <h2>Information We Collect</h2>
      <p>We designed ${esc(app.name)} to collect as little as possible.</p>
      <ul>
        <li><strong>Data you create in the app</strong>${acc ? "" : ", such as settings, progress and preferences,"} is stored ${acc ? "on your device and, where you enable it, in your account so it can sync across devices." : "locally on your device."}</li>
        <li><strong>Technical &amp; diagnostic data</strong> (such as device model, operating system version, and crash logs) may be processed automatically to keep the App stable and improve it.</li>
      </ul>
      ${ads ? `<h2>Advertising</h2>
      <p>The App may display advertisements through Google AdMob. Advertising partners may use device identifiers
      to deliver and measure ads. You can manage personalised advertising in your device settings.</p>` : ""}

      <h2>Third-Party Services</h2>
      <p>The App may use third-party services that have their own privacy policies:</p>
      <ul>
        <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Play Services</a></li>
        ${ads ? `<li><a href="https://support.google.com/admob/answer/6128543" target="_blank" rel="noopener noreferrer">Google AdMob</a></li>` : ""}
        <li><a href="https://expo.dev/privacy" target="_blank" rel="noopener noreferrer">Expo</a></li>
      </ul>

      <h2>Data Retention &amp; Deletion</h2>
      <p>${acc
        ? `Account data is retained while your account is active. You can delete your account and associated data at any time — see the <a href="deleteAccount.html">Delete Account</a> page.`
        : `Because data is stored locally, uninstalling the App removes it from your device. To request deletion of any data we may hold, see the <a href="deleteAccount.html">Delete Account</a> page.`}</p>

      <h2>Children's Privacy</h2>
      <p>The App is not directed to children under 13, and we do not knowingly collect personal information from
      them. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>

      <h2>Security</h2>
      <p>We use reasonable technical and organisational measures to protect information. However, no method of
      transmission or storage is completely secure.</p>

      <h2>Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
      effective date.</p>

      <h2>Contact</h2>
      <p>Questions about this policy? Email us at
      <a href="mailto:${esc(P.email)}">${esc(P.email)}</a>.</p>`;
}

function termsBody(app) {
  return `      <p>These Terms of Use ("Terms") govern your use of the <strong>${esc(app.name)}</strong> application
      ("the App") provided by ${esc(P.author)} ("${esc(P.name)}"). By downloading or using the App, you agree to
      these Terms.</p>

      <h2>License</h2>
      <p>We grant you a personal, non-exclusive, non-transferable, revocable licence to use the App for your own
      lawful, non-commercial purposes, in accordance with these Terms and the rules of the app store you used.</p>

      <h2>Acceptable Use</h2>
      <ul>
        <li>Do not copy, modify, reverse engineer, or redistribute the App except as permitted by law.</li>
        <li>Do not use the App in any way that is unlawful or that could harm the service or other users.</li>
        <li>Do not attempt to interfere with, disrupt, or gain unauthorised access to the App.</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>The App, including its content, design and trademarks, is owned by ${esc(P.name)} and protected by
      applicable laws. These Terms do not grant you any rights to our intellectual property except as expressly stated.</p>

      ${app.hasAds ? `<h2>Advertising</h2>
      <p>The App may display third-party advertisements. We are not responsible for the content of ads or for any
      third-party websites or services they link to.</p>` : ""}

      <h2>Disclaimer &amp; Limitation of Liability</h2>
      <p>The App is provided "as is" and "as available" without warranties of any kind. To the maximum extent
      permitted by law, ${esc(P.name)} shall not be liable for any indirect, incidental or consequential damages
      arising from your use of the App.</p>

      <h2>Updates &amp; Availability</h2>
      <p>We may update, change, or discontinue the App or any of its features at any time without notice.</p>

      <h2>Changes to These Terms</h2>
      <p>We may revise these Terms from time to time. Continued use of the App after changes take effect constitutes
      acceptance of the revised Terms.</p>

      <h2>Contact</h2>
      <p>Questions about these Terms? Email us at <a href="mailto:${esc(P.email)}">${esc(P.email)}</a>.</p>`;
}

function deleteBody(app) {
  const acc = app.hasAccounts;
  return `      <p>This page explains how to delete your data for the <strong>${esc(app.name)}</strong> application
      ("the App") by ${esc(P.author)} ("${esc(P.name)}").</p>

      ${acc ? `<h2>Delete your account &amp; data</h2>
      <div class="callout">
        <p><strong>In the app:</strong> open <em>Settings → Account → Delete account</em> and confirm. This
        permanently removes your account and the data associated with it.</p>
      </div>
      <p>Prefer email? Send a request from your account's email address to
      <a href="mailto:${esc(P.email)}?subject=Delete%20my%20${encodeURIComponent(app.name)}%20data">${esc(P.email)}</a>
      with the subject "Delete my data". We will process verified requests within 30 days.</p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your account identifier and profile information.</li>
        <li>App data linked to your account (such as progress, settings and saved content).</li>
      </ul>
      <p>Some records may be retained where required by law or for fraud prevention, for the minimum period necessary.</p>`
      : `<h2>Your data is stored on your device</h2>
      <p>${esc(app.name)} does not require an account. Your settings, progress and other data are stored locally on
      your device. To delete all of it, simply <strong>uninstall the App</strong> — this removes the associated data
      from your device.</p>

      <div class="callout">
        <p>If we hold any data relating to you (for example, diagnostics) and you would like it deleted, email a
        request to <a href="mailto:${esc(P.email)}?subject=Delete%20my%20${encodeURIComponent(app.name)}%20data">${esc(P.email)}</a>.
        We will respond within 30 days.</p>
      </div>`}

      <h2>Contact</h2>
      <p>Need help? Email us at <a href="mailto:${esc(P.email)}">${esc(P.email)}</a>.</p>`;
}

// ---- landing detection -----------------------------------------------------
function isRealLanding(file) {
  if (!fs.existsSync(file)) return false;
  const html = fs.readFileSync(file, "utf8");
  if (html.includes(GEN_MARKER)) return false;               // ours → refresh allowed
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [, ""])[1];
  if (/privacy policy|terms of use|delete account/i.test(title)) return false;
  return html.length > 1200;                                 // substantial, hand-made
}

// ---- run -------------------------------------------------------------------
const rootAds = path.join(PUBLIC, "app-ads.txt");
const hasRootAds = fs.existsSync(rootAds);
const summary = [];

for (const app of APPS) {
  if (!app.slug) { console.warn("! app without slug:", app.name); continue; }
  const dir = path.join(PUBLIC, app.slug);
  fs.mkdirSync(dir, { recursive: true });

  const write = (name, content) => fs.writeFileSync(path.join(dir, name), content);

  // legal pages — always regenerated for consistency
  write("privacyPolicy.html", docPage(app, "privacyPolicy.html", "Privacy Policy", privacyBody(app)));
  write("termsOfUse.html", docPage(app, "termsOfUse.html", "Terms of Use", termsBody(app)));
  write("deleteAccount.html", docPage(app, "deleteAccount.html", "Delete Account", deleteBody(app)));

  // app-ads.txt
  if (hasRootAds && !fs.existsSync(path.join(dir, "app-ads.txt"))) {
    fs.copyFileSync(rootAds, path.join(dir, "app-ads.txt"));
  }

  // landing
  const indexFile = path.join(dir, "index.html");
  let landingState;
  if (isRealLanding(indexFile)) {
    landingState = "kept";
  } else {
    write("index.html", landingPage(app));
    landingState = fs.existsSync(indexFile) ? "generated" : "generated";
  }

  summary.push({ slug: app.slug, landing: landingState, verified: app.verified !== false });
}

const gen = summary.filter((s) => s.landing === "generated").length;
const kept = summary.filter((s) => s.landing === "kept").length;
console.log(`✓ Processed ${summary.length} apps`);
console.log(`  Landings: ${kept} kept (hand-made), ${gen} generated`);
console.log(`  Legal pages regenerated for all (privacy / terms / delete).`);
const unverified = summary.filter((s) => !s.verified).map((s) => s.slug);
if (unverified.length) console.log(`  ⚠ Needs metadata review: ${unverified.join(", ")}`);
