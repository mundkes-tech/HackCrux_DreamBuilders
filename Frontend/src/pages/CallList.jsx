import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone, Search, RefreshCw, Calendar,
  Smile, Meh, Frown
} from "lucide-react";
import { dashboardApi } from "../api/api";
import "./CallList.css";

const SentimentBadge = ({ s }) => {
  const map = {
    positive: { cls: "badge-positive", icon: <Smile size={12} />, label: "Positive" },
    negative: { cls: "badge-negative", icon: <Frown size={12} />, label: "Negative" },
    neutral:  { cls: "badge-neutral",  icon: <Meh size={12} />,   label: "Neutral" },
  };
  const m = map[s?.toLowerCase()] || map.neutral;
  return <span className={`badge ${m.cls}`}>{m.icon} {m.label}</span>;
};

const CallList = () => {
  const [calls, setCalls]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [sentimentFilter, setSentiment] = useState("");
  const [callTypeFilter, setCallType] = useState("");

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getCalls();
      setCalls(res.calls || []);
      setFiltered(res.calls || []);
    } catch {
      // Keep UI usable in demo mode even if backend is unavailable.
      setCalls([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalls(); }, []);

  // Client-side filter
  useEffect(() => {
    let data = [...calls];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        (c.callTitle || c.productName || c.product_name || "").toLowerCase().includes(q) ||
        (c.summary || "").toLowerCase().includes(q)
      );
    }
    if (sentimentFilter) {
      data = data.filter(
        (c) => c.sentiment?.toLowerCase() === sentimentFilter.toLowerCase()
      );
    }
    if (callTypeFilter) {
      data = data.filter(
        (c) => (c.callType || "other").toLowerCase() === callTypeFilter.toLowerCase()
      );
    }
    setFiltered(data);
  }, [search, sentimentFilter, callTypeFilter, calls]);

  return (
    <div className="call-list animate-fade-in">
      <div className="page-header">
        <div>
          <h1>All Analyzed Calls</h1>
          <p>Browse all AI-analyzed sales conversations</p>
        </div>
        <Link to="/dashboard/analyze" className="btn btn-primary">
          <Phone size={16} /> Analyze New Call
        </Link>
      </div>

      {/* Filters */}
      <div className="call-list__filters">
        <div className="call-list__search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by title, product or summary..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select call-list__select"
          value={sentimentFilter}
          onChange={(e) => setSentiment(e.target.value)}
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select
          className="select call-list__select"
          value={callTypeFilter}
          onChange={(e) => setCallType(e.target.value)}
        >
          <option value="">All Call Types</option>
          <option value="sales">Sales</option>
          <option value="service">Service</option>
          <option value="enquiry">Enquiry</option>
          <option value="complaint">Complaint</option>
          <option value="support">Support</option>
          <option value="renewal">Renewal</option>
          <option value="upsell">Upsell</option>
          <option value="other">Other</option>
        </select>
        <button className="btn btn-ghost" onClick={fetchCalls}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="call-list__skeletons">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="call-list__empty">
          <Phone size={48} color="var(--text-muted)" />
          <h3>No calls found</h3>
          <p>Adjust your filters or upload a new call.</p>
          <Link to="/dashboard/analyze" className="btn btn-primary">Analyze Your First Call</Link>
        </div>
      ) : (
        <div className="call-list__table">
          <div className="call-list__header" style={{ gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.7fr 0.7fr 0.8fr 0.8fr" }}>
            <span>Product / Summary</span>
            <span>Sentiment</span>
            <span>Deal Prob.</span>
            <span>Rep Rating</span>
            <span>Engagement</span>
            <span>Urgency</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {filtered.map((call) => {
            const prob = call.dealProbability || 0;
            const probColor =
              prob >= 70 ? "var(--color-positive)"
              : prob >= 40 ? "var(--color-neutral)"
              : "var(--color-negative)";
            const spRating = call.salespersonRating || call.aiInsights?.salespersonPerformance?.rating || null;
            const spColor = spRating >= 7 ? "var(--color-positive)" : spRating >= 5 ? "var(--color-neutral)" : "var(--color-negative)";
            const engagement = call.customerEngagement || call.aiInsights?.conversationAnalysis?.customerEngagementScore || null;
            const engColor = engagement >= 7 ? "var(--color-positive)" : engagement >= 5 ? "var(--color-neutral)" : "var(--color-negative)";
            const urgency = call.urgencyLevel || call.aiInsights?.conversationAnalysis?.urgencyLevel || null;

            return (
              <div
                key={call.callId}
                className="call-list__row"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.7fr 0.7fr 0.8fr 0.8fr" }}
              >
                <div className="call-list__title-cell">
                  <Link to={`/dashboard/calls/${call.callId}`} className="call-list__title">
                    {call.callTitle || call.productName || call.product_name || "Sales Call"}
                  </Link>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    {call.summary?.substring(0, 70)}{call.summary?.length > 70 ? "..." : ""}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--color-info)", marginTop: "0.2rem", textTransform: "capitalize" }}>
                    Type: {call.callType || "other"}
                  </p>
                </div>

                <div>
                  <SentimentBadge s={call.sentiment} />
                </div>

                <div>
                  <div className="call-list__prob">
                    <span style={{ color: probColor, fontWeight: 700, fontSize: "0.9rem" }}>
                      {prob}%
                    </span>
                    <div className="progress-bar" style={{ width: 70 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${prob}%`, background: probColor }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  {spRating ? (
                    <span style={{ color: spColor, fontWeight: 700, fontSize: "0.9rem" }}>
                      {spRating}/10
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                  )}
                </div>

                <div>
                  {engagement ? (
                    <span style={{ color: engColor, fontWeight: 700, fontSize: "0.9rem" }}>
                      {engagement}/10
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                  )}
                </div>

                <div>
                  {urgency ? (
                    <span className={`badge ${urgency === "high" ? "badge-negative" : urgency === "low" ? "badge-positive" : "badge-neutral"}`} style={{ fontSize: "0.75rem", textTransform: "capitalize" }}>
                      {urgency}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                  )}
                </div>

                <div>
                  <span className="badge badge-positive">
                    ✅ Analyzed
                  </span>
                </div>

                <div className="call-list__date">
                  <Calendar size={12} />
                  {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "right" }}>
        Showing {filtered.length} of {calls.length} analyzed calls
      </p>
    </div>
  );
};

export default CallList;
