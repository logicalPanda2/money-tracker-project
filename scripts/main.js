const homePage = document.getElementById("homePage");
const transactionPage = document.getElementById("transactionPage");
const historyPage = document.getElementById("historyPage");
const transactionBtn = document.getElementById("transactionBtn");
const historyBtn = document.getElementById("historyBtn");
const closeTransactionBtn = document.getElementById("closeTransactionBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const confirmBtn = document.getElementById("confirmBtn");
const deleteBtn = document.getElementById("deleteBtn");
const balanceAmount = document.getElementById("balanceAmount");
const transactionType = document.getElementById("transactionType");
const transactionAmount = document.getElementById("transactionAmount");
const transactionHistory = document.getElementById("transactionHistory");
const pages = [homePage, transactionPage, historyPage];
const buttons = [closeHistoryBtn, transactionBtn, historyBtn];
let balance = 0;
let globalId = 0;

function removeAll(className) {
    for(let i = 0; i < pages.length; i++) {
        pages[i].classList.remove(className);
    }
}

function resetTransactionPage() {
    transactionAmount.value = null;
    transactionType.value = "income";
    removeAll("active-page");
    homePage.classList.add("active-page");
}

function moveToTransactionPage() {
    removeAll("active-page");
    transactionPage.classList.add("active-page");
}

function updateBalance(type, amount) {
    if(type === "income") {
        balance += amount;
    } else {
        balance -= amount;
    }
    balanceAmount.innerHTML = `Balance: $${balance}`;
}

function updateHistory(type, amount) {
    createHistoryElement(type, amount);
    enableHistoryEdit();
}

function createHistoryElement(type, amount) {
    const dateAndTime = new Date;
    const dateAndTimeString = dateAndTime.toString();
    const date = dateAndTimeString.slice(4, 15);
    let historyNode = document.createElement("div");
    let amountElement = document.createElement("div");
    let dateElement = document.createElement("div");
    historyNode.id = globalId;
    amountElement.id = "previousTransactionAmount" + globalId;
    historyNode.classList.add("previousTransaction");
    amountElement.classList.add("previousTransactionAmount");
    dateElement.classList.add("previousTransactionDate");
    if(type === "income") {
        amountElement.innerHTML = `+$${amount}`; 
    } else {
        amountElement.innerHTML = `-$${amount}`;
    }
    dateElement.innerHTML = date;
    historyNode.appendChild(amountElement);
    historyNode.appendChild(dateElement);
    transactionHistory.appendChild(historyNode);
}

function enableHistoryEdit() {
    globalId++;
    for(let i = 0; i < globalId; i++) {
        document.getElementById(i).onclick = () => {
            moveToTransactionPage();
            const transactionAmountString = document.getElementById(`previousTransactionAmount${i}`).innerHTML;
            const transactionAmountNum = Number(transactionAmountString.slice(2));
            if(transactionAmountString[0] === "+") {
                transactionType.value = "income";
            } else {
                transactionType.value = "expense";
            }
            transactionAmount.value = transactionAmountNum;
            overrideEventListeners(i, transactionAmountNum, transactionType.value);
        }
    }
}

function overrideEventListeners(id, oldAmount, oldType) {

    confirmBtn.onclick = () => {
        const newAmount = Number(transactionAmount.value);
        const newType = transactionType.value;
        const amountDifference = oldAmount - newAmount;
        if(newType === "income") {
            if(newType !== oldType) {
                balance += (newAmount + oldAmount);
            } else {
                balance -= amountDifference;
            }
            document.getElementById(`previousTransactionAmount${id}`).innerHTML = `+$${newAmount}`;
        } else {
            const oldBalance = balance;
            if(newType !== oldType) {
                balance -= (newAmount + oldAmount);
            } else {
                balance += amountDifference;
            }
            if(balance < 0) {
                console.error("Unable to spend more than current balance");
                balance = oldBalance;
                resetTransactionPage();
                revertEventListeners();
                return 0;
            }
            document.getElementById(`previousTransactionAmount${id}`).innerHTML = `-$${newAmount}`;
        }
        balanceAmount.innerHTML = `Balance: $${balance}`;
        resetTransactionPage();
        revertEventListeners();
    }

    deleteBtn.onclick = () => {
        const oldBalance = balance;
        updateBalance(transactionType.value, -oldAmount);
        if(balance < 0) {
            console.error("Cannot delete: Balance cannot be less than 0");
            balance = oldBalance;
            balanceAmount.innerHTML = `Balance: $${balance}`;
            resetTransactionPage();
            revertEventListeners();
            return 0;
        }
        document.getElementById(id).style.display = "none";
        resetTransactionPage();
        revertEventListeners();
    }

    closeTransactionBtn.onclick = () => {
        resetTransactionPage();
        revertEventListeners();
    }
}

function validateTransaction(type, amount) {
    if(amount === 0 || amount === NaN) {
        console.error("Amount must be a number and at least 1");
        return 0;
    }
    if(type === "expense" && amount > balance) {
        console.error("Unable to spend more than current balance");
        return 0;
    }
    return 1;
}

function revertEventListeners() {

    confirmBtn.onclick = () => {
        const type = transactionType.value;
        const amount = Number(transactionAmount.value);
        if(validateTransaction(type, amount) === 0) {
            return 0;
        }
        updateBalance(type, amount);
        updateHistory(type, amount);
        resetTransactionPage();
    }

    deleteBtn.onclick = () => {
        resetTransactionPage();
    }

    closeTransactionBtn.onclick = () => {
        resetTransactionPage();
    }
}

for(let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = () => {
        removeAll("active-page");
        pages[i].classList.add("active-page");
    }
}

revertEventListeners();