chrome.runtime.sendMessage({ action: "logUrl", url: window.location.href }, function() {
  // After logging, send the check and close message
  chrome.runtime.sendMessage({ action: "checkAndCloseWindow", url: window.location.href });
});
