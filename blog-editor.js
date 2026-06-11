const BLOG_EDITOR_STORAGE_KEY = `blog-editor:${window.location.pathname}`;
const BLOG_REACTIONS_STORAGE_KEY = `blog-reactions:${window.location.pathname}`;
const BLOG_RESPONSES_STORAGE_KEY = `blog-responses:${window.location.pathname}`;
const BLOG_OWNER_ACCESS_KEY = `blog-owner-access:${window.location.pathname}`;
const BLOG_EDIT_MODE_KEY = `blog-edit-mode:${window.location.pathname}`;

const editableSelectors = [
  "#article-kicker",
  "#article-title",
  "#article-dek",
  "#article-prose",
];

function ownerQueryEnabled() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("owner") === "1";
  } catch (error) {
    console.error("Could not parse owner query.", error);
    return false;
  }
}

function hasOwnerAccess() {
  return window.localStorage.getItem(BLOG_OWNER_ACCESS_KEY) === "true" || ownerQueryEnabled();
}

function getEditToggleButton() {
  return document.getElementById("article-edit-toggle");
}

function getEnableEditingButton() {
  return document.getElementById("article-enable-editing");
}

function getEditorPanel() {
  return document.getElementById("article-editor-panel");
}

function ensureEditorPanel() {
  let panel = getEditorPanel();
  if (panel) {
    return panel;
  }

  const articleMain = document.querySelector(".article-main");
  if (!articleMain) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="article-editor" id="article-editor-panel" aria-label="Blog editor toolbar" hidden>
      <div class="article-editor-bar" role="toolbar" aria-label="Formatting tools">
        <div class="editor-group" aria-label="Text formatting">
          <p class="editor-group-label">Text</p>
          <div class="editor-group-controls">
            <button type="button" class="editor-button" data-command="bold" aria-label="Bold"><strong>B</strong></button>
            <button type="button" class="editor-button" data-command="italic" aria-label="Italic"><em>I</em></button>
            <button type="button" class="editor-button" data-command="underline" aria-label="Underline"><span class="editor-underline">U</span></button>
            <button type="button" class="editor-button" data-command="formatBlock" data-value="p" aria-label="Paragraph">P</button>
            <button type="button" class="editor-button" data-command="formatBlock" data-value="h3" aria-label="Subheading">H3</button>
            <button type="button" class="editor-button" data-command="blockquote" aria-label="Block quote">“ ”</button>
            <button type="button" class="editor-button" data-command="removeFormat" aria-label="Clear formatting">Clear</button>
          </div>
        </div>

        <div class="editor-group" aria-label="Lists and structure">
          <p class="editor-group-label">Structure</p>
          <div class="editor-group-controls">
            <button type="button" class="editor-button" data-command="insertUnorderedList" aria-label="Bulleted list">• List</button>
            <button type="button" class="editor-button" data-command="insertOrderedList" aria-label="Numbered list">1. List</button>
            <button type="button" class="editor-button" data-command="indent" aria-label="Indent">→</button>
            <button type="button" class="editor-button" data-command="outdent" aria-label="Outdent">←</button>
            <button type="button" class="editor-button" data-command="createLink" aria-label="Insert link">Link</button>
          </div>
        </div>

        <div class="editor-group" aria-label="Editorial blocks">
          <p class="editor-group-label">Blocks</p>
          <div class="editor-group-controls">
            <button type="button" class="editor-button" data-command="insertPreset" data-value="sectionLabel" aria-label="Section label">Label</button>
            <button type="button" class="editor-button" data-command="insertPreset" data-value="pullquote" aria-label="Pull quote">Pullquote</button>
            <button type="button" class="editor-button" data-command="insertPreset" data-value="lessonQuote" aria-label="Lesson quote">Lesson quote</button>
            <button type="button" class="editor-button" data-command="insertPreset" data-value="callout" aria-label="Callout box">Callout</button>
            <button type="button" class="editor-button" data-command="insertPreset" data-value="checklist" aria-label="Checklist box">Checklist</button>
            <button type="button" class="editor-button" data-command="insertPreset" data-value="takeaway" aria-label="Takeaway box">Takeaway</button>
            <button type="button" class="editor-button" data-command="insertPreset" data-value="figure" aria-label="Figure block">Figure</button>
          </div>
        </div>

        <div class="editor-group" aria-label="Colors and emphasis">
          <p class="editor-group-label">Color</p>
          <div class="editor-group-controls">
            <label class="editor-color-chip" aria-label="Text color">
              <span>Text</span>
              <input type="color" id="editor-text-color" value="#5f7692" />
            </label>
            <label class="editor-color-chip" aria-label="Highlight color">
              <span>Mark</span>
              <input type="color" id="editor-highlight-color" value="#fff3a6" />
            </label>
          </div>
        </div>

        <div class="editor-group" aria-label="Attachments and embeds">
          <p class="editor-group-label">Attach</p>
          <div class="editor-group-controls">
            <button type="button" class="editor-button" data-command="uploadImage" aria-label="Upload image">Image</button>
            <button type="button" class="editor-button" data-command="uploadVideo" aria-label="Upload video">Video</button>
            <button type="button" class="editor-button" data-command="uploadFile" aria-label="Attach file">File</button>
            <button type="button" class="editor-button" data-command="embedYouTube" aria-label="Embed YouTube video">YouTube</button>
          </div>
        </div>
      </div>
      <div class="article-editor-actions">
        <button type="button" class="editor-action" id="save-article-edits">Save edits</button>
        <button type="button" class="editor-action editor-action-muted" id="reset-article-edits">Reset</button>
        <p class="editor-note" id="article-editor-status">Edit mode is on. Saved edits stay only in this browser.</p>
      </div>
    </div>

    <input type="file" id="editor-image-input" accept="image/*" hidden />
    <input type="file" id="editor-video-input" accept="video/*" hidden />
    <input type="file" id="editor-file-input" hidden />
  `;

  const firstChild = articleMain.firstElementChild;
  while (wrapper.firstChild) {
    articleMain.insertBefore(wrapper.firstChild, firstChild);
  }

  return getEditorPanel();
}

function getEditableNodes() {
  return editableSelectors
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);
}

function setEditableState(enabled) {
  getEditableNodes().forEach((node) => {
    node.setAttribute("contenteditable", enabled ? "true" : "false");
  });
}

function setEditMode(enabled) {
  const editorPanel = getEditorPanel();
  const toggleButton = getEditToggleButton();

  setEditableState(enabled);

  if (editorPanel) {
    editorPanel.hidden = !enabled;
  }

  if (toggleButton) {
    toggleButton.textContent = enabled ? "Done" : "Edit";
    toggleButton.setAttribute("aria-pressed", enabled ? "true" : "false");
  }

  window.localStorage.setItem(BLOG_EDIT_MODE_KEY, enabled ? "true" : "false");

  if (!enabled) {
    setEditorStatus("Read-only mode is on.");
  }
}

function captureArticleState() {
  const state = {};
  getEditableNodes().forEach((node) => {
    state[node.id] = node.innerHTML;
  });
  return state;
}

function applyArticleState(state) {
  getEditableNodes().forEach((node) => {
    if (state[node.id] !== undefined) {
      node.innerHTML = state[node.id];
    }
  });
}

function setEditorStatus(message) {
  const status = document.getElementById("article-editor-status");
  if (status) {
    status.textContent = message;
  }
}

function updateDocumentTitle() {
  const titleNode = document.getElementById("article-title");
  if (!titleNode) {
    return;
  }

  const pageTitle = titleNode.textContent.trim();
  if (pageTitle) {
    document.title = `${pageTitle} | Prachi Sharma`;
  }
}

function persistArticleState() {
  window.localStorage.setItem(BLOG_EDITOR_STORAGE_KEY, JSON.stringify(captureArticleState()));
  updateDocumentTitle();
  setEditorStatus("Edits saved in this browser.");
}

function restoreSavedState() {
  const saved = window.localStorage.getItem(BLOG_EDITOR_STORAGE_KEY);
  if (!saved) {
    return;
  }

  try {
    applyArticleState(JSON.parse(saved));
    updateDocumentTitle();
    setEditorStatus("Saved edits restored for this browser.");
  } catch (error) {
    console.error("Could not restore saved article edits.", error);
  }
}

function focusProse() {
  const prose = document.getElementById("article-prose");
  if (prose) {
    prose.focus();
  }
}

function insertHtmlAtSelection(html) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    focusProse();
  }
  document.execCommand("insertHTML", false, html);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (error) {
    console.error("Invalid YouTube URL", error);
  }

  return null;
}

function getPresetHtml(type) {
  const presets = {
    sectionLabel: `<p class="article-section-label">New section</p>`,
    pullquote: `<blockquote class="article-pullquote">Add a strong pull quote here.</blockquote>`,
    lessonQuote: `<blockquote class="article-lesson-quote"><span class="article-lesson-quote-mark">“</span><p>Add a lesson quote here.</p></blockquote>`,
    callout: `<div class="article-callout"><p class="article-callout-label">Callout</p><ul><li>Add the first point.</li><li>Add the second point.</li></ul></div>`,
    checklist: `<div class="article-checklist"><p class="article-callout-label">Checklist</p><ul><li>Add the first item.</li><li>Add the second item.</li></ul></div>`,
    takeaway: `<div class="article-takeaway-box"><strong>Takeaway:</strong> Add the key takeaway here.</div>`,
    figure: `<figure class="article-figure"><img src=\"\" alt=\"Describe the figure\" /><figcaption class="article-caption">Add the figure caption here.</figcaption></figure>`,
  };

  return presets[type] || "";
}

function execEditorCommand(command, value) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    focusProse();
  }

  if (command === "blockquote") {
    document.execCommand("formatBlock", false, "blockquote");
    return;
  }

  if (command === "createLink") {
    const url = window.prompt("Enter the URL");
    if (url) {
      document.execCommand("createLink", false, url);
    }
    return;
  }

  if (command === "uploadImage") {
    document.getElementById("editor-image-input")?.click();
    return;
  }

  if (command === "uploadVideo") {
    document.getElementById("editor-video-input")?.click();
    return;
  }

  if (command === "uploadFile") {
    document.getElementById("editor-file-input")?.click();
    return;
  }

  if (command === "embedYouTube") {
    const url = window.prompt("Paste the YouTube URL");
    if (!url) {
      return;
    }
    const embedUrl = normalizeYouTubeUrl(url);
    if (!embedUrl) {
      setEditorStatus("That YouTube URL could not be parsed.");
      return;
    }
    insertHtmlAtSelection(`<iframe src="${embedUrl}" title="YouTube video" loading="lazy" allowfullscreen></iframe>`);
    setEditorStatus("YouTube video embedded.");
    return;
  }

  if (command === "insertPreset") {
    const html = getPresetHtml(value);
    if (html) {
      insertHtmlAtSelection(html);
      setEditorStatus("Editorial block inserted.");
    }
    return;
  }

  if (command === "formatBlock") {
    document.execCommand("formatBlock", false, value);
    return;
  }

  document.execCommand(command, false, value || null);
}

function setupEditorToolbar() {
  document.querySelectorAll(".editor-button").forEach((button) => {
    button.addEventListener("click", () => {
      execEditorCommand(button.dataset.command, button.dataset.value);
    });
  });
}

function setupColorControls() {
  const textColor = document.getElementById("editor-text-color");
  const highlightColor = document.getElementById("editor-highlight-color");

  textColor?.addEventListener("input", (event) => {
    focusProse();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, event.target.value);
    setEditorStatus("Text color applied.");
  });

  highlightColor?.addEventListener("input", (event) => {
    focusProse();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("hiliteColor", false, event.target.value);
    setEditorStatus("Highlight color applied.");
  });
}

function setupUploadInputs() {
  const imageInput = document.getElementById("editor-image-input");
  const videoInput = document.getElementById("editor-video-input");
  const fileInput = document.getElementById("editor-file-input");

  imageInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    insertHtmlAtSelection(`<img src="${dataUrl}" alt="${file.name}" />`);
    event.target.value = "";
    setEditorStatus("Image inserted.");
  });

  videoInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    insertHtmlAtSelection(`<video controls preload="metadata"><source src="${dataUrl}" type="${file.type}" />Your browser does not support the video tag.</video>`);
    event.target.value = "";
    setEditorStatus("Video inserted.");
  });

  fileInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    insertHtmlAtSelection(`<a class="editor-file-link" href="${dataUrl}" download="${file.name}">${file.name}</a>`);
    event.target.value = "";
    setEditorStatus("File link inserted.");
  });
}

function setupEditorPersistence() {
  const originalState = captureArticleState();
  restoreSavedState();

  const saveButton = document.getElementById("save-article-edits");
  const resetButton = document.getElementById("reset-article-edits");

  if (saveButton) {
    saveButton.addEventListener("click", persistArticleState);
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      window.localStorage.removeItem(BLOG_EDITOR_STORAGE_KEY);
      applyArticleState(originalState);
      updateDocumentTitle();
      setEditorStatus("Edits reset to the original article content.");
    });
  }
}

function setupAutoSaveHint() {
  getEditableNodes().forEach((node) => {
    node.addEventListener("input", () => {
      updateDocumentTitle();
      setEditorStatus("Unsaved changes. Click Save edits when you're ready.");
    });
  });
}

function setupOwnerEditing() {
  const toggleButton = getEditToggleButton();
  let enableButton = getEnableEditingButton();
  const headerActions = document.querySelector(".header-actions.article-actions");

  if (!enableButton && headerActions) {
    enableButton = document.createElement("button");
    enableButton.type = "button";
    enableButton.id = "article-enable-editing";
    enableButton.className = "header-email article-owner-button";
    enableButton.textContent = "Enable editing";
    headerActions.appendChild(enableButton);
  }

  if (ownerQueryEnabled()) {
    window.localStorage.setItem(BLOG_OWNER_ACCESS_KEY, "true");
  }

  setEditableState(false);

  enableButton?.addEventListener("click", () => {
    window.localStorage.setItem(BLOG_OWNER_ACCESS_KEY, "true");
    enableButton.hidden = true;

    if (toggleButton) {
      toggleButton.hidden = false;
    }

    setEditMode(true);
    setEditorStatus("Edit mode is on. Saved edits stay only in this browser.");
    focusProse();
  });

  if (!hasOwnerAccess()) {
    if (enableButton) {
      enableButton.hidden = false;
    }
    setEditMode(false);
    return;
  }

  if (toggleButton) {
    toggleButton.hidden = false;
    toggleButton.addEventListener("click", () => {
      const isEditing = window.localStorage.getItem(BLOG_EDIT_MODE_KEY) === "true";
      setEditMode(!isEditing);

      if (!isEditing) {
        setEditorStatus("Edit mode is on. Saved edits stay only in this browser.");
        focusProse();
      }
    });
  }

  if (enableButton) {
    enableButton.hidden = true;
  }

  const shouldStartEditing = window.localStorage.getItem(BLOG_EDIT_MODE_KEY) === "true";
  setEditMode(shouldStartEditing);
}

function setResponseStatus(message) {
  const status = document.getElementById("article-response-status");
  if (status) {
    status.textContent = message;
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderResponses() {
  const list = document.getElementById("article-response-list");
  if (!list) {
    return;
  }

  let responses = [];
  try {
    responses = JSON.parse(window.localStorage.getItem(BLOG_RESPONSES_STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("Could not read saved responses.", error);
  }

  list.innerHTML = "";
  responses.forEach((response) => {
    const item = document.createElement("div");
    item.className = "article-response-item";
    const author = escapeHtml(response.anonymous ? "Anonymous" : (response.name || "Anonymous"));
    const body = escapeHtml(response.text || "");
    const replies = Array.isArray(response.replies) ? response.replies : [];
    const replyMarkup = replies.length
      ? `<div class="article-response-replies">${replies
          .map(
            (reply) =>
              `<div class="article-response-reply"><strong>Prachi Sharma</strong><p>${escapeHtml(reply)}</p></div>`
          )
          .join("")}</div>`
      : "";
    const ownerActions = hasOwnerAccess()
      ? `<div class="article-response-owner-actions">
           <button type="button" class="article-response-reply-button" data-response-id="${response.id}">Reply</button>
           <button type="button" class="article-response-delete-button" data-response-delete="${response.id}">Delete</button>
         </div>`
      : "";
    const replyForm = hasOwnerAccess()
      ? `<div class="article-response-reply-form" data-response-form="${response.id}" hidden>
           <textarea rows="3" placeholder="Write a reply..."></textarea>
           <button type="button" class="article-response-reply-submit" data-reply-submit="${response.id}">Post reply</button>
         </div>`
      : "";
    item.innerHTML = `
      <div class="article-response-head">
        <span class="article-response-author">${author}</span>
        ${ownerActions}
      </div>
      <p>${body}</p>
      ${replyMarkup}
      ${replyForm}
    `;
    list.appendChild(item);
  });

  if (hasOwnerAccess()) {
    list.querySelectorAll("[data-response-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const form = list.querySelector(`[data-response-form="${button.dataset.responseId}"]`);
        if (form) {
          form.hidden = !form.hidden;
        }
      });
    });

    list.querySelectorAll("[data-response-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        const responseId = button.dataset.responseDelete;
        let responses = [];
        try {
          responses = JSON.parse(window.localStorage.getItem(BLOG_RESPONSES_STORAGE_KEY) || "[]");
        } catch (error) {
          console.error("Could not read saved responses.", error);
        }

        responses = responses.filter((response) => String(response.id) !== String(responseId));
        window.localStorage.setItem(BLOG_RESPONSES_STORAGE_KEY, JSON.stringify(responses));
        renderResponses();
      });
    });

    list.querySelectorAll("[data-reply-submit]").forEach((button) => {
      button.addEventListener("click", () => {
        const responseId = button.dataset.replySubmit;
        const form = list.querySelector(`[data-response-form="${responseId}"]`);
        const textarea = form?.querySelector("textarea");
        const value = textarea?.value.trim();
        if (!value) {
          setResponseStatus("Write a reply first.");
          return;
        }

        let responses = [];
        try {
          responses = JSON.parse(window.localStorage.getItem(BLOG_RESPONSES_STORAGE_KEY) || "[]");
        } catch (error) {
          console.error("Could not read saved responses.", error);
        }

        responses = responses.map((response) => {
          if (String(response.id) !== String(responseId)) {
            return response;
          }

          return {
            ...response,
            replies: [...(response.replies || []), value],
          };
        });

        window.localStorage.setItem(BLOG_RESPONSES_STORAGE_KEY, JSON.stringify(responses));
        renderResponses();
        setResponseStatus("Reply added on this browser.");
      });
    });
  }
}

function setupReaderResponses() {
  renderResponses();

  const submit = document.getElementById("article-response-submit");
  const input = document.getElementById("article-response-input");

  submit?.addEventListener("click", () => {
    const value = input?.value.trim();
    const nameValue = document.getElementById("article-response-name")?.value.trim() || "";
    const anonymous = Boolean(document.getElementById("article-response-anonymous")?.checked);
    if (!value) {
      setResponseStatus("Write a short response first.");
      return;
    }

    let responses = [];
    try {
      responses = JSON.parse(window.localStorage.getItem(BLOG_RESPONSES_STORAGE_KEY) || "[]");
    } catch (error) {
      console.error("Could not read saved responses.", error);
    }

    responses.unshift({
      id: Date.now(),
      text: value,
      name: anonymous ? "" : nameValue,
      anonymous,
      replies: [],
    });
    window.localStorage.setItem(BLOG_RESPONSES_STORAGE_KEY, JSON.stringify(responses.slice(0, 12)));
    if (input) {
      input.value = "";
    }
    const nameInput = document.getElementById("article-response-name");
    const anonInput = document.getElementById("article-response-anonymous");
    if (nameInput) {
      nameInput.value = "";
    }
    if (anonInput) {
      anonInput.checked = false;
    }
    renderResponses();
    setResponseStatus("Response added on this browser.");
  });
}

function setupArticleReactions() {
  const heartButtons = Array.from(document.querySelectorAll(".article-reaction-button"));
  const heartCounts = Array.from(document.querySelectorAll(".article-reaction-count"));

  let state = { loved: false, count: 0 };
  try {
    state = {
      ...state,
      ...JSON.parse(window.localStorage.getItem(BLOG_REACTIONS_STORAGE_KEY) || "{}"),
    };
  } catch (error) {
    console.error("Could not restore reaction state.", error);
  }

  function renderReactionState() {
    heartCounts.forEach((node) => {
      node.textContent = String(state.count || 0);
    });
    heartButtons.forEach((button) => {
      button.classList.toggle("is-active", Boolean(state.loved));
      button.setAttribute("aria-pressed", state.loved ? "true" : "false");
    });
  }

  heartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.loved = !state.loved;
      state.count = Math.max(0, (state.count || 0) + (state.loved ? 1 : -1));
      window.localStorage.setItem(BLOG_REACTIONS_STORAGE_KEY, JSON.stringify(state));
      renderReactionState();
    });
  });

  document.querySelectorAll(".article-share-button").forEach((button) => {
    button.addEventListener("click", () => {
      const wrap = button.closest(".article-share-wrap");
      const shareMenu = wrap?.querySelector(".article-share-menu");
      if (!shareMenu) {
        return;
      }

      document.querySelectorAll(".article-share-menu").forEach((menu) => {
        if (menu !== shareMenu) {
          menu.hidden = true;
        }
      });
      document.querySelectorAll(".article-share-button").forEach((shareButtonNode) => {
        if (shareButtonNode !== button) {
          shareButtonNode.setAttribute("aria-expanded", "false");
        }
      });

      const nextHidden = !shareMenu.hidden;
      shareMenu.hidden = nextHidden;
      button.setAttribute("aria-expanded", nextHidden ? "false" : "true");
    });
  });

  document.querySelectorAll("[data-share-target]").forEach((node) => {
    node.addEventListener("click", async (event) => {
      event.preventDefault();
      const wrap = node.closest(".article-share-wrap");
      const localShareMenu = wrap?.querySelector(".article-share-menu");
      const localShareButton = wrap?.querySelector(".article-share-button");
      const target = node.dataset.shareTarget;
      const url = encodeURIComponent(window.location.href);
      const rawTitle = document.getElementById("article-title")?.textContent?.trim() || document.title;
      const title = encodeURIComponent(rawTitle);
      const text = encodeURIComponent(`${rawTitle} — ${window.location.href}`);

      const shareUrls = {
        whatsapp: `https://wa.me/?text=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        x: `https://x.com/intent/post?url=${url}`,
        email: `mailto:?subject=${title}&body=${text}`,
      };

      if (target === "instagram") {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setResponseStatus("Instagram doesn’t support direct web sharing. Link copied for you.");
        } catch (error) {
          console.error("Could not copy link.", error);
          setResponseStatus("Could not copy the link right now.");
        }
      } else if (target === "copy") {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setResponseStatus("Link copied.");
        } catch (error) {
          console.error("Could not copy link.", error);
          setResponseStatus("Could not copy the link right now.");
        }
      } else if (shareUrls[target]) {
        window.open(shareUrls[target], "_blank", "noopener,noreferrer");
        setResponseStatus(`Opened ${target} share.`);
      }

      if (localShareMenu) {
        localShareMenu.hidden = true;
      }
      if (localShareButton) {
        localShareButton.setAttribute("aria-expanded", "false");
      }
    });
  });

  renderReactionState();
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function setupArticleToc() {
  const articleLayout = document.querySelector(".article-layout");
  const prose = document.getElementById("article-prose");

  if (!articleLayout || !prose) {
    return;
  }

  const sectionLabels = Array.from(prose.querySelectorAll(".article-section-label"));
  if (sectionLabels.length < 3) {
    return;
  }

  const usedIds = new Set();
  const tocSections = sectionLabels.map((label, index) => {
    const heading = label.nextElementSibling?.tagName === "H3" ? label.nextElementSibling : label;
    const fallbackId = `section-${index + 1}`;
    const rawId = heading.id || slugifyHeading(label.textContent || heading.textContent || "") || fallbackId;
    let nextId = rawId;
    let duplicateIndex = 2;
    while (usedIds.has(nextId)) {
      nextId = `${rawId}-${duplicateIndex}`;
      duplicateIndex += 1;
    }
    usedIds.add(nextId);
    heading.id = nextId;
    return {
      id: nextId,
      label: label.textContent.trim(),
      heading,
    };
  });

  const toc = document.createElement("aside");
  toc.className = "article-toc";
  toc.setAttribute("aria-label", "Table of contents");

  const listItems = tocSections
    .map(
      (section) =>
        `<li><a class="article-toc-link" href="#${section.id}">${section.label}</a></li>`
    )
    .join("");

  toc.innerHTML = `
    <div class="article-toc-inner">
      <p class="article-toc-label">On this page</p>
      <ol class="article-toc-list">${listItems}</ol>
    </div>
  `;

  articleLayout.appendChild(toc);

  const links = Array.from(toc.querySelectorAll(".article-toc-link"));
  const linkById = new Map(links.map((link) => [link.getAttribute("href")?.slice(1), link]));

  function setActiveLink(id) {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visibleEntries.length > 0) {
        const activeId = visibleEntries[0].target.id;
        if (linkById.has(activeId)) {
          setActiveLink(activeId);
        }
      }
    },
    {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 1],
    }
  );

  tocSections.forEach((section) => observer.observe(section.heading));

  const firstHeadingId = tocSections[0]?.id;
  if (firstHeadingId) {
    setActiveLink(firstHeadingId);
  }
}

function bootBlogEditor() {
  ensureEditorPanel();
  setupOwnerEditing();
  setupEditorToolbar();
  setupColorControls();
  setupUploadInputs();
  setupEditorPersistence();
  setupAutoSaveHint();
  setupArticleReactions();
  setupReaderResponses();
  setupArticleToc();
}

bootBlogEditor();
