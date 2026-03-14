import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { dashboardApi } from "../api/api";
import { BarChart3, TrendingDown, AlertOctagon, Package } from "lucide-react";

const badgeClassMap = {
  positive: "border-emerald-500/35 bg-emerald-500/15 text-emerald-300",
  negative: "border-rose-500/35 bg-rose-500/15 text-rose-300",
  neutral: "border-amber-400/35 bg-amber-400/12 text-amber-300",
};

const Badge = ({ tone = "neutral", children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold ${badgeClassMap[tone] || badgeClassMap.neutral}`}
  >
    {children}
  </span>
);

const cardClassName = "rounded-2xl border border-white/12 bg-[#121527eb] p-4";

const Insights = () => {
  const [competitors, setCompetitors] = useState(null);
  const [calls, setCalls]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.getCompetitors(), dashboardApi.getCalls()])
      .then(([compRes, callsRes]) => {
        setCompetitors(compRes.competitorInsights);
        setCalls(callsRes.calls || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-slate-200">
        <div className="mb-4">
          <h1 className="text-[1.9rem] font-extrabold text-white">Signal Insights</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl border border-white/8 bg-[linear-gradient(110deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))] bg-size-[200%_100%]"
            />
          ))}
        </div>
      </div>
    );
  }

  // Aggregate objections & buying signals from all calls
  const objectionMap  = {};
  const signalMap     = {};
  const improvementMap = {};

  calls.forEach((call) => {
    const ins = call.aiInsights || {};
    (ins.objections || []).forEach((o) => { objectionMap[o]  = (objectionMap[o]  || 0) + 1; });
    (ins.buyingSignals || []).forEach((s) => { signalMap[s]   = (signalMap[s]    || 0) + 1; });
    (ins.improvementsNeeded || []).forEach((i) => { improvementMap[i] = (improvementMap[i] || 0) + 1; });
  });

  const objectionData  = Object.entries(objectionMap).sort((a,b)=>b[1]-a[1]).map(([_id,count])=>({_id,count}));
  const signalData     = Object.entries(signalMap).sort((a,b)=>b[1]-a[1]).map(([_id,count])=>({_id,count}));
  const improvementData = Object.entries(improvementMap).sort((a,b)=>b[1]-a[1]).map(([_id,count])=>({_id,count}));

  const comps = competitors?.competitorsFrequency || [];
  const advantages = competitors?.topAdvantages || [];

  return (
    <div className="py-8 text-slate-200">
      <div className="mb-4">
        <div>
          <h1 className="text-[1.9rem] font-extrabold text-white">Signal Insights</h1>
          <p className="mt-1.5 text-[0.95rem] text-slate-400">
            Aggregated AI intelligence across all analyzed sales calls
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Buying Signals Chart */}
        <div className={cardClassName}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base text-slate-50">🟢 Top Buying Signals</h3>
            <BarChart3 size={18} className="text-emerald-400" />
          </div>
          {signalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={signalData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9899B5" }} allowDecimals={false} />
                <YAxis dataKey="_id" type="category" tick={{ fontSize: 10, fill: "#9899B5" }} width={145} />
                <Tooltip contentStyle={{ background: "#161829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {signalData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${165 - i * 15}, 70%, ${55 - i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="rounded-xl border border-dashed border-white/14 p-8 text-center text-[0.875rem] text-slate-400">
              No buying signals detected yet.
            </div>
          )}
        </div>

        {/* Objections Chart */}
        <div className={cardClassName}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base text-slate-50">🔴 Top Customer Objections</h3>
            <TrendingDown size={18} className="text-rose-400" />
          </div>
          {objectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={objectionData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9899B5" }} allowDecimals={false} />
                <YAxis dataKey="_id" type="category" tick={{ fontSize: 10, fill: "#9899B5" }} width={145} />
                <Tooltip contentStyle={{ background: "#161829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {objectionData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${0 + i * 10}, 70%, ${55 - i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="rounded-xl border border-dashed border-white/14 p-8 text-center text-[0.875rem] text-slate-400">
              No objections detected yet.
            </div>
          )}
        </div>
      </div>

      {/* Improvements Needed */}
      {improvementData.length > 0 && (
        <div className={`${cardClassName} mb-6`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base text-slate-50">🔧 Product Improvements Needed</h3>
            <Package size={18} className="text-indigo-400" />
          </div>
          <div className="flex flex-col gap-3">
            {improvementData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-45 text-[0.85rem] text-slate-300 lg:w-35">{item._id}</span>
                <div className="h-2 w-full max-w-62.5 flex-1 overflow-hidden rounded-full bg-white/12">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.count / improvementData[0].count) * 100}%`,
                      background: "linear-gradient(135deg,#6C63FF,#00D4AA)",
                    }}
                  />
                </div>
                <Badge tone="neutral">{item.count}x</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Mentions */}
      <div className={`${cardClassName} mb-6`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base text-slate-50">🏢 Competitor Mentions</h3>
          <AlertOctagon size={18} className="text-amber-300" />
        </div>
        {comps.length > 0 ? (
          <div className="flex flex-col gap-3">
            {comps.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-45 text-[0.85rem] text-slate-300 lg:w-35">{c.name}</span>
                <div className="h-2 w-full max-w-62.5 flex-1 overflow-hidden rounded-full bg-white/12">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.count / comps[0].count) * 100}%`,
                      background: "linear-gradient(135deg,#FFB347,#FF8C42)",
                    }}
                  />
                </div>
                <Badge tone="neutral">{c.count} mentions</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/14 p-8 text-center text-[0.875rem] text-slate-400">
            No competitor mentions detected yet.
          </div>
        )}
      </div>

      {/* Competitor Advantages */}
      {advantages.length > 0 && (
        <div className={cardClassName}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base text-slate-50">⚡ Why Customers Prefer Competitors</h3>
          </div>
          <div className="flex flex-col gap-3">
            {advantages.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-45 text-[0.85rem] text-slate-300 lg:w-35">{a.advantage}</span>
                <div className="h-2 w-full max-w-62.5 flex-1 overflow-hidden rounded-full bg-white/12">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(a.count / advantages[0].count) * 100}%`,
                      background: "linear-gradient(135deg,#FB7185,#EF4444)",
                    }}
                  />
                </div>
                <Badge tone="negative">{a.count}x</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
