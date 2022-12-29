"use strict";

{

  let stylesheet = `
    .message {
      background: rgba(235, 235, 235, 0.9);
      backdrop-filter: blur(10px);
      padding: 16px 20px;
      color: #222222;
      border-radius: 16px;
      opacity: 0;
      animation: fadeInOut 3s;
      user-select: none;
    }

    .label {
      font-size: 14px;
      line-height: 20px;
      font-weight: 400;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
        "Helvetica Neue", Arial, sans-serif;
    }

    .color {
      display: inline-block;
      position: relative;
      top: 4px;
      height: 16px;
      width: 16px;
      border: 1px solid #000000;
      margin-left: 2px;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  function start() {
    if (!window.EyeDropper) {
      alert(chrome.i18n.getMessage("not_supported_error"));
      return;
    }

    if (!document.hasFocus()) {
      return;
    }

    let eyeDropper = new EyeDropper();
    let abortController = new AbortController();
    let message;

    eyeDropper.open({ signal: abortController.signal }).then(async (result) => {
        await copyToClipboard(result.sRGBHex);
        showMessage(result.sRGBHex);
      }).catch((err) => {
        console.log(err);
    });

    async function copyToClipboard(value) {
      await navigator.clipboard.writeText(value);
    }

    function showMessage(hex) {
      if (message) removeMessage();

      createMessageElement();

      let shadowRoot = message.attachShadow({ mode: "open" });
      let shadowMessage = document.createElement("div");
      shadowMessage.setAttribute("class", "message");
      shadowRoot.appendChild(shadowMessage);

      let sheet = new CSSStyleSheet();
      sheet.replaceSync(stylesheet);
      shadowRoot.adoptedStyleSheets = [sheet];

      let div = document.createElement("div");
      div.setAttribute("class", "message");

      let label = document.createElement("div");
      label.setAttribute("class", "label");
      label.innerHTML = `Copied <span class="color" style="background-color: ` + hex + `;"></span> <strong>` + hex.toString().toUpperCase() + `</strong> to Clipboard!`;
      shadowMessage.appendChild(label);

      document.body.insertBefore(message, document.body.firstChild);

      setTimeout(() => {
        removeMessage();
      }, 3000);
    }

    function createMessageElement() {
      message = document.createElement("div");
      message.style.position = "fixed";
      message.style.height = "auto";
      message.style.width = "auto";
      message.style.padding = "none";
      message.style.margin = "none";
      message.style.zIndex = "9999999";
      message.style.top = "16px";
      message.style.right = "16px";
    }

    function removeMessage() {
      message.remove();
      message = null;
    }
  }

  start();
}
