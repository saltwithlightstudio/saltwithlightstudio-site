(() => {
  const triggers = document.querySelectorAll("[data-open-anniversary-program]");
  if (!triggers.length) return;

  const program = [
    ["樂團演出", [
      ["TC. with 樂團", "Room335"],
      ["Miss Chief", "真昼の月明かり"],
      ["米奇妙妙屋", "白日"],
      ["Mina. with 樂團", "科技美"],
      ["睡眠不足", "777、Head Above Water"],
      ["港邊人生放送部樂團", "曲目待公布"],
      ["小麻雀樂團", "等火車"],
      ["Ting. B3 樂團", "曲目待公布"],
      ["宛庭樂團", "隨心所欲"],
      ["Chicken Banana", "Chicken"],
    ]],
    ["個人與雙人演出", [
      ["孟柏", "One Big Rush"],
      ["湘德", "Cliffs of Dover"],
      ["韋愷老師", "Romantica"],
      ["陳奕勲", "誰"],
      ["邱靖雅", "來自天堂的魔鬼"],
      ["王韻淑", "Hero"],
      ["蕭琨益", "必巡"],
      ["曾天裕", "浮誇"],
      ["李昭賢", "我不難過"],
      ["何啓任、梁瑋方", "Just the Way You Are"],
      ["夏巧議", "紅薔薇白玫瑰"],
      ["呂孟諭", "Love"],
      ["陳奕勲", "缺口"],
      ["Brianna", "Talking to the Moon"],
    ]],
  ];

  const dialog = document.createElement("dialog");
  dialog.id = "anniversary-program";
  dialog.className = "anniversary-program-dialog";
  dialog.setAttribute("aria-labelledby", "anniversary-program-title");
  dialog.innerHTML = `
    <header class="anniversary-program__head">
      <div>
        <p class="anniversary-program__eyebrow">10TH ANNIVERSARY · PROGRAM</p>
        <h2 id="anniversary-program-title">演出節目與曲目</h2>
        <p class="anniversary-program__note">依演出形式整理，非當天演出順序。曲目以現場公告為準。</p>
      </div>
      <button type="button" class="anniversary-program__close" aria-label="關閉節目表" autofocus>×</button>
    </header>
    <div class="anniversary-program__body"></div>`;

  const body = dialog.querySelector(".anniversary-program__body");
  program.forEach(([label, entries], index) => {
    const group = document.createElement("section");
    group.className = "anniversary-program__group";
    const heading = document.createElement("h3");
    heading.id = `anniversary-program-group-${index}`;
    heading.textContent = label;
    group.setAttribute("aria-labelledby", heading.id);
    const list = document.createElement("dl");
    entries.forEach(([performer, song]) => {
      const row = document.createElement("div");
      const name = document.createElement("dt");
      const title = document.createElement("dd");
      name.textContent = performer;
      title.textContent = song;
      row.append(name, title);
      list.append(row);
    });
    group.append(heading, list);
    body.append(group);
  });
  document.body.append(dialog);

  function openProgram() {
    if (dialog.open) return;
    body.scrollTop = 0;
    dialog.showModal();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openProgram);
    trigger.hidden = false;
  });
  dialog.querySelector(".anniversary-program__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const programHash = "#anniversary-program";
  function openFromHash() {
    if (location.hash === programHash) openProgram();
  }
  dialog.addEventListener("close", () => {
    if (location.hash === programHash) {
      history.replaceState(history.state, "", location.pathname + location.search);
    }
  });
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
