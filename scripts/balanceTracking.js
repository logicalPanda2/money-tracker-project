const balanceAmount = document.getElementById("balanceAmount");
const transactionType = document.getElementById("transactionType");
const transactionAmount = document.getElementById("transactionAmount");
const transactionHistory = document.getElementById("transactionHistory");
let balance = 0;
let globalId = 0;

confirmBtn.onclick = () => {
    let type = transactionType.value;
    let amount = Number(transactionAmount.value);
    if(amount === 0 || amount === null) {
        return 0;
    }
    if(type === "expense" && amount > balance) {
        return 0;
    }
    transactionAmount.value = null;
    transactionType.value = "income";
    updateBalance(type, amount);
    updateHistory(type, amount);
    removeAll("active-page");
    homePage.classList.add("active-page");
}

deleteBtn.onclick = () => {
    transactionAmount.value = null;
    transactionType.value = "income";
    removeAll("active-page");
    homePage.classList.add("active-page");
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
    const dateAndTime = new Date;
    const dateAndTimeString = dateAndTime.toString();
    const date = dateAndTimeString.slice(4, 15);
    let div = document.createElement("div");
    let _amount = document.createElement("div");
    let _date = document.createElement("div");
    div.id = globalId;
    _amount.id = "previousTransactionAmount" + globalId;
    div.classList.add("previousTransaction");
    _amount.classList.add("previousTransactionAmount");
    _date.classList.add("previousTransactionDate");
    if(type === "income") {
        _amount.innerHTML = `+$${amount}`; 
    } else {
        _amount.innerHTML = `-$${amount}`;
    }
    _date.innerHTML = date;
    div.appendChild(_amount);
    div.appendChild(_date);
    transactionHistory.appendChild(div);
    globalId++;
    for(let i = 0; i < globalId; i++) {
        document.getElementById(i).onclick = () => {
            removeAll("active-page");
            transactionPage.classList.add("active-page");
            const transactionAmountString = document.getElementById(`previousTransactionAmount${i}`).innerHTML;
            if(transactionAmountString[0] === "+") {
                transactionType.value = "income";
            } else {
                transactionType.value = "expense";
            }
            const transactionAmountNum = Number(transactionAmountString.slice(2));
            transactionAmount.value = transactionAmountNum;
            addNewEventListeners(i, transactionAmountNum, transactionType.value);
        }
    }
}

function addNewEventListeners(id, prev, priv) {
    confirmBtn.onclick = () => {
        let type = transactionType.value;
        let post = Number(transactionAmount.value);
        let diff = prev - post;
        if(type === "income") {
            if(type !== priv && post === prev) {
                balance += 2 * post;
            } else if(type !== priv) {
                balance += (post + prev);
            } else {
                balance -= diff;
            }
            document.getElementById(`previousTransactionAmount${id}`).innerHTML = `+$${Number(transactionAmount.value)}`;
        } else {
            if(type !== priv && post === prev) {
                balance -= 2 * post;
            } else if(type !== priv) {
                balance -= (post + prev);
            } else {
                balance += diff;
            }
            document.getElementById(`previousTransactionAmount${id}`).innerHTML = `-$${Number(transactionAmount.value)}`;
        }
        balanceAmount.innerHTML = `Balance: $${balance}`;
        transactionAmount.value = null;
        transactionType.value = "income";
        removeAll("active-page");
        homePage.classList.add("active-page");
        addOldEventListeners();
    }
    deleteBtn.onclick = () => {
        if(transactionType.value === "income") {
            balance -= prev;
        } else {
            balance += prev;
        }
        balanceAmount.innerHTML = `Balance: $${balance}`;
        document.getElementById(id).style.display = "none";
        transactionAmount.value = null;
        transactionType.value = "income";
        removeAll("active-page");
        homePage.classList.add("active-page");
        addOldEventListeners();
    }
    closeTransactionBtn.onclick = () => {
        transactionAmount.value = null;
        transactionType.value = "income";
        removeAll("active-page");
        homePage.classList.add("active-page");
        addOldEventListeners();
    }
}

function addOldEventListeners() {
    confirmBtn.onclick = () => {
        let type = transactionType.value;
        let amount = Number(transactionAmount.value);
        if(amount === 0 || amount === null) {
            return 0;
        }
        if(type === "expense" && amount > balance) {
            return 0;
        }
        transactionAmount.value = null;
        transactionType.value = "income";
        updateBalance(type, amount);
        updateHistory(type, amount);
        removeAll("active-page");
        homePage.classList.add("active-page");
    }
    deleteBtn.onclick = () => {
        transactionAmount.value = null;
        transactionType.value = "income";
        removeAll("active-page");
        homePage.classList.add("active-page");
    }
    closeTransactionBtn.onclick = () => {
        transactionAmount.value = null;
        transactionType.value = "income";
        removeAll("active-page");
        homePage.classList.add("active-page");
    }
}