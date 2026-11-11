
# SpendWise - Personal Budget Tracker

## About the Project

SpendWise is a personal budget and expense tracking application
that helps users manage their money.

Users can set a monthly budget, record their expenses,
calculate their remaining balance, and monitor their spending.

## Features

- Set a monthly budget.
- Add expenses with names, categories, and amounts.
- Calculate total expenses automatically.
- Calculate the remaining budget.
- Display expenses in a transactions table.
- Delete expenses.
- Save budget information using browser localStorage.
- Display budget calculations in the browser console.

## JavaScript Concepts Implemented

### 1. Variables

The project uses `let` and `const` to store information.

- `monthlyBudget` stores the user's monthly budget.
- `expenses` stores the list of expenses.
- `total` stores the calculated expenses.
- `balance` stores the remaining money.

### 2. Data Types

The project uses:

- Numbers for budgets and expenses.
- Strings for expense names and categories.
- Arrays to store multiple expenses.
- Objects to represent individual expenses.

### 3. User Input

The application collects information through:

- HTML input fields for expense names and amounts.
- A dropdown menu for expense categories.
- JavaScript `prompt()` for setting the monthly budget.

### 4. Budget Calculations

The application calculates total expenses by adding all recorded expenses.

It calculates the remaining balance using:

Remaining Balance = Monthly Budget - Total Expenses

### 5. Functions

The project uses reusable functions:

- `formatMoney()` formats amounts as Kenyan Shillings.
- `calculateTotalExpenses()` calculates all expenses.
- `calculateBalance()` calculates the remaining balance.
- `updateDashboard()` updates the dashboard.
- `displayTransactions()` displays recorded expenses.
- `deleteExpense()` removes an expense.

### 6. Events

JavaScript event listeners respond to user actions,
including adding expenses, setting a budget, and deleting expenses.

### 7. Local Storage

The application uses browser localStorage to save the budget
and expenses so that they remain available after refreshing the page.

## Technologies Used

- HTML5
- CSS3
- JavaScript

## Project Files

- `index.html` - Application structure.
- `style.css` - Application design and layout.
- `script.js` - Application logic and calculations.
- `README.md` - Project documentation.

## How to Run the Project

1. Download or clone the repository.
2. Open the project folder in VS Code.
3. Open `index.html` in your browser.
4. Click Set Monthly Budget.
5. Enter your budget.
6. Add expenses using the form.
7. View your updated balance and transactions.

## Author

SpendWise Budget Tracker Project