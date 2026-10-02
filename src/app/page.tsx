"use client";
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { ProfileIntakeWizard } from '@/components/wizard/ProfileIntakeWizard';
import { LanguageSelection } from '@/components/wizard/LanguageSelection';
import { LoadingAnalysis } from '@/components/results/LoadingAnalysis';
import { ResultsDashboard } from '@/components/results/ResultsDashboard';
import { Compass } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function Home() {
  const { step, setStep, language } = useAppStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[language || 'en'];

  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col print:bg-white">
        <header className="h-16 border-b border-borderSubtle flex items-center px-6 bg-bgSurface shrink-0 print:hidden">
          <div className="flex items-center gap-2 font-serif text-xl text-textPrimary font-bold">
            <Compass className="text-accentPrimary" /> Career Compass
          </div>
        </header>
        <div className="flex-1 overflow-y-auto"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col print:bg-white">
      <header className="h-16 border-b border-borderSubtle flex items-center px-6 bg-bgSurface shrink-0 print:hidden">
        <div className="flex items-center gap-2 font-serif text-xl text-textPrimary font-bold">
          <Compass className="text-accentPrimary" /> Career Compass
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {step === 0 && <LanguageSelection />}
        {step === 1 && (
          <div className="max-w-2xl mx-auto py-24 px-4 text-center">
            <div className="mb-6 flex justify-center"><Compass size={48} className="text-accentPrimary" /></div>
            <h1 className="text-4xl font-serif text-textPrimary mb-4">{t.findYourPath}</h1>
            <p className="text-lg text-textSecondary mb-8 leading-relaxed">
              {t.appHelps} <br/>
              <span className="text-sm italic mt-2 block">{t.supportTool}</span>
            </p>
            <Button size="lg" onClick={() => setStep(2)}>{t.getStarted}</Button>
          </div>
        )}
        
        {(step >= 2 && step <= 6) && <ProfileIntakeWizard />}
        {step === 7 && <LoadingAnalysis />}
        {step === 8 && <ResultsDashboard />}
      </div>
    </main>
  );
}
