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

class Transaction {
    static transactionId = 0;

    constructor(type, amount) {
        this.transactionId = null;
        this.type = type;
        this.amount = amount;
        this.date = null;
        this.time = null;

        this.initializeDateAndTime();
        this.initializeId();
    }

    initializeDateAndTime() {
        const dateObj = new Date();
        const dateString = String(dateObj);
        const date = dateString.slice(4, 15);
        const time = dateString.slice(16, 24);
        
        this.date = date;
        this.time = time;
    }

    initializeId() {
        this.transactionId = Transaction.transactionId;
        Transaction.transactionId += 1;
    }
}

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
    transactionAmountField.value = null;
    transactionTypeField.value = "income";
    // moveToPage(homePage);
}

function validateTransaction(transaction) {
    if(transaction.amount <= 0) {
        console.error("Amount must be at least 1");
        return false;
    }
    if(isNaN(transaction.amount)) {
        console.error("Amount must be a number");
        return false;
    }
    if(transaction.type === "expense" && transaction.amount > globalBalance) {
        console.error("Cannot spend more than current balance");
        return false;
    }

    return true;
}

function updateBalance(transaction) {
    if(transaction.type === "income") {
        globalBalance += transaction.amount;
    } else {
        globalBalance -= transaction.amount;
    }
}