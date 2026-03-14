import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { dashboardApi } from "../api/api";
import { BarChart3, TrendingDown, AlertOctagon, Package } from "lucide-react";
import "./Insights.css";

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
      <div className="insights animate-fade-in">
        <div className="page-header"><h1>Signal Insights</h1></div>
        <div className="grid-2">
          {[...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}
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
    <div className="insights animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Signal Insights</h1>
          <p>Aggregated AI intelligence across all analyzed sales calls</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        {/* Buying Signals Chart */}
        <div className="card">
          <div className="card__header">
            <h3>🟢 Top Buying Signals</h3>
            <BarChart3 size={18} color="var(--color-positive)" />
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
            <div className="insights__empty">No buying signals detected yet.</div>
          )}
        </div>

        {/* Objections Chart */}
        <div className="card">
          <div className="card__header">
            <h3>🔴 Top Customer Objections</h3>
            <TrendingDown size={18} color="var(--color-negative)" />
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
            <div className="insights__empty">No objections detected yet.</div>
          )}
        </div>
      </div>

      {/* Improvements Needed */}
      {improvementData.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card__header">
            <h3>🔧 Product Improvements Needed</h3>
            <Package size={18} color="var(--brand-primary)" />
          </div>
          <div className="insights__competitors">
            {improvementData.map((item, i) => (
              <div key={i} className="insights__competitor-item">
                <span className="insights__competitor-name">{item._id}</span>
                <div className="dashboard__signal-bar" style={{ flex: 1, maxWidth: 250 }}>
                  <div
                    className="dashboard__signal-fill"
                    style={{
                      width: `${(item.count / improvementData[0].count) * 100}%`,
                      background: "var(--grad-brand)",
                    }}
                  />
                </div>
                <span className="badge badge-neutral">{item.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Mentions */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card__header">
          <h3>🏢 Competitor Mentions</h3>
          <AlertOctagon size={18} color="var(--color-neutral)" />
        </div>
        {comps.length > 0 ? (
          <div className="insights__competitors">
            {comps.map((c, i) => (
              <div key={i} className="insights__competitor-item">
                <span className="insights__competitor-name">{c.name}</span>
                <div className="dashboard__signal-bar" style={{ flex: 1, maxWidth: 250 }}>
                  <div
                    className="dashboard__signal-fill"
                    style={{
                      width: `${(c.count / comps[0].count) * 100}%`,
                      background: "var(--grad-gold)",
                    }}
                  />
                </div>
                <span className="badge badge-neutral">{c.count} mentions</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="insights__empty">No competitor mentions detected yet.</div>
        )}
      </div>

      {/* Competitor Advantages */}
      {advantages.length > 0 && (
        <div className="card">
          <div className="card__header">
            <h3>⚡ Why Customers Prefer Competitors</h3>
          </div>
          <div className="insights__competitors">
            {advantages.map((a, i) => (
              <div key={i} className="insights__competitor-item">
                <span className="insights__competitor-name">{a.advantage}</span>
                <div className="dashboard__signal-bar" style={{ flex: 1, maxWidth: 250 }}>
                  <div
                    className="dashboard__signal-fill"
                    style={{
                      width: `${(a.count / advantages[0].count) * 100}%`,
                      background: "var(--grad-danger)",
                    }}
                  />
                </div>
                <span className="badge badge-negative">{a.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
