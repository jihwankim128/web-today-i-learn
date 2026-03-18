const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");
const tilDateInput = document.querySelector("#til-date");

window.addEventListener("DOMContentLoaded", () => {
  const today = getToday();

  tilDateInput.value = today;
  tilDateInput.min = today;
  tilDateInput.max = today;

  const savedTilList = JSON.parse(localStorage.getItem("TIL")) || [];
  savedTilList.forEach((til) => renderTil(til));
});

tilForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const selectedDate = tilDateInput.value;
  const title = document.querySelector("#til-title").value;
  const content = document.querySelector("#til-content").value;

  const today = getToday();
  if (selectedDate !== today) {
    alert("TIL은 오늘 날짜로만 작성할 수 있습니다!");
    tilDateInput.value = today;
    return;
  }

  if (title.length < 2 || title.length > 20) {
    alert("제목은 2자 이상 20자 이하로 입력해주세요.");
    document.querySelector("#til-title").focus();
    return;
  }

  if (content.length < 10 || content.length > 200) {
    alert("내용은 최소 10자 이상, 최대 200자까지 작성 가능합니다.");
    document.querySelector("#til-content").focus();
    return;
  }

  const newTil = { date: selectedDate, title, content };
  renderTil(newTil);
  saveToLocalStorage(newTil);

  tilForm.reset();
  tilDateInput.value = today;
});


function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().split("T")[0];
}

function renderTil(til) {
  const article = document.createElement("article");
  article.className = "til-item";
  article.innerHTML = `
    <time>${til.date}</time>
    <h3>${til.title}</h3>
    <p>${til.content}</p>
  `;

  tilList.prepend(article);
}

function saveToLocalStorage(til) {
  const tilList = JSON.parse(localStorage.getItem("TIL")) || [];
  tilList.push(til);

  localStorage.setItem("TIL", JSON.stringify(tilList));
}