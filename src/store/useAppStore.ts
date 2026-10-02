import { create } from 'zustand';

export type ProfileData = {
  academic: { degree: string; year: string; coursework: string[] };
  skills: string[];
  interests: string[];
  careerOptions: string[];
  constraints: { time: string; location: string; budget: string; timeline: string };
};

export type LearningResource = {
  platform: string;
  type: 'free' | 'paid';
  approx_price: string;
};

export type RoadmapStage = {
  stage: string;
  timeframe: string;
  actions: string[];
};

export type Feasibility = {
  band: 'Emerging Fit' | 'Good Fit' | 'Strong Fit';
  approx_range: string;
  explanation: string;
};

export type CareerDirection = {
  title: string;
  summary: string;
  fit_rationale: string;
  feasibility: Feasibility;
  skills_have: { skill: string }[];
  skills_needed: { skill: string; priority: "high" | "medium" | "low"; learning_resources: LearningResource[] }[];
  roadmap: {
    stages: RoadmapStage[];
  };
};

export type AnalysisResult = {
  directions: CareerDirection[];
  assumptions_and_caveats: string[];
};

export type AppState = {
  language: 'en' | 'hi' | null;
  englishLevel: 'Basic' | 'Comfortable' | 'Fluent' | null;
  step: number;
  profile: ProfileData;
  result: AnalysisResult | null;
  chatHistory: { role: 'user' | 'model'; content: string }[];
  setLanguage: (lang: 'en' | 'hi') => void;
  setEnglishLevel: (level: 'Basic' | 'Comfortable' | 'Fluent') => void;
  setStep: (step: number) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
  setResult: (result: AnalysisResult | null) => void;
  addChatMessage: (msg: { role: 'user' | 'model'; content: string }) => void;
  resetApp: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  language: null,
  englishLevel: null,
  step: 0,
  profile: {
    academic: { degree: '', year: '', coursework: [] },
    skills: [],
    interests: [],
    careerOptions: [],
    constraints: { time: '', location: '', budget: '', timeline: '' },
  },
  result: null,
  chatHistory: [],
  setLanguage: (language) => set({ language }),
  setEnglishLevel: (englishLevel) => set({ englishLevel }),
  setStep: (step) => set({ step }),
  updateProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),
  setResult: (result) => set({ result }),
  addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  resetApp: () => set({
    language: null,
    englishLevel: null,
    step: 0,
    profile: {
      academic: { degree: '', year: '', coursework: [] },
      skills: [],
      interests: [],
      careerOptions: [],
      constraints: { time: '', location: '', budget: '', timeline: '' },
    },
    result: null,
    chatHistory: [],
  }),
}));
