
import React, { useState, useEffect } from 'react';

const WidgetIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'html' | 'react' | 'config'>('html');
  const [copied, setCopied] = useState(false);

  const platformId = "nero_demo_8821";

  const htmlSnippet = `<!-- 1. Add the Nero Sentinel Script -->
<script 
  src="https://cdn.nero.ai/widget/v1.js" 
  data-platform-id="${platformId}"
  data-theme="light"
  data-primary-color="#4F46E5"
  async>
</script>

<!-- 2. The widget will automatically attach to your page -->`;

  const reactSnippet = `// 1. Install the package: npm install @nero-ai/react
import { NeroProvider, NeroWidget } from '@nero-ai/react';

function App() {
  return (
    <NeroProvider appId="${platformId}">
      <div className="your-app">
        {/* Your content */}
        
        <NeroWidget 
          config={{
            primaryColor: '#4F46E5',
            position: 'bottom-right',
            welcomeMessage: 'Need help with Move?'
          }} 
        />
      </div>
    </NeroProvider>
  );
}`;

  const configSnippet = `{
  "platformId": "${platformId}",
  "appearance": {
    "theme": "light",
    "primaryColor": "#4F46E5",
    "borderRadius": "24px",
    "position": "bottom-right"
  },
  "ai": {
    "persona": "Expert Guide",
    "contextUrl": "https://docs.yourdapp.com",
    "feePerQuery": 0.005
  },
  "rewards": {
    "xpMultipler": 1.5,
    "nftCollectionId": "your_collection_uuid"
  }
}`;

  const currentCode = activeTab === 'html' ? htmlSnippet : activeTab === 'react' ? reactSnippet : configSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Configuration & Guide */}
        <div className="flex-1 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest">SDK v1.0.4-Beta</span>
            </div>
            <h2 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase leading-none">Developer Core</h2>
            <p className="text-lg text-indigo-900/50 font-medium leading-relaxed">
              Integrate Nero's AI-Native Sentinel into your dApp. Provide real-time MoveVM guidance while earning protocol revenue through x402 micro-streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform">🎨</div>
              <h4 className="text-sm font-black text-indigo-950 uppercase mb-2">Visual Branding</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Customize colors, icons, and position to fit seamlessly into your dApp's existing UI components.</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform">💰</div>
              <h4 className="text-sm font-black text-indigo-950 uppercase mb-2">Monetization Engine</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Set custom MOVE/USDC fees per query. All payments settle instantly via the x402 protocol.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Deployment Steps</h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Claim Platform ID', desc: 'Register your project in the Admin Dashboard to receive your unique platform key.' },
                { step: '02', title: 'Define AI Persona', desc: 'Provide your project docs or smart contract ABIs to specialize your Nero Agent.' },
                { step: '03', title: 'Mount Component', desc: 'Use our React SDK or simple HTML snippet to activate the live guide.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <span className="text-4xl font-black text-slate-100">{item.step}</span>
                  <div className="pt-1">
                    <h5 className="text-[12px] font-black text-indigo-950 uppercase tracking-tight">{item.title}</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Code Preview */}
        <div className="flex-1">
          <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] flex flex-col h-[600px] border border-white/5">
            <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/10">
              <div className="flex space-x-6">
                {[
                  { id: 'html', label: 'HTML Snippet' },
                  { id: 'react', label: 'React SDK' },
                  { id: 'config', label: 'Full JSON Config' }
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-[10px] font-black uppercase tracking-[0.1em] transition-all relative py-1 ${activeTab === tab.id ? 'text-indigo-400' : 'text-white/40 hover:text-white'}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute -bottom-5 left-0 right-0 h-1 bg-indigo-500 rounded-full animate-in fade-in"></div>}
                  </button>
                ))}
              </div>
              <div className="flex space-x-1.5 opacity-40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
            </div>
            
            <div className="flex-1 p-8 font-mono text-[11px] text-indigo-200/90 leading-relaxed overflow-auto custom-scrollbar bg-indigo-950/20">
              <pre className="animate-in fade-in duration-300">
                <code>{currentCode}</code>
              </pre>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Ready for Production</span>
              </div>
              <button 
                onClick={handleCopy}
                className={`min-w-[140px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy Snippet'}
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📘</div>
              <div>
                <h5 className="text-[11px] font-black text-indigo-950 uppercase">Technical Reference</h5>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Full API specs available</p>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 uppercase hover:bg-indigo-50 transition-all">View Docs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetIntegration;
