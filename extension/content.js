(function () {
  function sendTitle() {
    const title = document.title || "";
    chrome.runtime.sendMessage({
      type: "PAGE_TITLE",
      title: title,
      url: window.location.href
    });
  }

  sendTitle();

  const observer = new MutationObserver(() => {
    sendTitle();
  });

  const titleEl = document.querySelector("title");
  if (titleEl) {
    observer.observe(titleEl, {
      subtree: true,
      characterData: true,
      childList: true
    });
  }

  setTimeout(sendTitle, 2000);
  setTimeout(sendTitle, 5000);
})();