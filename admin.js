const BASE_PATH = document.body.dataset.basePath || "";
const API_PATH = document.body.dataset.apiPath || "admin/api.php";
let csrfToken = document.body.dataset.csrfToken || "";

const LANGUAGES = {
  pt: "Português",
  en: "English",
  es: "Español"
};

const SECTIONS = [
  {
    id: "home",
    label: "Início",
    hint: "Hero, navegação e CTAs",
    title: "Página inicial",
    description: "Edite a primeira impressão do site: menu, chamada principal, botões e imagens de entrada.",
    fields: [
      { key: "nav.home", label: "Menu: Início" },
      { key: "nav.lines", label: "Menu: Linhagens" },
      { key: "nav.about", label: "Menu: A Novogen" },
      { key: "nav.science", label: "Menu: Ciência" },
      { key: "nav.versatility", label: "Menu: Versatilidade" },
      { key: "nav.partnership", label: "Menu: Parceria" },
      { key: "nav.faq", label: "Menu: FAQ" },
      { key: "nav.contact", label: "Menu: Contato" },
      { key: "nav.radar", label: "Menu: Radar de mercado" },
      { key: "nav.novocenter", label: "Botão: Novocenter" },
      { key: "hero.eyebrow", label: "Hero: linha superior" },
      { key: "hero.title", label: "Hero: título", large: true },
      { key: "hero.copy", label: "Hero: texto", large: true },
      { key: "hero.primary", label: "Hero: botão principal" },
      { key: "hero.secondary", label: "Hero: botão secundário" }
    ],
    links: [
      { key: "link.novocenter", label: "Link do Novocenter", placeholder: "novocenter.html" },
      { key: "link.hero.primary", label: "Link do botão principal", placeholder: "#versatilidade" },
      { key: "link.hero.secondary", label: "Link do botão secundário", placeholder: "#contato" },
      { key: "link.social.instagram", label: "Link do Instagram", placeholder: "https://www.instagram.com/..." },
      { key: "link.social.linkedin", label: "Link do LinkedIn", placeholder: "https://www.linkedin.com/company/..." }
    ],
    assets: [
      { key: "image.logo", label: "Logo do site", placeholder: "assets/novogen-logo.png" },
      { key: "image.hero", label: "Imagem do hero", placeholder: "assets/hero-chicks.png" }
    ]
  },
  {
    id: "pillars",
    label: "Pilares",
    hint: "Faixa institucional",
    title: "Pilares de marca",
    description: "Controle os quatro pontos de apoio logo após o hero.",
    fields: [
      { key: "pillars.science", label: "Pilar 01" },
      { key: "pillars.versatility", label: "Pilar 02" },
      { key: "pillars.partnership", label: "Pilar 03" },
      { key: "pillars.resilience", label: "Pilar 04" }
    ]
  },
  {
    id: "about",
    label: "A Novogen",
    hint: "Home e página institucional",
    title: "A Novogen",
    description: "Edite a chamada institucional usada na home e na página sobre a empresa.",
    fields: [
      { key: "about.eyebrow", label: "Linha superior" },
      { key: "about.title", label: "Título", large: true },
      { key: "about.copy", label: "Texto", large: true },
      { key: "about.cta", label: "Botão" }
    ]
  },
  {
    id: "novocenter",
    label: "Novocenter",
    hint: "Página de conteúdo técnico",
    title: "Novocenter",
    description: "Edite a chamada principal da página Novocenter.",
    fields: [
      { key: "novocenter.eyebrow", label: "Linha superior" },
      { key: "novocenter.title", label: "Título", large: true },
      { key: "novocenter.copy", label: "Texto", large: true },
      { key: "novocenter.create", label: "Botão criar conta" },
      { key: "novocenter.access", label: "Botão acessar" }
    ]
  },
  {
    id: "radar",
    label: "Radar",
    hint: "Mercado e CEPEA",
    title: "Radar de Mercado",
    description: "Edite a chamada principal da página de indicadores.",
    fields: [
      { key: "radar.eyebrow", label: "Linha superior" },
      { key: "radar.title", label: "Título", large: true },
      { key: "radar.copy", label: "Texto", large: true }
    ]
  },
  {
    id: "seo",
    label: "SEO e GEO",
    hint: "Busca, redes e localização",
    title: "SEO, GEO e compartilhamento",
    description: "Edite metadados usados por buscadores, redes sociais e sistemas que interpretam localização e dados estruturados.",
    fields: [],
    seo: [
      { key: "title", label: "Título SEO", placeholder: "Novogen Brasil | Genética de postura e acompanhamento técnico" },
      { key: "description", label: "Descrição SEO", large: true, placeholder: "Resumo institucional do site para buscadores." },
      { key: "canonical", label: "URL canônica", placeholder: "https://www.novogen.com.br/" },
      { key: "ogImage", label: "Imagem de compartilhamento", placeholder: "https://www.novogen.com.br/assets/hero-chicks.png" },
      { key: "geoRegion", label: "Região GEO", placeholder: "BR" },
      { key: "geoPlace", label: "Localidade GEO", placeholder: "Brasil" },
      { key: "latitude", label: "Latitude", placeholder: "-15.7801" },
      { key: "longitude", label: "Longitude", placeholder: "-47.9292" }
    ]
  },
  {
    id: "science",
    label: "Ciência",
    hint: "Autoridade técnica",
    title: "Ciência aplicada",
    description: "Textos da seção que posiciona a base científica e o jeito técnico da marca.",
    fields: [
      { key: "science.eyebrow", label: "Linha superior" },
      { key: "science.title", label: "Título", large: true },
      { key: "science.copy", label: "Texto", large: true },
      { key: "science.card1Title", label: "Card 01: título" },
      { key: "science.card1Text", label: "Card 01: texto", large: true },
      { key: "science.card2Title", label: "Card 02: título" },
      { key: "science.card2Text", label: "Card 02: texto", large: true }
    ]
  },
  {
    id: "versatility",
    label: "Versatilidade",
    hint: "Sistemas produtivos",
    title: "Versatilidade real",
    description: "Controle a narrativa sobre gaiola, sistemas livres e transição.",
    fields: [
      { key: "versatility.eyebrow", label: "Linha superior" },
      { key: "versatility.title", label: "Título", large: true },
      { key: "versatility.copy", label: "Texto", large: true },
      { key: "versatility.card1Title", label: "Card 01: título" },
      { key: "versatility.card1Text", label: "Card 01: texto", large: true },
      { key: "versatility.card2Title", label: "Card 02: título" },
      { key: "versatility.card2Text", label: "Card 02: texto", large: true },
      { key: "versatility.card3Title", label: "Card 03: título" },
      { key: "versatility.card3Text", label: "Card 03: texto", large: true }
    ]
  },
  {
    id: "partnership",
    label: "Parceria",
    hint: "Suporte e proximidade",
    title: "Parceria de verdade",
    description: "Edite a seção que explica acompanhamento técnico e relação com o produtor.",
    fields: [
      { key: "partnership.eyebrow", label: "Linha superior" },
      { key: "partnership.title", label: "Título", large: true },
      { key: "partnership.copy", label: "Texto", large: true },
      { key: "partnership.item1", label: "Item 01", large: true },
      { key: "partnership.item2", label: "Item 02", large: true },
      { key: "partnership.item3", label: "Item 03", large: true }
    ]
  },
  {
    id: "resilience",
    label: "Resiliência",
    hint: "Clima, manejo e futuro",
    title: "Resiliência tropical",
    description: "Ajuste os blocos ligados a clima, manejo e cenários futuros.",
    fields: [
      { key: "resilience.eyebrow", label: "Linha superior" },
      { key: "resilience.title", label: "Título", large: true },
      { key: "resilience.step1Title", label: "Etapa 01: título" },
      { key: "resilience.step1Text", label: "Etapa 01: texto", large: true },
      { key: "resilience.step2Title", label: "Etapa 02: título" },
      { key: "resilience.step2Text", label: "Etapa 02: texto", large: true },
      { key: "resilience.step3Title", label: "Etapa 03: título" },
      { key: "resilience.step3Text", label: "Etapa 03: texto", large: true }
    ]
  },
  {
    id: "lines",
    label: "Linhagens",
    hint: "Portfólio genético",
    title: "Linhagens",
    description: "Edite o resumo de portfólio e as descrições das linhas Brown, White e Tinted.",
    fields: [
      { key: "lines.eyebrow", label: "Linha superior" },
      { key: "lines.title", label: "Título", large: true },
      { key: "lines.copy", label: "Texto", large: true },
      { key: "lines.item1", label: "Brown: descrição" },
      { key: "lines.item2", label: "White: descrição" },
      { key: "lines.item3", label: "Tinted: descrição" }
    ]
  },
  {
    id: "indicators",
    label: "Indicadores",
    hint: "Mercado e CEPEA",
    title: "Indicadores de mercado",
    description: "Controle os textos do módulo de indicadores, cards e apresentação do widget.",
    fields: [
      { key: "indicators.eyebrow", label: "Linha superior" },
      { key: "indicators.title", label: "Título", large: true },
      { key: "indicators.copy", label: "Texto", large: true },
      { key: "indicators.card1Label", label: "Card 01: etiqueta" },
      { key: "indicators.card1Title", label: "Card 01: título" },
      { key: "indicators.card1Text", label: "Card 01: texto" },
      { key: "indicators.card2Label", label: "Card 02: etiqueta" },
      { key: "indicators.card2Title", label: "Card 02: título" },
      { key: "indicators.card2Text", label: "Card 02: texto" },
      { key: "indicators.card3Label", label: "Card 03: etiqueta" },
      { key: "indicators.card3Title", label: "Card 03: título" },
      { key: "indicators.card3Text", label: "Card 03: texto" },
      { key: "indicators.card4Label", label: "Card 04: etiqueta" },
      { key: "indicators.card4Title", label: "Card 04: título" },
      { key: "indicators.card4Text", label: "Card 04: texto" },
      { key: "indicators.widgetLabel", label: "Widget: etiqueta" },
      { key: "indicators.widgetTitle", label: "Widget: título" },
      { key: "indicators.widgetText", label: "Widget: texto", large: true },
      { key: "indicators.note", label: "Nota da fonte", large: true }
    ]
  },
  {
    id: "support",
    label: "Novogen Partners",
    hint: "Conteúdo técnico",
    title: "Novogen Partners",
    description: "Edite os blocos de conteúdo técnico e suporte.",
    fields: [
      { key: "support.eyebrow", label: "Linha superior" },
      { key: "support.title", label: "Título", large: true },
      { key: "support.item1Title", label: "Item 01: título" },
      { key: "support.item1Text", label: "Item 01: texto" },
      { key: "support.item2Title", label: "Item 02: título" },
      { key: "support.item2Text", label: "Item 02: texto" },
      { key: "support.item3Title", label: "Item 03: título" },
      { key: "support.item3Text", label: "Item 03: texto" }
    ]
  },
  {
    id: "faq",
    label: "FAQ",
    hint: "Perguntas técnicas",
    title: "FAQ técnico",
    description: "Gerencie perguntas e respostas usadas para esclarecer a escolha genética.",
    fields: [
      { key: "faq.eyebrow", label: "Linha superior" },
      { key: "faq.title", label: "Título", large: true },
      { key: "faq.card1Title", label: "Pergunta 01" },
      { key: "faq.card1Text", label: "Resposta 01", large: true },
      { key: "faq.card2Title", label: "Pergunta 02" },
      { key: "faq.card2Text", label: "Resposta 02", large: true },
      { key: "faq.card3Title", label: "Pergunta 03" },
      { key: "faq.card3Text", label: "Resposta 03", large: true }
    ]
  },
  {
    id: "contact",
    label: "Contato",
    hint: "Formulário e rodapé",
    title: "Contato e rodapé",
    description: "Edite chamada final, campos do formulário, rodapé e aviso de cookies.",
    fields: [
      { key: "contact.eyebrow", label: "Linha superior" },
      { key: "contact.title", label: "Título", large: true },
      { key: "contact.copy", label: "Texto", large: true },
      { key: "contact.name", label: "Campo: nome" },
      { key: "contact.email", label: "Campo: e-mail" },
      { key: "contact.message", label: "Campo: mensagem" },
      { key: "contact.submit", label: "Botão de envio" },
      { key: "footer.copy", label: "Texto do rodapé", large: true },
      { key: "cookies.title", label: "Cookies: título" },
      { key: "cookies.copy", label: "Cookies: texto", large: true },
      { key: "cookies.accept", label: "Cookies: botão" }
    ]
  }
];

let activeSection = SECTIONS[0].id;
let activeLang = "pt";
let defaults = {};

const pageList = document.querySelector("[data-page-list]");
const editorForm = document.querySelector("[data-editor-form]");
const titleNode = document.querySelector("[data-section-title]");
const eyebrowNode = document.querySelector("[data-section-eyebrow]");
const descriptionNode = document.querySelector("[data-section-description]");
const statusNode = document.querySelector("[data-status]");
let cmsState = {
  text: {},
  assets: {},
  links: {},
  seo: {}
};

const normalizeState = (state) => ({
  text: state.text || {},
  assets: state.assets || {},
  links: state.links || {},
  seo: state.seo || {}
});

const readState = () => normalizeState(cmsState);

const handleAuthError = (response) => {
  if (response.status === 401) {
    window.location.href = "/admin/login";
    return true;
  }
  return false;
};

const writeState = async (state) => {
  cmsState = normalizeState(state);
  const response = await fetch(API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      csrfToken,
      content: cmsState
    })
  });

  if (handleAuthError(response)) return;

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "save_failed");
  }

  cmsState = normalizeState(result.content || cmsState);
};

const getDefault = (key) => defaults?.[activeLang]?.[key] || "";

const setStatus = (message) => {
  statusNode.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusNode.textContent = "Alterações ficam salvas no servidor e aparecem no site ao abrir ou recarregar.";
  }, 4200);
};

const loadDefaults = async () => {
  try {
    const response = await fetch(`${BASE_PATH}script.js`, { cache: "no-store" });
    const source = await response.text();
    const match = source.match(/const translations = ([\s\S]*?);\s*const header/);
    if (!match) return;
    defaults = Function(`"use strict"; return (${match[1]});`)();
  } catch (error) {
    defaults = {};
  }
};

const loadCmsState = async () => {
  const response = await fetch(API_PATH, { cache: "no-store" });
  if (handleAuthError(response)) return;
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "load_failed");
  }

  cmsState = normalizeState(result.content || {});
  csrfToken = result.csrfToken || csrfToken;
};

const renderPageList = () => {
  pageList.innerHTML = SECTIONS.map((section) => `
    <button type="button" class="${section.id === activeSection ? "active" : ""}" data-section="${section.id}">
      <strong>${section.label}</strong>
      <span>${section.hint}</span>
    </button>
  `).join("");

  pageList.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSection = button.dataset.section;
      render();
    });
  });
};

const createTextField = (field, state) => {
  const value = state.text?.[activeLang]?.[field.key] || "";
  const fallback = getDefault(field.key);
  const control = field.large
    ? `<textarea rows="4" id="text-${field.key}" data-text-key="${field.key}" placeholder="${escapeAttribute(fallback || "Usa o texto padrão do site")}">${escapeHtml(value)}</textarea>`
    : `<input type="text" id="text-${field.key}" data-text-key="${field.key}" value="${escapeAttribute(value)}" placeholder="${escapeAttribute(fallback || "Usa o texto padrão do site")}">`;

  return `
    <div class="editor-field">
      <label for="text-${field.key}">
        <span>${field.label}</span>
        <small>${field.key}</small>
      </label>
      ${control}
      ${fallback ? `<div class="default-preview">Padrão: ${escapeHtml(fallback)}</div>` : ""}
    </div>
  `;
};

const createAssetField = (field, state) => `
  <div class="editor-field">
    <label for="asset-${field.key}">
      <span>${field.label}</span>
      <small>${field.key}</small>
    </label>
    <input type="text" id="asset-${field.key}" data-asset-key="${field.key}" value="${escapeAttribute(state.assets?.[field.key] || "")}" placeholder="${escapeAttribute(field.placeholder)}">
    <div class="default-preview">Use caminho local, como ${escapeHtml(field.placeholder)}, ou uma URL de imagem.</div>
  </div>
`;

const createLinkField = (field, state) => `
  <div class="editor-field">
    <label for="link-${field.key}">
      <span>${field.label}</span>
      <small>${field.key}</small>
    </label>
    <input type="text" id="link-${field.key}" data-link-key="${field.key}" value="${escapeAttribute(state.links?.[field.key] || "")}" placeholder="${escapeAttribute(field.placeholder)}">
  </div>
`;

const createSeoField = (field, state) => {
  const value = state.seo?.[field.key] || "";
  const control = field.large
    ? `<textarea rows="4" id="seo-${field.key}" data-seo-key="${field.key}" placeholder="${escapeAttribute(field.placeholder)}">${escapeHtml(value)}</textarea>`
    : `<input type="text" id="seo-${field.key}" data-seo-key="${field.key}" value="${escapeAttribute(value)}" placeholder="${escapeAttribute(field.placeholder)}">`;

  return `
    <div class="editor-field">
      <label for="seo-${field.key}">
        <span>${field.label}</span>
        <small>seo.${field.key}</small>
      </label>
      ${control}
    </div>
  `;
};

const renderForm = () => {
  const section = SECTIONS.find((item) => item.id === activeSection);
  const state = normalizeState(readState());
  eyebrowNode.textContent = `Editando em ${LANGUAGES[activeLang]}`;
  titleNode.textContent = section.title;
  descriptionNode.textContent = section.description;

  const textFields = section.fields.map((field) => createTextField(field, state)).join("");
  const assetFields = (section.assets || []).map((field) => createAssetField(field, state)).join("");
  const linkFields = (section.links || []).map((field) => createLinkField(field, state)).join("");
  const seoFields = (section.seo || []).map((field) => createSeoField(field, state)).join("");

  editorForm.innerHTML = `
    ${textFields ? `<div class="field-group">
      <h2>Textos</h2>
      ${textFields}
    </div>` : ""}
    ${linkFields ? `<div class="field-group"><h2>Botões e links</h2>${linkFields}</div>` : ""}
    ${assetFields ? `<div class="field-group"><h2>Imagens</h2>${assetFields}</div>` : ""}
    ${seoFields ? `<div class="field-group"><h2>Metadados</h2>${seoFields}</div>` : ""}
  `;

};

const saveCurrentSection = async () => {
  const state = normalizeState(readState());
  state.text[activeLang] = state.text[activeLang] || {};

  editorForm.querySelectorAll("[data-text-key]").forEach((field) => {
    const value = field.value.trim();
    if (value) state.text[activeLang][field.dataset.textKey] = value;
    else delete state.text[activeLang][field.dataset.textKey];
  });

  editorForm.querySelectorAll("[data-asset-key]").forEach((field) => {
    const value = field.value.trim();
    if (value) state.assets[field.dataset.assetKey] = value;
    else delete state.assets[field.dataset.assetKey];
  });

  editorForm.querySelectorAll("[data-link-key]").forEach((field) => {
    const value = field.value.trim();
    if (value) state.links[field.dataset.linkKey] = value;
    else delete state.links[field.dataset.linkKey];
  });

  editorForm.querySelectorAll("[data-seo-key]").forEach((field) => {
    const value = field.value.trim();
    if (value) state.seo[field.dataset.seoKey] = value;
    else delete state.seo[field.dataset.seoKey];
  });

  try {
    await writeState(state);
    setStatus("Alterações salvas no servidor. Abra ou recarregue o site para visualizar.");
  } catch (error) {
    setStatus("Não foi possível salvar. Verifique se sua sessão ainda está ativa.");
  }
};

const clearCurrentSection = async () => {
  const section = SECTIONS.find((item) => item.id === activeSection);
  const state = normalizeState(readState());
  const keys = section.fields.map((field) => field.key);

  Object.keys(LANGUAGES).forEach((lang) => {
    state.text[lang] = state.text[lang] || {};
    keys.forEach((key) => delete state.text[lang][key]);
  });

  (section.assets || []).forEach((field) => delete state.assets[field.key]);
  (section.links || []).forEach((field) => delete state.links[field.key]);
  (section.seo || []).forEach((field) => delete state.seo[field.key]);
  try {
    await writeState(state);
    renderForm();
    setStatus("Seção limpa. O site voltará a usar o conteúdo padrão para esses campos.");
  } catch (error) {
    setStatus("Não foi possível limpar a seção. Verifique se sua sessão ainda está ativa.");
  }
};

const exportJson = () => {
  const blob = new Blob([JSON.stringify(normalizeState(readState()), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "novogen-conteudo.json";
  link.click();
  URL.revokeObjectURL(url);
};

const importJson = (file) => {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    try {
      const data = JSON.parse(reader.result);
      await writeState(normalizeState(data));
      renderForm();
      setStatus("Conteúdo importado com sucesso.");
    } catch (error) {
      setStatus("Não foi possível importar o JSON. Verifique o arquivo.");
    }
  });
  reader.readAsText(file);
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const escapeAttribute = (value) => escapeHtml(value).replace(/'/g, "&#039;");

const render = () => {
  renderPageList();
  renderForm();
};

document.querySelectorAll("[data-editor-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    activeLang = button.dataset.editorLang;
    document.querySelectorAll("[data-editor-lang]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderForm();
  });
});

document.querySelector("[data-save]").addEventListener("click", saveCurrentSection);
document.querySelector("[data-clear-section]").addEventListener("click", clearCurrentSection);
document.querySelector("[data-export]").addEventListener("click", exportJson);
document.querySelector("[data-import]").addEventListener("change", (event) => importJson(event.target.files[0]));
document.querySelector("[data-clear-all]").addEventListener("click", async () => {
  if (window.confirm("Limpar todas as alterações salvas no painel?")) {
    try {
      await writeState({ text: {}, assets: {}, links: {}, seo: {} });
      renderForm();
      setStatus("Todas as alterações foram removidas.");
    } catch (error) {
      setStatus("Não foi possível limpar tudo. Verifique se sua sessão ainda está ativa.");
    }
  }
});

Promise.all([loadCmsState(), loadDefaults()])
  .then(render)
  .catch(() => {
    setStatus("Não foi possível carregar o conteúdo do servidor.");
  });
