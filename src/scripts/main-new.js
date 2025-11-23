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
const transactions = [];
let globalBalance = 0;
let isCurrentlyEditing = false;

buttons.forEach((button, index) => {
    button.onclick = () => {
        moveToPage(pages[index]);
    }
});

class Transaction {
    static id = 0;

    constructor(type, amount) {
        this.id = null;
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
        this.id = Transaction.id;
        Transaction.id += 1;
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
}

function validateTransaction(type, amount) {
    if(amount <= 0) {
        console.error("Amount must be at least 1");
        return false;
    }
    if(isNaN(amount)) {
        console.error("Amount must be a number");
        return false;
    }
    if(type === "expense" && amount > globalBalance) {
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

    globalBalanceAmount.textContent = `Balance: $${globalBalance}`;
}

confirmBtn.onclick = () => {
    const type = transactionTypeField.value;
    const amount = Number(transactionAmountField.value);
    if(!validateTransaction(type, amount)) {
        return false;
    }
    const transaction = new Transaction(type, amount);
    transactions.push(transaction);
    updateBalance(transaction);
    createTransactionHistory(transaction);
    resetTransactionPage();
    moveToPage(homePage);
}

deleteBtn.onclick = () => {
    resetTransactionPage();
    moveToPage(homePage);
}

closeTransactionBtn.onclick = () => {
    resetTransactionPage();
    moveToPage(homePage);
}

function createTransactionHistory(transaction) {
    const transactionElement = document.createElement("button");
    const amountElement = document.createElement("div");
    const dateElement = document.createElement("div");
    const timeElement = document.createElement("div");
    transactionElement.classList.add("previousTransaction");
    amountElement.id = transaction.id;
    amountElement.classList.add("previousTransactionAmount");
    dateElement.classList.add("previousTransactionDate");
    timeElement.classList.add("previousTransactionTime");
    if(transaction.type === "income") {
        amountElement.textContent = `+$${transaction.amount}`; 
    } else {
        amountElement.textContent = `-$${transaction.amount}`;
    }
    dateElement.textContent = transaction.date;
    timeElement.textContent = transaction.time;
    transactionElement.appendChild(amountElement);
    transactionElement.appendChild(dateElement);
    transactionElement.appendChild(timeElement);
    transactionHistory.appendChild(transactionElement);
}

transactionHistory.onclick = (event) => {
    if(event.target.matches(".previousTransactionDate") || event.target.matches(".previousTransactionTime")) {
        return false;
    }
    moveToPage(transactionPage);
    isCurrentlyEditing = true;
    transactionPage.querySelector("h2").textContent = "Edit a transaction";
    const transaction = transactions.find(object => object.id === Number(event.target.id));
    transactionTypeField.value = transaction.type;
    transactionAmountField.value = transaction.amount;
}