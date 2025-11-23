const homePage = document.getElementById("homePage");
const transactionPage = document.getElementById("transactionPage");
const historyPage = document.getElementById("historyPage");
const transactionBtn = document.getElementById("transactionBtn");
const historyBtn = document.getElementById("historyBtn");
const closeTransactionBtn = document.getElementById("closeTransactionBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const confirmBtn = document.getElementById("confirmBtn");
const deleteBtn = document.getElementById("deleteBtn");
const globalBalanceAmount = document.getElementById("globalBalanceAmount");
const transactionTypeField = document.getElementById("transactionTypeField");
const transactionAmountField = document.getElementById("transactionAmountField");
const transactionHistory = document.getElementById("transactionHistory");
const pages = [homePage, transactionPage, historyPage];
const buttons = [closeHistoryBtn, transactionBtn, historyBtn];
let globalBalance = 0;

buttons.forEach((button, index) => {
    button.onclick = () => {
        moveToPage(pages[index]);
    }
});

function moveToPage(page) {
    removeAll("active-page");
    page.classList.add("active-page");
    page.inert = false;
}

function removeAll(className) {
    pages.forEach(page => {
        page.classList.remove(className);
        page.inert = true;
    });
}

function resetTransactionPage() {
    transactionAmount.value = null;
    transactionType.value = "income";
    // moveToPage(homePage);
}

function updateBalance(type, amount) {
    if(type === "income") {
        balance += amount;
    } else {
        balance -= amount;
    }
    balanceAmount.innerHTML = `Balance: $${balance}`;
}

function validateTransaction(type, amount) {
    if(amount <= 0 || isNaN(amount)) {
        console.error("Amount must be a number and at least 1");
        return false;
    }
    if(type === "expense" && amount > globalBalance) {
        console.error("Unable to spend more than current balance");
        return false;
    }
    return true;
}