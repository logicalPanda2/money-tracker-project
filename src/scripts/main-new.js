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
    constructor(dom) {
        this.dom = dom;
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleHistoryEdit = this.handleHistoryEdit.bind(this);
        this.pages = Object.values(this.dom.pages);
        this.isCurrentlyEditing = false;
        this.editedTransaction = null;
    }

    static createMsg = "Add a new transaction";
    static editMsg = "Edit a transaction";
    static incorrectDeletionErrorMsg = "Cannot delete outside transaction editor:Press the close button to close this page";
    static overSpendingErrorMsg = "Cannot spend more than current balance";
    static overSpendingDeletionErrorMsg = "Cannot delete:Balance cannot be less than 0";
    static incorrectSyntaxErrorMsg = "Amount must be a number:Amount must be at least 1";

    initializeEventListeners() {
        const btns = Object.values(this.dom.pageButtons);
        btns.forEach((button, index) => {
            button.onclick = () => {
                View.moveToPage(this.pages[index], this.pages, this.dom.classNames.activeClass);
            }
        });

        this.dom.editingButtons.confirmBtn.addEventListener("click", this.handleConfirm);
        this.dom.editingButtons.deleteBtn.addEventListener("click", this.handleDelete);
        this.dom.editingButtons.closeTransactionBtn.addEventListener("click", this.handleClose);
        this.dom.containers.transactionHistoryContainer.addEventListener("click", this.handleHistoryEdit);
    }

    validateTransaction(type, amount) {
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

    handleConfirm() {
        View.removeErrors(this.dom.containers.errorMessageContainer);
        if(this.isCurrentlyEditing) {
            const temp = Model.globalBalance;
            const oldAmount = this.editedTransaction.amount;
            const oldType = this.editedTransaction.type;
            const newAmount = Number(this.dom.fields.transactionAmountField.value);
            const newType = this.dom.fields.transactionTypeField.value;
            Model.editBalance(oldType, newType, oldAmount, newAmount);
            if(Model.globalBalance < 0) {
                View.displayError(this.dom.containers.errorMessageContainer, Controller.overSpendingErrorMsg, this.dom.classNames.errorClass);
                Model.globalBalance = temp;
            } else {
                View.editTransactionMessage(this.editedTransaction.id, newType, newAmount);
                View.updateBalance(this.dom.fields.globalBalanceAmount, Model.globalBalance);
                View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
                View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
                this.editedTransaction.type = newType;
                this.editedTransaction.amount = newAmount;
                this.isCurrentlyEditing = false;
                this.editedTransaction = null;
            }
        } else {
            const type = this.dom.fields.transactionTypeField.value;
            const amount = Number(this.dom.fields.transactionAmountField.value);
            const errorObject = this.validateTransaction(type, amount);
            if(!errorObject.isValid) {
                View.displayError(this.dom.containers.errorMessageContainer, errorObject.message, this.dom.classNames.errorClass);
                return false;
            }
            const transaction = new Transaction(type, amount);
            this.createTransactionHistory(transaction);
            Model.transactions.push(transaction);
            Model.updateBalance(transaction);
            View.updateBalance(this.dom.fields.globalBalanceAmount, Model.globalBalance);
            View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
            View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
        }
    }

    handleDelete() {
        View.removeErrors(this.dom.containers.errorMessageContainer);
        if(this.isCurrentlyEditing) {
            const temp = Model.globalBalance;
            Model.revertBalance(this.editedTransaction);
            if(Model.globalBalance < 0) {
                Model.globalBalance = temp;
                View.displayError(this.dom.containers.errorMessageContainer, Controller.overSpendingDeletionErrorMsg, this.dom.classNames.errorClass);
                View.updateBalance(this.dom.fields.globalBalanceAmount, Model.globalBalance);
                return false;
            }
            View.updateBalance(this.dom.fields.globalBalanceAmount, Model.globalBalance);
            View.deleteTransaction(this.editedTransaction.id);
            View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
            View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
            this.isCurrentlyEditing = false;
            this.editedTransaction = null;
        } else {
            View.displayError(this.dom.containers.errorMessageContainer, Controller.incorrectDeletionErrorMsg, this.dom.classNames.errorClass);
        }
    }

    handleClose() {
        if(this.isCurrentlyEditing) {
            this.isCurrentlyEditing = false;
            this.editedTransaction = null;
        }
        View.removeErrors(this.dom.containers.errorMessageContainer);
        View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
        View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
    }

    handleHistoryEdit(event) {
        if(event.target.matches(".previousTransactionAmount")) {
            const transaction = Model.findTransaction(Number(event.target.id));
            View.moveToPage(this.dom.pages.transactionPage, this.pages, this.dom.classNames.activeClass);
            View.changeTransactionPageHeading(this.dom.pages.transactionPage, Controller.editMsg);
            this.dom.fields.transactionTypeField.value = transaction.type;
            this.dom.fields.transactionAmountField.value = transaction.amount;

            this.isCurrentlyEditing = true;
            this.editedTransaction = transaction;
        } else {
            return false;
        }
    }

    createTransactionHistory(transaction) {
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
        View.renderElement(this.dom.containers.transactionHistoryContainer, transactionElement);
    }
}

class View {
    static moveToPage(targetPage, pages, className) {
        View.removeAll(pages, className);
        targetPage.classList.add(className);
        targetPage.inert = false;
    }

    static removeAll(pages, className) {
        pages.forEach(page => {
            page.classList.remove(className);
            page.inert = true;
        });
    }

    static resetTransactionPage(page, amountField, typeField, heading) {
        console.log("resettpage");
        console.log(heading);
        amountField.value = null;
        typeField.value = "income";
        page.querySelector("h2").textContent = heading;
    }

    static changeTransactionPageHeading(page, heading) {
        console.log(page);
        console.log(heading);
        page.querySelector("h2").textContent = heading;
    }
    
    static updateBalance(balanceElement, balance) {
        balanceElement.textContent = `Balance: $${balance}`;
    }

    static displayError(errorContainer, messages, errorClass) {
        errorContainer.textContent = null;
        errorContainer.style.display = "block";
        errorContainer.hidden = false;
        const messagesArr = messages.split(":");
        messagesArr.forEach(message => {
            const errorMessage = document.createElement("p");
            errorMessage.classList.add(errorClass);
            errorMessage.textContent = message;
            this.renderElement(errorContainer, errorMessage);
        })
    }

    static removeErrors(errorContainer) {
        errorContainer.style.display = "none";
        errorContainer.hidden = true;
        errorContainer.textContent = null;
    }

    static renderElement(parent, child) {
        parent.appendChild(child);
    }

    static deleteTransaction(id, className) {
        document.getElementById(id).closest(className).style.display = "none";
        document.getElementById(id).closest(className).hidden = true;
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

const DOMReferences = {
    pages: {
        homePage: document.getElementById("homePage"),
        transactionPage: document.getElementById("transactionPage"),
        historyPage: document.getElementById("historyPage"),
    },
    pageButtons: {
        closeHistoryBtn: document.getElementById("closeHistoryBtn"),
        transactionBtn: document.getElementById("transactionBtn"),
        historyBtn: document.getElementById("historyBtn"),
    },
    editingButtons: {
        closeTransactionBtn: document.getElementById("closeTransactionBtn"),
        confirmBtn: document.getElementById("confirmBtn"),
        deleteBtn: document.getElementById("deleteBtn"),
    },
    fields: {
        globalBalanceAmount: document.getElementById("globalBalanceAmount"),
        transactionTypeField: document.getElementById("transactionTypeField"),
        transactionAmountField: document.getElementById("transactionAmountField"),
    },
    containers: {
        transactionHistoryContainer: document.getElementById("transactionHistory"),
        errorMessageContainer: document.getElementById("errorMessageContainer"),
    },
    selectors: {
        transactionHistoryClass: ".previousTransaction",
    }, 
    classNames: {
        activeClass: "active-page",
        errorClass: "errorMessage",
    }
}

const controller = new Controller(DOMReferences);
controller.initializeEventListeners();