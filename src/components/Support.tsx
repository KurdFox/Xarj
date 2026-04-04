import React from 'react';
import { Heart, Phone, ExternalLink, CreditCard, Instagram, Facebook, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function Support() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/20 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-10 h-10 text-pink-600 dark:text-pink-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">پشتگیری و دەربارە</h2>
        <p className="text-gray-500 dark:text-gray-400">بۆ پشتگیری لە گەشەپێدەری ئەم سیستەمە و بەردەوامبوونی پەرەپێدانی</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/30 text-center space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <CreditCard className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h4 className="font-bold text-pink-700 dark:text-pink-400">FastPay</h4>
            <p className="text-sm text-pink-600/70 dark:text-pink-400/60">فاستپەی</p>
          </div>
          
          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-bold text-blue-700 dark:text-blue-400">FIB</h4>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/60">بانکی نێودەوڵەتی یەکەم</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">ژمارەی مۆبایل بۆ ناردن:</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-widest">07510464127</h3>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">داواکردنی سیستەم</h3>
          <p className="text-blue-100 leading-relaxed">گەر سیستەمی لەم شێوەیەتان ویست بۆ خۆتان یان بزنسەکەت، دەتوانن ڕاستەوخۆ پەیوەندیمان پێوە بکەن.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <a 
            href="https://hosheytech.netlify.app/#/services/static" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95"
          >
            <ExternalLink className="w-5 h-5" />
            پەیوەندی بکە
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">دەربارە</h3>
        </div>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p className="font-bold text-gray-900 dark:text-white">ئەم سیستەمە بە خۆڕاییە و دروست کراوە لەلایەن هۆشمەند نوری</p>
          <p>لە دوعای خێر بێبەشمان مەکەن</p>
          <p>بۆ بینینی زانیاری تەکنەلۆژی و بابەتی تر سەردانی ئەم پەیجانەم بکەن</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a 
              href="https://www.instagram.com/HosheyTech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="font-bold">ئینستگرام</span>
            </a>
            
            <a 
              href="https://www.facebook.com/HosheyTech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                <Facebook className="w-5 h-5" />
              </div>
              <span className="font-bold">فەیسبووك</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
