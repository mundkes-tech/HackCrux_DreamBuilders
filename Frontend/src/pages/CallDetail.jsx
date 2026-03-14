import { createElement, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  DollarSign,
  Download,
  Frown,
  HelpCircle,
  Lightbulb,
  Mail,
  Meh,
  MessageSquare,
  Mic2,
  Package,
  Shield,
  Smile,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';

const cardClassName = 'rounded-2xl border border-white/10 bg-[#121527]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md';
const inputClassName = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/8';

const baseCalls = {
  'call-101': {
    callId: 'call-101',
    call_title: 'Enterprise Suite Procurement Review',
    call_type: 'sales',
    product_name: 'Enterprise Suite',
    customer_name: 'Aarav Mehta',
    customer_email: 'aarav.mehta@northstarprocure.com',
    customer_phone: '+91 98765 43210',
    fileName: 'enterprise-suite-review.mp3',
    createdAt: '2026-03-12T09:30:00.000Z',
    transcript: 'Sales Rep: Thanks for making time today.\nCustomer: We like the reporting depth, but onboarding speed is still a concern.\nSales Rep: We can support phased onboarding in under three weeks.\nCustomer: That would help. We also need clearer pricing for procurement approval.\nSales Rep: I will send a structured pricing breakdown and rollout plan after this call.',
    aiInsights: {
      summary: 'The buyer responded positively to reporting capabilities and team visibility, but raised clear concerns around onboarding speed and pricing clarity. The rep handled the discussion calmly, positioned phased rollout well, and secured a next step centered on a pricing breakdown. Deal momentum is healthy, though procurement scrutiny remains a material risk.',
      objections: ['Onboarding may take too long for the team timeline.', 'Pricing needs to be clearer for procurement approval.'],
      buyingSignals: ['Customer asked implementation timeline questions.', 'Prospect requested a structured pricing follow-up.', 'Reporting depth was received positively.'],
      positivePoints: ['Reporting depth', 'Team visibility', 'Phased rollout option'],
      competitors: ['Clariq', 'RevPilot'],
      competitorAdvantages: ['Lower implementation cost', 'Simpler initial setup'],
      improvementsNeeded: ['Faster onboarding narrative', 'More transparent pricing packaging'],
      productName: 'Enterprise Suite',
      callTitle: 'Enterprise Suite Procurement Review',
      callType: 'sales',
      sentiment: 'positive',
      dealProbability: 82,
      followUpRecommendation: 'Send a procurement-ready pricing breakdown, include phased onboarding milestones, and propose a technical walkthrough with implementation stakeholders within 48 hours.',
      customer: {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@northstarprocure.com',
        phone: '+91 98765 43210',
      },
      emailDraft: {
        subject: 'Next steps and pricing breakdown for Enterprise Suite',
        body: 'Hi Aarav,\n\nThanks again for the conversation today. As discussed, I am sharing a clearer pricing breakdown along with a phased onboarding outline that keeps rollout within your team timeline.\n\nI would also be happy to set up a technical walkthrough with your implementation stakeholders this week.\n\nBest,\nDreamBuilders Sales Team',
        tone: 'professional',
        cta: 'Schedule technical walkthrough',
      },
      salespersonTone: {
        overall: 'professional',
        emotionalIntelligence: 8,
        breakdown: ['Calm under procurement pressure', 'Clear and structured answers', 'Confident without sounding aggressive'],
        toneShifts: ['Became more consultative during onboarding discussion'],
        examples: ['We can support phased onboarding in under three weeks.', 'I will send a structured pricing breakdown after this call.'],
      },
      salespersonPerformance: {
        rating: 8,
        verdict: 'The rep maintained control of the conversation, addressed key concerns directly, and created a practical next step. The remaining gap is sharper handling of cost-value framing.',
        skills: {
          discovery: 8,
          objectionHandling: 7,
          productKnowledge: 9,
          confidence: 8,
          empathy: 7,
          closing: 7,
        },
        strengths: ['Strong product positioning', 'Good implementation framing', 'Clear next-step ownership'],
        weaknesses: ['Could quantify ROI more explicitly', 'Could isolate procurement concerns earlier'],
        tips: ['Lead with timeline proof points.', 'Use pricing anchors before detailed breakdowns.'],
        missedOpportunities: ['Did not probe procurement approval stages in detail.'],
        callPhases: {
          opening: 8,
          discovery: 7,
          objectionHandling: 7,
          valuePitch: 8,
          close: 7,
        },
      },
      conversationAnalysis: {
        talkRatioSalesperson: 56,
        talkRatioCustomer: 44,
        questionsAskedBySalesperson: 9,
        questionsAskedByCustomer: 6,
        urgencyLevel: 'medium',
        customerEngagementScore: 8,
        keyTopics: ['Reporting', 'Onboarding', 'Pricing', 'Procurement'],
        painPoints: ['Slow implementation risk', 'Approval complexity'],
        pricingDiscussed: true,
        pricingDetails: 'Customer needs clearer package structure and rollout-linked commercial terms before moving the deal forward.',
        decisionMakers: ['Procurement lead', 'Operations manager'],
        actionItems: ['Rep to send pricing sheet', 'Rep to propose technical walkthrough'],
        nextSteps: ['Review commercial package', 'Schedule implementation review'],
        objectionResponses: [
          {
            objection: 'Onboarding will take too long.',
            response: 'Rep positioned a phased rollout with a three-week implementation target.',
            effectiveness: 'strong',
          },
          {
            objection: 'Pricing needs more clarity.',
            response: 'Rep promised a detailed pricing breakdown after the call.',
            effectiveness: 'average',
          },
        ],
      },
      keyMoments: [
        {
          moment: 'Buyer responded well to phased onboarding',
          description: 'Timeline concern softened once the rep described a staged rollout.',
          impact: 'positive',
        },
        {
          moment: 'Pricing concern remained open',
          description: 'Procurement clarity is still needed before advancing.',
          impact: 'neutral',
        },
      ],
    },
  },
  'call-102': {
    callId: 'call-102',
    call_title: 'Growth Plan Pilot Discussion',
    call_type: 'sales',
    product_name: 'Growth Plan',
    customer_name: 'Riya Shah',
    customer_email: 'riya.shah@peakworks.io',
    customer_phone: '+91 99887 77665',
    fileName: 'growth-plan-pilot.m4a',
    createdAt: '2026-03-11T14:15:00.000Z',
    transcript: 'Customer asked for a smaller pilot before a full rollout. Finance needs a lower-risk entry point and wants success metrics defined before committing budget.',
    aiInsights: {
      summary: 'The buyer sees value in the Growth Plan, but finance is not ready for a broad commitment. The rep kept the discussion constructive, though the conversation needs stronger pilot framing and quantified outcomes.',
      objections: ['Finance wants a smaller pilot first.'],
      buyingSignals: ['Champion still sees value.', 'Pilot path is being considered instead of a full rejection.'],
      positivePoints: ['Interest in measured rollout', 'Openness to pilot metrics'],
      competitors: ['SalesForge'],
      competitorAdvantages: ['Lower upfront commitment'],
      improvementsNeeded: ['Stronger pilot success framework'],
      productName: 'Growth Plan',
      callTitle: 'Growth Plan Pilot Discussion',
      callType: 'sales',
      sentiment: 'neutral',
      dealProbability: 58,
      followUpRecommendation: 'Package a narrow pilot proposal with explicit success criteria and a lower-risk commercial model.',
      customer: {
        name: 'Riya Shah',
        email: 'riya.shah@peakworks.io',
        phone: '+91 99887 77665',
      },
      emailDraft: {
        subject: 'Pilot proposal for Growth Plan',
        body: 'Hi Riya,\n\nFollowing up with a draft pilot structure that keeps scope controlled while giving your finance team measurable outcomes to review.\n\nRegards,\nDreamBuilders Sales Team',
        tone: 'professional',
        cta: 'Review pilot structure',
      },
      salespersonTone: {
        overall: 'friendly',
        emotionalIntelligence: 7,
        breakdown: ['Supportive tone', 'Non-pushy approach'],
        toneShifts: ['Moved from broad pitch to more collaborative planning'],
        examples: ['We can start with a smaller pilot and build confidence from there.'],
      },
      salespersonPerformance: {
        rating: 7,
        verdict: 'Solid relationship management, but the rep needs sharper pilot framing to convert interest into commitment.',
        skills: {
          discovery: 7,
          objectionHandling: 6,
          productKnowledge: 8,
          confidence: 7,
          empathy: 8,
          closing: 6,
        },
        strengths: ['Good empathy', 'Constructive tone'],
        weaknesses: ['Pilot economics not fully defined'],
        tips: ['Propose success metrics in the call, not after it.'],
        missedOpportunities: ['Could have asked who signs off on pilot budget.'],
        callPhases: {
          opening: 7,
          discovery: 7,
          objectionHandling: 6,
          valuePitch: 7,
          close: 6,
        },
      },
      conversationAnalysis: {
        talkRatioSalesperson: 51,
        talkRatioCustomer: 49,
        questionsAskedBySalesperson: 7,
        questionsAskedByCustomer: 5,
        urgencyLevel: 'medium',
        customerEngagementScore: 7,
        keyTopics: ['Pilot', 'Finance approval', 'Metrics'],
        painPoints: ['Budget caution', 'Need for low-risk rollout'],
        pricingDiscussed: true,
        pricingDetails: 'Customer wants a smaller initial commercial commitment with clear review gates.',
        decisionMakers: ['Finance lead', 'Revenue operations manager'],
        actionItems: ['Send pilot proposal'],
        nextSteps: ['Book finance review'],
        objectionResponses: [],
      },
      keyMoments: [
        {
          moment: 'Pilot interest surfaced',
          description: 'Buyer suggested a smaller starting scope instead of blocking the opportunity.',
          impact: 'positive',
        },
      ],
    },
  },
};

const getCallById = (callId) => baseCalls[callId] || baseCalls['call-101'];

const sentimentMap = {
  positive: { label: 'Positive', icon: Smile, className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' },
  neutral: { label: 'Neutral', icon: Meh, className: 'border-amber-500/20 bg-amber-500/10 text-amber-300' },
  negative: { label: 'Negative', icon: Frown, className: 'border-rose-500/20 bg-rose-500/10 text-rose-300' },
};

const getBadgeClassName = (variant) => {
  if (variant === 'positive') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  if (variant === 'negative') return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
  if (variant === 'info') return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300';
  return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
};

const getBarColor = (score) => {
  if (score >= 7) return '#00D4AA';
  if (score >= 5) return '#FFB347';
  return '#FF6B6B';
};

function Section({ title, icon: Icon, iconColor = '#6C63FF', defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`${cardClassName} overflow-hidden p-0`}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-white/[0.02]"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex items-center gap-2.5">
          {createElement(Icon, { size: 18, style: { color: iconColor } })}
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open ? <div className="px-6 pb-6">{children}</div> : null}
    </section>
  );
}

function ListItems({ items, variant = 'info' }) {
  if (!items?.length) {
    return <p className="text-sm text-slate-400">None detected.</p>;
  }

  const rowClassName = getBadgeClassName(variant);

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${rowClassName}`}>
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MeterRing({ value, color, label }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-4xl font-black" style={{ color }}>{value}%</div>
            <div className="mt-1 text-xs text-slate-400">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingRing({ score }) {
  const ringColor = getBarColor(score);
  const angle = Math.max(0, Math.min(100, score * 10));

  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(${ringColor} ${angle}%, rgba(255,255,255,0.06) ${angle}% 100%)` }}
    >
      <div className="absolute inset-2 rounded-full bg-[#121527]" />
      <div className="relative z-10 text-center">
        <span className="text-4xl font-black" style={{ color: ringColor }}>{score}</span>
        <span className="text-base text-slate-300">/10</span>
      </div>
    </div>
  );
}

function CallDetail() {
  const location = useLocation();
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [callMetaOverrides, setCallMetaOverrides] = useState({});
  const [metaForm, setMetaForm] = useState({
    callTitle: '',
    callType: 'other',
    productName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const callId = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'call-101';
  }, [location.pathname]);

  const call = useMemo(() => {
    const base = getCallById(callId);
    const overrides = callMetaOverrides[callId];
    return overrides ? { ...base, ...overrides } : base;
  }, [callId, callMetaOverrides]);

  if (!call) {
    return null;
  }

  const insights = call.aiInsights || {};
  const {
    summary,
    objections = [],
    buyingSignals = [],
    positivePoints = [],
    competitors = [],
    competitorAdvantages = [],
    improvementsNeeded = [],
    productName,
    callTitle,
    callType,
    sentiment = 'neutral',
    dealProbability = 0,
    followUpRecommendation,
    customer = {},
    emailDraft = {},
    salespersonTone = {},
    salespersonPerformance = {},
    conversationAnalysis = {},
    keyMoments = [],
  } = insights;

  const sentimentConfig = sentimentMap[sentiment] || sentimentMap.neutral;
  const SentimentIcon = sentimentConfig.icon;
  const rating = salespersonPerformance.rating || 5;
  const probabilityColor = getBarColor(Math.round(dealProbability / 10));
  const resolvedMeta = {
    callTitle: call.call_title || callTitle || productName || call.product_name || '',
    callType: call.call_type || callType || 'other',
    productName: call.product_name || productName || '',
    customerName: call.customer_name || customer.name || '',
    customerEmail: call.customer_email || customer.email || '',
    customerPhone: call.customer_phone || customer.phone || '',
  };

  const copyText = async (value, setFlag) => {
    try {
      await navigator.clipboard.writeText(value);
      setFlag(true);
      setFeedback({ type: 'success', message: 'Copied to clipboard.' });
      setTimeout(() => setFlag(false), 1800);
    } catch {
      setFeedback({ type: 'error', message: 'Copy failed in this browser context.' });
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setFeedback({ type: 'error', message: 'Report download is not wired to the backend in this workspace yet.' });
    }, 400);
  };

  const saveMetadata = async () => {
    setSavingMeta(true);
    setTimeout(() => {
      setCallMetaOverrides((current) => ({
        ...current,
        [callId]: {
          ...(current[callId] || {}),
          call_title: metaForm.callTitle,
          call_type: metaForm.callType,
          product_name: metaForm.productName,
          customer_name: metaForm.customerName,
          customer_email: metaForm.customerEmail,
          customer_phone: metaForm.customerPhone,
        },
      }));
      setSavingMeta(false);
      setEditMode(false);
      setFeedback({ type: 'success', message: 'Metadata updated locally for the demo view.' });
    }, 250);
  };

  return (
    <div className="flex flex-col gap-6 py-8 text-slate-200">
      {feedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <Link to="/dashboard/calls" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Calls
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-white">
              {call.call_title || callTitle || productName || call.product_name || 'Sales Call Analysis'}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Package size={13} /> {productName || 'Product'}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : '—'}</span>
              <span className="inline-flex items-center gap-1.5"><Mic2 size={13} /> {call.fileName || 'audio file'}</span>
              <span className="inline-flex items-center gap-1.5 capitalize">📌 {call.call_type || callType || 'other'} call</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${sentimentConfig.className}`}>
              <SentimentIcon size={14} />
              {sentimentConfig.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
              <CheckCircle2 size={13} /> Analyzed
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={downloadReport}
              disabled={downloading}
            >
              <Download size={14} />
              {downloading ? 'Preparing...' : 'Download Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={cardClassName}>
          <h3 className="mb-2 text-center text-sm font-bold text-white">Deal Probability</h3>
          <MeterRing value={dealProbability} color={probabilityColor} label="Deal Probability" />
          <p className="mt-1 text-center text-xs text-slate-400">
            {dealProbability >= 70 ? 'Prioritize this deal.' : dealProbability >= 40 ? 'Follow up soon.' : 'High risk and needs attention.'}
          </p>
        </section>

        <section className={`${cardClassName} grid grid-cols-2 gap-5`}>
          {[
            { label: 'Buying Signals', value: buyingSignals.length, color: '#00D4AA' },
            { label: 'Objections', value: objections.length, color: '#FF6B6B' },
            { label: 'Competitors', value: competitors.length, color: '#FFB347' },
            { label: 'Liked Points', value: positivePoints.length, color: '#00D4AA' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black" style={{ color: item.color }}>{item.value}</span>
              <span className="mt-1 text-xs text-slate-400">{item.label}</span>
            </div>
          ))}
        </section>

        <section className={`${cardClassName} flex flex-col items-center justify-center gap-3`}>
          <h3 className="text-center text-sm font-bold text-white">Salesperson Rating</h3>
          <RatingRing score={rating} />
          <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${getBadgeClassName(rating >= 7 ? 'positive' : rating >= 5 ? 'neutral' : 'negative')}`}>
            {rating >= 8 ? 'Excellent' : rating >= 6 ? 'Good' : rating >= 4 ? 'Average' : 'Needs Work'}
          </span>
        </section>
      </div>

      <section className={`${cardClassName} flex flex-col items-center justify-center gap-3 py-7`}>
        <h3 className="text-sm font-bold text-white">Customer Sentiment</h3>
        <div className="text-6xl">{sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😟' : '😐'}</div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${sentimentConfig.className}`}>
          <SentimentIcon size={14} />
          {sentimentConfig.label}
        </span>
      </section>

      <Section title="Conversation Analysis" icon={Activity} iconColor="#4CC9F0">
        <div className="flex flex-col gap-5">
          <div>
            <h4 className="mb-2 text-sm text-slate-400">Talk Ratio</h4>
            <div className="flex h-8 overflow-hidden rounded-xl text-xs font-semibold text-white">
              <div className="flex min-w-[60px] items-center justify-center bg-[#6C63FF] transition-[width] duration-500" style={{ width: `${conversationAnalysis.talkRatioSalesperson || 50}%` }}>
                Rep {conversationAnalysis.talkRatioSalesperson || 50}%
              </div>
              <div className="flex min-w-[60px] items-center justify-center bg-slate-500/70 transition-[width] duration-500" style={{ width: `${conversationAnalysis.talkRatioCustomer || 50}%` }}>
                Customer {conversationAnalysis.talkRatioCustomer || 50}%
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: HelpCircle, value: conversationAnalysis.questionsAskedBySalesperson ?? 0, label: 'Questions by Rep', color: '#6C63FF' },
              { icon: HelpCircle, value: conversationAnalysis.questionsAskedByCustomer ?? 0, label: 'Questions by Customer', color: '#4CC9F0' },
              { icon: Zap, value: conversationAnalysis.urgencyLevel || 'Medium', label: 'Urgency Level', color: conversationAnalysis.urgencyLevel === 'high' ? '#FF6B6B' : conversationAnalysis.urgencyLevel === 'low' ? '#00D4AA' : '#FFB347' },
              { icon: Activity, value: `${conversationAnalysis.customerEngagementScore ?? 5}/10`, label: 'Customer Engagement', color: getBarColor(conversationAnalysis.customerEngagementScore ?? 5) },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  {createElement(Icon, { size: 18, style: { color: item.color } })}
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">{item.value}</span>
                    <span className="text-xs text-slate-400">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {conversationAnalysis.keyTopics?.length ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">🏷️ Key Topics</h4>
              <div className="flex flex-wrap gap-2">
                {conversationAnalysis.keyTopics.map((topic) => (
                  <span key={topic} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>{topic}</span>
                ))}
              </div>
            </div>
          ) : null}

          {conversationAnalysis.painPoints?.length ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">🔥 Customer Pain Points</h4>
              <ListItems items={conversationAnalysis.painPoints} variant="negative" />
            </div>
          ) : null}

          {conversationAnalysis.pricingDiscussed && conversationAnalysis.pricingDetails ? (
            <div>
              <h4 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-white"><DollarSign size={16} /> Pricing Discussion</h4>
              <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-slate-300">
                {conversationAnalysis.pricingDetails}
              </div>
            </div>
          ) : null}

          {conversationAnalysis.decisionMakers?.length ? (
            <div>
              <h4 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-white"><Users size={16} /> Decision Makers</h4>
              <div className="flex flex-wrap gap-2">
                {conversationAnalysis.decisionMakers.map((person) => (
                  <span key={person} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('positive')}`}>👤 {person}</span>
                ))}
              </div>
            </div>
          ) : null}

          {conversationAnalysis.actionItems?.length || conversationAnalysis.nextSteps?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {conversationAnalysis.actionItems?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-emerald-300">✅ Action Items</h4>
                  <ListItems items={conversationAnalysis.actionItems} variant="positive" />
                </div>
              ) : null}
              {conversationAnalysis.nextSteps?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-indigo-300">➡️ Next Steps</h4>
                  <ListItems items={conversationAnalysis.nextSteps} variant="info" />
                </div>
              ) : null}
            </div>
          ) : null}

          {conversationAnalysis.objectionResponses?.length ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">🛡️ Objection Handling Breakdown</h4>
              <div className="flex flex-col gap-3">
                {conversationAnalysis.objectionResponses.map((item) => (
                  <div key={`${item.objection}-${item.response}`} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-start gap-2 text-sm font-semibold text-white">
                      <AlertTriangle size={14} className="mt-0.5 text-rose-300" />
                      <span>"{item.objection}"</span>
                    </div>
                    <div className="pl-6 text-sm text-slate-300">→ {item.response}</div>
                    <span className={`ml-6 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClassName(item.effectiveness === 'strong' ? 'positive' : item.effectiveness === 'weak' ? 'negative' : 'neutral')}`}>
                      {item.effectiveness === 'strong' ? 'Strong' : item.effectiveness === 'weak' ? 'Weak' : 'Average'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {keyMoments?.length ? (
        <Section title="Key Moments" icon={Zap} iconColor="#F59E0B">
          <div className="flex flex-col gap-3">
            {keyMoments.map((item) => (
              <div key={item.moment} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.impact === 'positive' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : item.impact === 'negative' ? 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'}`} />
                <div className="flex-1">
                  <strong className="block text-sm text-white">{item.moment}</strong>
                  {item.description ? <p className="mt-1 text-sm text-slate-300">{item.description}</p> : null}
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClassName(item.impact === 'positive' ? 'positive' : item.impact === 'negative' ? 'negative' : 'neutral')}`}>
                  {item.impact === 'positive' ? 'Positive' : item.impact === 'negative' ? 'Negative' : 'Neutral'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {summary ? (
        <Section title="AI Conversation Summary" icon={MessageSquare} iconColor="#4CC9F0">
          <p className="rounded-r-xl border-l-3 border-indigo-400 bg-indigo-500/5 px-4 py-4 text-sm leading-8 text-slate-300">{summary}</p>
        </Section>
      ) : null}

      <Section title="Review Extracted Metadata" icon={Target} iconColor="#6C63FF">
        {!editMode ? (
          <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-slate-300">
            <p><strong>Call Title:</strong> {resolvedMeta.callTitle || 'Untitled Call'}</p>
            <p className="capitalize"><strong>Call Type:</strong> {resolvedMeta.callType || 'other'}</p>
            <p><strong>Product:</strong> {resolvedMeta.productName || 'Unknown'}</p>
            <p><strong>Customer Name:</strong> {resolvedMeta.customerName || 'Unknown'}</p>
            <p><strong>Customer Email:</strong> {resolvedMeta.customerEmail || 'Not available'}</p>
            <p><strong>Customer Phone:</strong> {resolvedMeta.customerPhone || 'Not available'}</p>
            <div className="mt-3">
              <button
                type="button"
                className="rounded-lg bg-[#6C63FF] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#5d54f4]"
                onClick={() => {
                  setMetaForm({
                    callTitle: resolvedMeta.callTitle,
                    callType: resolvedMeta.callType,
                    productName: resolvedMeta.productName,
                    customerName: resolvedMeta.customerName,
                    customerEmail: resolvedMeta.customerEmail,
                    customerPhone: resolvedMeta.customerPhone,
                  });
                  setEditMode(true);
                }}
              >
                Edit Metadata
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4">
            <div className="grid gap-3">
              <input className={inputClassName} placeholder="Call title" value={metaForm.callTitle} onChange={(event) => setMetaForm((current) => ({ ...current, callTitle: event.target.value }))} />
              <select className={inputClassName} value={metaForm.callType} onChange={(event) => setMetaForm((current) => ({ ...current, callType: event.target.value }))}>
                <option value="sales">Sales</option>
                <option value="service">Service</option>
                <option value="enquiry">Enquiry</option>
                <option value="complaint">Complaint</option>
                <option value="support">Support</option>
                <option value="renewal">Renewal</option>
                <option value="upsell">Upsell</option>
                <option value="other">Other</option>
              </select>
              <input className={inputClassName} placeholder="Product name" value={metaForm.productName} onChange={(event) => setMetaForm((current) => ({ ...current, productName: event.target.value }))} />
              <input className={inputClassName} placeholder="Customer name" value={metaForm.customerName} onChange={(event) => setMetaForm((current) => ({ ...current, customerName: event.target.value }))} />
              <input className={inputClassName} placeholder="Customer email" value={metaForm.customerEmail} onChange={(event) => setMetaForm((current) => ({ ...current, customerEmail: event.target.value }))} />
              <input className={inputClassName} placeholder="Customer phone" value={metaForm.customerPhone} onChange={(event) => setMetaForm((current) => ({ ...current, customerPhone: event.target.value }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-lg bg-[#6C63FF] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#5d54f4] disabled:opacity-50" onClick={saveMetadata} disabled={savingMeta}>
                {savingMeta ? 'Saving...' : 'Save Metadata'}
              </button>
              <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10" onClick={() => setEditMode(false)} disabled={savingMeta}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Section>

      {followUpRecommendation ? (
        <Section title="AI Follow-Up Recommendation" icon={Lightbulb} iconColor="#4CC9F0">
          <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-slate-300">{followUpRecommendation}</div>
        </Section>
      ) : null}

      <Section title="Generated Follow-Up Email" icon={Mail} iconColor="#6C63FF">
        <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm text-slate-300">
          <p><strong>Subject:</strong> {emailDraft.subject || 'Follow-up on our call'}</p>
          <pre className="mt-3 max-h-[220px] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {emailDraft.body || 'No email draft generated.'}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10" onClick={() => copyText(`Subject: ${emailDraft.subject || 'Follow-up on our call'}\n\n${emailDraft.body || 'No email draft generated.'}`, setEmailCopied)}>
              {emailCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {emailCopied ? 'Copied' : 'Copy Email'}
            </button>
            {(emailDraft.cta || emailDraft.tone) ? (
              <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>
                {emailDraft.tone || 'professional'} | {emailDraft.cta || 'Follow up requested'}
              </span>
            ) : null}
          </div>
        </div>
      </Section>

      <Section title="Customer Details" icon={Target} iconColor="#FFB347" defaultOpen={false}>
        <div className="rounded-r-xl border-l-3 border-cyan-400 bg-cyan-500/5 px-4 py-4 text-sm leading-7 text-slate-300">
          <p><strong>Name:</strong> {metaForm.customerName || call.customer_name || customer.name || 'Unknown'}</p>
          <p><strong>Email:</strong> {metaForm.customerEmail || call.customer_email || customer.email || 'Not available'}</p>
          <p><strong>Phone:</strong> {metaForm.customerPhone || call.customer_phone || customer.phone || 'Not available'}</p>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Buying Signals" icon={TrendingUp} iconColor="#00D4AA">
          <ListItems items={buyingSignals} variant="positive" />
        </Section>
        <Section title="Customer Objections" icon={AlertTriangle} iconColor="#FF6B6B">
          <ListItems items={objections} variant="negative" />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="What Customer Liked" icon={ThumbsUp} iconColor="#00D4AA">
          <ListItems items={positivePoints} variant="positive" />
        </Section>
        <Section title="Improvements Needed" icon={Star} iconColor="#FFB347">
          <ListItems items={improvementsNeeded} variant="neutral" />
        </Section>
      </div>

      {(competitors.length || competitorAdvantages.length) ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Competitor Mentions" icon={Package} iconColor="#FFB347">
            {competitors.length ? (
              <div className="flex flex-wrap gap-2">
                {competitors.map((name) => (
                  <span key={name} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>🏢 {name}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No competitors mentioned.</p>
            )}
          </Section>
          <Section title="Competitor Advantages" icon={Shield} iconColor="#FF6B6B">
            <ListItems items={competitorAdvantages} variant="negative" />
          </Section>
        </div>
      ) : null}

      <div>
        <h2 className="mb-6 flex items-center gap-2 border-t border-white/10 pt-6 text-2xl font-bold text-indigo-300">
          <User size={24} /> Salesperson Analysis Deep Dive
        </h2>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Salesperson Tone Analysis" icon={User} iconColor="#4CC9F0">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold capitalize ${getBadgeClassName(salespersonTone.overall === 'aggressive' ? 'negative' : salespersonTone.overall === 'nervous' || salespersonTone.overall === 'passive' ? 'neutral' : salespersonTone.overall === 'friendly' || salespersonTone.overall === 'empathetic' ? 'info' : 'positive')}`}>
                  {salespersonTone.overall || 'neutral'}
                </span>
                {salespersonTone.emotionalIntelligence ? (
                  <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getBadgeClassName(salespersonTone.emotionalIntelligence >= 7 ? 'positive' : salespersonTone.emotionalIntelligence >= 5 ? 'neutral' : 'negative')}`}>
                    EQ Score: {salespersonTone.emotionalIntelligence}/10
                  </span>
                ) : null}
              </div>

              {salespersonTone.breakdown?.length ? (
                <div>
                  <h4 className="mb-2 text-sm text-slate-400">Tone Breakdown</h4>
                  <ListItems items={salespersonTone.breakdown} variant="info" />
                </div>
              ) : null}

              {salespersonTone.toneShifts?.length ? (
                <div>
                  <h4 className="mb-2 text-sm text-slate-400">🔄 Tone Shifts</h4>
                  <ListItems items={salespersonTone.toneShifts} variant="neutral" />
                </div>
              ) : null}

              {salespersonTone.examples?.length ? (
                <div>
                  <h4 className="mb-2 text-sm text-slate-400">Examples from Call</h4>
                  <div className="flex flex-col gap-2">
                    {salespersonTone.examples.map((example) => (
                      <blockquote key={example} className="rounded-r-xl border-l-3 border-indigo-400 bg-indigo-500/5 px-4 py-3 text-sm italic text-slate-300">
                        "{example}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>

          <Section title="Salesperson Performance Scorecard" icon={BarChart3} iconColor="#6C63FF">
            <div className="flex flex-col gap-4">
              {salespersonPerformance.verdict ? (
                <div className="rounded-r-xl border-l-3 border-indigo-400 bg-indigo-500/5 px-4 py-4 text-sm leading-7 text-slate-300">
                  {salespersonPerformance.verdict}
                </div>
              ) : null}

              <div>
                <h4 className="mb-3 text-sm font-semibold text-white">Skill Scores</h4>
                <div className="flex flex-col gap-3">
                  {Object.entries(salespersonPerformance.skills || {}).map(([skill, score]) => {
                    const value = score || 5;
                    const label = skill.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
                    const color = getBarColor(value);
                    return (
                      <div key={skill} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 sm:grid-cols-[140px_1fr_48px]">
                        <span className="text-xs font-medium text-slate-300">{label}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(value / 10) * 100}%`, background: color }} />
                        </div>
                        <span className="text-right text-xs font-bold" style={{ color }}>{value}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-emerald-300">💪 Strengths</h4>
                  <ListItems items={salespersonPerformance.strengths} variant="positive" />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-rose-300">⚠️ Weaknesses</h4>
                  <ListItems items={salespersonPerformance.weaknesses} variant="negative" />
                </div>
              </div>

              {salespersonPerformance.tips?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-indigo-300">💡 Coaching Tips</h4>
                  <ListItems items={salespersonPerformance.tips} variant="info" />
                </div>
              ) : null}

              {salespersonPerformance.missedOpportunities?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-rose-300">🎯 Missed Opportunities</h4>
                  <ListItems items={salespersonPerformance.missedOpportunities} variant="negative" />
                </div>
              ) : null}

              {salespersonPerformance.callPhases && Object.keys(salespersonPerformance.callPhases).length ? (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-white">📊 Call Phase Scores</h4>
                  <div className="flex flex-col gap-3">
                    {Object.entries(salespersonPerformance.callPhases).map(([phase, score]) => {
                      const value = score || 5;
                      const label = phase.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
                      const color = getBarColor(value);
                      return (
                        <div key={phase} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 sm:grid-cols-[140px_1fr_48px]">
                          <span className="text-xs font-medium text-slate-300">{label}</span>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(value / 10) * 100}%`, background: color }} />
                          </div>
                          <span className="text-right text-xs font-bold" style={{ color }}>{value}/10</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>
        </div>
      </div>

      {call.transcript ? (
        <Section title="Full Transcript" icon={Mic2} defaultOpen={false}>
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10" onClick={() => copyText(call.transcript || '', setCopied)}>
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Transcript'}
            </button>
            <span className={`ml-auto inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeClassName('neutral')}`}>
              🎙 Groq Whisper large-v3-turbo
            </span>
          </div>
          <pre className="max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{call.transcript}</pre>
        </Section>
      ) : null}
    </div>
  );
}

export default CallDetail;