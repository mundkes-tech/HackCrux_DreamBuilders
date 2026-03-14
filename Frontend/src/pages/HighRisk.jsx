import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../api/api";
import { AlertTriangle, ArrowUpRight, Shield } from "lucide-react";
import "./Insights.css";

const HighRisk = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getCalls()
      .then((r) => {
        // Calls with dealProbability < 40 or negative sentiment
        const risky = (r.calls || []).filter((c) => {
          const prob = c.dealProbability ?? 100;
          const sentiment = c.sentiment || "";
          return prob < 40 || sentiment === "negative";
        });
        setCalls(risky);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "2rem 0" }} className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>⚠️ High Risk Deals</h1>
          <p>Calls with low deal probability (below 40%) or negative customer sentiment</p>
        </div>
      </div>

      {loading ? (
        <div className="grid-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160 }} />)}
        </div>
      ) : calls.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <Shield size={48} color="var(--color-positive)" style={{ marginBottom: "1rem" }} />
          <h3 style={{ color: "var(--color-positive)" }}>No high-risk deals!</h3>
          <p style={{ marginTop: "0.5rem" }}>All analyzed calls look healthy. 🎉</p>
        </div>
      ) : (
        <div className="grid-2">
          {calls.map((call) => {
            const ins  = call.aiInsights || {};
            const prob = call.dealProbability ?? 0;
            const sentiment = call.sentiment || "";
            const riskColor = prob < 20 || sentiment === "negative"
              ? "var(--risk-critical)"
              : "var(--risk-high)";
            const riskLabel = prob < 20 || sentiment === "negative" ? "Critical" : "High";

            return (
              <div
                key={call.callId}
                className="card"
                style={{ borderColor: riskColor, borderWidth: 1 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                      <span style={{ background: `${riskColor}22`, color: riskColor, padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${riskColor}44` }}>
                        <AlertTriangle size={11} style={{ display: "inline", marginRight: "0.25rem" }} />
                        {riskLabel} Risk
                      </span>
                      <span className={`badge ${sentiment === "negative" ? "badge-negative" : sentiment === "positive" ? "badge-positive" : "badge-neutral"}`}>
                        {sentiment || "unknown"}
                      </span>
                    </div>
                    <Link to={`/dashboard/calls/${call.callId}`} style={{
                      fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)",
                      textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem"
                    }}>
                      {call.callTitle || call.productName || call.product_name || "Sales Call"} <ArrowUpRight size={13} />
                    </Link>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {call.summary?.substring(0, 70)}{call.summary?.length > 70 ? "..." : ""}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-info)", marginTop: "0.2rem", textTransform: "capitalize" }}>
                      Type: {call.callType || "other"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: riskColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {prob}%
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Probability</div>
                  </div>
                </div>

                <div className="progress-bar" style={{ marginTop: "0.75rem" }}>
                  <div className="progress-fill" style={{ width: `${prob}%`, background: riskColor }} />
                </div>

                {ins.objections?.length > 0 && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem", fontWeight: 600 }}>
                      Objections:
                    </p>
                    {ins.objections.slice(0, 2).map((o, i) => (
                      <span key={i} className="badge badge-negative" style={{ marginRight: "0.35rem", marginTop: "0.25rem", fontSize: "0.73rem" }}>
                        ⚠️ {o.substring(0, 45)}{o.length > 45 ? "..." : ""}
                      </span>
                    ))}
                  </div>
                )}

                {(ins.followUpRecommendation || call.aiInsights?.followUpRecommendation) && (
                  <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--color-info)", fontStyle: "italic" }}>
                    💡 {ins.followUpRecommendation || call.aiInsights?.followUpRecommendation}
                  </p>
                )}

                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HighRisk;
