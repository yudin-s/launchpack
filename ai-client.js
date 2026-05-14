(function () {
  "use strict";

  const DEFAULT_TIMEOUT_MS = 90000;

  async function generateWithLLM({ input, localKit, settings }) {
    const endpoint = buildChatCompletionsUrl(settings.endpoint);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: buildHeaders(settings.apiKey),
        body: JSON.stringify(buildRequest({ input, localKit, settings })),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM request failed (${response.status}): ${text.slice(0, 220)}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
      const parsed = parseJsonObject(content);
      return mergeKit(localKit, parsed);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function testConnection(settings) {
    const endpoint = buildModelsUrl(settings.endpoint);
    const response = await fetch(endpoint, {
      headers: buildHeaders(settings.apiKey),
    });

    if (!response.ok) {
      throw new Error(`Connection failed (${response.status})`);
    }

    const data = await response.json();
    const models = Array.isArray(data?.data) ? data.data : [];
    return models.map((item) => item.id).filter(Boolean).slice(0, 5);
  }

  function buildRequest({ input, localKit, settings }) {
    return {
      model: settings.model,
      temperature: 0.55,
      messages: [
        {
          role: "system",
          content: [
            "You are Launchpack, an expert Product Hunt launch strategist.",
            "Return only valid JSON. Do not wrap the JSON in markdown.",
            "Do not invent metrics, customers, integrations, or proof.",
            "Keep claims tied to the source material.",
          ].join(" "),
        },
        {
          role: "user",
          content: buildPrompt(input, localKit),
        },
      ],
    };
  }

  function buildPrompt(input, localKit) {
    return [
      "Create a polished Product Hunt launch kit from the source notes.",
      "",
      "Required JSON shape:",
      JSON.stringify(exampleShape(), null, 2),
      "",
      "Baseline deterministic kit you can improve:",
      JSON.stringify(localKit, null, 2),
      "",
      "Source notes:",
      input,
    ].join("\n");
  }

  function exampleShape() {
    return {
      strategy: {
        productName: "Product name",
        audience: "Target audience",
        pain: "Core pain",
        positioning: "One sentence positioning",
        promise: "Outcome promise",
        angle: "Launch angle",
        features: ["Feature 1", "Feature 2", "Feature 3"],
        proofPoints: ["Proof point 1"],
      },
      productHunt: {
        tagline: "Under 60 characters",
        shortDescription: "One concise paragraph",
        makerComment: "Human maker comment",
      },
      social: {
        xPost: "Short X post",
        linkedInPost: "LinkedIn post",
        email: "Launch email",
      },
      faq: [
        { question: "Question", answer: "Answer" },
      ],
      checklist: ["Checklist item"],
      demoScript: "30-60 second script",
      receipts: [
        { claim: "Claim", source: "Source snippet" },
      ],
    };
  }

  function mergeKit(localKit, generated) {
    const kit = {
      ...localKit,
      ...generated,
      strategy: { ...localKit.strategy, ...generated.strategy },
      productHunt: { ...localKit.productHunt, ...generated.productHunt },
      social: { ...localKit.social, ...generated.social },
      faq: normalizeFaq(generated.faq, localKit.faq),
      checklist: normalizeStringArray(generated.checklist, localKit.checklist),
      receipts: normalizeReceipts(generated.receipts, localKit.receipts),
      source: localKit.source,
    };

    kit.aiPrompt = window.LaunchKitGenerator.generateLocalKit(localKit.source, {
      productName: kit.strategy.productName,
      audience: kit.strategy.audience,
    }).aiPrompt;

    return kit;
  }

  function normalizeFaq(value, fallback) {
    if (!Array.isArray(value)) return fallback;
    const items = value
      .map((item) => ({
        question: String(item?.question || "").trim(),
        answer: String(item?.answer || "").trim(),
      }))
      .filter((item) => item.question && item.answer);
    return items.length ? items : fallback;
  }

  function normalizeReceipts(value, fallback) {
    if (!Array.isArray(value)) return fallback;
    const items = value
      .map((item) => ({
        claim: String(item?.claim || "").trim(),
        source: String(item?.source || "").trim(),
      }))
      .filter((item) => item.claim && item.source);
    return items.length ? items : fallback;
  }

  function normalizeStringArray(value, fallback) {
    if (!Array.isArray(value)) return fallback;
    const items = value.map((item) => String(item || "").trim()).filter(Boolean);
    return items.length ? items : fallback;
  }

  function parseJsonObject(content) {
    const clean = String(content || "").trim();
    try {
      return JSON.parse(clean);
    } catch (error) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("The LLM did not return JSON.");
      return JSON.parse(match[0]);
    }
  }

  function buildHeaders(apiKey) {
    const headers = {
      "Content-Type": "application/json",
    };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    return headers;
  }

  function buildChatCompletionsUrl(endpoint) {
    const base = normalizeEndpoint(endpoint);
    if (base.endsWith("/chat/completions")) return base;
    if (base.endsWith("/v1")) return `${base}/chat/completions`;
    return `${base}/v1/chat/completions`;
  }

  function buildModelsUrl(endpoint) {
    const base = normalizeEndpoint(endpoint);
    if (base.endsWith("/chat/completions")) return base.replace(/\/chat\/completions$/, "/models");
    if (base.endsWith("/v1")) return `${base}/models`;
    return `${base}/v1/models`;
  }

  function normalizeEndpoint(endpoint) {
    const clean = String(endpoint || "").trim().replace(/\/+$/, "");
    if (!clean) throw new Error("Add an OpenAI-compatible base URL first.");
    return clean;
  }

  window.LaunchKitAIClient = {
    generateWithLLM,
    testConnection,
  };
})();
