"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TagInput } from '@/components/ui/TagInput';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { translations } from '@/lib/translations';

export function ProfileIntakeWizard() {
  const { profile, updateProfile, setStep, language, englishLevel } = useAppStore();
  const t = translations[language || 'en'];
  const [localStep, setLocalStep] = React.useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (localStep < totalSteps) setLocalStep(prev => prev + 1);
    else handleSubmit();
  };
  const prevStep = () => setLocalStep(prev => prev - 1);

  const handleSubmit = async () => {
    setStep(7); // Loading state
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, language, englishLevel })
      });
      if (!res.ok) {
        throw new Error('Failed to analyze profile');
      }
      const data = await res.json();
      useAppStore.getState().setResult(data);
      setStep(8); // Results state
    } catch (e) {
      console.error(e);
      alert('Something went wrong contacting the AI. Please try again.');
      setStep(2); // Back to wizard
    }
  };

  const StepIndicator = () => (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full ${i + 1 <= localStep ? 'bg-accentPrimary' : 'bg-borderSubtle'}`} />
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 w-full">
      <StepIndicator />
      <Card className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={localStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {localStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-textPrimary">{t.academicTitle}</h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-textSecondary">{t.degreeLabel}</label>
                  <input type="text" className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:ring-1 focus:ring-accentPrimary outline-none text-textPrimary" value={profile.academic.degree} onChange={e => updateProfile({ academic: { ...profile.academic, degree: e.target.value } })} placeholder="e.g. B.S. Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-textSecondary">{t.yearLabel}</label>
                  <input type="text" className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:ring-1 focus:ring-accentPrimary outline-none text-textPrimary" value={profile.academic.year} onChange={e => updateProfile({ academic: { ...profile.academic, year: e.target.value } })} placeholder="e.g. Senior" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-textSecondary">{t.courseworkLabel}</label>
                  <TagInput tags={profile.academic.coursework} setTags={tags => updateProfile({ academic: { ...profile.academic, coursework: tags } })} placeholder="e.g. Data Structures" />
                </div>
              </div>
            )}
            
            {localStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-textPrimary">{t.skillsTitle}</h2>
                <p className="text-textSecondary text-sm">{t.skillsDesc}</p>
                <TagInput 
                  tags={profile.skills} 
                  setTags={tags => updateProfile({ skills: tags })} 
                  placeholder="e.g. Python, Communication, UI Design"
                  suggestions={["Python", "Communication", "Data Analysis", "UI Design", "Public Speaking", "JavaScript"]}
                />
              </div>
            )}

            {localStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-textPrimary">{t.interestsTitle}</h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-textSecondary">{t.enjoyLabel}</label>
                  <TagInput 
                    tags={profile.interests} 
                    setTags={tags => updateProfile({ interests: tags })} 
                    placeholder="e.g. solving ambiguous problems"
                    suggestions={["working with people", "building things", "research", "designing", "analyzing data"]}
                  />
                </div>
                <div className="pt-4">
                  <label className="block text-sm font-medium mb-2 text-textSecondary">{t.careerOptLabel}</label>
                  <TagInput 
                    tags={profile.careerOptions} 
                    setTags={tags => updateProfile({ careerOptions: tags })} 
                    placeholder="e.g. Data Scientist, UX Designer"
                  />
                </div>
              </div>
            )}

            {localStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-textPrimary">{t.constraintsTitle}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-textSecondary">{t.timeLabel}</label>
                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:ring-1 focus:ring-accentPrimary outline-none text-textPrimary" value={profile.constraints.time} onChange={e => updateProfile({ constraints: { ...profile.constraints, time: e.target.value } })} placeholder="e.g. 5 hours" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-textSecondary">{t.locationLabel}</label>
                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:ring-1 focus:ring-accentPrimary outline-none text-textPrimary" value={profile.constraints.location} onChange={e => updateProfile({ constraints: { ...profile.constraints, location: e.target.value } })} placeholder="e.g. Remote only" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-textSecondary">{t.budgetLabel}</label>
                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:ring-1 focus:ring-accentPrimary outline-none text-textPrimary" value={profile.constraints.budget} onChange={e => updateProfile({ constraints: { ...profile.constraints, budget: e.target.value } })} placeholder="e.g. $0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-textSecondary">{t.timelineLabel}</label>
                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:ring-1 focus:ring-accentPrimary outline-none text-textPrimary" value={profile.constraints.timeline} onChange={e => updateProfile({ constraints: { ...profile.constraints, timeline: e.target.value } })} placeholder="e.g. 3 months" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between pt-6 border-t border-borderSubtle">
          <Button variant="ghost" onClick={localStep === 1 ? () => setStep(1) : prevStep}>
            <ChevronLeft size={18} className="mr-2" /> {t.back}
          </Button>
          <Button onClick={nextStep}>
            {localStep === totalSteps ? t.submitProfile : t.next} <ChevronRight size={18} className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
