function extractPageContent() {
  const title = document.title;

  const bodyText = document.body.innerText;

  return {
    title,
    content: bodyText
  };
}

console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.type === "GET_PAGE_CONTENT") {
    const pageData = extractPageContent();

    console.log("Sending page data");

    sendResponse(pageData);
  }

  return true;
});