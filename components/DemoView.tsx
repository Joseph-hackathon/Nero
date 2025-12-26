
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { UserState, LEVEL_NAMES, LEVEL_REQUIREMENTS, NeroLevel, PlatformConfig } from '../types';
import ChatWidget from './ChatWidget';
import AdminDemoView from './AdminDemoView';

interface DemoViewProps {
  user: UserState;
  onQuery: (type: 'query' | 'transaction', isPaid?: boolean) => void;
  onConnect: () => void;
  onTopUp: (amount: number, token: any) => void;
  onMint: (platformId: string) => void;
  onPricing: () => void;
  activeDapp: string | null;
  setActiveDapp: (dapp: string | null) => void;
  platforms: Record<string, PlatformConfig>;
  onUpdatePlatform: (id: string, config: PlatformConfig) => void;
}

const DemoView: React.FC<DemoViewProps> = ({ 
  user, onQuery, onConnect, onMint, onPricing, activeDapp, setActiveDapp, platforms, onUpdatePlatform 
}) => {
  const [demoRole, setDemoRole] = useState<'user' | 'admin'>('user');
  const [isSyncing, setIsSyncing] = useState(false);
  const [xpPopups, setXpPopups] = useState<{ id: number; amount: number }[]>([]);
  
  const platform = activeDapp ? platforms[activeDapp] : null;
  const agent = activeDapp ? user.agents[activeDapp] : null;
  const prevXpRef = useRef(agent?.xp || 0);
  const prevLevelRef = useRef(agent?.level || 1);

  const currentLevel = agent?.level || NeroLevel.NEWBIE;
  const currentXp = agent?.xp || 0;
  const nextLevelReq = LEVEL_REQUIREMENTS[(currentLevel + 1) as NeroLevel] || LEVEL_REQUIREMENTS[currentLevel as NeroLevel];
  const progress = Math.min(100, (currentXp / (nextLevelReq || 1)) * 100);

  // Dynamic visual feedback for XP gain
  useEffect(() => {
    if (agent && agent.xp > prevXpRef.current) {
      const diff = agent.xp - prevXpRef.current;
      const id = Date.now();
      setXpPopups(prev => [...prev, { id, amount: diff }]);
      setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1500);
    }
    prevXpRef.current = agent?.xp || 0;
    prevLevelRef.current = agent?.level || 1;
  }, [agent?.xp]);

  const handleMintWithLoading = (id: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      onMint(id);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Simulator Core</h2>
          <p className="text-slate-500 font-medium text-sm">Validate your AI-native integration across the Movement ecosystem.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
          <button 
            onClick={() => setDemoRole('user')}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${demoRole === 'user' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            User View
          </button>
          <button 
            onClick={() => setDemoRole('admin')}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${demoRole === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Admin Control
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {Object.keys(platforms).map(id => (
          <button 
            key={id} 
            onClick={() => setActiveDapp(id)}
            className={`flex items-center space-x-3 px-6 py-3.5 rounded-2xl border transition-all whitespace-nowrap ${
              activeDapp === id 
              ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <img src={platforms[id].logo} className="max-w-full max-h-full object-contain" alt={id} />
            </div>
            <span className="text-sm font-bold tracking-tight">{id}</span>
          </button>
        ))}
        <button 
          onClick={() => setActiveDapp(null)}
          className={`px-6 py-3.5 rounded-2xl border transition-all ${activeDapp === null ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-400'}`}
        >
          <span className="text-sm font-bold tracking-tight">Movement Ecosystem</span>
        </button>
      </div>

      {demoRole === 'admin' ? (
        <AdminDemoView 
          initialConfig={activeDapp ? platforms[activeDapp] : platforms['Uniswap']}
          onSave={(config) => activeDapp && onUpdatePlatform(activeDapp, config)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Agent Card */}
          <div className="lg:col-span-4">
            <div className="h-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
              <div className="mb-8 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Linked Asset</h3>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              
              {activeDapp ? (
                <div className="flex-1 flex flex-col justify-between">
                  {agent ? (
                    <div className="space-y-10">
                      <div className="flex justify-center relative">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                        <div className={`w-52 h-52 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative z-10 transition-all duration-500 ${agent.level > prevLevelRef.current ? 'scale-110 level-up-glow' : ''}`}>
                          <img src={platform?.nftImage} className="w-full h-full object-cover" alt="Agent" />
                        </div>
                        <div className="absolute -bottom-4 -right-2 w-14 h-14 bg-white rounded-2xl shadow-xl border border-slate-50 flex flex-col items-center justify-center z-20">
                          <span className="text-[9px] font-bold text-slate-400">LVL</span>
                          <span className="text-xl font-black text-indigo-600 leading-none">{agent.level}</span>
                        </div>
                        {/* XP Gain Floating Indicator */}
                        {xpPopups.map(p => (
                          <div key={p.id} className="absolute top-0 right-10 xp-gain text-indigo-600 font-bold text-sm bg-white border border-indigo-50 px-3 py-1 rounded-full shadow-lg z-30">
                            +{p.amount} XP
                          </div>
                        ))}
                      </div>

                      <div className="text-center space-y-1">
                        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{platform?.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">Verified Movement Asset</p>
                      </div>

                      <div className="space-y-5 pt-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync Progress</span>
                          <span className="text-sm font-black text-slate-900 tabular-nums">{Math.floor(progress)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                          <div className="h-full bg-indigo-600 rounded-full transition-all duration-700 relative" style={{ width: `${progress}%` }}>
                             <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{agent.xp} xp earned</span>
                          <span>{nextLevelReq} xp target</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-6">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-4xl grayscale opacity-30">
                        🤖
                      </div>
                      <div className="space-y-3">
                        <p className="text-base font-bold text-slate-900">Platform Not Linked</p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">Mint a platform-specific Nero Agent to start tracking your on-chain expertise.</p>
                      </div>
                      <button 
                        onClick={() => handleMintWithLoading(activeDapp!)}
                        disabled={isSyncing}
                        className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                      >
                        {isSyncing ? 'Linking...' : `Mint ${activeDapp} Nero Agent`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 opacity-25">
                  <div className="text-5xl">🔭</div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">Awaiting Protocol Selection</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Session */}
          <div className="lg:col-span-5">
            <div className="h-[680px] bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.15)] border-[12px] border-slate-900 overflow-hidden relative flex flex-col ring-1 ring-slate-100">
              {activeDapp && agent ? (
                <ChatWidget 
                  user={user} 
                  onQuery={(paid) => onQuery('query', paid)} 
                  onConnect={onConnect}
                  onPricing={onPricing}
                  detectedDapp={activeDapp}
                  embedded={true}
                  platformConfig={platform}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 space-y-8">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">🔒</div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight">Session Guarded</h4>
                    <p className="text-sm text-slate-400 font-medium px-4">Sync an agent to unlock specialized protocol guidance.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ledger Side */}
          <div className="lg:col-span-3">
            <div className="h-full bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10">Sync History</h3>
              <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                {user.paymentHistory.length > 0 ? (
                  user.paymentHistory.slice(0, 12).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center py-4 border-b border-slate-100/50 group hover:bg-white/50 px-2 rounded-xl transition-colors">
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 tracking-tight">{tx.id}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{tx.type}</div>
                      </div>
                      <div className={`text-[12px] font-bold ${tx.type === 'topup' ? 'text-green-600' : 'text-slate-900'}`}>
                        {tx.type === 'topup' ? '+' : '-'}{tx.amount.toFixed(3)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                    No Live Events
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoView;
