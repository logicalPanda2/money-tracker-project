const homePage = document.getElementById("homePage");
const transactionPage = document.getElementById("transactionPage");
const historyPage = document.getElementById("historyPage");
const historyBtn = document.getElementById("historyBtn");
const transactionBtn = document.getElementById("transactionBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const closeTransactionBtn = document.getElementById("closeTransactionBtn");
const confirmBtn = document.getElementById("confirmBtn");
const deleteBtn = document.getElementById("deleteBtn");
const pages = [homePage, homePage, homePage, homePage, transactionPage, historyPage];
const buttons = [closeHistoryBtn, closeTransactionBtn, confirmBtn, deleteBtn, transactionBtn, historyBtn];

for(let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = () => {
        removeAll("active-page");
        pages[i].classList.add("active-page");
    }
}

function removeAll(className) {
    for(let i = 0; i < pages.length; i++) {
        pages[i].classList.remove(className);
    }
}