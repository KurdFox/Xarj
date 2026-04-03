import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, Transaction } from '../types';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, TrendingDown, Plus, Trash2, Calendar, Tag, FileText, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TransactionsProps {
  profile: UserProfile;
  type: 'income' | 'expense';
}

export default function Transactions({ profile, type }: TransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: type,
    amount: 0,
    currency: 'IQD',
    category: '',
    note: '',
  });

  useEffect(() => {
    setNewTransaction(prev => ({ ...prev, type }));
  }, [type]);

  useEffect(() => {
    const q = query(
      collection(db, `users/${profile.uid}/transactions`),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(allTransactions.filter(t => t.type === type));
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${profile.uid}/transactions`));

    return () => unsub();
  }, [profile.uid, type]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = newTransaction.category === 'ئەوانی تر' ? customCategory : newTransaction.category;
    if (!newTransaction.amount || !finalCategory) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, `users/${profile.uid}/transactions`, editingId), {
          ...newTransaction,
          category: finalCategory,
        });
      } else {
        await addDoc(collection(db, `users/${profile.uid}/transactions`), {
          ...newTransaction,
          type: type,
          category: finalCategory,
          userId: profile.uid,
          currency: 'IQD',
          date: Timestamp.now(),
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setCustomCategory('');
      setNewTransaction({
        type: type,
        amount: 0,
        currency: 'IQD',
        category: '',
        note: '',
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, `users/${profile.uid}/transactions`);
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id!);
    setNewTransaction({
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      category: categories[type].includes(t.category) ? t.category : 'ئەوانی تر',
      note: t.note || '',
    });
    if (!categories[type].includes(t.category)) {
      setCustomCategory(t.category);
    }
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${profile.uid}/transactions`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/transactions/${id}`);
    }
  };

  const categories = {
    expense: ['خواردن', 'گواستنەوە', 'کرێ', 'تەندروستی', 'خوێندن', 'کات بەسەربردن', 'جلوبەرگ', 'ئەوانی تر'],
    income: ['مووچە', 'دیاری', 'قازانج', 'ئەوانی تر']
  };

  const isIncome = type === 'income';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isIncome ? 'داهاتەکان' : 'خەرجییەکان'}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className={cn(
            "text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95",
            isIncome ? "bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none" : "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none"
          )}
        >
          <Plus className="w-5 h-5" />
          {isIncome ? 'زیادکردنی داهات' : 'زیادکردنی خەرجی'}
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400">پۆلێن</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400">بڕ</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400">بەروار</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 text-left">کردار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">هیچ تۆمارێک نییە</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isIncome ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        )}>
                          {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{t.category}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">{t.note || 'بێ تێبینی'}</p>
                            {t.note && (
                              <button 
                                onClick={() => setSelectedNote(t.note!)}
                                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={cn(
                        "font-bold",
                        isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {t.date?.toDate()?.toLocaleDateString('ku-IQ')}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id!)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId 
                    ? (isIncome ? 'دەستکاری داهات' : 'دەستکاری خەرجی')
                    : (isIncome ? 'زیادکردنی داهات' : 'زیادکردنی خەرجی')
                  }
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewTransaction({
                      type: type,
                      amount: 0,
                      currency: 'IQD',
                      category: '',
                      note: '',
                    });
                  }} 
                  className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-sm">IQD</div>
                    <input
                      type="number"
                      placeholder="بڕی پارە"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-16 outline-none transition-all font-bold text-xl dark:text-white"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">
                      دینار
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <select
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all appearance-none dark:text-white"
                        required
                      >
                        <option value="" className="dark:bg-gray-900">پۆلێن هەڵبژێرە</option>
                        {categories[type].map(cat => (
                          <option key={cat} value={cat} className="dark:bg-gray-900">{cat}</option>
                        ))}
                      </select>
                    </div>

                    {newTransaction.category === 'ئەوانی تر' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <Plus className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="ناوی پۆلێن بنووسە"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-3 pr-12 pl-4 outline-none transition-all font-medium dark:text-white"
                          required
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="relative">
                    <FileText className="absolute right-4 top-4 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <textarea
                      placeholder="تێبینی (ئارەزوومەندانە)"
                      value={newTransaction.note}
                      onChange={(e) => setNewTransaction({ ...newTransaction, note: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all min-h-[100px] dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95",
                    isIncome ? "bg-green-600 hover:bg-green-700 shadow-green-100 dark:shadow-none" : "bg-red-600 hover:bg-red-700 shadow-red-100 dark:shadow-none"
                  )}
                >
                  {editingId ? 'نوێکردنەوە' : 'پاشەکەوتکردن'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  تێبینی
                </h3>
                <button onClick={() => setSelectedNote(null)} className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedNote}</p>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="w-full mt-6 bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-all"
              >
                داخستن
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
