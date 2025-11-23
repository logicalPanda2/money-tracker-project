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
let editedTransaction = null;

buttons.forEach((button, index) => {
    button.onclick = () => {
        moveToPage(pages[index]);
    }
});
confirmBtn.addEventListener("click", handleConfirm);
deleteBtn.addEventListener("click", handleDelete);
closeTransactionBtn.addEventListener("click", handleClose);
transactionHistory.addEventListener("click", handleHistoryEdit);

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
    transactionPage.querySelector("h2").textContent = "Add a new transaction";
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

    updateGlobalBalanceView();
}

function revertBalance(transaction) {
    if(transaction.type === "income") {
        globalBalance -= transaction.amount;
    } else {
        globalBalance += transaction.amount;
    }

    updateGlobalBalanceView();
}

function updateGlobalBalanceView() {
    globalBalanceAmount.textContent = `Balance: $${globalBalance}`;
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

function handleConfirm() {
    if(isCurrentlyEditing) {
        const oldAmount = editedTransaction.amount;
        const oldType = editedTransaction.type;
        const newAmount = Number(transactionAmountField.value);
        const newType = transactionTypeField.value;
        const amountDifference = oldAmount - newAmount;
        if(newType === "income") {
            if(newType !== oldType) {
                globalBalance += (newAmount + oldAmount);
            } else {
                globalBalance -= amountDifference;
            }
            document.getElementById(editedTransaction.id).textContent = `+$${newAmount}`;
        } else {
            const temp = globalBalance;
            if(newType !== oldType) {
                globalBalance -= (newAmount + oldAmount);
            } else {
                globalBalance += amountDifference;
            }
            if(globalBalance < 0) {
                console.error("Unable to spend more than current balance");
                globalBalance = temp;
                return false;
            }
            document.getElementById(editedTransaction.id).textContent = `-$${newAmount}`;
        }
        editedTransaction.type = newType;
        editedTransaction.amount = newAmount;
        updateGlobalBalanceView();
        resetTransactionPage();
        moveToPage(homePage);
        isCurrentlyEditing = false;
        editedTransaction = null;
    } else {
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
}

function handleDelete() {
    if(isCurrentlyEditing) {
        const temp = globalBalance;
        revertBalance(editedTransaction);
        if(globalBalance < 0) {
            console.error("Cannot delete: Balance cannot be less than 0");
            globalBalance = temp;
            updateGlobalBalanceView();
            return false;
        }
        document.getElementById(editedTransaction.id).closest(".previousTransaction").style.display = "none";
        document.getElementById(editedTransaction.id).closest(".previousTransaction").hidden = true;
        resetTransactionPage();
        moveToPage(homePage);
        isCurrentlyEditing = false;
        editedTransaction = null;
    }
}

function handleClose() {
    if(isCurrentlyEditing) {
        isCurrentlyEditing = false;
        editedTransaction = null;
    }
    resetTransactionPage();
    moveToPage(homePage);   
}

function handleHistoryEdit(event) {
    if(event.target.matches(".previousTransactionDate") || event.target.matches(".previousTransactionTime")) {
        return false;
    }
    moveToPage(transactionPage);
    transactionPage.querySelector("h2").textContent = "Edit a transaction";
    const transaction = transactions.find(object => object.id === Number(event.target.id));
    transactionTypeField.value = transaction.type;
    transactionAmountField.value = transaction.amount;
    isCurrentlyEditing = true;
    editedTransaction = transaction;
}