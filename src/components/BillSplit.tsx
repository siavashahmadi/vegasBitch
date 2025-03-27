import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Person {
  id: string;
  name: string;
  selected: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
  date: Date;
}

interface CustomBill {
  [key: string]: number; // Person ID -> amount spent
}

const BillSplit: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Kiarash', selected: true },
    { id: '2', name: 'Daniel', selected: true },
    { id: '3', name: 'Lucas', selected: true },
    { id: '4', name: 'Peter', selected: true },
    { id: '5', name: 'Kyon', selected: true },
    { id: '6', name: 'Siavash', selected: true },
  ]);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Dinner at Prime',
      amount: 420,
      paidBy: '1',
      splitWith: ['1', '2', '3', '4', '5', '6'],
      date: new Date('2024-03-26T19:00:00')
    },
    {
      id: '2',
      description: 'Uber to Marquee',
      amount: 45,
      paidBy: '3',
      splitWith: ['1', '2', '3', '5'],
      date: new Date('2024-03-26T22:30:00')
    },
    {
      id: '3',
      description: 'Bottle service',
      amount: 1200,
      paidBy: '2',
      splitWith: ['1', '2', '3', '4', '5', '6'],
      date: new Date('2024-03-27T00:15:00')
    }
  ]);
  
  const [newExpense, setNewExpense] = useState<{
    description: string;
    amount: string;
    paidBy: string;
    splitWith: string[];
  }>({
    description: '',
    amount: '',
    paidBy: '1',
    splitWith: people.filter(p => p.selected).map(p => p.id)
  });
  
  const [activeTab, setActiveTab] = useState<'expenses' | 'summary' | 'quicksplit'>('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [splitMode, setSplitMode] = useState<'even' | 'custom'>('even');
  const [customBill, setCustomBill] = useState<CustomBill>({
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0
  });
  const [tipAmount, setTipAmount] = useState<string>('');
  const [totalWithTip, setTotalWithTip] = useState<CustomBill>({
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0
  });
  const [paidBy, setPaidBy] = useState<string>('1');
  
  // Calculate who owes what to whom
  const calculateBalances = () => {
    // Initialize balances for each person
    const balances: { [key: string]: number } = {};
    people.forEach(person => {
      balances[person.id] = 0;
    });
    
    // Calculate payments and debts from expenses
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const splitWith = expense.splitWith;
      const amountPerPerson = expense.amount / splitWith.length;
      
      // The person who paid gets credited
      balances[paidBy] += expense.amount;
      
      // Everyone who split the bill gets debited
      splitWith.forEach(personId => {
        balances[personId] -= amountPerPerson;
      });
    });
    
    return balances;
  };
  
  // Calculate transactions to settle debts
  const calculateSettlements = () => {
    const balances = calculateBalances();
    
    // Sort people by balance (positive balances are owed money)
    const sortedPeople = [...people].sort((a, b) => balances[b.id] - balances[a.id]);
    
    const settlements: { from: string; to: string; amount: number }[] = [];
    
    // Map of person IDs to names
    const nameMap: { [key: string]: string } = {};
    people.forEach(person => {
      nameMap[person.id] = person.name;
    });
    
    // Creditors (positive balance) are owed money by debtors (negative balance)
    const creditors = sortedPeople.filter(p => balances[p.id] > 0.5);
    const debtors = sortedPeople.filter(p => balances[p.id] < -0.5);
    
    for (const creditor of creditors) {
      let amountOwed = balances[creditor.id];
      
      for (const debtor of debtors) {
        const debtAmount = -balances[debtor.id];
        
        if (debtAmount <= 0) continue;
        
        if (amountOwed <= 0) break;
        
        const settlementAmount = Math.min(amountOwed, debtAmount);
        if (settlementAmount > 0.01) {
          settlements.push({
            from: debtor.id,
            to: creditor.id,
            amount: Math.round(settlementAmount * 100) / 100 // Round to 2 decimal places
          });
          
          // Update remaining balances
          balances[debtor.id] += settlementAmount;
          amountOwed -= settlementAmount;
        }
      }
    }
    
    return { settlements, nameMap };
  };
  
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || newExpense.splitWith.length === 0) {
      alert('Please fill in all fields');
      return;
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const newId = (expenses.length + 1).toString();
    
    setExpenses([
      ...expenses,
      {
        id: newId,
        description: newExpense.description,
        amount: amount,
        paidBy: newExpense.paidBy,
        splitWith: newExpense.splitWith,
        date: new Date()
      }
    ]);
    
    setNewExpense({
      description: '',
      amount: '',
      paidBy: '1',
      splitWith: people.filter(p => p.selected).map(p => p.id)
    });
    
    setShowAddExpense(false);
  };
  
  const togglePersonInSplit = (personId: string) => {
    setNewExpense(prev => {
      if (prev.splitWith.includes(personId)) {
        return {
          ...prev,
          splitWith: prev.splitWith.filter(id => id !== personId)
        };
      } else {
        return {
          ...prev,
          splitWith: [...prev.splitWith, personId]
        };
      }
    });
  };
  
  const getPersonName = (personId: string) => {
    const person = people.find(p => p.id === personId);
    return person ? person.name : 'Unknown';
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleCustomBillChange = (personId: string, value: string) => {
    const amount = parseFloat(value);
    setCustomBill(prev => ({
      ...prev,
      [personId]: isNaN(amount) ? 0 : amount
    }));
  };
  
  const calculateCustomBill = () => {
    const tipValue = parseFloat(tipAmount) || 0;
    const subtotal = Object.values(customBill).reduce((sum, amount) => sum + amount, 0);
    
    if (subtotal === 0) {
      alert('Please enter at least one person\'s bill amount');
      return;
    }
    
    // Calculate tip proportion for each person
    const tipProportion = tipValue / subtotal;
    
    // Calculate total with tip for each person
    const newTotalWithTip: CustomBill = {};
    
    people.forEach(person => {
      const personAmount = customBill[person.id] || 0;
      const personTip = personAmount * tipProportion;
      newTotalWithTip[person.id] = Math.round((personAmount + personTip) * 100) / 100;
    });
    
    setTotalWithTip(newTotalWithTip);
    
    // Create a new expense from this custom bill
    if (subtotal > 0) {
      const participatingPeople = people
        .filter(person => (customBill[person.id] || 0) > 0)
        .map(person => person.id);
      
      const newId = (expenses.length + 1).toString();
      const description = `Bill split (${new Date().toLocaleDateString()})`;
      
      setExpenses([
        ...expenses,
        {
          id: newId,
          description,
          amount: subtotal + tipValue,
          paidBy,
          splitWith: participatingPeople,
          date: new Date()
        }
      ]);
      
      // Reset the custom bill form
      setCustomBill({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
      setTipAmount('');
      setTotalWithTip({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 });
    }
  };
  
  const { settlements, nameMap } = calculateSettlements();
  const balances = calculateBalances();
  
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center text-4xl font-bold mb-8 text-cyber-pink neon-text">BILL SPLIT</h2>
      
      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`cyber-btn text-sm ${activeTab === 'expenses' ? 'bg-cyber-pink text-white' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          EXPENSES
        </button>
        <button
          className={`cyber-btn text-sm ${activeTab === 'quicksplit' ? 'bg-cyber-pink text-white' : ''}`}
          onClick={() => setActiveTab('quicksplit')}
        >
          QUICK SPLIT
        </button>
        <button
          className={`cyber-btn text-sm ${activeTab === 'summary' ? 'bg-cyber-pink text-white' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          SUMMARY
        </button>
      </div>
      
      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <motion.button
              className="cyber-btn text-sm"
              onClick={() => setShowAddExpense(!showAddExpense)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAddExpense ? 'CANCEL' : 'ADD EXPENSE'}
            </motion.button>
          </div>
          
          {/* Add Expense Form */}
          {showAddExpense && (
            <motion.div
              className="glass-panel p-6 mb-6"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl text-cyber-blue mb-4">New Expense</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Description</label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g., Dinner at Spago"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Amount</label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Paid By</label>
                  <select
                    className="glass-input w-full"
                    value={newExpense.paidBy}
                    onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                  >
                    {people.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Split With</label>
                  <div className="flex flex-wrap gap-2">
                    {people.map(person => (
                      <button
                        key={person.id}
                        className={`px-2 py-1 rounded text-xs ${
                          newExpense.splitWith.includes(person.id)
                            ? 'bg-cyber-green text-black'
                            : 'bg-cyber-dark/50 text-white'
                        }`}
                        onClick={() => togglePersonInSplit(person.id)}
                      >
                        {person.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    className="cyber-btn text-sm bg-cyber-green text-black"
                    onClick={handleAddExpense}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    SAVE EXPENSE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Expenses List */}
          {expenses.length === 0 ? (
            <div className="text-center text-cyber-blue py-8">No expenses yet. Add one to get started!</div>
          ) : (
            <div className="space-y-4">
              {expenses.map(expense => (
                <motion.div
                  key={expense.id}
                  className="glass-panel p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white">{expense.description}</h4>
                      <p className="text-sm text-cyber-blue">{formatDate(expense.date)}</p>
                    </div>
                    <div className="text-xl font-bold text-cyber-gold">{formatCurrency(expense.amount)}</div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-sm">
                      <span className="text-cyber-green">Paid by:</span> 
                      <span className="ml-1 text-white">{getPersonName(expense.paidBy)}</span>
                    </p>
                    
                    <div className="mt-1">
                      <span className="text-sm text-cyber-pink">Split with:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expense.splitWith.map(personId => (
                          <span key={personId} className="px-2 py-0.5 rounded-full text-xs bg-cyber-dark/50">
                            {getPersonName(personId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Quick Split Tab */}
      {activeTab === 'quicksplit' && (
        <div className="space-y-6">
          <div className="flex justify-center mb-6 space-x-4">
            <button 
              className={`cyber-btn text-sm ${splitMode === 'even' ? 'bg-cyber-blue text-white' : ''}`}
              onClick={() => setSplitMode('even')}
            >
              SPLIT EVENLY
            </button>
            <button 
              className={`cyber-btn text-sm ${splitMode === 'custom' ? 'bg-cyber-blue text-white' : ''}`}
              onClick={() => setSplitMode('custom')}
            >
              CUSTOM AMOUNTS
            </button>
          </div>
          
          <div className="glass-panel p-6">
            <h3 className="text-xl text-cyber-blue mb-4">
              {splitMode === 'even' ? 'Split Bill Evenly' : 'Custom Bill Split'}
            </h3>
            
            {splitMode === 'even' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Total Bill Amount</label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Paid By</label>
                  <select
                    className="glass-input w-full"
                    value={newExpense.paidBy}
                    onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                  >
                    {people.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Split Between</label>
                  <div className="flex flex-wrap gap-2">
                    {people.map(person => (
                      <button
                        key={person.id}
                        className={`px-2 py-1 rounded text-xs ${
                          newExpense.splitWith.includes(person.id)
                            ? 'bg-cyber-green text-black'
                            : 'bg-cyber-dark/50 text-white'
                        }`}
                        onClick={() => togglePersonInSplit(person.id)}
                      >
                        {person.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {newExpense.amount && parseFloat(newExpense.amount) > 0 && newExpense.splitWith.length > 0 && (
                  <div className="mt-4 p-4 bg-cyber-dark/50 rounded-lg">
                    <p className="text-center text-cyber-pink mb-2">Each person pays:</p>
                    <p className="text-center text-3xl text-cyber-gold font-bold">
                      {formatCurrency(parseFloat(newExpense.amount) / newExpense.splitWith.length)}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <motion.button
                    className="cyber-btn text-sm bg-cyber-green text-black"
                    onClick={handleAddExpense}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newExpense.amount || parseFloat(newExpense.amount) <= 0 || newExpense.splitWith.length === 0}
                  >
                    ADD TO EXPENSES
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyber-blue mb-2">Individual Amounts</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {people.map(person => (
                      <div key={person.id} className="flex items-center space-x-2">
                        <span className="text-white w-20">{person.name}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="glass-input flex-1"
                          value={customBill[person.id] || ''}
                          onChange={(e) => handleCustomBillChange(person.id, e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Tip Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="glass-input w-full"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-cyber-blue mb-1">Paid By</label>
                  <select
                    className="glass-input w-full"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                  >
                    {people.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Subtotal and calculations */}
                <div className="mt-4 p-4 bg-cyber-dark/50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Subtotal:</span>
                    <span className="text-cyber-gold">{formatCurrency(Object.values(customBill).reduce((sum, val) => sum + val, 0))}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white">Tip:</span>
                    <span className="text-cyber-pink">{formatCurrency(parseFloat(tipAmount) || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total:</span>
                    <span className="text-cyber-green font-bold">
                      {formatCurrency((Object.values(customBill).reduce((sum, val) => sum + val, 0)) + (parseFloat(tipAmount) || 0))}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <motion.button
                    className="cyber-btn text-sm bg-cyber-green text-black"
                    onClick={calculateCustomBill}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    CALCULATE & SAVE
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Current Balances */}
          <div className="glass-panel p-6">
            <h3 className="text-xl text-cyber-blue mb-4">Current Balances</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {people.map(person => {
                const balance = balances[person.id] || 0;
                const isPositive = balance > 0;
                const isNeutral = Math.abs(balance) < 0.01;
                
                return (
                  <div 
                    key={person.id} 
                    className={`p-3 rounded-lg ${
                      isNeutral 
                        ? 'bg-cyber-dark/50' 
                        : isPositive 
                          ? 'bg-cyber-green/20 border border-cyber-green'
                          : 'bg-cyber-pink/20 border border-cyber-pink'
                    }`}
                  >
                    <div className="text-lg font-bold">{person.name}</div>
                    <div className={`text-xl ${
                      isNeutral 
                        ? 'text-white' 
                        : isPositive 
                          ? 'text-cyber-green' 
                          : 'text-cyber-pink'
                    }`}>
                      {formatCurrency(balance)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Settlements */}
          <div className="glass-panel p-6">
            <h3 className="text-xl text-cyber-blue mb-4">Settlements</h3>
            
            {settlements.length === 0 ? (
              <p className="text-center text-white py-4">All settled up! No payments needed.</p>
            ) : (
              <div className="space-y-3">
                {settlements.map((settlement, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-cyber-dark/50"
                  >
                    <div className="flex items-center">
                      <div className="text-cyber-pink">{nameMap[settlement.from]}</div>
                      <div className="mx-2 text-white">pays</div>
                      <div className="text-cyber-green">{nameMap[settlement.to]}</div>
                    </div>
                    <div className="text-cyber-gold font-bold">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total Expenses */}
          <div className="glass-panel p-6">
            <h3 className="text-xl text-cyber-blue mb-4">Stats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-cyber-dark/50 p-3 rounded-lg">
                <div className="text-sm text-cyber-pink">Total Expenses</div>
                <div className="text-2xl text-white font-bold">
                  {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </div>
              </div>
              
              <div className="bg-cyber-dark/50 p-3 rounded-lg">
                <div className="text-sm text-cyber-pink">Avg Per Person</div>
                <div className="text-2xl text-white font-bold">
                  {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0) / people.length)}
                </div>
              </div>
              
              <div className="bg-cyber-dark/50 p-3 rounded-lg">
                <div className="text-sm text-cyber-pink">Expense Count</div>
                <div className="text-2xl text-white font-bold">
                  {expenses.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BillSplit; 