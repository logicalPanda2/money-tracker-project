const balanceAmount = document.getElementById("balanceAmount");
const transactionType = document.getElementById("transactionType");
const transactionAmount = document.getElementById("transactionAmount");
const transactionHistory = document.getElementById("transactionHistory");
let balance = 0;

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
    updateBalance(type, amount);
    updateHistory(type, amount);
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
}