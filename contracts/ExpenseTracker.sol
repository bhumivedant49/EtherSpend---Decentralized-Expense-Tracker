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
    uint256 private nextId;

    event ExpenseAdded(uint256 id, address indexed user, string description, uint256 amount, string category, uint256 timestamp);
    event ExpenseDeleted(uint256 id, address indexed user);

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
