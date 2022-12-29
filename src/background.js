"use strict";

import * as storage from "./js/storage.js";

chrome.runtime.onInstalled.addListener(init);
chrome.contextMenus.onClicked.addListener(onMenuClick);
chrome.action.onClicked.addListener(onActionClicked);

let menu = [
  {
    id: "type",
    title: chrome.i18n.getMessage("option_type"),
    contexts: ["action"],
    type: "normal",
  },
  {
    id: "type_hex",
    title: chrome.i18n.getMessage("option_type_hex"),
    contexts: ["action"],
    parentId: "type",
    type: "radio",
  },
  {
    id: "type_rgb",
    title: chrome.i18n.getMessage("option_type_rgb"),
    contexts: ["action"],
    parentId: "type",
    type: "radio",
  }
];

async function init() {
  for (let item of menu) {
    await createMenuItem(item);
  }

  updateRadioControls();
}

async function updateRadioControls() {
  let type = await storage.load("type", "hex");

  switch (type) {
    case "hex":
      await restoreCheckmark("type_hex", true);
      break;
    case "rgb":
      await restoreCheckmark("type_rgb", true);
      break;
  }
}

function restoreCheckmark(id, bool) {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.update(
      id,
      {
        checked: bool,
      },
      function () {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
        resolve();
      }
    );
  });
}

function createMenuItem(item) {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.create(item, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
      resolve();
    });
  });
}

async function onMenuClick(info) {
  let menuId = info.menuItemId;

  switch (menuId) {
    case "type_hex":
      await storage.save("type", "hex");
      break;
    case "type_rgb":
      await storage.save("type", "rgb");
      break;
  }
}

function onActionClicked(tab) {
  runScript(tab.id);
}

function runScript(tabid) {
  chrome.scripting.executeScript({
    target: { tabId: tabid },
    files: ["./js/content-script.js"],
  },
  function () {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  });
}
