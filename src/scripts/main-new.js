class DOMReferences {
    static homePage = document.getElementById("homePage");
    static transactionPage = document.getElementById("transactionPage");
    static historyPage = document.getElementById("historyPage");
    static transactionBtn = document.getElementById("transactionBtn");
    static historyBtn = document.getElementById("historyBtn");
    static closeTransactionBtn = document.getElementById("closeTransactionBtn");
    static closeHistoryBtn = document.getElementById("closeHistoryBtn");
    static confirmBtn = document.getElementById("confirmBtn");
    static deleteBtn = document.getElementById("deleteBtn");
    static globalBalanceAmount = document.getElementById("globalBalanceAmount");
    static transactionTypeField = document.getElementById("transactionTypeField");
    static transactionAmountField = document.getElementById("transactionAmountField");
    static transactionHistory = document.getElementById("transactionHistory");
    static errorMessageContainer = document.getElementById("errorMessageContainer");

    static pages = [homePage, transactionPage, historyPage];
    static buttons = [closeHistoryBtn, transactionBtn, historyBtn];
}

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
        const date = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
        const time = `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
        
        this.date = date;
        this.time = time;
    }

    initializeId() {
        this.id = Transaction.id;
        Transaction.id += 1;
    }
}

class Controller {
    static isCurrentlyEditing = false;
    static editedTransaction = null;
    static createMsg = "Add a new transaction";
    static editMsg = "Edit a transaction";
    static incorrectDeletionErrorMsg = "Cannot delete outside transaction editor:Press the close button to close this page";
    static overSpendingErrorMsg = "Cannot spend more than current balance";
    static overSpendingDeletionErrorMsg = "Cannot delete:Balance cannot be less than 0";
    static incorrectSyntaxErrorMsg = "Amount must be a number:Amount must be at least 1";

    static initializeEventListeners() {
        DOMReferences.buttons.forEach((button, index) => {
            button.onclick = () => {
                View.moveToPage(DOMReferences.pages[index]);
            }
        });

        DOMReferences.confirmBtn.addEventListener("click", Controller.handleConfirm);
        DOMReferences.deleteBtn.addEventListener("click", Controller.handleDelete);
        DOMReferences.closeTransactionBtn.addEventListener("click", Controller.handleClose);
        DOMReferences.transactionHistory.addEventListener("click", Controller.handleHistoryEdit);
    }

    static validateTransaction(type, amount) {
        const errorObject = {
            isValid: true,
            message: "",
        }

        if(amount <= 0 || isNaN(amount)) {
            errorObject.message = Controller.incorrectSyntaxErrorMsg;
            errorObject.isValid = false;
        }
        if(type === "expense" && amount > Model.globalBalance) {
            errorObject.message = Controller.overSpendingErrorMsg;
            errorObject.isValid = false;
        }

        return errorObject;
    }

    static handleConfirm() {
        View.removeErrors();
        if(Controller.isCurrentlyEditing) {
            const temp = Model.globalBalance;
            const oldAmount = Controller.editedTransaction.amount;
            const oldType = Controller.editedTransaction.type;
            const newAmount = Number(DOMReferences.transactionAmountField.value);
            const newType = DOMReferences.transactionTypeField.value;
            Model.editBalance(oldType, newType, oldAmount, newAmount);
            if(Model.globalBalance < 0) {
                View.displayError(Controller.overSpendingErrorMsg);
                Model.globalBalance = temp;
            } else {
                View.editTransactionMessage(Controller.editedTransaction.id, newType, newAmount);
                View.updateBalance(Model.globalBalance);
                View.resetTransactionPage();
                View.moveToPage(DOMReferences.homePage);
                Controller.editedTransaction.type = newType;
                Controller.editedTransaction.amount = newAmount;
                Controller.isCurrentlyEditing = false;
                Controller.editedTransaction = null;
            }
        } else {
            const type = DOMReferences.transactionTypeField.value;
            const amount = Number(DOMReferences.transactionAmountField.value);
            const errorObject = Controller.validateTransaction(type, amount);
            if(!errorObject.isValid) {
                View.displayError(errorObject.message);
                return false;
            }
            const transaction = new Transaction(type, amount);
            Controller.createTransactionHistory(transaction);
            Model.transactions.push(transaction);
            Model.updateBalance(transaction);
            View.updateBalance(Model.globalBalance);
            View.resetTransactionPage();
            View.moveToPage(DOMReferences.homePage);
        }
    }

    static handleDelete() {
        View.removeErrors();
        if(Controller.isCurrentlyEditing) {
            const temp = Model.globalBalance;
            Model.revertBalance(Controller.editedTransaction);
            if(Model.globalBalance < 0) {
                Model.globalBalance = temp;
                View.displayError(Controller.overSpendingDeletionErrorMsg);
                View.updateBalance(Model.globalBalance);
                return false;
            }
            View.updateBalance(Model.globalBalance);
            View.deleteTransaction(Controller.editedTransaction.id);
            View.resetTransactionPage();
            View.moveToPage(DOMReferences.homePage);
            Controller.isCurrentlyEditing = false;
            Controller.editedTransaction = null;
        } else {
            View.displayError(Controller.incorrectDeletionErrorMsg);
        }
    }

    static handleClose() {
        if(Controller.isCurrentlyEditing) {
            Controller.isCurrentlyEditing = false;
            Controller.editedTransaction = null;
        }
        View.removeErrors();
        View.resetTransactionPage();
        View.moveToPage(DOMReferences.homePage);
    }

    static handleHistoryEdit(event) {
        if(event.target.matches(".previousTransactionAmount")) {
            const transaction = Model.findTransaction(Number(event.target.id));
            View.moveToPage(DOMReferences.transactionPage);
            View.changeTransactionPageHeading(Controller.editMsg);
            DOMReferences.transactionTypeField.value = transaction.type;
            DOMReferences.transactionAmountField.value = transaction.amount;

            Controller.isCurrentlyEditing = true;
            Controller.editedTransaction = transaction;
        } else {
            return false;
        }
    }

    static createTransactionHistory(transaction) {
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
        View.renderElement(DOMReferences.transactionHistory, transactionElement);
    }
}

class View {
    static moveToPage(page) {
        View.removeAll("active-page");
        page.classList.add("active-page");
        page.inert = false;
    }

    static removeAll(className) {
        DOMReferences.pages.forEach(page => {
            page.classList.remove(className);
            page.inert = true;
        });
    }

    static resetTransactionPage() {
        DOMReferences.transactionAmountField.value = null;
        DOMReferences.transactionTypeField.value = "income";
        DOMReferences.transactionPage.querySelector("h2").textContent = "Add a new transaction";
    }

    static changeTransactionPageHeading(message) {
        DOMReferences.transactionPage.querySelector("h2").textContent = message;
    }
    
    static updateBalance(balance) {
        DOMReferences.globalBalanceAmount.textContent = `Balance: $${balance}`;
    }

    static displayError(messages) {
        DOMReferences.errorMessageContainer.textContent = null;
        DOMReferences.errorMessageContainer.style.display = "block";
        DOMReferences.errorMessageContainer.hidden = false;
        const messagesArr = messages.split(":");
        messagesArr.forEach(message => {
            const errorMessage = document.createElement("p");
            errorMessage.classList.add("errorMessage");
            errorMessage.textContent = message;
            this.renderElement(DOMReferences.errorMessageContainer, errorMessage);
        })
    }

    static removeErrors() {
        DOMReferences.errorMessageContainer.style.display = "none";
        DOMReferences.errorMessageContainer.hidden = true;
        DOMReferences.errorMessageContainer.textContent = null;
    }

    static renderElement(parent, child) {
        parent.appendChild(child);
    }

    static deleteTransaction(id) {
        document.getElementById(id).closest(".previousTransaction").style.display = "none";
        document.getElementById(id).closest(".previousTransaction").hidden = true;
    }

    static editTransactionMessage(id, type, amount) {
        if(type === "income") {
            document.getElementById(id).textContent = `+$${amount}`;
        } else {
            document.getElementById(id).textContent = `-$${amount}`;
        }
    }
}

class Model {
    static transactions = [];
    static globalBalance = 0;

    static updateBalance(transaction) {
        if(transaction.type === "income") {
            Model.globalBalance += transaction.amount;
        } else {
            Model.globalBalance -= transaction.amount;
        }
    }

    static revertBalance(transaction) {
        if(transaction.type === "income") {
            Model.globalBalance -= transaction.amount;
        } else {
            Model.globalBalance += transaction.amount;
        }
    }

    static findTransaction(id) {
        return Model.transactions.find(object => object.id === id);
    }

    static editBalance(oldType, newType, oldAmount, newAmount) {
        if(oldType === "income") {
            Model.globalBalance -= oldAmount;
        } else {
            Model.globalBalance += oldAmount;
        }
        if(newType === "income") {
            Model.globalBalance += newAmount;
        } else {
            Model.globalBalance -= newAmount;
        }
    }
}

Controller.initializeEventListeners();