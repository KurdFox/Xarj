import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, SavingGoal } from '../types';
import { formatCurrency } from '../lib/utils';
import { Coins, Plus, Trash2, Target, Calendar, X, TrendingUp, CheckCircle2, FileText, Pencil, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SavingsGoalsProps {
  profile: UserProfile;
}

export default function SavingsGoals({ profile }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [updateAmount, setUpdateAmount] = useState<number>(0);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<SavingGoal>>({
    goalName: '',
    targetAmount: 0,
    currentAmount: 0,
    currency: 'IQD',
    icon: '🎯',
    note: '',
  });

  useEffect(() => {
    const q = query(
      collection(db, `users/${profile.uid}/savings`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingGoal)));
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${profile.uid}/savings`));

    return () => unsub();
  }, [profile.uid]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.goalName || !newGoal.targetAmount) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, `users/${profile.uid}/savings`, editingId), {
          ...newGoal,
        });
      } else {
        await addDoc(collection(db, `users/${profile.uid}/savings`), {
          ...newGoal,
          userId: profile.uid,
          currency: 'IQD', // Explicitly set to IQD
          createdAt: Timestamp.now(),
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setNewGoal({
        goalName: '',
        targetAmount: 0,
        currentAmount: 0,
        currency: 'IQD',
        icon: '🎯',
        note: '',
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, `users/${profile.uid}/savings`);
    }
  };

  const handleEdit = (goal: SavingGoal) => {
    setEditingId(goal.id!);
    setNewGoal({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      currency: goal.currency || 'IQD',
      icon: goal.icon || '🎯',
      note: goal.note || '',
    });
    setIsAdding(true);
  };

  const handleAddFunds = async (goalId: string, current: number) => {
    if (!updateAmount) return;
    try {
      await updateDoc(doc(db, `users/${profile.uid}/savings`, goalId), {
        currentAmount: current + updateAmount
      });
      setIsUpdating(null);
      setUpdateAmount(0);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}/savings/${goalId}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${profile.uid}/savings`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/savings/${id}`);
    }
  };

  const icons = ['🎯', '🏠', '🚗', '💻', '✈️', '💍', '🎓', '🎁'];

  const [calcTarget, setCalcTarget] = useState<number>(30000000);
  const [calcSaving, setCalcSaving] = useState<number>(1000000);

  const calculateResult = () => {
    if (!calcSaving || calcSaving <= 0) return 0;
    return Math.ceil(calcTarget / calcSaving);
  };

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ئامانجەکانی پاشەکەوت</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
          >
            <Plus className="w-5 h-5" />
            ئامانجی نوێ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <Coins className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-gray-500">هیچ ئامانجێکی پاشەکەوتت نییە</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              const isCompleted = progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col group relative overflow-hidden"
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-4 bg-green-500 text-white rounded-bl-2xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{goal.goalName}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">دروستکراوە لە: {goal.createdAt?.toDate()?.toLocaleDateString('ku-IQ')}</p>
                        {goal.note && (
                          <button 
                            onClick={() => setSelectedNote(goal.note!)}
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">کۆکراوەتەوە</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">ئامانج</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                        <span>پێشکەوتن</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={cn(
                            "h-full rounded-full transition-all",
                            isCompleted ? "bg-green-500" : "bg-blue-600 dark:bg-blue-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-2">
                    <button
                      onClick={() => setIsUpdating(goal.id!)}
                      className="flex-1 bg-gray-900 dark:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-700 transition-all active:scale-95"
                    >
                      زیادکردنی پارە
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-3 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id!)}
                        className="p-3 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Add Funds Mini Modal */}
                  <AnimatePresence>
                    {isUpdating === goal.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6 flex flex-col justify-center z-10"
                      >
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-center">بڕی پارەی زیادکراو</h4>
                        <div className="relative mb-4">
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs font-bold">IQD</div>
                          <input
                            type="number"
                            autoFocus
                            value={updateAmount || ''}
                            onChange={(e) => setUpdateAmount(Number(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-500 rounded-xl py-3 pr-10 pl-4 outline-none font-bold dark:text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddFunds(goal.id!, goal.currentAmount)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm"
                          >
                            پاشەکەوت
                          </button>
                          <button
                            onClick={() => setIsUpdating(null)}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-3 rounded-xl font-bold text-sm"
                          >
                            پاشگەزبوونەوە
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Calculator Section */}
      <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">حاسیبەی پاشەکەوت</h2>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 px-1">بڕی پارەی ئامانج</label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-sm">IQD</div>
                  <input
                    type="number"
                    value={calcTarget || ''}
                    onChange={(e) => setCalcTarget(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 pr-12 pl-4 outline-none font-bold text-xl dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 px-1">بڕی پاشەکەوت لە هەر جارێکدا</label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-sm">IQD</div>
                  <input
                    type="number"
                    value={calcSaving || ''}
                    onChange={(e) => setCalcSaving(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 pr-12 pl-4 outline-none font-bold text-xl dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/20 text-center">
              <p className="text-blue-600 dark:text-blue-400 font-bold mb-4">ئەنجامی حیسابکردن</p>
              <div className="space-y-2">
                <h4 className="text-5xl font-black text-blue-700 dark:text-blue-400">
                  {calculateResult()}
                </h4>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  جار پاشەکەوتکردن
                </p>
              </div>
              <p className="mt-6 text-sm text-blue-600/60 dark:text-blue-400/60 leading-relaxed">
                بە پاشەکەوتکردنی {formatCurrency(calcSaving)} لە هەر جارێکدا، 
                پێویستت بە {calculateResult()} جار پاشەکەوتکردن دەبێت بۆ گەیشتن بە ئامانجەکەت.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
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
                  {editingId ? 'دەستکاری ئامانج' : 'ئامانجێکی نوێ'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewGoal({
                      goalName: '',
                      targetAmount: 0,
                      currentAmount: 0,
                      deadline: '',
                    });
                  }} 
                  className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-x-auto">
                    {icons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewGoal({ ...newGoal, icon })}
                        className={cn(
                          "w-12 h-12 flex-shrink-0 rounded-xl text-2xl flex items-center justify-center transition-all",
                          newGoal.icon === icon ? "bg-white dark:bg-gray-700 shadow-md scale-110" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Target className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ناوی ئامانج (بۆ نموونە: کڕینی لاپتۆپ)"
                      value={newGoal.goalName}
                      onChange={(e) => setNewGoal({ ...newGoal, goalName: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all font-bold dark:text-white"
                      required
                    />
                  </div>

                  <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-sm">IQD</div>
                    <input
                      type="number"
                      placeholder="بڕی پارەی پێویست"
                      value={newGoal.targetAmount || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
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
                      value={newGoal.note}
                      onChange={(e) => setNewGoal({ ...newGoal, note: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all min-h-[100px] dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
                >
                  {editingId ? 'نوێکردنەوە' : 'دروستکردنی ئامانج'}
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
