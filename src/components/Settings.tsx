import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType, logout } from '../firebase';
import { doc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { User, Trash2, Save, AlertTriangle, X, CheckCircle2, Smile } from 'lucide-react';

const EMOJIS = [
  '👤', '👨', '👩', '🧔', '🧕', '👴', '👵', '👦', '👧', 
  '🦁', '🦊', '🐻', '🐼', '🐨', '🐯', '🐸', '🦄', '🐲', 
  '🌵', '🍕', '🍔', '🍦', '⚽', '🏀', '🎸', '🎮', '🚀', 
  '💎', '🔥', '✨', '🌈', '🍀', '💰', '💳', '📊', '🏠', '🚗', '💼'
];
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SettingsProps {
  profile: UserProfile;
}

export default function Settings({ profile }: SettingsProps) {
  const [newName, setNewName] = useState(profile.displayName || '');
  const [selectedEmoji, setSelectedEmoji] = useState(profile.emoji || '👤');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newName.trim() || newName === profile.displayName) && selectedEmoji === profile.emoji) return;

    setIsUpdating(true);
    setError(null);
    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        displayName: newName.trim(),
        emoji: selectedEmoji
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      setError('هەڵەیەک ڕوویدا لە کاتی نوێکردنەوەی زانیارییەکان');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsUpdating(true);
    setError(null);
    try {
      const batch = writeBatch(db);
      
      // Delete transactions
      const transactionsSnap = await getDocs(collection(db, `users/${profile.uid}/transactions`));
      transactionsSnap.forEach((doc) => batch.delete(doc.ref));
      
      // Delete debts
      const debtsSnap = await getDocs(collection(db, `users/${profile.uid}/debts`));
      debtsSnap.forEach((doc) => batch.delete(doc.ref));
      
      // Delete savings
      const savingsSnap = await getDocs(collection(db, `users/${profile.uid}/savings`));
      savingsSnap.forEach((doc) => batch.delete(doc.ref));
      
      // Delete user profile
      batch.delete(doc(db, 'users', profile.uid));
      
      await batch.commit();
      
      // Delete Firebase Auth user
      await deleteUser(user);
      await logout();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('بۆ سڕینەوەی ئەکاونت، پێویستە جارێکی تر بچیتەوە ژوورەوە (Re-authenticate)');
      } else {
        setError('هەڵەیەک ڕوویدا لە کاتی سڕینەوەی ئەکاونت');
      }
    } finally {
      setIsUpdating(false);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ڕێکخستنەکان</h2>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">زانیارییەکان</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">ناوی خۆت بگۆڕە</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {!profile.photoURL && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 flex items-center gap-2">
                <Smile className="w-4 h-4" />
                ئیمۆجی هەڵبژێرە (وەک وێنەی پرۆفایل)
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-xl rounded-xl transition-all border-2",
                      selectedEmoji === emoji 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500 scale-110" 
                        : "bg-gray-50 dark:bg-gray-900 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">ناو</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 px-6 outline-none transition-all dark:text-white text-right"
              placeholder="ناوی تەواوت"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isUpdating || ((!newName.trim() || newName === profile.displayName) && selectedEmoji === profile.emoji)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100 dark:shadow-none"
            >
              <Save className="w-5 h-5" />
              پاشەکەوتکردن
            </button>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-green-600 font-bold"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  بە سەرکەوتوویی گۆڕدرا
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-400">ناوچەی مەترسیدار</h3>
            <p className="text-sm text-red-600/70 dark:text-red-400/60">ئاگاداربە، ئەم کردارە ناگەڕێتەوە</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-red-700 dark:text-red-400/80 max-w-md">
            بە سڕینەوەی ئەکاونتەکەت، هەموو داتاکانت (خەرجی، داهات، پاشەکەوت، قەرز) بە تەواوی دەسڕێنەوە.
          </p>
          <button
            onClick={() => setIsDeleting(true)}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
            سڕینەوەی ئەکاونت
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50 text-center font-bold">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleting(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">دڵنیایت؟</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                ئەم کردارە هەموو داتاکانت بە تەواوی دەسڕێتەوە و ناگەڕێتەوە.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isUpdating}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isUpdating ? 'خەریکی سڕینەوەیە...' : 'بەڵێ، بیسڕەوە'}
                </button>
                <button
                  onClick={() => setIsDeleting(false)}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  پاشگەزبوونەوە
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
