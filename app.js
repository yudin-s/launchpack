(function () {
  const form = document.querySelector("#launch-form");
  const productName = document.querySelector("#product-name");
  const audience = document.querySelector("#audience");
  const tone = document.querySelector("#tone");
  const generationMode = document.querySelector("#generation-mode");
  const useAiEngine = document.querySelector("#use-ai-engine");
  const llmSettings = document.querySelector("[data-llm-settings]");
  const llmEndpoint = document.querySelector("#llm-endpoint");
  const llmModel = document.querySelector("#llm-model");
  const llmApiKey = document.querySelector("#llm-api-key");
  const saveLlmSettings = document.querySelector("#save-llm-settings");
  const llmStatus = document.querySelector("[data-llm-status]");
  const testLlmButton = document.querySelector("[data-test-llm]");
  const worklog = document.querySelector("#worklog");
  const kitTitle = document.querySelector("#kit-title");
  const kitRoot = document.querySelector("#kit");
  const emptyState = document.querySelector("#empty-state");
  const tabContent = document.querySelector("#tab-content");
  const exportButton = document.querySelector("[data-export]");
  const fillSampleButtons = document.querySelectorAll("[data-fill-sample]");
  const clearButton = document.querySelector("[data-clear]");

  let activeTab = "productHunt";
  let currentKit = null;
  const submitButton = form.querySelector('button[type="submit"]');

  function generator() {
    if (!window.LaunchKitGenerator) {
      throw new Error("LaunchKitGenerator is not loaded.");
    }
    return window.LaunchKitGenerator;
  }

  function fillSample() {
    const sample = typeof generator().sampleInput === "function"
      ? generator().sampleInput()
      : generator().sampleInput;
    productName.value = "Launchpack";
    audience.value = "indie makers, devtool founders, and solo builders";
    tone.value = "crisp";
    worklog.value = sample;
    generate().catch(showGenerationError);
    document.querySelector("#builder").scrollIntoView({ behavior: "smooth" });
  }

  function clearForm() {
    form.reset();
    syncAiToggle();
    currentKit = null;
    activeTab = "productHunt";
    kitRoot.hidden = true;
    emptyState.hidden = false;
    exportButton.disabled = true;
    kitTitle.textContent = "Your launch kit will appear here";
    tabContent.innerHTML = "";
    setStatus("");
  }

  async function generate() {
    const input = worklog.value.trim();
    if (!input) {
      worklog.focus();
      return;
    }

    setBusy(true);
    setStatus("Generating launch kit...");

    const localKit = generator().generateLocalKit(input, {
      productName: productName.value.trim(),
      audience: audience.value.trim(),
      tone: tone.value,
    });

    currentKit = localKit;

    if (generationMode.value === "llm") {
      try {
        saveSettings();
        setStatus("Asking your configured LLM...");
        currentKit = await window.LaunchKitAIClient.generateWithLLM({
          input,
          localKit,
          settings: getLlmSettings(),
        });
        setStatus("LLM kit generated. Review receipts before launch.");
      } catch (error) {
        currentKit = localKit;
        setStatus(`LLM unavailable, local fallback generated. ${error.message}`);
      }
    } else {
      saveSettings();
      setStatus("Local deterministic kit generated.");
    }

    kitTitle.textContent = `${currentKit.strategy.productName} launch kit`;
    emptyState.hidden = true;
    kitRoot.hidden = false;
    exportButton.disabled = false;
    setActiveTab(activeTab);
    setBusy(false);
  }

  function setActiveTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    renderTab();
  }

  function row(label, value) {
    return `
      <article class="copy-row">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <p>${escapeHtml(value)}</p>
        </div>
        <button class="mini-copy" type="button" data-copy="${encodeURIComponent(value)}">Copy</button>
      </article>
    `;
  }

  function preRow(label, value) {
    return `
      <article class="copy-row">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <pre>${escapeHtml(value)}</pre>
        </div>
        <button class="mini-copy" type="button" data-copy="${encodeURIComponent(value)}">Copy</button>
      </article>
    `;
  }

  function renderTab() {
    if (!currentKit) return;

    const kit = currentKit;
    const renderers = {
      productHunt: () => `
        <div class="kit-card">
          ${row("Tagline", kit.productHunt.tagline)}
          ${row("Short description", kit.productHunt.shortDescription)}
          ${preRow("Maker comment", kit.productHunt.makerComment)}
          ${preRow("Demo script", kit.demoScript)}
        </div>
      `,
      social: () => `
        <div class="kit-card">
          ${preRow("X / Twitter post", kit.social.xPost)}
          ${preRow("LinkedIn post", kit.social.linkedInPost)}
          ${preRow("Launch email", kit.social.email)}
        </div>
      `,
      faq: () => `
        <ul class="faq-list">
          ${kit.faq.map((item) => `
            <li>
              <span>${escapeHtml(item.question)}</span>
              ${escapeHtml(item.answer)}
            </li>
          `).join("")}
        </ul>
      `,
      checklist: () => `
        <ul class="check-list">
          ${kit.checklist.map((item, index) => `
            <li>
              <span>Step ${index + 1}</span>
              ${escapeHtml(item)}
            </li>
          `).join("")}
        </ul>
      `,
      receipts: () => `
        <ul class="receipt-list">
          ${kit.receipts.map((item) => `
            <li>
              <span>${escapeHtml(item.claim)}</span>
              ${escapeHtml(item.source)}
            </li>
          `).join("")}
        </ul>
      `,
      aiPrompt: () => `
        <div class="kit-card">
          ${preRow("LLM polish prompt", kit.aiPrompt)}
        </div>
      `,
    };

    tabContent.innerHTML = renderers[activeTab]();
  }

  function exportMarkdown() {
    if (!currentKit) return;
    const markdown = generator().generateMarkdown(currentKit);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(currentKit.strategy.productName)}-launch-kit.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function testLlmConnection() {
    setStatus("Testing LLM endpoint...");
    testLlmButton.disabled = true;
    try {
      saveSettings();
      const models = await window.LaunchKitAIClient.testConnection(getLlmSettings());
      const suffix = models.length ? ` Models: ${models.join(", ")}` : "";
      setStatus(`Connection OK.${suffix}`);
    } catch (error) {
      setStatus(`Connection failed. ${error.message}`);
    } finally {
      testLlmButton.disabled = false;
    }
  }

  function getLlmSettings() {
    return {
      endpoint: llmEndpoint.value.trim(),
      model: llmModel.value.trim(),
      apiKey: llmApiKey.value.trim(),
    };
  }

  function saveSettings() {
    if (!saveLlmSettings.checked) {
      localStorage.removeItem("launchpack.llmSettings");
      return;
    }

    localStorage.setItem("launchpack.llmSettings", JSON.stringify({
      generationMode: generationMode.value,
      useAiEngine: useAiEngine.checked,
      endpoint: llmEndpoint.value.trim(),
      model: llmModel.value.trim(),
      save: true,
    }));
  }

  function loadSettings() {
    const stored = localStorage.getItem("launchpack.llmSettings");
    if (!stored) {
      llmEndpoint.value = "http://localhost:1234/v1";
      llmModel.value = "local-model";
      syncAiToggle();
      return;
    }

    try {
      const settings = JSON.parse(stored);
      generationMode.value = settings.generationMode || "local";
      useAiEngine.checked = settings.useAiEngine || generationMode.value === "llm";
      llmEndpoint.value = settings.endpoint || "http://localhost:1234/v1";
      llmModel.value = settings.model || "local-model";
      saveLlmSettings.checked = settings.save !== false;
    } catch (error) {
      llmEndpoint.value = "http://localhost:1234/v1";
      llmModel.value = "local-model";
    }
    syncAiToggle();
  }

  function syncAiToggle() {
    generationMode.value = useAiEngine.checked ? "llm" : "local";
    llmSettings.hidden = !useAiEngine.checked;
    testLlmButton.disabled = !useAiEngine.checked;
    setStatus(useAiEngine.checked
      ? "AI Engine enabled. Add an endpoint, then test the connection."
      : "AI Engine off. Launchpack will use local deterministic generation.");
    saveSettings();
  }

  function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Generating..." : "Generate launch kit";
  }

  function setStatus(message) {
    llmStatus.textContent = message;
  }

  function showGenerationError(error) {
    setBusy(false);
    setStatus(error.message);
  }

  async function copyValue(value, button) {
    await navigator.clipboard.writeText(value);
    const original = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "launch-kit";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate().catch(showGenerationError);
  });

  document.querySelector(".tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (button) setActiveTab(button.dataset.tab);
  });

  tabContent.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    copyValue(decodeURIComponent(button.dataset.copy), button).catch(() => {
      button.textContent = "Copy failed";
    });
  });

  exportButton.addEventListener("click", exportMarkdown);
  useAiEngine.addEventListener("change", syncAiToggle);
  testLlmButton.addEventListener("click", testLlmConnection);
  clearButton.addEventListener("click", clearForm);
  fillSampleButtons.forEach((button) => button.addEventListener("click", fillSample));
  loadSettings();
})();
