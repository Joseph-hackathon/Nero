
import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-28 md:py-40 flex flex-col items-center text-center space-y-16">
      <div className="space-y-8 max-w-4xl">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <span>Next Gen Web3 Onboarding</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.05] tracking-tightest">
          The AI companion for <br />
          <span className="text-indigo-600">Movement Native Apps.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto px-4">
          Nero enables developers to embed AI-native guidance into any dApp. 
          Reduce friction, maximize retention, and monetize expertise with real-time value streams.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button 
          onClick={onStart}
          className="px-10 py-4.5 bg-indigo-600 text-white font-bold rounded-full shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-base min-w-[220px]"
        >
          Explore the SDK
        </button>
        <button 
          className="px-10 py-4.5 bg-white text-slate-900 border border-slate-200 font-bold rounded-full hover:border-slate-900 transition-all text-base min-w-[220px]"
        >
          Read the Docs
        </button>
      </div>

      <div className="w-full pt-12 relative max-w-6xl">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-10" />
        <div className="rounded-[3rem] bg-slate-100 border border-slate-200 p-3 shadow-2xl relative overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1400" 
            className="w-full rounded-[2.5rem] opacity-70 grayscale h-[500px] object-cover transition-all duration-1000 group-hover:scale-105" 
            alt="Nero Dashboard" 
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-6">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/60 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                   <img src="https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/filled/robot.svg" className="w-5 h-5 invert" alt="Nero" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Nero Sentinel</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Assistant</div>
                </div>
              </div>
              <p className="text-[15px] text-slate-700 leading-relaxed font-semibold text-left">
                "Welcome to Movement M2. Ready to deploy your first Move module? I can guide you through the developer environment in real-time."
              </p>
              <div className="pt-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="pl-4 text-[11px] font-bold text-slate-400 flex items-center">Join 2.5k+ Movement developers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
