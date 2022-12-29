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

  async function start() {
    if (!window.EyeDropper) {
      alert(chrome.i18n.getMessage("not_supported_error"));
      return;
    }

    if (!document.hasFocus()) {
      return;
    }

    let type = await load("type", "hex");
    let eyeDropper = new EyeDropper();
    let message;
    let result;

    try {
      result = await eyeDropper.open();
    } catch (err) {
      console.log(err);
      return;
    }

    switch(type) {
      case "hex":
        await copyToClipboard(result.sRGBHex);
        break;
      case "rgb":
        await copyToClipboard(hexToRgb(result.sRGBHex));
        break;
    }

    showMessage(result.sRGBHex);

    function hexToRgb(hex) {
      hex = hex.replace(/[^0-9A-F]/gi, '');

      let int = parseInt(hex, 16);
      let r = (int >> 16) & 255;
      let g = (int >> 8) & 255;
      let b = int & 255;

      return "rgb(" + r + ", " + g + ", " + b + ")" ;
    }

    async function copyToClipboard(value) {
      await navigator.clipboard.writeText(value);
    }

    function showMessage(hex) {
      if (message) removeMessage();

      let colorStr;

      switch(type) {
        case "hex":
          colorStr = result.sRGBHex.toUpperCase();
          break;
        case "rgb":
          colorStr = hexToRgb(result.sRGBHex);
          break;
      }

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
      label.innerHTML = `Copied <span class="color" style="background-color: ` + hex + `;"></span> <strong>` + colorStr + `</strong> to Clipboard!`;
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

  function load(key, defaults) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(
        {
          [key]: defaults,
        },
        function (value) {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
          }
          resolve(value[key]);
        }
      );
    });
  }

  start();
}
