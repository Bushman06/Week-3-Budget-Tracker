
# SpendWise - Interactive Budget Tracker

## Project Overview

SpendWise is a personal budget and expense tracking application
built to help users manage their monthly income and expenses.

Users can set a budget, add expenses, monitor spending,
and view their remaining balance.

## Improvements Made This Week

- Added conditional statements for budget warnings.
- Used arrays to store multiple expense records.
- Used loops to process expense information.
- Added automatic expense categorization.
- Added a dynamic spending progress bar.
- Updated dashboard information using DOM manipulation.
- Added event listeners for buttons and forms.
- Added localStorage to save user information.

## JavaScript Concepts Implemented

### 1. Conditional Statements

The project uses if, else if, and else to make decisions.

Examples:
- Warn users when they exceed their budget.
- Alert users when they have used 80% of their budget.
- Display a positive message when spending is within budget.
- Validate expense information before saving it.

### 2. Arrays

The expenses array stores multiple expense records.

Each expense is an object containing:
- An ID
- Expense name
- Category
- Amount

Example:

    let expenses = [
        {
            id: 1,
            name: "Lunch",
            category: "Food",
            amount: 500
        }
    ];

### 3. Loops

The project uses for...of loops to:
- Calculate total expenses.
- Display expense records.
- Group expenses by category.

### 4. DOM Manipulation

The application uses JavaScript DOM methods to update
the webpage without refreshing it.

Examples:
- textContent updates budget values.
- innerHTML clears old transaction rows.
- createElement creates new table rows and category items.
- appendChild adds new elements to the webpage.
- style changes the appearance of budget warnings.

### 5. Events and User Interaction

Event listeners respond to user actions.

- Submit event adds a new expense.
- Click event sets the monthly budget.
- Click events on Delete buttons remove expenses.

### 6. Functions

Reusable functions organize the application:

- formatMoney()
- calculateTotalExpenses()
- calculateBalance()
- checkBudgetStatus()
- updateBudgetProgress()
- displayCategorySummary()
- displayTransactions()
- updateDashboard()
- deleteExpense()

### 7. Local Storage

localStorage saves the budget and expenses in the browser.
This allows the information to remain available after refreshing
the page in the same browser.

## Challenges and Solutions

### Challenge 1: Updating the dashboard

Solution: Used DOM manipulation and a reusable updateDashboard()
function to refresh the displayed information.

### Challenge 2: Calculating multiple expenses

Solution: Used an array and for...of loops to process
all recorded expenses.

### Challenge 3: Monitoring budget limits

Solution: Used conditional statements to check the remaining
balance and display appropriate warnings.

### Challenge 4: Saving information

Solution: Used localStorage and JSON.stringify()
and JSON.parse() to save and retrieve application data.

## Technologies Used

- HTML5
- CSS3
- JavaScript

## Project Files

- index.html
- style.css
- script.js
- README.md

## How to Run

1. Clone or download the repository.
2. Open the project folder in VS Code.
3. Open index.html in a web browser.
4. Set your monthly budget.
5. Add expenses and select their categories.
6. Monitor your spending and remaining balance.

## Author

SpendWise Budget Tracker
