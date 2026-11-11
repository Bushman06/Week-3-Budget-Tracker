import { initAccount, api, showPhoto } from './account.js';
import { createAmountVisibility, linkAmountVisibility } from './privacy.js';
let signedIn = false;
let ready = false;
let preferredCurrency = 'KSh';
let saveQueue = Promise.resolve();
const dashboardContent = document.getElementById('overview');
dashboardContent.hidden = true;


// ======================================
// SPENDWISE - INTERACTIVE BUDGET TRACKER
// ======================================

// 1. VARIABLES AND APPLICATION DATA

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;

let expenses = [];

try {
    const savedExpenses = JSON.parse(
        localStorage.getItem("expenses") || "[]"
    );

    expenses = Array.isArray(savedExpenses) ? savedExpenses : [];
} catch (error) {
    expenses = [];
}

const budgetAmount = document.getElementById("budgetAmount");
const totalExpenses = document.getElementById("totalExpenses");
const remainingBalance = document.getElementById("remainingBalance");
let privacySaveQueue = Promise.resolve();
const amountVisibility = createAmountVisibility({
    root: document.documentElement,
    amounts: [remainingBalance, budgetAmount, totalExpenses],
    controls: [document.getElementById('toggleAmounts')],
    onChange(hidden) {
        linkAmountVisibility(hidden, document);
        const status = document.getElementById('amountVisibilityMessage');
        status.textContent = hidden ? 'Financial amounts are hidden.' : 'Financial amounts are visible.';
        if (signedIn) {
            privacySaveQueue = privacySaveQueue.then(() => api('profile', {
                method: 'PATCH', body: JSON.stringify({ hideAmounts: hidden })
            })).catch(() => { status.textContent = 'Display updated. Unable to save your preference; try the control again.'; });
        }
    }
});
amountVisibility.setHidden(new URLSearchParams(location.search).get('hideAmounts') === 'true');
linkAmountVisibility(amountVisibility.isHidden(), document);


const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseCategory = document.getElementById("expenseCategory");
const expenseAmount = document.getElementById("expenseAmount");

const transactionList = document.getElementById("transactionList");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const message = document.getElementById("message");

const budgetStatus = document.getElementById("budgetStatus");
const budgetProgress = document.getElementById("budgetProgress");
const spendingPercentage = document.getElementById("spendingPercentage");
const categorySummary = document.getElementById("categorySummary");

// 2. FORMAT CURRENCY

function formatMoney(amount) {
    return preferredCurrency + " " + amount.toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 3. CALCULATE TOTAL EXPENSES USING A LOOP

function calculateTotalExpenses() {
    let total = 0;

    for (const expense of expenses) {
        total += expense.amount;
    }

    return total;
}

// 4. CALCULATE REMAINING BALANCE

function calculateBalance(budget, total) {
    return budget - total;
}

// 5. CHECK BUDGET STATUS USING CONDITIONALS

function checkBudgetStatus(balance, total) {
    if (monthlyBudget === 0) {
        budgetStatus.textContent =
            "Please set your monthly budget to get started.";
        budgetStatus.style.color = "#666666";

    } else if (balance < 0) {
        budgetStatus.textContent =
            "Warning! You have exceeded your monthly budget.";
        budgetStatus.style.color = "#d32f2f";

    } else if (total / monthlyBudget >= 0.8) {
        budgetStatus.textContent =
            "Careful! You have used 80% or more of your budget.";
        budgetStatus.style.color = "#ed8b00";

    } else {
        budgetStatus.textContent =
            "Great! Your spending is within your budget.";
        budgetStatus.style.color = "#2e7d32";
    }
}

// 6. DISPLAY BUDGET PROGRESS

function updateBudgetProgress(total) {
    let percentage = 0;

    if (monthlyBudget > 0) {
        percentage = (total / monthlyBudget) * 100;
    }

    // Keep the visual progress bar between 0% and 100%
    const displayedPercentage = Math.min(percentage, 100);

    budgetProgress.style.width = displayedPercentage + "%";

    if (percentage >= 100) {
        budgetProgress.style.backgroundColor = "#d32f2f";
    } else if (percentage >= 80) {
        budgetProgress.style.backgroundColor = "#ed8b00";
    } else {
        budgetProgress.style.backgroundColor = "#2e7d32";
    }

    spendingPercentage.textContent =
        percentage.toFixed(1) + "% of budget used";
}

// 7. GROUP EXPENSES BY CATEGORY

function displayCategorySummary() {
    categorySummary.innerHTML = "";

    if (expenses.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No expenses recorded yet.";
        categorySummary.appendChild(item);
        return;
    }

    const categoryTotals = {};

    // Loop through all expenses and group them
    for (const expense of expenses) {
        if (categoryTotals[expense.category] === undefined) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += expense.amount;
    }

    // Display each category and its total
    for (const category in categoryTotals) {
        const item = document.createElement("li");

        item.textContent =
            category + ": " + formatMoney(categoryTotals[category]);

        categorySummary.appendChild(item);
    }
}

// 8. DISPLAY EXPENSE RECORDS IN THE TABLE

function displayTransactions() {
    transactionList.innerHTML = "";

    if (expenses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No expenses recorded yet.";

        row.appendChild(cell);
        transactionList.appendChild(row);
        return;
    }

    // Loop through every expense in the array
    for (const expense of expenses) {
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
    }
}

// 9. UPDATE THE WHOLE DASHBOARD

function updateDashboard() {
    const total = calculateTotalExpenses();
    const balance = calculateBalance(monthlyBudget, total);

    amountVisibility.setAmount(budgetAmount, formatMoney(monthlyBudget));
    amountVisibility.setAmount(totalExpenses, formatMoney(total));
    amountVisibility.setAmount(remainingBalance, formatMoney(balance));

    remainingBalance.style.color =
        balance < 0 ? "#d32f2f" : "#2e7d32";

    checkBudgetStatus(balance, total);
    updateBudgetProgress(total);
    displayTransactions();
    displayCategorySummary();

    if (ready) {
        if (signedIn) {
            const body = JSON.stringify({ monthlyBudget, expenses });
            saveQueue = saveQueue.then(() => api('finances', { method: 'PUT', body })).catch(error => {
                message.textContent = error.message + ' Your latest changes have not been saved. Reloading may lose them.';
                message.style.color = '#d32f2f';
            });
        } else {
            localStorage.setItem('monthlyBudget', monthlyBudget);
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }
    }
}

// 10. ADD A NEW EXPENSE THROUGH THE FORM

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const category = expenseCategory.value;
    const amount = Number(expenseAmount.value);

    if (
        name === "" ||
        category === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        message.textContent =
            "Please enter a valid name, category, and amount.";
        message.style.color = "#d32f2f";
        return;
    }

    // Create an expense object
    const newExpense = {
        id: Date.now(),
        name: name,
        category: category,
        amount: amount
    };

    // Store the new expense in the array
    expenses.push(newExpense);

    updateDashboard();

    expenseForm.reset();

    message.textContent = "Expense added successfully!";
    message.style.color = "#2e7d32";
});

// 11. DELETE AN EXPENSE

function deleteExpense(expenseId) {
    expenses = expenses.filter(function (expense) {
        return expense.id !== expenseId;
    });

    updateDashboard();

    message.textContent = "Expense deleted successfully!";
    message.style.color = "#2e7d32";
}

// 12. SET MONTHLY BUDGET

setBudgetBtn.addEventListener("click", function () {
    const userInput = prompt(
        "Enter your monthly budget in KSh:"
    );

    if (userInput === null) {
        return;
    }

    const newBudget = Number(userInput);

    if (
        userInput.trim() === "" ||
        !Number.isFinite(newBudget) ||
        newBudget <= 0
    ) {
        alert("Please enter a valid budget greater than zero.");
        return;
    }

    monthlyBudget = newBudget;

    updateDashboard();

    message.textContent = "Your monthly budget has been updated!";
    message.style.color = "#2e7d32";
});

// 13. LOAD SAVED DATA WHEN THE PAGE OPENS

async function startDashboard() {
    try {
        const user = await initAccount();
        if (user) {
            signedIn = true;
            const [profile, finances] = await Promise.all([api('profile'), api('finances')]);
            monthlyBudget = finances.monthlyBudget;
            expenses = finances.expenses;
            preferredCurrency = profile.currency;
            amountVisibility.setHidden(profile.hideAmounts);
            linkAmountVisibility(profile.hideAmounts, document);
            document.getElementById('dashboardName').textContent = profile.fullName || 'Your account';
            document.getElementById('accountLink').textContent = 'Manage profile';
            showPhoto(profile, document.getElementById('dashboardPhoto'), document.getElementById('dashboardInitial'));
        }
        updateDashboard();
        ready = true;
        dashboardContent.hidden = false;
    } catch {
        dashboardContent.hidden = false;
        // Never fall back to a guest's records when loading a signed-in account fails.
        monthlyBudget = 0; expenses = [];
        updateDashboard();
        expenseForm.querySelectorAll('input, select, button').forEach(element => { element.disabled = true; });
        setBudgetBtn.disabled = true;
        message.textContent = 'Unable to load your account. Reload to try again, or open Settings to sign in.';
        message.style.color = '#d32f2f';
    }
}
startDashboard();
