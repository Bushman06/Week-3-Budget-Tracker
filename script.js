
// ======================================
// SPENDWISE - BUDGET TRACKER
// ======================================

// 1. APPLICATION DATA
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// 2. SELECT HTML ELEMENTS
const budgetAmount = document.getElementById("budgetAmount");
const totalExpenses = document.getElementById("totalExpenses");
const remainingBalance = document.getElementById("remainingBalance");

const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseCategory = document.getElementById("expenseCategory");
const expenseAmount = document.getElementById("expenseAmount");

const transactionList = document.getElementById("transactionList");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const message = document.getElementById("message");

// 3. FORMAT MONEY
function formatMoney(amount) {
    return "KSh " + amount.toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 4. CALCULATE TOTAL EXPENSES
function calculateTotalExpenses() {
    return expenses.reduce((total, expense) => {
        return total + expense.amount;
    }, 0);
}

// 5. CALCULATE REMAINING BALANCE
function calculateBalance(budget, expenseTotal) {
    return budget - expenseTotal;
}

// 6. UPDATE DASHBOARD
function updateDashboard() {
    const total = calculateTotalExpenses();
    const balance = calculateBalance(monthlyBudget, total);

    budgetAmount.textContent = formatMoney(monthlyBudget);
    totalExpenses.textContent = formatMoney(total);
    remainingBalance.textContent = formatMoney(balance);

    // Show warning when spending exceeds the budget
    remainingBalance.style.color =
        balance < 0 ? "#d32f2f" : "#2e7d32";

    // Save information in the browser
    localStorage.setItem("monthlyBudget", monthlyBudget);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    displayTransactions();

    // Display results in the browser console
    console.clear();
    console.log("===== SPENDWISE BUDGET REPORT =====");
    console.log("Monthly Budget:", formatMoney(monthlyBudget));
    console.log("Total Expenses:", formatMoney(total));
    console.log("Remaining Balance:", formatMoney(balance));
}

// 7. DISPLAY EXPENSES IN THE TABLE
function displayTransactions() {
    transactionList.innerHTML = "";

    if (expenses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No expenses added yet.";
        row.appendChild(cell);
        transactionList.appendChild(row);

        return;
    }

    expenses.forEach((expense) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = expense.name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const amountCell = document.createElement("td");
        amountCell.textContent = formatMoney(expense.amount);

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.className = "delete-expense";

        deleteButton.addEventListener("click", function () {
            deleteExpense(expense.id);
        });

        actionCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(amountCell);
        row.appendChild(actionCell);

        transactionList.appendChild(row);
    });
}

// 8. ADD A NEW EXPENSE
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const category = expenseCategory.value;
    const amount = Number(expenseAmount.value);

    if (!name || !category || !Number.isFinite(amount) || amount <= 0) {
        message.textContent = "Please enter valid expense details.";
        message.style.color = "#d32f2f";
        return;
    }

    const newExpense = {
        id: Date.now(),
        name: name,
        category: category,
        amount: amount
    };

    expenses.push(newExpense);

    updateDashboard();

    expenseForm.reset();

    message.textContent = "Expense added successfully!";
    message.style.color = "#2e7d32";
});

// 9. DELETE AN EXPENSE
function deleteExpense(expenseId) {
    expenses = expenses.filter(function (expense) {
        return expense.id !== expenseId;
    });

    updateDashboard();

    message.textContent = "Expense deleted successfully!";
    message.style.color = "#2e7d32";
}

// 10. SET MONTHLY BUDGET USING A PROMPT
setBudgetBtn.addEventListener("click", function () {
    const userInput = prompt("Enter your monthly budget in KSh:");

    // Cancelled prompt
    if (userInput === null) {
        return;
    }

    const newBudget = Number(userInput);

    if (userInput.trim() === "" ||
        !Number.isFinite(newBudget) ||
        newBudget < 0) {

        alert("Please enter a valid budget amount.");
        return;
    }

    monthlyBudget = newBudget;

    updateDashboard();

    message.textContent = "Monthly budget updated successfully!";
    message.style.color = "#2e7d32";
});

// 11. LOAD SAVED DATA WHEN THE PAGE OPENS
updateDashboard();
