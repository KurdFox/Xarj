import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { UserProfile, Transaction, Debt, SavingGoal } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Coins, HandCoins, ArrowUpRight, ArrowDownRight, Clock, Layout } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savings, setSavings] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transactionsQuery = query(
      collection(db, `users/${profile.uid}/transactions`),
      orderBy('date', 'desc')
    );

    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${profile.uid}/transactions`));

    const unsubDebts = onSnapshot(collection(db, `users/${profile.uid}/debts`), (snapshot) => {
      setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt)));
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${profile.uid}/debts`));

    const unsubSavings = onSnapshot(collection(db, `users/${profile.uid}/savings`), (snapshot) => {
      setSavings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingGoal)));
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${profile.uid}/savings`));

    setLoading(false);
    return () => {
      unsubTransactions();
      unsubDebts();
      unsubSavings();
    };
  }, [profile.uid]);

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = savings
    .reduce((acc, s) => acc + s.currentAmount, 0);

  const totalLent = debts
    .filter(d => d.type === 'lent' && d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalBorrowed = debts
    .filter(d => d.type === 'borrowed' && d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);

  const incomeVsExpense = totalIncome - totalExpense;

  const stats = [
    { label: 'کۆی پاشەکەوت', value: totalSavings, icon: Coins, color: 'text-blue-600', bg: 'bg-blue-50' },
    { 
      label: 'داهات بەرامبەر خەرجی', 
      value: incomeVsExpense, 
      icon: incomeVsExpense >= 0 ? TrendingUp : TrendingDown, 
      color: incomeVsExpense >= 0 ? 'text-green-600' : 'text-red-600', 
      bg: incomeVsExpense >= 0 ? 'bg-green-50' : 'bg-red-50',
      isBalance: true 
    },
    { label: 'قەرزەکان (لای خەڵک)', value: totalLent, icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'قەرزەکان (لای من)', value: totalBorrowed, icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className={cn(stat.bg, "dark:bg-opacity-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4")}>
              <stat.icon className={stat.color + " w-6 h-6"} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
            <h3 className={cn(
              "text-xl font-bold",
              stat.isBalance 
                ? (stat.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")
                : "text-gray-900 dark:text-white"
            )}>
              {stat.isBalance && stat.value > 0 ? '+' : ''}{formatCurrency(stat.value)}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              دوایین خەرجییەکان
            </h3>
          </div>
          <div className="space-y-4">
            {transactions.filter(t => t.type === 'expense').length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-10">هیچ خەرجییەک نییە</p>
            ) : (
              transactions.filter(t => t.type === 'expense').slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{t.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{t.note || 'بێ تێبینی'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-600 dark:text-red-400">
                      -{formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {t.date?.toDate()?.toLocaleDateString('ku-IQ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Income */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              دوایین داهاتەکان
            </h3>
          </div>
          <div className="space-y-4">
            {transactions.filter(t => t.type === 'income').length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-10">هیچ داهاتێک نییە</p>
            ) : (
              transactions.filter(t => t.type === 'income').slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{t.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{t.note || 'بێ تێبینی'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      +{formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {t.date?.toDate()?.toLocaleDateString('ku-IQ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Savings Progress Mini */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ئامانجەکانی پاشەکەوت
          </h3>
          <div className="space-y-6">
            {savings.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-10">هیچ ئامانجێک نییە</p>
            ) : (
              savings.slice(0, 3).map((s) => {
                const progress = Math.min(Math.round((s.currentAmount / s.targetAmount) * 100), 100);
                return (
                  <div key={s.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{s.goalName}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                      <span>{formatCurrency(s.currentAmount)}</span>
                      <span>کۆی گشتی: {formatCurrency(s.targetAmount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            کورتەی گشتی
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
              <p className="text-red-600 dark:text-red-400 text-sm font-bold mb-2">کۆی خەرجییەکان</p>
              <h4 className="text-2xl font-black text-red-700 dark:text-red-400">{formatCurrency(totalExpense)}</h4>
            </div>
            <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
              <p className="text-green-600 dark:text-green-400 text-sm font-bold mb-2">کۆی داهاتەکان</p>
              <h4 className="text-2xl font-black text-green-700 dark:text-green-400">{formatCurrency(totalIncome)}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
