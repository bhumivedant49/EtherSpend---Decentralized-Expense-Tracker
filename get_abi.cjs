const solc = require('solc');

const source = `
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

    Expense[] private expenses;

    function addExpense(string memory _description, uint256 _amount, string memory _category) public {
        expenses.push(Expense(expenses.length, msg.sender, _description, _amount, _category, block.timestamp));
    }

    function getExpenses() public view returns (Expense[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < expenses.length; i++) {
            if (expenses[i].user == msg.sender) count++;
        }
        Expense[] memory result = new Expense[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < expenses.length; i++) {
            if (expenses[i].user == msg.sender) {
                result[j] = expenses[i];
                j++;
            }
        }
        return result;
    }
}
`;

const input = {
  language: 'Solidity',
  sources: {
    'ExpenseTracker.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['ExpenseTracker.sol']['ExpenseTracker'];

console.log(JSON.stringify(contract.abi, null, 2));
