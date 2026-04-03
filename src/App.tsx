/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType, signInWithPhone, signUpWithPhone } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { UserProfile, Currency } from './types';
import { Layout, Wallet, Coins, HandCoins, LogOut, RefreshCw, Menu, X, TrendingUp, TrendingDown, Settings as SettingsIcon, Moon, Sun, Heart, User, Lock, Phone as PhoneIcon, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Components
import Dashboard from './components/Dashboard';
import SavingsGoals from './components/SavingsGoals';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import Settings from './components/Settings';
import Support from './components/Support';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'savings' | 'expenses' | 'income' | 'debts' | 'settings' | 'support'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    console.log('Dark mode changed:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Migrate old profiles to IQD if needed
            if (data.preferredCurrency !== 'IQD') {
              setDoc(userDocRef, { ...data, preferredCurrency: 'IQD' }, { merge: true })
                .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${firebaseUser.uid}`));
            }
            setProfile(data);
            setLoading(false);
          } else {
              const initialProfile: UserProfile = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || authName || 'بەکارهێنەر',
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                preferredCurrency: 'IQD',
              };
            setDoc(userDocRef, initialProfile)
              .then(() => {
                // Snapshot will fire again with the new data
              })
              .catch(e => {
                handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
                setLoading(false);
              });
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, [authName]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validation
    if (authPhone.length !== 11) {
      setAuthError('تکایە ژمارەی مۆبایل بە دروستی بنووسە (١١ ژمارە)');
      return;
    }

    if (isSignUp) {
      if (!authName) {
        setAuthError('تکایە ناوەکەت بنووسە');
        return;
      }
      if (authPass.length < 6) {
        setAuthError('پاسۆرد دەبێت لانی کەم ٦ پیت یان ژمارە بێت');
        return;
      }
      if (authPass !== authConfirmPass) {
        setAuthError('پاسۆردەکان وەک یەک نین');
        return;
      }
    }

    setIsAuthLoading(true);
    try {
      if (isSignUp) {
        await signUpWithPhone(authPhone, authPass, authName);
      } else {
        await signInWithPhone(authPhone, authPass);
      }
    } catch (err: any) {
      console.error('Auth Error:', err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError(isSignUp ? 'هەڵەیەک لە زانیارییەکاندا هەیە' : 'ژمارەی مۆبایل یان پاسۆرد هەڵەیە');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('ئەم ژمارەیە پێشتر تۆمار کراوە');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError('سیستەمی چوونەژوورەوە بە مۆبایل کارا نەکراوە لە فایەربەیس، تکایە Email/Password کارا بکە');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('پاسۆردەکە زۆر لاوازە، تکایە پاسۆردێکی بەهێزتر بنووسە');
      } else {
        setAuthError('هەڵەیەک ڕوویدا: ' + (err.message || 'تکایە دووبارە هەوڵ بدەرەوە'));
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center p-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
              <Wallet className="w-10 h-10 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-sans tracking-tight">XARJ - خەرج</h1>
            <p className="text-gray-500 dark:text-gray-400 font-sans">بەڕێوەبەری دارایی و پاشەکەوتەکانت بە شێوەیەکی ئاسان</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="ناوی تەواو"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all dark:text-white text-right placeholder:text-right"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                dir="rtl"
                placeholder="ژمارەی مۆبایل"
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 pr-12 pl-4 outline-none transition-all dark:text-white text-right placeholder:text-right"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none">
                ١١ ژمارە بێت
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                dir="rtl"
                placeholder="پاسۆرد"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 pr-12 pl-12 outline-none transition-all dark:text-white text-right placeholder:text-right"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  dir="rtl"
                  placeholder="دووبارەکردنەوەی پاسۆرد"
                  value={authConfirmPass}
                  onChange={(e) => setAuthConfirmPass(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl py-4 pr-12 pl-12 outline-none transition-all dark:text-white text-right placeholder:text-right"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{authError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isAuthLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                isSignUp ? 'تۆمارکردن' : 'چوونەژوورەوە'
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <span className="relative px-4 bg-white dark:bg-gray-900 text-sm text-gray-400">یان</span>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 py-4 px-6 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              چوونەژوورەوە بە گووگڵ
            </button>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {isSignUp ? 'پێشتر هەژمارت هەیە؟ بچۆ ژوورەوە' : 'هێشتا هەژمارت نییە؟ دروستی بکە'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'داشبۆرد', icon: Layout },
    { id: 'expenses', label: 'خەرجییەکان', icon: TrendingDown },
    { id: 'income', label: 'داهاتەکان', icon: TrendingUp },
    { id: 'savings', label: 'پاشەکەوت', icon: Coins },
    { id: 'debts', label: 'قەرزەکان', icon: HandCoins },
    { id: 'settings', label: 'ڕێکخستنەکان', icon: SettingsIcon },
    { id: 'support', label: 'پشتگیری و دەربارە', icon: Heart },
  ];

  return (
    <div className={cn(
      "min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300",
      isDarkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    )} dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">XARJ</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group text-right",
                activeTab === item.id 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            {profile?.photoURL ? (
              <img src={profile.photoURL} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" alt="User" />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                {profile?.emoji || '👤'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile?.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email || 'بەکارهێنەری ژمارە'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-right"
          >
            <LogOut className="w-5 h-5" />
            چوونەدەرەوە
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg dark:text-white">XARJ</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-gray-900 z-[70] p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl dark:text-white">XARJ</span>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-right",
                      activeTab === item.id 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold" 
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center gap-3 px-2">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" alt="User" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                      {profile?.emoji || '👤'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile?.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email || 'بەکارهێنەری ژمارە'}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 text-right"
                >
                  <LogOut className="w-5 h-5" />
                  چوونەدەرەوە
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {profile?.photoURL ? (
              <img src={profile.photoURL} className="w-16 h-16 rounded-2xl border-2 border-white dark:border-gray-800 shadow-sm" alt="User" />
            ) : (
              <div className="w-16 h-16 rounded-2xl border-2 border-white dark:border-gray-800 shadow-sm bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-3xl">
                {profile?.emoji || '👤'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">سڵاو، {profile?.displayName?.split(' ')[0]} 👋</h2>
              <p className="text-gray-500 dark:text-gray-400">بەخێربێیتەوە بۆ سیستەمی خەرج</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {profile && (
              <>
                {activeTab === 'dashboard' && <Dashboard profile={profile} />}
                {activeTab === 'expenses' && <Transactions profile={profile} type="expense" />}
                {activeTab === 'income' && <Transactions profile={profile} type="income" />}
                {activeTab === 'savings' && <SavingsGoals profile={profile} />}
                {activeTab === 'debts' && <Debts profile={profile} />}
                {activeTab === 'settings' && <Settings profile={profile} />}
                {activeTab === 'support' && <Support />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
