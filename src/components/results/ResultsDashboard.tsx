"use client";
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, MessageSquare, Download } from 'lucide-react';
import { translations } from '@/lib/translations';

export function ResultsDashboard() {
  const { profile, result, language, englishLevel, chatHistory, addChatMessage, resetApp } = useAppStore();
  const t = translations[language || 'en'];
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!result) return null;

  const handleRefine = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const q = chatInput;
    setChatInput('');
    addChatMessage({ role: 'user', content: q });
    setIsChatLoading(true);
    
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, lastResult: result, chatHistory, question: q, language, englishLevel })
      });
      const data = await res.json();
      if (data.answer) {
        addChatMessage({ role: 'model', content: data.answer });
      } else {
        addChatMessage({ role: 'model', content: "Something went wrong reaching the assistant — try again" });
      }
    } catch (e) {
      console.error(e);
      addChatMessage({ role: 'model', content: "Something went wrong reaching the assistant — try again" });
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full flex gap-6 relative">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-serif text-textPrimary mb-2">Your Career Compass</h1>
            <p className="text-textSecondary">Based on your background and interests.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}><Download size={16} className="mr-2"/> {t.exportPdf}</Button>
            <Button variant="secondary" onClick={resetApp}>{t.startOver}</Button>
          </div>
        </div>

        {/* Caveats */}
        <Card className="bg-caveatBg border-warning/30 p-5 flex gap-4 items-start">
          <AlertCircle className="text-warning shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm text-textPrimary">
            <p className="font-semibold">{t.caveatsTitle}</p>
            <ul className="list-disc pl-4 space-y-1">
              {result.assumptions_and_caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <p className="text-xs text-textSecondary mt-2">{t.caveatsDesc}</p>
          </div>
        </Card>

        {/* Directions */}
        <div className="space-y-4">
          {result.directions.map((dir, idx) => {
            const isExpanded = expandedId === idx;
            return (
              <Card key={idx} className="overflow-hidden transition-all">
                <button 
                  className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setExpandedId(isExpanded ? null : idx)}
                >
                  <div className="w-full pr-4">
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="text-sm text-accentPrimary font-bold">{t.option} {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-textSecondary bg-bgSecondary px-3 py-1 rounded-full border border-borderSubtle">
                          {dir.feasibility?.band}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif text-textPrimary">{dir.title}</h3>
                    <p className="text-textSecondary mt-1 line-clamp-1">{dir.summary}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="text-textTertiary shrink-0" /> : <ChevronDown className="text-textTertiary shrink-0" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-borderSubtle"
                    >
                      <div className="p-6 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-bgSecondary p-4 rounded-xl">
                            <h4 className="font-semibold text-textPrimary mb-2 text-sm">{t.whyFits}</h4>
                            <p className="text-textSecondary text-sm leading-relaxed">{dir.fit_rationale}</p>
                          </div>
                          {dir.feasibility && (
                            <div className="bg-caveatBg border border-borderSubtle p-4 rounded-xl">
                              <h4 className="font-semibold text-textPrimary mb-2 text-sm">Feasibility: {dir.feasibility.approx_range}</h4>
                              <p className="text-textSecondary text-sm leading-relaxed">{dir.feasibility.explanation}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-textPrimary mb-3 text-sm">{t.skillsHave}</h4>
                            <ul className="space-y-2">
                              {dir.skills_have.map((s, i) => (
                                <li key={i} className="flex items-center text-sm text-textSecondary">
                                  <CheckCircle2 size={16} className="text-success mr-2" /> {s.skill}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-textPrimary mb-3 text-sm">{t.skillsBuild}</h4>
                            <ul className="space-y-3">
                              {dir.skills_needed.map((s, i) => (
                                <div key={i} className="flex flex-col gap-2 bg-bgSecondary px-3 py-2.5 rounded-lg">
                                  <div className="flex items-center justify-between text-sm text-textSecondary">
                                    <span className="font-medium text-textPrimary">{s.skill}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      s.priority === 'high' ? 'bg-danger/10 text-danger' : 
                                      s.priority === 'medium' ? 'bg-warning/10 text-warning' : 
                                      'bg-borderStrong text-textSecondary'
                                    }`}>{s.priority} priority</span>
                                  </div>
                                  {s.learning_resources && s.learning_resources.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {s.learning_resources.map((r, ri) => (
                                        <span key={ri} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-borderSubtle bg-bgSurface text-textSecondary">
                                          {r.platform}
                                          <span className={`w-2 h-2 rounded-full ${r.type.toLowerCase() === 'free' ? 'bg-success' : 'bg-warning'}`} title={r.type} />
                                          <span className="text-textTertiary font-medium">{r.approx_price}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-textPrimary mb-4 text-sm">{t.roadmap}</h4>
                          <div className="relative border-l-2 border-borderSubtle ml-3 space-y-6">
                            {dir.roadmap?.stages?.map((stage, i) => (
                              <div key={i} className="relative pl-6">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-accentPrimary border-4 border-bgSurface" />
                                <div className="text-xs font-bold text-accentPrimary uppercase tracking-wider mb-1">
                                  {stage.stage} <span className="text-textTertiary normal-case font-normal ml-2">{stage.timeframe}</span>
                                </div>
                                <ul className="list-disc pl-5 text-sm text-textSecondary space-y-1">
                                  {stage.actions.map((act, actIdx) => <li key={actIdx}>{act}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mobile Chat Toggle */}
      <button 
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full bg-textPrimary text-white shadow-elevated flex items-center justify-center font-medium gap-2 hover:bg-black transition-colors md:hidden z-50"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <MessageSquare size={20} /> {t.askWhy}
      </button>

      {/* Desktop Chat Panel */}
      <Card className={`${chatOpen ? 'flex fixed inset-0 z-40 m-4' : 'hidden'} md:flex flex-col md:w-80 md:sticky md:top-8 md:h-[calc(100vh-4rem)] md:shrink-0 md:m-0 bg-bgSurface`}>
        <div className="p-4 border-b border-borderSubtle bg-bgSecondary md:rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-textPrimary">{t.refineAskWhy}</h3>
            <p className="text-xs text-textSecondary">{t.refineDesc}</p>
          </div>
          {chatOpen && <button className="md:hidden p-2" onClick={() => setChatOpen(false)}><ChevronDown /></button>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-bgSecondary p-3 rounded-lg text-sm text-textSecondary">
            {t.hiHelp}
          </div>
          {chatHistory.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-accentPrimary/10 text-textPrimary ml-4' : 'bg-bgSecondary text-textSecondary mr-4'}`}>
              {msg.content}
            </div>
          ))}
          {isChatLoading && (
            <div className="bg-bgSecondary text-textSecondary mr-4 p-3 rounded-lg text-sm flex gap-1 items-center w-fit">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-textTertiary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-textTertiary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-textTertiary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-borderSubtle">
          <form onSubmit={e => { e.preventDefault(); handleRefine(); }} className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 h-10 px-3 rounded-lg border border-borderStrong bg-transparent focus:outline-none focus:border-accentPrimary text-sm text-textPrimary"
              placeholder={t.refinePlaceholder}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isChatLoading}
            />
            <Button type="submit" size="sm" className="px-3" disabled={!chatInput.trim() || isChatLoading}>{t.send}</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
