// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ExpenseTracker {
    struct Expense {
        uint256 id;
        address user;
        string description;
        uint256 amount;
        string category;
        uint256 timestamp;
    }

    mapping(address => Expense[]) private userExpenses;
    mapping(address => uint256) private userBudgets;
    mapping(address => mapping(string => uint256)) private categoryBudgets;
    uint256 private nextId;

    event ExpenseAdded(uint256 id, address indexed user, string description, uint256 amount, string category, uint256 timestamp);
    event ExpenseDeleted(uint256 id, address indexed user);
    event BudgetUpdated(address indexed user, uint256 newBudget);
    event CategoryBudgetUpdated(address indexed user, string category, uint256 newBudget);

    function setBudget(uint256 _amount) public {
        userBudgets[msg.sender] = _amount;
        emit BudgetUpdated(msg.sender, _amount);
    }

    function getBudget() public view returns (uint256) {
        return userBudgets[msg.sender];
    }

    function setCategoryBudget(string memory _category, uint256 _amount) public {
        categoryBudgets[msg.sender][_category] = _amount;
        emit CategoryBudgetUpdated(msg.sender, _category, _amount);
    }

    function getCategoryBudget(string memory _category) public view returns (uint256) {
        return categoryBudgets[msg.sender][_category];
    }

    function addExpense(string memory _description, uint256 _amount, string memory _category) public {
        Expense memory newExpense = Expense({
            id: nextId,
            user: msg.sender,
            description: _description,
            amount: _amount,
            category: _category,
            timestamp: block.timestamp
        });

        userExpenses[msg.sender].push(newExpense);
        emit ExpenseAdded(nextId, msg.sender, _description, _amount, _category, block.timestamp);
        nextId++;
    }

    function addExpenses(string[] memory _descriptions, uint256[] memory _amounts, string[] memory _categories) public {
        require(_descriptions.length == _amounts.length && _amounts.length == _categories.length, "Arrays length mismatch");
        for (uint256 i = 0; i < _descriptions.length; i++) {
            addExpense(_descriptions[i], _amounts[i], _categories[i]);
        }
    }

    function getExpenses() public view returns (Expense[] memory) {
        return userExpenses[msg.sender];
    }

    function getTotalExpenses() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < userExpenses[msg.sender].length; i++) {
            total += userExpenses[msg.sender][i].amount;
        }
        return total;
    }
}
