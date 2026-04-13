import React from 'react';
import { Download, Apple, Smartphone, Share, PlusSquare, MoreVertical, MonitorSmartphone } from 'lucide-react';
import { motion } from 'motion/react';

export default function DownloadApp() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Download className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">دابەزاندن</h2>
        <p className="text-gray-500 dark:text-gray-400">سیستەمی خەرج دابەزێنە سەر مۆبایلەکەت بۆ بەکارهێنانێکی ئاسانتر</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* iOS Instructions */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Apple className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">بۆ بەکارهێنەرانی ئایفۆن (iOS)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Safari</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">لە وێبگەڕی سەفاری (Safari)، کلیک لە ئایکۆنی "Share" بکە لە خوارەوەی شاشەکە.</p>
                <div className="mt-2 inline-flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Share className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">بچۆ خوارەوە و کلیک لە "Add to Home Screen" بکە.</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
                  <PlusSquare className="w-4 h-4" />
                  Add to Home Screen
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">لە گۆشەی سەرەوە کلیک لە "Add" بکە.</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold">
                  Add
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Android Instructions */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">بۆ بەکارهێنەرانی ئەندرۆید (Android)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chrome</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">لە وێبگەڕی کرۆم (Chrome)، کلیک لە سێ خاڵەکەی گۆشەی سەرەوە بکە.</p>
                <div className="mt-2 inline-flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">لە مینیوکەدا کلیک لە "Install App" یان "Add to Home screen" بکە.</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium">
                  <MonitorSmartphone className="w-4 h-4" />
                  Install App
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">کلیک لە "Install" یان "Add" بکە بۆ تەواوکردن.</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold">
                  Install
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none space-y-6 text-center mt-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">بۆ داونڵۆدکردن وەك بەرنامە بۆ ناو موبایل</h3>
          <p className="text-blue-100">(تەنها سیستەمی ئەندرۆید)</p>
        </div>
        
        <div className="flex justify-center pt-2">
          <a 
            href="https://download1347.mediafire.com/91zdiz9oziegkXQz7MHlF7SuteEsC1ag5sHUb9VP9dgPVCuXoIBIJxV2I6_fto2K2ArFgH0mX481Rk5qwlNhCvZpBuW14e5z3mOTKUdsZxrAwYCS40LeC36S2pk8ANort2KI8NswxQVpq0HyePDcSjF40R4iVhxUcwc9qX4yxuWNiixA/67kbia0ovgpip0t/Xarj.apk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-50 transition-all active:scale-95 shadow-lg w-full sm:w-auto"
          >
            <Download className="w-6 h-6" />
            دابەزاندن
          </a>
        </div>
      </div>
    </div>
  );
}
