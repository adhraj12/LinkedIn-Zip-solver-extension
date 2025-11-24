// This script runs in the background and listens for the extension icon to be clicked.
chrome.action.onClicked.addListener((tab) => {
  // Check if the URL is a LinkedIn page to prevent running on other sites.
  if (tab.url && tab.url.startsWith("https://www.linkedin.com/")) {
    // Execute the solver logic and the content script in the context of the active tab.
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content_script.js"],
    });
  } else {
    // Provide feedback if the user clicks on a non-LinkedIn page.
    chrome.action.setBadgeText({ text: 'X', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#c53030', tabId: tab.id }); // Red color
    setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 3000);
  }
});
