
import React from 'react';

const Pricing: React.FC = () => {
  const tiers = [
    {
      tier: "Free Daily",
      price: "10 questions/day",
      features: "Basic Q&A, real-time guidance"
    },
    {
      tier: "Pay-as-You-Go",
      price: "$0.001-0.01/query",
      features: "Unlimited questions, on-demand"
    },
    {
      tier: "NFT Evolution",
      price: "$1-10/level",
      features: "Unlock advanced features"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center space-x-4 mb-12">
        <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-3xl border border-indigo-50">📊</div>
        <h1 className="text-4xl font-black text-indigo-950 uppercase tracking-tight">Pricing</h1>
      </div>

      <div className="bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/40 text-center border-r border-white/10 w-1/4">Tier</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/40 text-center border-r border-white/10 w-1/4">Price</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/40 text-center">Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tiers.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-10 py-10 border-r border-white/10">
                    <span className="text-lg font-black text-white uppercase tracking-tight block text-center">
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-10 py-10 border-r border-white/10 text-center">
                    <span className="text-base font-bold text-indigo-300">
                      {row.price}
                    </span>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <span className="text-base font-medium text-white/70 leading-relaxed">
                      {row.features}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-10 bg-white rounded-[3rem] border border-indigo-50 shadow-sm space-y-4">
          <div className="text-2xl">⚡</div>
          <h4 className="text-[11px] font-black text-indigo-950 uppercase tracking-widest">Real-time settlement</h4>
          <p className="text-[13px] text-slate-500 font-bold leading-relaxed">
            All "Pay-as-You-Go" queries are settled instantly via the x402 protocol, streaming MOVE tokens from your wallet directly to the protocol treasury.
          </p>
        </div>
        <div className="p-10 bg-white rounded-[3rem] border border-indigo-50 shadow-sm space-y-4">
          <div className="text-2xl">🧬</div>
          <h4 className="text-[11px] font-black text-indigo-950 uppercase tracking-widest">Asset Evolution</h4>
          <p className="text-[13px] text-slate-500 font-bold leading-relaxed">
            Fees paid during learning sessions directly increase the XP of your Nero Agent NFT, permanently increasing its on-chain value and intelligence level.
          </p>
        </div>
        <div className="p-10 bg-indigo-600 rounded-[3rem] text-white space-y-4 shadow-2xl shadow-indigo-200">
          <div className="text-2xl">🚀</div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-white/70">Protocol Governance</h4>
          <p className="text-[13px] font-bold leading-relaxed">
            Higher tier users and high-level NFT holders gain priority access to the Nero DAO and revenue sharing mechanisms within the Movement ecosystem.
          </p>
        </div>
      </div>

      <div className="mt-16 pt-12 border-t border-indigo-50 text-center">
        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] leading-relaxed max-w-2xl mx-auto">
          Nero Protocol Business Architecture v1.0.4. All prices are calculated based on M2 network congestion and AI compute complexity.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
