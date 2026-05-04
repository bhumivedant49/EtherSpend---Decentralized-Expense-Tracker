const solc = require('solc');
const fs = require('fs');
const path = require('path');

const contractPath = path.join(__dirname, 'contracts', 'ExpenseTracker.sol');
const source = fs.readFileSync(contractPath, 'utf8');

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

console.log('BYTECODE:');
console.log('0x' + contract.evm.bytecode.object);
console.log('ABI:');
console.log(JSON.stringify(contract.abi, null, 2));
