"use strict";

chrome.action.onClicked.addListener(onActionClicked);

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
