
import React, { useState, useRef, useEffect } from 'react';
import { PlatformConfig } from '../types';

interface AdminDemoViewProps {
  initialConfig: PlatformConfig;
  onSave: (config: PlatformConfig) => void;
}

const AdminDemoView: React.FC<AdminDemoViewProps> = ({ initialConfig, onSave }) => {
  const [config, setConfig] = useState<PlatformConfig>(initialConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleUpdate = (field: keyof PlatformConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate('nftImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalize = () => {
    onSave(config);
    // Simple alert for feedback since this is a demo
    alert("Smart Contract Config Updated! Platform settings are now live.");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-indigo-50">
            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-6">Smart Configuration</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[9px] font-black text-indigo-950 uppercase tracking-widest block mb-2">Platform Branding</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  className="w-full bg-slate-50 border border-indigo-50 rounded-xl px-4 py-3 text-[11px] font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-indigo-950 uppercase tracking-widest block mb-2">Treasury Wallet (x402)</label>
                <input 
                  type="text" 
                  value={config.treasuryWallet}
                  onChange={(e) => handleUpdate('treasuryWallet', e.target.value)}
                  className="w-full bg-slate-50 border border-indigo-50 rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-indigo-950"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-indigo-950 uppercase tracking-widest block mb-2">Micro-Fee (MOVE)</label>
                <input 
                  type="number" 
                  step="0.001"
                  value={config.feePerQuery}
                  onChange={(e) => handleUpdate('feePerQuery', parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-indigo-50 rounded-xl px-4 py-3 text-[11px] font-bold text-indigo-950"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-indigo-950 uppercase tracking-widest block mb-2">Agent NFT Asset</label>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-indigo-50 overflow-hidden flex-shrink-0 shadow-inner">
                    <img src={config.nftImage} alt="NFT Preview" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-4 bg-slate-50 border border-indigo-50 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                  >
                    Upload Asset
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-indigo-950 uppercase tracking-widest block mb-2">Agent System Persona</label>
                <textarea 
                  rows={4}
                  value={config.systemPrompt}
                  onChange={(e) => handleUpdate('systemPrompt', e.target.value)}
                  className="w-full bg-slate-50 border border-indigo-50 rounded-xl px-4 py-3 text-[11px] font-bold text-indigo-950 resize-none"
                />
              </div>

              <button 
                onClick={handleFinalize}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Push Config to Protocol
              </button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-indigo-50 flex items-center justify-center space-x-12">
            <div className="text-center space-y-6">
                <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Live Widget Simulation</h4>
                <div className="w-[340px] h-[540px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-indigo-950 overflow-hidden relative flex flex-col">
                    <div className="p-4 flex items-center justify-between" style={{ backgroundColor: config.primaryColor }}>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{config.name}</span>
                        <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
                        <img src={config.nftImage} className="w-32 h-32 rounded-[2rem] object-cover mb-6 border-4 border-white shadow-xl" alt="Preview" />
                        <span className="text-sm font-black text-indigo-950 uppercase">Ready for Learning</span>
                    </div>
                </div>
            </div>
            
            <div className="max-w-xs space-y-8">
               <div className="space-y-2">
                  <h4 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Sync Status</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Changes made here are reflected in real-time within the User Simulator. This mirrors how a protocol would update their on-chain Nero parameters.
                  </p>
               </div>
               <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="text-[9px] font-black text-indigo-600 uppercase mb-2">Micro-Fee Breakdown</div>
                  <div className="flex justify-between text-[11px] font-bold text-indigo-950">
                     <span>Base Query</span>
                     <span>{config.feePerQuery} MOVE</span>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDemoView;
