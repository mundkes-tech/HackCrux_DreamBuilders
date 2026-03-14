import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../api/api";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import "./Insights.css";

const TopDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getCalls()
      .then((r) => {
        const sorted = [...(r.calls || [])]
          .sort((a, b) => (b.dealProbability || 0) - (a.dealProbability || 0))
          .slice(0, 10);
        setDeals(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "2rem 0" }} className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>🏆 Top Deals</h1>
          <p>Sales calls with the highest AI-calculated deal probability</p>
        </div>
      </div>

      {loading ? (
        <div className="grid-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}
        </div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <TrendingUp size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
          <p>No analyzed calls yet. <Link to="/dashboard/analyze">Analyze your first call →</Link></p>
        </div>
      ) : (
        <div className="grid-2">
          {deals.map((deal, i) => {
            const prob = deal.dealProbability ?? 0;
            const probColor =
              prob >= 70 ? "var(--color-positive)"
              : prob >= 40 ? "var(--color-neutral)"
              : "var(--color-negative)";

            return (
              <div key={deal.callId} className="card" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "1.4rem", opacity: 0.15 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <Link to={`/dashboard/calls/${deal.callId}`} style={{
                      fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)",
                      textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem"
                    }}>
                      {deal.callTitle || deal.productName || deal.product_name || "Sales Call"} <ArrowUpRight size={14} />
                    </Link>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {deal.summary?.substring(0, 60)}{deal.summary?.length > 60 ? "..." : ""}
                    </p>
                    <span className={`badge ${(deal.sentiment || "").toLowerCase() === "positive" ? "badge-positive" : (deal.sentiment || "").toLowerCase() === "negative" ? "badge-negative" : "badge-neutral"}`}
                      style={{ marginTop: "0.5rem" }}>
                      {deal.sentiment || "—"}
                    </span>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-info)", marginTop: "0.35rem", textTransform: "capitalize" }}>
                      Type: {deal.callType || "other"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: probColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {prob}%
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Deal Probability</div>
                  </div>
                </div>

                <div className="progress-bar" style={{ marginTop: "1rem" }}>
                  <div className="progress-fill" style={{ width: `${prob}%`, background: probColor }} />
                </div>

                {deal.aiInsights?.buyingSignals?.length > 0 && (
                  <div style={{ marginTop: "0.75rem" }}>
                    {deal.aiInsights.buyingSignals.slice(0, 2).map((s, j) => (
                      <span key={j} className="badge badge-positive" style={{ marginRight: "0.35rem", marginTop: "0.35rem", fontSize: "0.73rem" }}>
                        ✅ {s.substring(0, 40)}{s.length > 40 ? "..." : ""}
                      </span>
                    ))}
                  </div>
                )}

                <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopDeals;
