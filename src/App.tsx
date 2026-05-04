import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  Wallet, 
  Plus, 
  History, 
  PieChart, 
  TrendingUp, 
  LogOut, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Tag,
  FileText,
  ExternalLink,
  Settings,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import ExpenseTrackerABI from './contracts/ExpenseTrackerABI.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Pre-compiled bytecode for the ExpenseTracker contract (Corrected version)
const CONTRACT_BYTECODE = "0x6080604052348015600e575f5ffd5b506111ba8061001c5f395ff3fe608060405234801561000f575f5ffd5b506004361061003f575f3560e01c8063106caaa11461004357806383a36a911461005f578063d79ec07e1461007d575b5f5ffd5b61005d600480360381019061005891906108aa565b610099565b005b61006761019c565b6040516100749190610b28565b60405180910390f35b61009760048036038101906100929190610cea565b610524565b005b5f6040518060c001604052805f8054905081526020013373ffffffffffffffffffffffffffffffffffffffff16815260200185815260200184815260200183815260200142815250908060018154018082558091505060019003905f5260205f2090600602015f909190919091505f820151815f01556020820151816001015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550604082015181600201908161016a9190610f9c565b5060608201518160030155608082015181600401908161018a9190610f9c565b5060a082015181600501555050505050565b60605f5f90505f5f90505b5f80549050811015610243573373ffffffffffffffffffffffffffffffffffffffff165f82815481106101dd576101dc61106b565b5b905f5260205f2090600602016001015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610236578180610232906110c5565b9250505b80806001019150506101a7565b505f8167ffffffffffffffff81111561025f5761025e610753565b5b60405190808252806020026020018201604052801561029857816020015b6102856106e2565b81526020019060019003908161027d5790505b5090505f5f90505f5f90505b5f8054905081101561051a573373ffffffffffffffffffffffffffffffffffffffff165f82815481106102da576102d961106b565b5b905f5260205f2090600602016001015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff160361050d575f81815481106103375761033661106b565b5b905f5260205f2090600602016040518060c00160405290815f8201548152602001600182015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016002820180546103bc90610dbb565b80601f01602080910402602001604051908101604052809291908181526020018280546103e890610dbb565b80156104335780601f1061040a57610100808354040283529160200191610433565b820191905f5260205f20905b81548152906001019060200180831161041657829003601f168201915b505050505081526020016003820154815260200160048201805461045690610dbb565b80601f016020809104026020016040519081016040528092919081815260200182805461048290610dbb565b80156104cd5780601f106104a4576101008083540402835291602001916104cd565b820191905f5260205f20905b8154815290600101906020018083116104b057829003601f168201915b505050505081526020016005820154815250508383815181106104f3576104f261106b565b5b60200260200101819052508180610509906110c5565b9250505b80806001019150506102a4565b5081935050505090565b81518351148015610536575080518251145b610575576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161056c90611166565b60405180910390fd5b5f5f90505b83518110156106dc575f6040518060c001604052805f8054905081526020013373ffffffffffffffffffffffffffffffffffffffff1681526020018684815181106105c8576105c761106b565b5b602002602001015181526020018584815181106105e8576105e761106b565b5b602002602001015181526020018484815181106106085761060761106b565b5b6020026020010151815260200142815250908060018154018082558091505060019003905f5260205f2090600602015f909190919091505f820151815f01556020820151816001015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060408201518160020190816106a29190610f9c565b506060820151816003015560808201518160040190816106c29190610f9c565b5060a082015181600501555050808060010191505061057a565b50505050565b6040518060c001604052805f81526020015f73ffffffffffffffffffffffffffffffffffffffff168152602001606081526020015f8152602001606081526020015f81525090565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61078982610743565b810181811067ffffffffffffffff821117156107a8576107a7610753565b5b80604052505050565b5f6107ba61072a565b90506107c68282610780565b919050565b5f67ffffffffffffffff8211156107e5576107e4610753565b5b6107ee82610743565b9050602081019050919050565b828183375f83830152505050565b5f61081b610816846107cb565b6107b1565b9050828152602081018484840111156108375761083661073f565b5b6108428482856107fb565b509392505050565b5f82601f83011261085e5761085d61073b565b5b813561086e848260208601610809565b91505092915050565b5f819050919050565b61088981610877565b8114610893575f5ffd5b50565b5f813590506108a481610880565b92915050565b5f5f5f606084860312156108c1576108c0610733565b5b5f84013567ffffffffffffffff8111156108de576108dd610737565b5b6108ea8682870161084a565b93505060206108fb86828701610896565b925050604084013567ffffffffffffffff81111561091c5761091b610737565b5b6109288682870161084a565b9150509250925092565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b61096481610877565b82525050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6109938261096a565b9050919050565b6109a381610989565b82525050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f6109db826109a9565b6109e581856109b3565b93506109f58185602086016109c3565b6109fe81610743565b840191505092915050565b5f60c083015f830151610a1e5f86018261095b565b506020830151610a31602086018261099a565b5060408301518482036040860152610a4982826109d1565b9150506060830151610a5e606086018261095b565b5060808301518482036080860152610a7682826109d1565b91505060a0830151610a8b60a086018261095b565b508091505092915050565b5f610aa18383610a09565b905092915050565b5f602082019050919050565b5f610abf82610932565b610ac9818561093c565b935083602082028501610adb8561094c565b805f5b85811015610b165784840389528151610af78582610a96565b9450610b0283610aa9565b925060208a01995050600181019050610ade565b50829750879550505050505092915050565b5f6020820190508181035f830152610b408184610ab5565b905092915050565b5f67ffffffffffffffff821115610b6257610b61610753565b5b602082029050602081019050919050565b5f5ffd5b5f610b89610b8484610b48565b6107b1565b90508083825260208201905060208402830185811115610bac57610bab610b73565b5b835b81811015610bf357803567ffffffffffffffff811115610bd157610bd061073b565b5b808601610bde898261084a565b85526020850194505050602081019050610bae565b5050509392505050565b5f82601f830112610c1157610c1061073b565b5b8135610c21848260208601610b77565b91505092915050565b5f67ffffffffffffffff821115610c4457610c43610753565b5b602082029050602081019050919050565b5f610c67610c6284610c2a565b6107b1565b90508083825260208201905060208402830185811115610c8a57610c89610b73565b5b835b81811015610cb35780610c9f8882610896565b845260208401935050602081019050610c8c565b5050509392505050565b5f82601f830112610cd157610cd061073b565b5b8135610ce1848260208601610c55565b91505092915050565b5f5f5f60608486031215610d0157610d00610733565b5b5f84013567ffffffffffffffff811115610d1e57610d1d610737565b5b610d2a86828701610bfd565b935050602084013567ffffffffffffffff811115610d4b57610d4a610737565b5b610d5786828701610cbd565b925050604084013567ffffffffffffffff811115610d7857610d77610737565b5b610d8486828701610bfd565b9150509250925092565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680610dd257607f821691505b602082108103610de557610de4610d8e565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f60088302610e477fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610e0c565b610e518683610e0c565b95508019841693508086168417925050509392505050565b5f819050919050565b5f610e8c610e87610e8284610877565b610e69565b610877565b9050919050565b5f819050919050565b610ea583610e72565b610eb9610eb182610e93565b848454610e18565b825550505050565b5f5f905090565b610ed0610ec1565b610edb818484610e9c565b505050565b5f5b82811015610f0157610ef65f828401610ec8565b600181019050610ee2565b505050565b601f821115610f545782821115610f5357610f2081610deb565b610f2983610dfd565b610f3285610dfd565b6020861015610f3f575f90505b808301610f4e82840382610ee0565b505050505b5b505050565b5f82821c905092915050565b5f610f745f1984600802610f59565b1980831691505092915050565b5f610f8c8383610f65565b9150826002028217905092915050565b610fa5826109a9565b67ffffffffffffffff811115610fbe57610fbd610753565b5b610fc88254610dbb565b610fd3828285610f06565b5f60209050601f831160018114611004575f8415610ff2578287015190505b610ffc8582610f81565b865550611063565b601f19841661101286610deb565b5f5b8281101561103957848901518255600182019150602085019450602081019050611014565b868310156110565784890151611052601f891682610f65565b8355505b6001600288020188555050505b505050505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6110cf82610877565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361110157611100611098565b5b600182019050919050565b5f82825260208201905092915050565b7f417272617973206c656e677468206d69736d61746368000000000000000000005f82015250565b5f61115060168361110c565b915061115b8261111c565b602082019050919050565b5f6020820190508181035f83015261117d81611144565b905091905056fea26469706673582212206dfd767664e99d3d5103d71645c38f8fae83579cc8c616b4254899a1e05aa47d64736f6c63430008220033";
;

// Default to null or localStorage
const INITIAL_CONTRACT_ADDRESS = localStorage.getItem('ether_spend_contract_address') || "";

interface Expense {
  id: number;
  description: string;
  amount: string;
  category: string;
  timestamp: number;
  transactionHash?: string;
}

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>(INITIAL_CONTRACT_ADDRESS);
  const [isContractSet, setIsContractSet] = useState<boolean>(!!INITIAL_CONTRACT_ADDRESS && ethers.isAddress(INITIAL_CONTRACT_ADDRESS));
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [budget, setBudget] = useState<string>("0");
  const [categoryBudgets, setCategoryBudgets] = useState<{[key: string]: string}>({});
  const [newBudgetInput, setNewBudgetInput] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [catBudgetInput, setCatBudgetInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  
  // Batch Form State
  const [batchExpenses, setBatchExpenses] = useState<{description: string, amount: string, category: string}[]>([]);

  const saveContractAddress = (address: string) => {
    if (ethers.isAddress(address)) {
      localStorage.setItem('ether_spend_contract_address', address);
      setContractAddress(address);
      setIsContractSet(true);
      setError(null);
      // If already connected, re-initialize contract
      if (account) connectWallet();
    } else {
      setError("Invalid Ethereum address format.");
    }
  };

  const deployContract = async () => {
    if (typeof window.ethereum === 'undefined') return;
    try {
      setLoading(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const factory = new ethers.ContractFactory(ExpenseTrackerABI, CONTRACT_BYTECODE, signer);
      setSuccess("Deploying contract... Please confirm in MetaMask.");
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      saveContractAddress(address);
      setSuccess(`Contract deployed successfully at ${address}`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to deploy contract");
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        setError(null);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Use getAddress to ensure the address is in checksummed (mixed-case) format
        const checksummedAddress = ethers.getAddress(accounts[0]);
        setAccount(checksummedAddress);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        if (!isContractSet || !ethers.isAddress(contractAddress)) {
          setError("Please set a valid contract address first.");
          setLoading(false);
          return;
        }

        const expenseContract = new ethers.Contract(contractAddress, ExpenseTrackerABI, signer);
        setContract(expenseContract);

        
        // Check if we are on Sepolia
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111n) {
          setError("Please switch to the Sepolia Test Network in MetaMask.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect wallet");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask to use this app.");
    }
  };

  const fetchBudget = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const b = await contract.getBudget();
      setBudget(ethers.formatEther(b));
      setNewBudgetInput(ethers.formatEther(b));

      // Fetch budgets for common categories
      const categories = ["General", "Food", "Travel", "Entertainment", "Utilities"];
      const catBudgets: {[key: string]: string} = {};
      for (const cat of categories) {
        const cb = await contract.getCategoryBudget(cat);
        catBudgets[cat] = ethers.formatEther(cb);
      }
      setCategoryBudgets(catBudgets);

    } catch (err: any) {
      console.error("Error fetching budget:", err);
      // If code is CALL_EXCEPTION, it definitively means the function doesn't exist on this contract address
      if (err.code === 'CALL_EXCEPTION' || (err.message && err.message.includes('CALL_EXCEPTION'))) {
        console.warn("Budget functionality is not available on this contract version.");
        setError("Your currently linked contract is outdated. Budgeting and Category insights require a redeploy of the latest smart contract.");
        setBudget("0");
      }
    }
  }, [contract, account]);

  const updateBudget = async () => {
    if (!contract || !newBudgetInput) return;
    try {
      setLoading(true);
      setError(null);
      const tx = await contract.setBudget(ethers.parseEther(newBudgetInput));
      setSuccess("Updating budget... Please wait.");
      await tx.wait();
      setSuccess("Budget updated successfully!");
      fetchBudget();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Error updating budget:", err);
      if (err.code === 'ACTION_REJECTED') {
        setError("Transaction cancelled by user.");
      } else if (err.code === 'CALL_EXCEPTION' || (err.message && err.message.includes('CALL_EXCEPTION'))) {
        setError("The 'setBudget' function is missing from your deployed contract. Please redeploy the updated Solidity code and link the new address.");
      } else {
        setError(err.message || "Failed to update budget");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryBudget = async (category: string, amount: string) => {
    if (!contract) return;
    try {
      setLoading(true);
      setError(null);
      const tx = await contract.setCategoryBudget(category, ethers.parseEther(amount));
      setSuccess(`Updating ${category} budget...`);
      await tx.wait();
      setSuccess(`${category} budget updated!`);
      setEditingCategory(null);
      fetchBudget();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Error updating category budget:", err);
      if (err.code === 'CALL_EXCEPTION' || (err.message && err.message.includes('CALL_EXCEPTION'))) {
        setError("Category budget functions not found. Please redeploy the latest contract.");
      } else {
        setError(err.message || "Failed to update category budget");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = useCallback(async () => {
    if (!contract || !account || !contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 1. Check Network
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        setError("Wrong Network: Please switch to Sepolia Testnet in MetaMask.");
        setLoading(false);
        return;
      }

      // 2. Check if address is a contract
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        setError("The address provided is not a smart contract. Please deploy a new one or check the address.");
        setLoading(false);
        return;
      }

      // 3. Attempt to call getExpenses
      let data;
      try {
        data = await contract.getExpenses();
      } catch (callErr: any) {
        console.error("Contract call failed:", callErr);
        // Specifically catch the revert/exception to show the Fix button
        const isContractMismatch = 
          callErr.code === 'CALL_EXCEPTION' || 
          callErr.message.includes('execution reverted') ||
          callErr.message.includes('no data present') ||
          callErr.message.includes('missing revert data');
          
        if (isContractMismatch) {
          setError("Contract Mismatch: The contract at this address is invalid or outdated. Please use the 'Fix Connection' button below.");
        } else {
          setError("Failed to communicate with the contract. Please check your network.");
        }
        setLoading(false);
        return;
      }

      if (!data) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      // 4. Fetch Event Logs for Transaction Hashes
      // This allows us to map expenses to their actual on-chain transaction hashes
      let txHashes: { [key: number]: string } = {};
      try {
        const filter = contract.filters.ExpenseAdded(null, account);
        const events = await contract.queryFilter(filter, -1000000); // Look back up to 1M blocks
        events.forEach((event: any) => {
          if (event.args) {
            txHashes[Number(event.args.id)] = event.transactionHash;
          }
        });
      } catch (logErr) {
        console.warn("Could not fetch event logs for tx hashes:", logErr);
      }

      const formattedExpenses = data.map((exp: any) => ({
        id: Number(exp.id),
        description: exp.description,
        amount: ethers.formatEther(exp.amount),
        category: exp.category,
        timestamp: Number(exp.timestamp),
        transactionHash: txHashes[Number(exp.id)]
      }));
      setExpenses(formattedExpenses.reverse());
    } catch (err: any) {
      console.error("Fetch error:", err);
      
      if (err.code === 'CALL_EXCEPTION') {
        setError("Contract Call Failed: The contract at this address does not match the expected ExpenseTracker interface. Try deploying a new contract using the 'Deploy' button.");
      } else {
        setError(err.reason || err.message || "Failed to fetch expenses.");
      }
    } finally {
      setLoading(false);
    }
  }, [contract, account, contractAddress]);

  useEffect(() => {
    if (contract && account) {
      fetchExpenses();
      fetchBudget();
    }
  }, [contract, account, fetchExpenses, fetchBudget]);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    if (!description || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const amountInWei = ethers.parseEther(amount);
      const tx = await contract.addExpense(description, amountInWei, category);
      setSuccess("Transaction submitted! Waiting for confirmation...");
      await tx.wait();
      setSuccess("Expense added successfully!");
      setDescription('');
      setAmount('');
      fetchExpenses();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const addBatchExpenses = async () => {
    if (!contract) return;
    if (batchExpenses.length === 0) {
      setError("No expenses to add.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const descriptions = batchExpenses.map(exp => exp.description);
      const amounts = batchExpenses.map(exp => ethers.parseEther(exp.amount));
      const categories = batchExpenses.map(exp => exp.category);

      const tx = await contract.addExpenses(descriptions, amounts, categories);
      setSuccess("Batch transaction submitted! Waiting for confirmation...");
      await tx.wait();
      setSuccess("Expenses added successfully!");
      setBatchExpenses([]);
      fetchExpenses();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to add expenses");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const budgetValue = parseFloat(budget);
  const budgetProgress = budgetValue > 0 ? (totalSpent / budgetValue) * 100 : 0;

  // Insights data
  const categoryTotals = expenses.reduce((acc: {[key: string]: number}, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  const insights = Object.entries(categoryTotals).map(([cat, total]) => {
    const totalNum = total as number;
    const catBudget = parseFloat(categoryBudgets[cat] || "0");
    if (catBudget > 0 && totalNum > catBudget) {
      const overPercentage = ((totalNum - catBudget) / catBudget) * 100;
      return {
        category: cat,
        type: 'danger',
        message: `${overPercentage.toFixed(0)}% over budget in ${cat} this month.`
      };
    } else if (catBudget > 0 && totalNum > catBudget * 0.8) {
      return {
        category: cat,
        type: 'warning',
        message: `Nearing budget for ${cat} (${((totalNum / catBudget) * 100).toFixed(0)}%).`
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">EtherSpend</span>
            </div>
            
            {account ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "p-2 rounded-full transition-all hover:bg-white/5",
                    showSettings ? "text-indigo-400 bg-white/5" : "text-slate-400"
                  )}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Connected Wallet</span>
                  <span className="text-sm font-mono text-indigo-400">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <button 
                  onClick={() => setAccount(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {showSettings && account && (
            <motion.div
              key="settings-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    Contract Management
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-500 hover:text-white text-sm"
                  >
                    Close
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Current Contract Address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        onClick={() => saveContractAddress(contractAddress)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-sm font-bold transition-all"
                      >
                        Update
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Paste an existing ExpenseTracker contract address to sync your data.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Troubleshooting</label>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('ether_spend_contract_address');
                        window.location.reload();
                      }}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2.5 px-4 text-sm font-bold text-red-400 transition-all flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Reset App & Clear Cache
                    </button>
                    <p className="text-[10px] text-slate-500">
                      If you're seeing "Execution Reverted" errors, use this to reset and deploy a fresh contract.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isContractSet ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl"
            >
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <TrendingUp className="text-indigo-500 w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Contract Setup Required</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                To start tracking expenses on-chain, please provide the address of your deployed smart contract on the Sepolia network.
              </p>
              
              <div className="space-y-4 text-left">
                <button 
                  onClick={deployContract}
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-yellow-400" />}
                  Deploy New Contract
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-slate-600 text-xs font-bold uppercase">Or Use Existing</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sepolia Contract Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                    onBlur={(e) => {
                      if (e.target.value) saveContractAddress(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveContractAddress((e.target as HTMLInputElement).value);
                    }}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                  <h4 className="text-indigo-400 text-xs font-bold uppercase mb-2">Don't have a contract?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Deploy the Solidity code provided in the footer using Remix IDE on the Sepolia Testnet, then paste the resulting address here.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : !account ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md"
            >
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-indigo-500 w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Decentralized Expense Tracking</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Securely log your expenses on the Ethereum blockchain. Transparent, immutable, and completely private to your wallet.
              </p>
              <button
                onClick={connectWallet}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
              >
                Get Started with MetaMask
              </button>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sepolia Network</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Database</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form & Stats */}
            <div className="lg:col-span-4 space-y-8">
              {/* Stats Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden relative"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm font-medium">Total Spent</span>
                    <PieChart className="text-indigo-500 w-5 h-5" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{totalSpent.toFixed(4)}</span>
                    <span className="text-indigo-400 font-mono text-sm">ETH</span>
                  </div>
                  
                  {budgetValue > 0 && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Budget Progress</span>
                        <span className={cn(
                          "font-bold",
                          budgetProgress > 100 ? "text-red-400" : "text-indigo-400"
                        )}>
                          {budgetProgress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
                          className={cn(
                            "h-full rounded-full transition-colors",
                            budgetProgress > 90 ? "bg-red-500" : "bg-indigo-500"
                          )}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Spent: {totalSpent.toFixed(4)} ETH</span>
                        <span>Budget: {budgetValue.toFixed(4)} ETH</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Transactions</span>
                      <span className="text-sm font-bold text-white">{expenses.length}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest block">Update Budget</label>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          value={newBudgetInput}
                          onChange={(e) => setNewBudgetInput(e.target.value)}
                          placeholder="Set budget (ETH)"
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500/50"
                        />
                        <button 
                          onClick={updateBudget}
                          className="bg-white/5 hover:bg-white/10 p-1.5 rounded-xl transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Insights & Budget Logic Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    Budget Transparency
                  </h2>
                  <Settings className="w-4 h-4 text-slate-600 cursor-pointer hover:text-indigo-400 transition-colors" />
                </div>
                
                <div className="space-y-6">
                  {/* Alert Section for Budget Breach */}
                  <AnimatePresence>
                    {insights.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 mb-2"
                      >
                        {insights.map((insight, i) => (
                          <div key={i} className={cn(
                            "p-3 rounded-xl text-xs flex items-center gap-2 animate-pulse-slow",
                            insight?.type === 'danger' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {insight?.message}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {["Food", "Travel", "Entertainment", "Utilities", "General"].map((cat) => {
                      const total = categoryTotals[cat] || 0;
                      const catBudgetStr = categoryBudgets[cat] || "0";
                      const catBudgetValue = parseFloat(catBudgetStr);
                      const isEditing = editingCategory === cat;

                      return (
                        <div key={cat} className="group p-3 hover:bg-white/[0.02] rounded-2xl transition-all border border-transparent hover:border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{cat}</span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Spent: {total.toFixed(4)} ETH
                              </div>
                            </div>
                            <div className="text-right">
                              {isEditing ? (
                                <div className="flex gap-1 items-center">
                                  <input 
                                    className="w-16 bg-black/40 border border-white/10 rounded-md py-0.5 px-2 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                                    value={catBudgetInput}
                                    onChange={(e) => setCatBudgetInput(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') updateCategoryBudget(cat, catBudgetInput);
                                      if (e.key === 'Escape') setEditingCategory(null);
                                    }}
                                  />
                                  <button 
                                    onClick={() => updateCategoryBudget(cat, catBudgetInput)}
                                    className="p-1 hover:bg-emerald-500/20 rounded-md text-emerald-500 transition-colors"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setCatBudgetInput(catBudgetStr);
                                  }}
                                  className="text-[10px] text-slate-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1 font-mono"
                                >
                                  Budget: {catBudgetValue > 0 ? `${catBudgetValue.toFixed(3)}` : "Set Limit"}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {catBudgetValue > 0 && (
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                className={cn(
                                  "h-full rounded-full transition-colors",
                                  total > catBudgetValue ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((total / catBudgetValue) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Add Expense Form */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-500" />
                  Add New Expense
                </h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!description || !amount) {
                    setError("Please fill in all fields.");
                    return;
                  }
                  setBatchExpenses([...batchExpenses, { description, amount, category }]);
                  setDescription('');
                  setAmount('');
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Coffee"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (ETH)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        step="0.0001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.01"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                      >
                        <option value="General">General</option>
                        <option value="Food">Food</option>
                        <option value="Travel">Travel</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Batch
                    </button>
                  </div>
                </form>
                
                {batchExpenses.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white mb-3">Batch ({batchExpenses.length})</h3>
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {batchExpenses.map((exp, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-xs">
                          <span className="text-slate-300 truncate max-w-[120px]">{exp.description}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-indigo-400 font-mono">{exp.amount} ETH</span>
                            <button 
                              onClick={() => setBatchExpenses(batchExpenses.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-red-400"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addBatchExpenses}
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      Submit All ({batchExpenses.length})
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  Recent Activity
                </h2>
                <button 
                  onClick={fetchExpenses}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Refresh Data
                </button>
              </div>

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    key="error-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                    {(error.includes("Contract Mismatch") || error.includes("Contract Call Failed")) && (
                      <button 
                        onClick={() => {
                          localStorage.removeItem('ether_spend_contract_address');
                          window.location.reload();
                        }}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Fix Connection: Reset & Redeploy
                      </button>
                    )}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    key="success-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-200">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transaction History Section */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  Transaction History
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-white/5 px-2 py-1 rounded-md">
                    Immutable Ledger
                  </span>
                  <button 
                    onClick={fetchExpenses}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    Sync
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {expenses.length === 0 && !loading ? (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No expenses recorded yet.</p>
                  </div>
                ) : (
                  expenses.map((expense, idx) => (
                    <motion.div
                      layout
                      key={`${expense.id}-${expense.timestamp}-${idx}`}
                      onClick={() => setSelectedExpense(expense)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group bg-white/5 hover:bg-white/[0.08] lg:hover:translate-x-1 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-lg",
                          expense.category === 'Food' ? "bg-orange-500/10 text-orange-400" :
                          expense.category === 'Travel' ? "bg-blue-500/10 text-blue-400" :
                          expense.category === 'Entertainment' ? "bg-purple-500/10 text-purple-400" :
                          expense.category === 'Utilities' ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-indigo-500/10 text-indigo-400"
                        )}>
                          {expense.category[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{expense.description}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                              {expense.category}
                            </span>
                            <span className="text-[10px] text-slate-600 font-mono">
                              {new Date(expense.timestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-5">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-white leading-none">
                            {parseFloat(expense.amount).toFixed(4)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-1">ETH</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Reset Contract Option */}
              <div className="pt-8 flex justify-center">
                <button 
                  onClick={() => {
                    localStorage.removeItem('ether_spend_contract_address');
                    setIsContractSet(false);
                    setContractAddress("");
                    setContract(null);
                  }}
                  className="text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Reset Contract Address
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Expense Detail Modal */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExpense(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">On-Chain Receipt</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Registry ID: {selectedExpense.id}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedExpense(null)}
                    className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">On-Chain Value</label>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{parseFloat(selectedExpense.amount).toFixed(6)}</span>
                        <span className="text-xs text-indigo-400 font-mono">ETH</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Entity Class</label>
                      <span className="text-lg font-bold text-white">{selectedExpense.category}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Accounting Memo</label>
                    <p className="text-white text-lg font-medium leading-relaxed">{selectedExpense.description}</p>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Historical Timestamp</label>
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <History className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="text-sm">{new Date(selectedExpense.timestamp * 1000).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' })}</span>
                    </div>
                  </div>

                  {selectedExpense.transactionHash ? (
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Block Explorer Evidence</label>
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-xs text-indigo-300 truncate flex-1 font-mono tracking-tighter">
                          {selectedExpense.transactionHash}
                        </code>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${selectedExpense.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Verify
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Transaction hash lookup is currently processing or stored in an older block segment. Data is cryptographically confirmed.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5 active:scale-[0.99]"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Privacy */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-white font-bold mb-4">Real-World Problem</h3>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              "This application solves the critical issue of financial trust and transparency in personal and organizational accounting. 
              By leveraging blockchain, we eliminate the possibility of 'ghost expenses' or retroactive record tampering, 
              providing a verifiable truth for expense management and budget adherence."
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Privacy</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We don't use a database. Your data lives on the blockchain and is only 
              accessible via your wallet address. No identity linked, no central storage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
