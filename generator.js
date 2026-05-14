(function () {
  "use strict";

  const sampleInput = [
    "Product: Launchpack",
    "Launchpack turns messy founder worklogs, transcripts, changelogs, and git commits into a Product Hunt launch kit.",
    "Audience: indie makers, devtool founders, and solo builders who ship quickly but freeze when they need launch copy.",
    "Problem: makers already have the raw material, but it is scattered across notes, calls, commits, and half-written posts. Product Hunt launch prep becomes a blank-page problem.",
    "Features:",
    "- Paste raw notes and get a Product Hunt tagline, short description, maker comment, FAQ, social posts, and demo script.",
    "- Receipts mode links every bold claim back to source snippets so the launch story feels credible, not AI-generated.",
    "- Markdown export lets a teammate or coding agent keep polishing the kit.",
    "Proof: built as a static GitHub Pages app, no backend, no login, no hidden API key.",
    "Why now: Product Hunt launches are increasingly won by clear before/after demos and practical AI workflows that turn existing work into a polished output.",
  ].join("\n");

  function generateLocalKit(input, options = {}) {
    const source = normalizeInput(input);
    const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
    const sentences = splitSentences(source);
    const productName = cleanOption(options.productName) || findLabeledValue(lines, ["product", "name", "project"]) || inferProductName(lines);
    const audience = cleanOption(options.audience) || findLabeledValue(lines, ["audience", "for", "target"]) || inferAudience(source);
    const tone = options.tone || "crisp";
    const problem = findLabeledValue(lines, ["problem", "pain", "pain points"]) ||
      findByKeywords(sentences, ["problem", "pain", "struggle", "freeze", "messy", "scattered", "manual", "slow"]) ||
      `${audience} lose momentum when launch prep turns into a blank-page writing task.`;
    const features = extractFeatures(lines, sentences);
    const proofPoints = extractProofs(sentences, lines);
    const promise = buildPromise(productName, audience, features, problem);
    const receipts = buildReceipts({ problem, features, proofPoints, source });
    const tagline = buildTagline(productName, audience, tone);
    const shortDescription = `${productName} turns ${painLabel(problem)} into a ready-to-use launch kit: Product Hunt copy, social posts, FAQ, demo script, checklist, and proof-backed receipts.`;

    const strategy = {
      productName,
      audience,
      pain: problem,
      positioning: `${productName} is a launch-prep workspace for ${audience}.`,
      promise,
      angle: "Use the work you already did as the source of truth for a credible launch story.",
      features,
      proofPoints,
    };

    return {
      strategy,
      productHunt: {
        tagline,
        shortDescription,
        makerComment: buildMakerComment({ productName, audience, problem, features, proofPoints, tone }),
      },
      social: buildSocial({ productName, audience, problem, features, proofPoints }),
      faq: buildFaq({ productName, audience, problem, features }),
      checklist: buildChecklist(productName),
      demoScript: buildDemoScript({ productName, problem, features }),
      aiPrompt: buildAiPrompt({ productName, audience, problem, features, proofPoints }),
      receipts,
      source,
    };
  }

  function generateMarkdown(kit) {
    if (!kit || !kit.strategy) return "";

    const faq = kit.faq.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n");
    const checklist = kit.checklist.map((item) => `- [ ] ${item}`).join("\n");
    const receipts = kit.receipts.map((item) => `- **${item.claim}:** ${item.source}`).join("\n");

    return [
      `# ${kit.strategy.productName} Launch Kit`,
      "",
      "## Strategy",
      `- Audience: ${kit.strategy.audience}`,
      `- Positioning: ${kit.strategy.positioning}`,
      `- Promise: ${kit.strategy.promise}`,
      `- Angle: ${kit.strategy.angle}`,
      "",
      "## Product Hunt",
      `### Tagline\n${kit.productHunt.tagline}`,
      "",
      `### Short Description\n${kit.productHunt.shortDescription}`,
      "",
      `### Maker Comment\n${kit.productHunt.makerComment}`,
      "",
      "## Social",
      `### X / Twitter\n${kit.social.xPost}`,
      "",
      `### LinkedIn\n${kit.social.linkedInPost}`,
      "",
      `### Email\n${kit.social.email}`,
      "",
      "## FAQ",
      faq,
      "",
      "## Demo Script",
      kit.demoScript,
      "",
      "## AI Polish Prompt",
      kit.aiPrompt,
      "",
      "## Checklist",
      checklist,
      "",
      "## Receipts",
      receipts,
    ].join("\n").trim();
  }

  function normalizeInput(input) {
    return String(input || "")
      .replace(/\r/g, "")
      .replace(/[ \t]+$/gm, "")
      .trim();
  }

  function cleanOption(value) {
    return String(value || "").trim();
  }

  function splitSentences(text) {
    return text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  function findLabeledValue(lines, labels) {
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (!match) continue;
      const label = match[1].toLowerCase();
      if (labels.some((item) => label.includes(item))) {
        return stripTerminal(match[2]);
      }
    }
    return "";
  }

  function inferProductName(lines) {
    const heading = lines.find((line) => line.startsWith("#"));
    if (heading) return stripTerminal(heading.replace(/^#+\s*/, ""));

    const shortLine = lines.find((line) => line.length >= 3 && line.length <= 44 && !line.includes("."));
    if (shortLine) return stripTerminal(shortLine.replace(/^(product|project|name):\s*/i, ""));

    return "Launchpack";
  }

  function inferAudience(source) {
    const audienceMatch = source.match(/\bfor\s+([^.\n]{8,120})/i);
    if (audienceMatch) return stripTerminal(audienceMatch[1]);

    const lower = source.toLowerCase();
    if (lower.includes("founder")) return "founders and indie makers";
    if (lower.includes("developer") || lower.includes("devtool")) return "developers and devtool teams";
    if (lower.includes("creator")) return "creator-founders";
    return "makers preparing a public launch";
  }

  function findByKeywords(sentences, keywords) {
    const hit = sentences.find((sentence) => {
      const lower = sentence.toLowerCase();
      return keywords.some((keyword) => lower.includes(keyword));
    });
    return hit ? stripTerminal(hit) : "";
  }

  function extractFeatures(lines, sentences) {
    const bulletFeatures = lines
      .filter((line) => /^[-*+]\s+/.test(line))
      .map((line) => stripTerminal(line.replace(/^[-*+]\s+/, "")))
      .filter((line) => line.length > 16);

    const sentenceFeatures = sentences
      .filter((sentence) => /\b(turns|generates|exports|links|lets|helps|creates|builds|shows|tracks)\b/i.test(sentence))
      .map(stripTerminal)
      .filter((sentence) => sentence.length > 20);

    return unique([...bulletFeatures, ...sentenceFeatures]).slice(0, 5);
  }

  function extractProofs(sentences, lines) {
    const proofLines = [...sentences, ...lines]
      .filter((line) => /\b(proof|built|users|pilot|beta|static|github|no backend|no login|\d+%|\d+x|\d+\s*(users|teams|founders|hours|days))\b/i.test(line))
      .map(stripTerminal);

    return unique(proofLines).slice(0, 4);
  }

  function buildPromise(productName, audience, features, problem) {
    const result = features[0] || "a clear launch story with reusable assets";
    return `${productName} helps ${audience} move from ${painLabel(problem)} to ${lowerFirst(result)}.`;
  }

  function buildTagline(productName, audience, tone) {
    const variants = {
      warm: `${productName} turns your real work into launch-ready copy`,
      bold: `Launch on Product Hunt without the blank-page panic`,
      crisp: `Turn messy worklogs into Product Hunt launch kits`,
    };
    return variants[tone] || `Launch kits for ${audience}`;
  }

  function buildMakerComment({ productName, audience, problem, features, proofPoints, tone }) {
    const greeting = tone === "bold" ? "Hey Product Hunt!" : "Hey Product Hunt friends,";
    const featureBullets = safeList(features, [
      "Product Hunt copy",
      "social posts",
      "FAQ",
      "demo script",
      "markdown export",
    ]).slice(0, 4).map((item) => `- ${item}`).join("\n");
    const proof = proofPoints[0] || "The first version is intentionally lightweight and runs fully in the browser.";

    return [
      greeting,
      "",
      `I built ${productName} because ${summarizePain(problem)} keeps showing up right before launch day.`,
      "",
      `The idea is simple: ${audience} already have the raw material. It is sitting in worklogs, changelogs, calls, commits, and half-written notes. ${productName} turns that material into a launch kit instead of asking you to start from a blank page.`,
      "",
      "What it gives you:",
      featureBullets,
      "",
      `A small thing I care about: receipts. If the kit makes a claim, it should point back to the source note that inspired it. That keeps the launch story specific and credible.`,
      "",
      proof,
      "",
      "I would love feedback on the output quality, the checklist, and what you would want before using this for a real launch.",
    ].join("\n");
  }

  function buildSocial({ productName, problem, features, proofPoints }) {
    const firstFeature = features[0] || "generates Product Hunt copy, FAQ, social posts, and a demo script";
    const proof = proofPoints[0] || "it runs as a static GitHub Pages app with no backend";

    return {
      xPost: [
        `Launch prep should not start with a blank page.`,
        "",
        `${productName} takes messy worklogs and turns them into a Product Hunt launch kit:`,
        `- ${firstFeature}`,
        "- maker comment",
        "- FAQ",
        "- social posts",
        "- receipts for claims",
        "",
        `Built for the moment when ${summarizePain(problem)}.`,
      ].join("\n"),
      linkedInPost: [
        `Most launch copy sounds generic because the source material is scattered.`,
        "",
        `With ${productName}, the source of truth is the work you already did: notes, changelogs, transcripts, commits, and rough product briefs.`,
        "",
        `The app turns that into launch assets, then shows receipts so the strongest claims stay grounded in real context.`,
        "",
        `Current proof point: ${proof}`,
        "",
        "The goal is not to generate more words. The goal is to make the launch story easier to trust.",
      ].join("\n"),
      email: [
        `Subject: A faster way to prep your Product Hunt launch`,
        "",
        `Hey,`,
        "",
        `I am building ${productName}, a small tool that turns messy product notes into a ready-to-edit launch kit.`,
        "",
        `Paste your worklog and it creates Product Hunt copy, social posts, FAQ, a checklist, and a short demo script.`,
        "",
        `The part I am most excited about: it keeps receipts for important claims, so the output feels specific instead of generic.`,
        "",
        `Would you try it on one product you are preparing to launch?`,
      ].join("\n"),
    };
  }

  function buildFaq({ productName, audience, problem, features }) {
    return [
      {
        question: `Who is ${productName} for?`,
        answer: `${productName} is for ${audience} who have product context but need a faster way to turn it into launch-ready assets.`,
      },
      {
        question: "What do I paste into it?",
        answer: "Worklogs, meeting notes, changelogs, git commits, customer quotes, product briefs, or any rough context that explains what changed and why it matters.",
      },
      {
        question: "How is this different from a generic AI writer?",
        answer: `The workflow starts from your actual source material and keeps receipts for key claims. That matters because ${summarizePain(problem)} is usually a context problem, not a writing prompt problem.`,
      },
      {
        question: "What does the first version generate?",
        answer: safeList(features, ["Product Hunt copy", "maker comment", "FAQ", "social posts", "demo script", "launch checklist"]).join("; ") + ".",
      },
      {
        question: "Does it require a backend or account?",
        answer: "No. The first version is a static GitHub Pages app that runs locally in the browser.",
      },
    ];
  }

  function buildChecklist(productName) {
    return [
      `Paste the messiest real notes you have about ${productName}.`,
      "Generate the first launch kit and read only the Product Hunt tab.",
      "Delete any claim that does not have a receipt or obvious source.",
      "Tighten the tagline until the before/after is clear in one breath.",
      "Record a 30-second demo using the generated script.",
      "Post one teaser using the X/LinkedIn drafts.",
      "Ask three friendly users which FAQ question feels missing.",
      "Export markdown and keep it in the repository next to launch assets.",
      "On launch day, use the maker comment as the opening comment and answer objections from the FAQ.",
    ];
  }

  function buildAiPrompt({ productName, audience, problem, features, proofPoints }) {
    return [
      `You are helping polish a Product Hunt launch kit for ${productName}.`,
      "",
      "Goal: make the copy specific, credible, and launch-ready without inventing unsupported claims.",
      "",
      `Audience: ${audience}`,
      `Core pain: ${summarizePain(problem)}`,
      "",
      "Known features:",
      ...safeList(features, ["Product Hunt launch copy", "social posts", "FAQ", "demo script", "markdown export"]).map((item) => `- ${item}`),
      "",
      "Proof points and constraints:",
      ...safeList(proofPoints, ["Do not invent metrics. Keep every strong claim tied to the source material."]).map((item) => `- ${item}`),
      "",
      "Please improve the launch kit with:",
      "- A sharper Product Hunt tagline under 60 characters.",
      "- A maker comment that sounds human and concrete.",
      "- Five likely launch-day objections with concise answers.",
      "- A 30-second demo script with a clear before/after.",
      "- A list of claims that need stronger evidence before launch.",
    ].join("\n");
  }

  function buildDemoScript({ productName, problem, features }) {
    const topFeatures = safeList(features, [
      "generate launch copy",
      "create social posts",
      "export markdown",
    ]).slice(0, 3);

    return [
      "0:00 - Show the mess",
      `Open with raw notes and say: "${summarizePain(problem)}."`,
      "",
      "0:10 - Paste into the builder",
      `Paste the notes into ${productName}, add the audience, and hit generate.`,
      "",
      "0:20 - Show the launch kit",
      topFeatures.map((feature) => `Show: ${feature}.`).join("\n"),
      "",
      "0:35 - Show receipts",
      "Click Receipts and point out that strong claims trace back to source snippets.",
      "",
      "0:45 - Export",
      "Export markdown and show how the launch kit can move into GitHub, Notion, or a Product Hunt draft.",
    ].join("\n");
  }

  function buildReceipts({ problem, features, proofPoints, source }) {
    const receipts = [
      {
        claim: "The product solves a real launch-prep pain",
        source: problem,
      },
      ...features.slice(0, 3).map((feature) => ({
        claim: "Generated feature claim",
        source: feature,
      })),
      ...proofPoints.slice(0, 3).map((proof) => ({
        claim: "Proof point",
        source: proof,
      })),
    ];

    if (receipts.length < 4) {
      receipts.push({
        claim: "Source material length",
        source: `${source.split(/\s+/).filter(Boolean).length} words of pasted context were used to build this kit.`,
      });
    }

    return receipts.slice(0, 7);
  }

  function summarizePain(problem) {
    const cleaned = stripTerminal(problem)
      .replace(/^problem:\s*/i, "")
      .replace(/^pain:\s*/i, "")
      .replace(/^pain points:\s*/i, "")
      .replace(/\bmakers\b/gi, "makers");
    return truncateAtWord(cleaned, 136);
  }

  function painLabel(problem) {
    const text = summarizePain(problem).toLowerCase();
    if (text.includes("scattered") || text.includes("raw material")) return "scattered launch context";
    if (text.includes("blank-page") || text.includes("blank page")) return "blank-page launch prep";
    if (text.includes("manual")) return "manual launch prep";
    return text;
  }

  function lowerFirst(value) {
    const text = String(value || "");
    return text ? text[0].toLowerCase() + text.slice(1) : text;
  }

  function truncateAtWord(value, maxLength) {
    if (value.length <= maxLength) return value;
    const clipped = value.slice(0, maxLength);
    const lastSpace = clipped.lastIndexOf(" ");
    return `${clipped.slice(0, Math.max(48, lastSpace)).trim()}...`;
  }

  function stripTerminal(value) {
    return String(value || "")
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/[.;:\s]+$/g, "")
      .trim();
  }

  function safeList(value, fallback) {
    return Array.isArray(value) && value.length ? value : fallback;
  }

  function unique(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const api = {
    generateLocalKit,
    generateMarkdown,
    sampleInput,
  };

  if (typeof window !== "undefined") {
    window.LaunchKitGenerator = api;
  }

  if (typeof module !== "undefined") {
    module.exports = api;
  }
})();
