"use client";
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';

export function LanguageSelection() {
  const { language, setLanguage, setEnglishLevel, setStep } = useAppStore();

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    if (lang === 'hi') {
      setStep(1); // Skip english level
    }
  };

  const handleLevelSelect = (level: 'Basic' | 'Comfortable' | 'Fluent') => {
    setEnglishLevel(level);
    setStep(1);
  };

  return (
    <div className="max-w-2xl mx-auto py-24 px-4 w-full flex flex-col items-center">
      {!language ? (
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-serif text-textPrimary text-center mb-8">Choose your language</h1>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => handleLanguageSelect('en')} className="w-full text-left focus:outline-none">
              <Card className="p-6 hover:border-accentPrimary hover:shadow-elevated transition-all group active:scale-[0.98]">
                <div className="text-xl font-medium text-textPrimary group-hover:text-accentPrimary transition-colors">English</div>
              </Card>
            </button>
            <button onClick={() => handleLanguageSelect('hi')} className="w-full text-left focus:outline-none">
              <Card className="p-6 hover:border-accentPrimary hover:shadow-elevated transition-all group active:scale-[0.98]">
                <div className="text-xl font-medium text-textPrimary group-hover:text-accentPrimary transition-colors">हिंदी (Hindi)</div>
              </Card>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-serif text-textPrimary text-center mb-8">Comfort level with English</h1>
          <div className="grid grid-cols-1 gap-4">
            {['Basic', 'Comfortable', 'Fluent'].map(level => (
              <button key={level} onClick={() => handleLevelSelect(level as 'Basic' | 'Comfortable' | 'Fluent')} className="w-full text-left focus:outline-none">
                <Card className="p-6 hover:border-accentPrimary hover:shadow-elevated transition-all group active:scale-[0.98]">
                  <div className="text-lg font-medium text-textPrimary group-hover:text-accentPrimary transition-colors">{level}</div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
