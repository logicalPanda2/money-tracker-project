class Transaction {
    static id = 0;

    constructor(type, amount) {
        this.id = null;
        this.type = type;
        this.amount = amount;
        this.date = null;
        this.month = null;
        this.year = null;
        this.hour = null;
        this.minutes = null;
        this.seconds = null;
        this.dateLong = null;
        this.time = null;
        this.options = {
            year: "numeric",
            month: "long",
            day: "numeric",
        }

        this.initializeDateAndTime();
        this.initializeId();
        this.updateLocalStorageId();
    }

    initializeDateAndTime() {
        const dateObj = new Date();
        this.date = dateObj.getDate();
        this.month = dateObj.getMonth() + 1;
        this.year = dateObj.getFullYear();
        this.hour = dateObj.getHours();
        this.minutes = dateObj.getMinutes();
        this.seconds = dateObj.getSeconds();
        const paddedHour = String(this.hour).padStart(2, "0");
        const paddedMinutes = String(this.minutes).padStart(2, "0");
        const dateLong = dateObj.toLocaleString(undefined, this.options);
        const time = `${paddedHour}:${paddedMinutes}`;
        
        this.dateLong = dateLong;
        this.time = time;
    }

    initializeId() {
        const idString = localStorage.getItem("transactionId");
        const id = Number(idString);
        if(id !== null) {
            Transaction.id = id;
        }
        this.id = Transaction.id;
    }

    updateLocalStorageId() {
        Transaction.id += 1;
        localStorage.setItem("transactionId", Transaction.id);
    }
}

class Controller {
    constructor(dom, model) {
        this.dom = dom;
        this.model = model;
        this.pages = Object.values(this.dom.pages);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleHistoryEdit = this.handleHistoryEdit.bind(this);
        this.handleManualUpdate = this.handleManualUpdate.bind(this);
        this.handleManualUpdateClose = this.handleManualUpdateClose.bind(this);
        this.handleWindowLoad = this.handleWindowLoad.bind(this);
        this.isCurrentlyEditing = false;
        this.editedTransaction = null;
        this.latestDate = null;
    }

    static createMsg = "Add a new transaction";
    static manualUpdateMsg = "Update balance manually";
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
        this.dom.editingButtons.manualUpdateConfirmBtn.addEventListener("click", this.handleManualUpdate);
        this.dom.editingButtons.deleteBtn.addEventListener("click", this.handleDelete);
        this.dom.editingButtons.closeTransactionBtn.addEventListener("click", this.handleClose);
        this.dom.editingButtons.closeManualUpdateBtn.addEventListener("click", this.handleManualUpdateClose);
        this.dom.containers.transactionHistoryContainer.addEventListener("click", this.handleHistoryEdit);
        window.addEventListener("load", this.handleWindowLoad);
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
        if(type === "expense" && amount > this.model.globalBalance) {
            errorObject.message = Controller.overSpendingErrorMsg;
            errorObject.isValid = false;
        }

        return errorObject;
    }

    handleConfirm() {
        View.removeErrors(this.dom.containers.errorMessageContainer);
        if(this.isCurrentlyEditing) {
            const temp = this.model.globalBalance;
            const oldAmount = this.editedTransaction.amount;
            const oldType = this.editedTransaction.type;
            const newAmount = Number(this.dom.fields.transactionAmountField.value);
            const newType = this.dom.fields.transactionTypeField.value;
            this.model.editBalance(oldType, newType, oldAmount, newAmount);
            if(this.model.globalBalance < 0) {
                View.displayError(this.dom.containers.errorMessageContainer, Controller.overSpendingErrorMsg, this.dom.classNames.errorClass);
                this.model.globalBalance = temp;
            } else {
                View.editTransactionMessage(this.editedTransaction.id, newType, newAmount);
                View.updateBalance(this.dom.fields.globalBalanceAmount, this.model.globalBalance);
                View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
                View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
                this.editedTransaction.type = newType;
                this.editedTransaction.amount = newAmount;
                this.model.updateLocalStorageTransactions();
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
            this.model.transactions.push(transaction);
            this.model.updateBalance(transaction);
            this.model.updateLocalStorageTransactions();
            View.updateBalance(this.dom.fields.globalBalanceAmount, this.model.globalBalance);
            View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
            View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
        }
    }

    handleDelete() {
        View.removeErrors(this.dom.containers.errorMessageContainer);
        if(this.isCurrentlyEditing) {
            const temp = this.model.globalBalance;
            this.model.revertBalance(this.editedTransaction);
            if(this.model.globalBalance < 0) {
                this.model.globalBalance = temp;
                View.displayError(this.dom.containers.errorMessageContainer, Controller.overSpendingDeletionErrorMsg, this.dom.classNames.errorClass);
                View.updateBalance(this.dom.fields.globalBalanceAmount, this.model.globalBalance);
                return false;
            }
            View.updateBalance(this.dom.fields.globalBalanceAmount, this.model.globalBalance);
            View.deleteTransaction(this.editedTransaction.id, this.dom.selectors.transactionHistoryClass);
            this.model.deleteTransaction(this.editedTransaction.id);
            this.model.updateLocalStorageTransactions();
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
        if(event.target.matches(this.dom.selectors.transactionAmountClass)) {
            const transaction = this.model.findTransaction(Number(event.target.id));
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

    handleManualUpdate() {
        const type = this.dom.fields.manualUpdateTypeField.value;
        const amount = Number(this.dom.fields.manualUpdateAmountField.value);
        const errorObject = this.validateTransaction(type, amount);
        if(!errorObject.isValid) {
            View.displayError(this.dom.containers.manualUpdateErrorMessageContainer, errorObject.message, this.dom.classNames.errorClass);
            return false;
        }
        const transaction = new Transaction(type, amount);
        this.model.updateBalance(transaction);
        View.updateBalance(this.dom.fields.globalBalanceAmount, this.model.globalBalance);
        View.resetTransactionPage(this.dom.pages.transactionPage, this.dom.fields.transactionAmountField, this.dom.fields.transactionTypeField, Controller.createMsg);
        View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
    }

    handleManualUpdateClose() {
        View.removeErrors(this.dom.containers.errorMessageContainer);
        View.resetTransactionPage(this.dom.pages.manualUpdatePage, this.dom.fields.manualUpdateAmountField, this.dom.fields.manualUpdateTypeField, Controller.manualUpdateMsg);
        View.moveToPage(this.dom.pages.homePage, this.pages, this.dom.classNames.activeClass);
    }

    createTransactionHistory(transaction) {
        const transactionElement = document.createElement("div");
        const amountElement = document.createElement("button");
        const timeElement = document.createElement("div");
        transactionElement.classList.add(this.dom.classNames.transactionHistory);
        amountElement.id = transaction.id;
        amountElement.classList.add(this.dom.classNames.transactionAmount);
        timeElement.classList.add(this.dom.classNames.transactionTime);
        if(transaction.type === "income") {
            amountElement.textContent = `+$${transaction.amount}`; 
        } else {
            amountElement.textContent = `-$${transaction.amount}`;
        }
        if(transaction.date !== this.latestDate) {
            this.latestDate = transaction.date;
            const heading = document.createElement("p");
            heading.classList.add(this.dom.classNames.transactionHistoryDateGroup);
            heading.textContent = `${transaction.dateLong}`;
            View.renderElement(this.dom.containers.transactionHistoryContainer, heading);
        }
        timeElement.textContent = transaction.time;
        transactionElement.appendChild(amountElement);
        transactionElement.appendChild(timeElement); 
        View.renderElement(this.dom.containers.transactionHistoryContainer, transactionElement);
    }

    handleWindowLoad() {
        const balanceString = localStorage.getItem("balance");
        const balance = Number(balanceString);
        const transactionsString = localStorage.getItem("transactions");
        const transactions = JSON.parse(transactionsString);

        if(balance !== null) {
            this.model.globalBalance = balance;
            View.updateBalance(this.dom.fields.globalBalanceAmount, this.model.globalBalance);
        }
        if(transactions !== null) {
            this.model.transactions = transactions;
            for(const transaction of transactions) {
                this.createTransactionHistory(transaction);
            }
        }
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
        amountField.value = null;
        typeField.value = "income";
        page.querySelector("h2").textContent = heading;
    }

    static changeTransactionPageHeading(page, heading) {
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
        document.getElementById(id).closest(className).remove();
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
    constructor() {
        this.transactions = [];
        this.globalBalance = 0;
    }

    updateBalance(transaction) {
        if(transaction.type === "income") {
            this.globalBalance += transaction.amount;
        } else {
            this.globalBalance -= transaction.amount;
        }
        this.updateLocalStorageBalance();
    }

    revertBalance(transaction) {
        if(transaction.type === "income") {
            this.globalBalance -= transaction.amount;
        } else {
            this.globalBalance += transaction.amount;
        }
        this.updateLocalStorageBalance();
    }

    findTransaction(id) {
        return this.transactions.find(object => object.id === id);
    }

    editBalance(oldType, newType, oldAmount, newAmount) {
        if(oldType === "income") {
            this.globalBalance -= oldAmount;
        } else {
            this.globalBalance += oldAmount;
        }
        if(newType === "income") {
            this.globalBalance += newAmount;
        } else {
            this.globalBalance -= newAmount;
        }
        this.updateLocalStorageBalance();
    }

    updateLocalStorageBalance() {
        localStorage.setItem("balance", this.globalBalance);
    }

    updateLocalStorageTransactions() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }

    deleteTransaction(id) {
        const updatedTransactions = this.transactions.filter(transaction => transaction.id !== id);
        this.transactions = updatedTransactions;
    }
}

const DOMReferences = {
    pages: {
        homePage: document.getElementById("homePage"),
        transactionPage: document.getElementById("transactionPage"),
        historyPage: document.getElementById("historyPage"),
        manualUpdatePage: document.getElementById("manualUpdatePage"),
    },
    pageButtons: {
        closeHistoryBtn: document.getElementById("closeHistoryBtn"),
        transactionBtn: document.getElementById("transactionBtn"),
        historyBtn: document.getElementById("historyBtn"),
        manualUpdateBtn: document.getElementById("manualUpdateBtn"),
    },
    editingButtons: {
        closeTransactionBtn: document.getElementById("closeTransactionBtn"),
        confirmBtn: document.getElementById("confirmBtn"),
        deleteBtn: document.getElementById("deleteBtn"),
        manualUpdateConfirmBtn: document.getElementById("manualUpdateConfirmBtn"),
        closeManualUpdateBtn: document.getElementById("closeManualUpdateBtn"),
    },
    fields: {
        globalBalanceAmount: document.getElementById("globalBalanceAmount"),
        transactionTypeField: document.getElementById("transactionTypeField"),
        transactionAmountField: document.getElementById("transactionAmountField"),
        manualUpdateTypeField: document.getElementById("manualUpdateTypeField"),
        manualUpdateAmountField: document.getElementById("manualUpdateAmountField"),
    },
    containers: {
        transactionHistoryContainer: document.getElementById("transactionHistory"),
        errorMessageContainer: document.getElementById("errorMessageContainer"),
        manualUpdateErrorMessageContainer: document.getElementById("manualUpdateErrorMessageContainer"),
    },
    selectors: {
        transactionHistoryClass: ".previousTransaction",
        transactionAmountClass: ".previousTransactionAmount",
    }, 
    classNames: {
        activeClass: "active-page",
        errorClass: "errorMessage",
        transactionHistory: "previousTransaction",
        transactionHistoryDateGroup: "transactionHistoryDateGroup",
        transactionAmount: "previousTransactionAmount",
        transactionTime: "previousTransactionTime",
    }
}
const model = new Model();
const controller = new Controller(DOMReferences, model);

controller.initializeEventListeners();