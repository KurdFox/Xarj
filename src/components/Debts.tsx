import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, Debt } from '../types';
import { formatCurrency } from '../lib/utils';
import { HandCoins, Plus, Trash2, User, X, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, FileText, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DebtsProps {
  profile: UserProfile;
}

export default function Debts({ profile }: DebtsProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({
    personName: '',
    amount: 0,
    currency: 'IQD',
    type: 'lent',
    status: 'pending',
    note: '',
  });

  useEffect(() => {
    const q = query(
      collection(db, `users/${profile.uid}/debts`),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt)));
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${profile.uid}/debts`));

    return () => unsub();
  }, [profile.uid]);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.personName || !newDebt.amount) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, `users/${profile.uid}/debts`, editingId), {
          ...newDebt,
        });
      } else {
        await addDoc(collection(db, `users/${profile.uid}/debts`), {
          ...newDebt,
          userId: profile.uid,
          currency: 'IQD', // Explicitly set to IQD
          date: Timestamp.now(),
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setNewDebt({
        personName: '',
        amount: 0,
        currency: 'IQD',
        type: 'lent',
        status: 'pending',
        note: '',
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, `users/${profile.uid}/debts`);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingId(debt.id!);
    setNewDebt({
      personName: debt.personName,
      amount: debt.amount,
      currency: debt.currency,
      type: debt.type,
      status: debt.status,
      note: debt.note || '',
    });
    setIsAdding(true);
  };

  const toggleStatus = async (debt: Debt) => {
    const newStatus = debt.status === 'pending' ? 'paid' : 'pending';
    try {
      await updateDoc(doc(db, `users/${profile.uid}/debts`, debt.id!), {
        status: newStatus
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}/debts/${debt.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${profile.uid}/debts`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/debts/${id}`);
    }
  };

  const lentDebts = debts.filter(d => d.type === 'lent');
  const borrowedDebts = debts.filter(d => d.type === 'borrowed');

  const renderDebtList = (debtList: Debt[], emptyMessage: string, title: string, icon: React.ElementType, colorClass: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClass)}>
          {React.createElement(icon, { className: "w-6 h-6" })}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
          {debtList.length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {debtList.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <HandCoins className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          debtList.map((debt) => (
            <motion.div
              key={debt.id}
              layout
              className={cn(
                "bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all",
                debt.status === 'paid' ? "opacity-60 grayscale" : ""
              )}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className={cn(
                  "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
                  debt.type === 'lent' ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                )}>
                  {debt.type === 'lent' ? <ArrowUpRight className="w-6 h-6 md:w-7 md:h-7" /> : <ArrowDownRight className="w-6 h-6 md:w-7 md:h-7" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg truncate">{debt.personName}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-bold whitespace-nowrap",
                      debt.type === 'lent' ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                    )}>
                      {debt.type === 'lent' ? 'پارەی منی لایە' : 'پارەی لای منە'}
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span className="whitespace-nowrap">{debt.date?.toDate()?.toLocaleDateString('ku-IQ')}</span>
                    {debt.note && (
                      <>
                        <span className="hidden xs:inline">•</span>
                        <button 
                          onClick={() => setSelectedNote(debt.note)}
                          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="xs:hidden">تێبینی</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50 dark:border-gray-800">
                <div className="text-right sm:text-left">
                  <p className={cn(
                    "text-lg md:text-xl font-bold",
                    debt.type === 'lent' ? "text-orange-600 dark:text-orange-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {formatCurrency(debt.amount)}
                  </p>
                  <button
                    onClick={() => toggleStatus(debt)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-lg transition-all whitespace-nowrap",
                      debt.status === 'paid' 
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    {debt.status === 'paid' ? 'دراوەتەوە' : 'وەک دراوە نیشانی بدە'}
                  </button>
                </div>
                <div className="flex sm:flex-col gap-1">
                  <button
                    onClick={() => handleEdit(debt)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-xl"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id!)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">قەرزەکان</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
        >
          <Plus className="w-5 h-5" />
          تۆمارکردنی قەرز
        </button>
      </div>

      <div className="space-y-12">
        {renderDebtList(
          lentDebts, 
          "هیچ کەسێک قەرزاری تۆ نییە", 
          "پارەی منی لایە (قەرزدارمە)", 
          ArrowUpRight, 
          "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
        )}

        <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
          {renderDebtList(
            borrowedDebts, 
            "تۆ قەرزاری هیچ کەسێک نیت", 
            "پارەی لای منە (من قەرزداریمە)", 
            ArrowDownRight, 
            "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          )}
        </div>
      </div>

      {/* Add Debt Modal */}
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
              className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'دەستکاری قەرز' : 'تۆمارکردنی قەرز'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewDebt({
                      personName: '',
                      amount: 0,
                      currency: 'IQD',
                      type: 'lent',
                      status: 'pending',
                      note: '',
                    });
                  }} 
                  className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddDebt} className="space-y-6">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNewDebt({ ...newDebt, type: 'lent' })}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      newDebt.type === 'lent' ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm" : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    پارەم بە قەرز داوە
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDebt({ ...newDebt, type: 'borrowed' })}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      newDebt.type === 'borrowed' ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm" : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    پارەم بە قەرز وەرگرتووە
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ناوی کەسەکە"
                      value={newDebt.personName}
                      onChange={(e) => setNewDebt({ ...newDebt, personName: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all font-bold dark:text-white"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-sm">IQD</div>
                    <input
                      type="number"
                      placeholder="بڕی پارە"
                      value={newDebt.amount || ''}
                      onChange={(e) => setNewDebt({ ...newDebt, amount: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-16 outline-none transition-all font-bold text-xl dark:text-white"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">
                      دینار
                    </div>
                  </div>

                  <div className="relative">
                    <FileText className="absolute right-4 top-4 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <textarea
                      placeholder="تێبینی (ئارەزوومەندانە)"
                      value={newDebt.note}
                      onChange={(e) => setNewDebt({ ...newDebt, note: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all min-h-[100px] dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
                >
                  {editingId ? 'نوێکردنەوە' : 'تۆمارکردن'}
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
