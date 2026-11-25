(() => {
  const teaMenu = document.querySelector("#tea-menu");
  const openTeaMenu = document.querySelector("[data-open-tea-menu]");
  if (typeof teaMenu?.showModal === "function" && openTeaMenu) {
    openTeaMenu.addEventListener("click", () => {
      teaMenu.showModal();
      teaMenu.querySelector(".tea-menu-items").scrollTop = 0;
    });
    teaMenu.querySelector(".anniversary-program__close").addEventListener("click", () => teaMenu.close());
    teaMenu.addEventListener("click", (event) => {
      if (event.target === teaMenu) teaMenu.close();
    });
    openTeaMenu.hidden = false;
  }

  const status = document.querySelector("#orders-status");
  const isOfficial = location.protocol === "https:" &&
    ["saltwithlightstudio.com", "www.saltwithlightstudio.com"].includes(location.hostname);
  const googleFormUrl = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform$/;

  if (isOfficial && googleFormUrl.test(document.querySelector("#official-ticket-form").href)) {
    document.querySelector("#official-purchase").hidden = false;
    status.hidden = true;
    return;
  }

  if (location.hostname !== "127.0.0.1") {
    status.textContent = "請從鹽與光正式網站進入購票頁。";
    return;
  }

  async function loadPreviewForm() {
    try {
      const response = await fetch("/api/anniversary-orders", { cache: "no-store", signal: AbortSignal.timeout(5000) });
      const config = await response.json();
      if (!response.ok || config.previewStorage !== "google-form" || !googleFormUrl.test(config.googleFormUrl)) {
        throw new Error("Preview form not configured");
      }
      document.querySelector("#google-forms-link").href = config.googleFormUrl;
      document.querySelector("#google-forms-bridge").hidden = false;
      status.hidden = true;
    } catch {
      status.textContent = "本機測試表單暫時無法開啟，請勿匯款。";
    }
  }
  loadPreviewForm();
})();
