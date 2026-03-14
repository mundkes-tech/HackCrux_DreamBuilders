import { useCallback, useRef, useState } from 'react';
import {
	CheckCircle,
	ChevronRight,
	Cpu,
	FileAudio,
	FileText,
	Info,
	Loader2,
	Mic,
	Type,
	Upload,
	X,
	Zap,
} from 'lucide-react';

const PIPELINE_STEPS = [
	{ key: 'uploading', label: 'Uploading file', description: 'Saving to server' },
	{ key: 'transcribing', label: 'Transcribing with Groq Whisper', description: 'Speech to Text' },
	{ key: 'analyzing', label: 'Analyzing with LLaMA-3.3-70b', description: 'GPT intelligence' },
	{ key: 'done', label: 'Insights ready!', description: 'Redirecting...' },
];

const DETECTION_ITEMS = [
	{ icon: '🎙️', label: 'Full Transcript', description: 'Groq Whisper speech-to-text' },
	{ icon: '📝', label: 'Call Summary', description: 'Detailed 3-5 sentence overview' },
	{ icon: '🏢', label: 'Product Detected', description: 'What product or service was discussed' },
	{ icon: '✅', label: 'Buying Signals', description: 'Positive purchase intent indicators' },
	{ icon: '⚠️', label: 'Customer Objections', description: 'Pricing, timing, feature concerns' },
	{ icon: '😊', label: 'Positive Points', description: 'What customer genuinely liked' },
	{ icon: '🏁', label: 'Competitor Mentions', description: 'Alternative products discussed' },
	{ icon: '📉', label: 'Competitor Advantages', description: 'Why customer prefers competitors' },
	{ icon: '🔧', label: 'Improvements Needed', description: 'Product weaknesses from feedback' },
	{ icon: '💬', label: 'Customer Sentiment', description: 'Positive, Neutral, or Negative' },
	{ icon: '📊', label: 'Deal Probability', description: '0-100% close likelihood score' },
	{ icon: '📧', label: 'Follow-Up Action', description: 'AI-suggested next steps' },
	{ icon: '🎤', label: 'Salesperson Tone', description: 'Tone shifts and emotional intelligence' },
	{ icon: '⭐', label: 'Salesperson Rating', description: '1-10 score with 11 skill breakdowns' },
	{ icon: '💪', label: 'Strengths & Weaknesses', description: 'What rep did well and where to improve' },
	{ icon: '💡', label: 'Coaching Tips', description: 'Actionable tips to boost performance' },
	{ icon: '🎯', label: 'Missed Opportunities', description: 'Moments the rep could have leveraged' },
	{ icon: '📞', label: 'Call Phase Scores', description: 'Opening to Discovery to Close ratings' },
	{ icon: '🗣️', label: 'Talk Ratio Analysis', description: 'Rep vs Customer speaking balance' },
	{ icon: '❓', label: 'Question Analysis', description: 'Questions asked by both parties' },
	{ icon: '🔥', label: 'Pain Points', description: 'Customer frustrations and needs' },
	{ icon: '🏷️', label: 'Key Topics', description: 'Main discussion themes extracted' },
	{ icon: '💰', label: 'Pricing Discussion', description: 'Budget and pricing conversation analysis' },
	{ icon: '👤', label: 'Decision Makers', description: 'Who has buying authority' },
	{ icon: '✅', label: 'Action Items', description: 'Agreed to-dos and next steps' },
	{ icon: '🛡️', label: 'Objection Handling', description: 'How each objection was addressed' },
	{ icon: '⚡', label: 'Key Moments', description: 'Pivotal breakthroughs and risk moments' },
	{ icon: '🔄', label: 'Engagement & Urgency', description: 'Customer interest and timeline pressure' },
];

const PIPELINE_ITEMS = [
	'Audio uploaded to server',
	'Groq Whisper transcribes speech to text',
	'LLaMA-3.3-70b deep-analyzes conversation',
	'Signals, objections & sentiment detected',
	'Salesperson tone, EQ & performance scored',
	'11 skill scores + 5 call phase scores generated',
	'Talk ratio, questions & engagement analyzed',
	'Pain points, key topics & pricing extracted',
	'Objection responses rated for effectiveness',
	'Key moments & missed opportunities identified',
	'Deal probability & urgency calculated',
	'Follow-up email & action items generated',
	'Results saved to MongoDB Atlas',
];

const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.mp4'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const cardClassName = 'rounded-2xl border border-white/10 bg-[#121527]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-md';
const inputClassName = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/8';
const tabBaseClassName = 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition';
const notConfiguredMessage = 'Analysis API is not configured in this workspace yet. The page UI is ready, but the upload and analysis requests still need to be wired to your backend.';

const formatFileSize = (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`;

const isAcceptedFile = (file) => {
	const fileName = file.name.toLowerCase();
	return ACCEPTED_EXTENSIONS.some((extension) => fileName.endsWith(extension));
};

function AnalyzeCall({ token }) {
	const fileInputRef = useRef(null);
	const [inputType, setInputType] = useState('audio');
	const [audioFile, setAudioFile] = useState(null);
	const [textContent, setTextContent] = useState('');
	const [step, setStep] = useState(null);
	const [completedSteps, setCompletedSteps] = useState([]);
	const [customerName, setCustomerName] = useState('');
	const [customerEmail, setCustomerEmail] = useState('');
	const [customerPhone, setCustomerPhone] = useState('');
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragActive, setIsDragActive] = useState(false);
	const [feedback, setFeedback] = useState(null);
	const [callId, setCallId] = useState(null);
	const [aiInsights, setAiInsights] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

	const setSelectedFile = useCallback((file) => {
		if (!file) {
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			setFeedback({ type: 'error', message: 'File too large. Maximum size is 50MB.' });
			return;
		}

		if (!isAcceptedFile(file)) {
			setFeedback({
				type: 'error',
				message: 'Invalid format. Use mp3, wav, m4a, ogg, webm, flac, aac, or mp4.',
			});
			return;
		}

		setFeedback(null);
		setAudioFile(file);
	}, []);

	const resetPipeline = useCallback(() => {
		setStep(null);
		setCompletedSteps([]);
		setUploadProgress(0);
		setCallId(null);
		setAiInsights(null);
	}, []);

	const handleFileInputChange = useCallback((event) => {
		const [file] = event.target.files || [];
		setSelectedFile(file);
	}, [setSelectedFile]);

	const handleDrop = useCallback((event) => {
		event.preventDefault();
		setIsDragActive(false);
		const [file] = Array.from(event.dataTransfer.files || []);
		setSelectedFile(file);
	}, [setSelectedFile]);

	// Step 1: Upload Audio
	const uploadAudio = async () => {
		const formData = new FormData();
		formData.append('audio', audioFile);
		formData.append('customer_name', customerName || 'Unknown');
		formData.append('customer_email', customerEmail);
		formData.append('customer_phone', customerPhone || '');

		const response = await fetch(`${API_BASE_URL}/audio/upload`, {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}` },
			body: formData
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Upload failed');
		return data.callId;
	};

	// Step 2: Transcribe
	const transcribeAudio = async (cId) => {
		const response = await fetch(`${API_BASE_URL}/transcription/transcribe/${cId}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Transcription failed');
		return data.transcript;
	};

	// Step 3: Analyze
	const analyzeCall = async (cId) => {
		const response = await fetch(`${API_BASE_URL}/ai/analyze/${cId}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Analysis failed');
		return data.insights;
	};

	// Upload text
	const uploadText = async () => {
		const response = await fetch(`${API_BASE_URL}/audio/upload-text`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: textContent,
				customer_name: customerName || 'Unknown',
				customer_email: customerEmail,
				customer_phone: customerPhone || ''
			})
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.message || 'Upload failed');
		return data.callId;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setFeedback(null);

		if (inputType === 'audio' && !audioFile) {
			setFeedback({ type: 'error', message: 'Please select an audio or video file first.' });
			return;
		}

		if (inputType === 'text' && !textContent.trim()) {
			setFeedback({ type: 'error', message: 'Please enter the text format speech.' });
			return;
		}

		if (!customerEmail) {
			setFeedback({ type: 'error', message: 'Please enter customer email.' });
			return;
		}

		resetPipeline();
		setStep('uploading');

		try {
			// STEP 1: Upload
			let cId;
			if (inputType === 'audio') {
				cId = await uploadAudio();
			} else {
				cId = await uploadText();
			}
			setCallId(cId);
			setCompletedSteps(['uploading']);

			// Only transcribe if not text input
			if (inputType === 'audio') {
				setStep('transcribing');
				await transcribeAudio(cId);
				setCompletedSteps(['uploading', 'transcribing']);
			}

			// STEP 3: Analyze
			setStep('analyzing');
			const insights = await analyzeCall(cId);
			setAiInsights(insights);
			setCompletedSteps(['uploading', 'transcribing', 'analyzing', 'done']);
			setStep('done');

			// Show complete view
			setTimeout(() => setStep('complete'), 1000);

		} catch (error) {
			resetPipeline();
			setFeedback({ type: 'error', message: error.message });
		}
	};

	if (step) {
		return (
			<div className="py-8">
				<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
					<div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(108,99,255,0.12)] shadow-[0_0_40px_rgba(108,99,255,0.18)]">
						{step === 'done' ? (
							<CheckCircle size={56} className="text-[#00D4AA]" />
						) : (
							<Loader2 size={56} className="animate-spin text-[#6C63FF]" />
						)}
					</div>

					<div>
						<h2 className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300 bg-clip-text text-3xl font-extrabold text-transparent">
							{step === 'done' ? 'Analysis Complete!' : 'AI Pipeline Running...'}
						</h2>
						<p className="mt-3 text-sm text-slate-400">
							{step === 'uploading' && inputType === 'audio'
								? `Uploading: ${uploadProgress}%`
								: 'Please wait, this may take a moment...' }
						</p>
					</div>

					<div className="flex w-full max-w-[360px] flex-col gap-3">
						{PIPELINE_STEPS.map((pipelineStep) => {
							const isDone = completedSteps.includes(pipelineStep.key);
							const isCurrent = step === pipelineStep.key && !isDone;
							const stepClassName = isDone
								? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
								: isCurrent
									? 'border border-indigo-400/35 bg-indigo-400/10 text-indigo-300'
									: 'border border-white/8 bg-white/4 text-slate-400';

							return (
								<div key={pipelineStep.key} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left ${stepClassName}`}>
									{isDone ? (
										<CheckCircle size={18} className="shrink-0 text-[#00D4AA]" />
									) : isCurrent ? (
										<Loader2 size={18} className="shrink-0 animate-spin text-[#6C63FF]" />
									) : (
										<div className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-white/10 bg-white/10" />
									)}
									<div>
										<span className="block text-sm font-semibold">{pipelineStep.label}</span>
										<span className="mt-0.5 block text-xs opacity-70">{pipelineStep.description}</span>
									</div>
								</div>
							);
						})}
					</div>

					{step === 'uploading' && inputType === 'audio' ? (
						<div className="w-full max-w-[360px]">
							<div className="h-2.5 overflow-hidden rounded-full bg-white/10">
								<div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${uploadProgress}%` }} />
							</div>
							<p className="mt-2 text-center text-xs text-slate-400">{uploadProgress}% uploaded</p>
						</div>
					) : null}
				</div>
			</div>
		);
	}

	return (
		<div className="py-8 text-slate-200 animate-in fade-in duration-300">
			<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Analyze Sales Call</h1>
					<p className="mt-2 max-w-3xl text-sm text-slate-400 md:text-base">
						Upload an audio or video recording or paste text and AI will analyze it automatically.
					</p>
				</div>
			</div>

			<div className="mb-6 inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#121527]/90 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.2)] backdrop-blur-md">
				<button
					type="button"
					className={`${tabBaseClassName} ${inputType === 'audio' ? 'bg-[#6C63FF] text-white shadow-[0_10px_30px_rgba(108,99,255,0.35)]' : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
					onClick={() => setInputType('audio')}
				>
					<FileAudio size={16} />
					1. Audio / Video upload
				</button>
				<button
					type="button"
					className={`${tabBaseClassName} ${inputType === 'text' ? 'bg-[#6C63FF] text-white shadow-[0_10px_30px_rgba(108,99,255,0.35)]' : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
					onClick={() => setInputType('text')}
				>
					<Type size={16} />
					2. Add the text format speech
				</button>
			</div>

			{feedback ? (
				<div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>
					{feedback.message}
				</div>
			) : null}

			<div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
				<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
					<section className={cardClassName}>
						<h3 className="mb-4 text-lg font-bold text-white">Customer Details</h3>
						<div className="grid gap-4">
							<input
								type="text"
								placeholder="Customer Name"
								value={customerName}
								onChange={(event) => setCustomerName(event.target.value)}
								className={inputClassName}
							/>
							<input
								type="email"
								placeholder="Customer Email (Optional)"
								value={customerEmail}
								onChange={(event) => setCustomerEmail(event.target.value)}
								className={inputClassName}
							/>
							<input
								type="tel"
								placeholder="Customer Phone (Optional)"
								value={customerPhone}
								onChange={(event) => setCustomerPhone(event.target.value)}
								className={inputClassName}
							/>
						</div>
					</section>

					<section className={cardClassName}>
						{inputType === 'audio' ? (
							<>
								<h3 className="mb-5 flex items-center text-lg font-bold text-white">
									<FileAudio size={18} className="mr-2" />
									Audio / Video Upload
								</h3>

								{!audioFile ? (
									<div
										role="button"
										tabIndex={0}
										onClick={() => fileInputRef.current?.click()}
										onKeyDown={(event) => {
											if (event.key === 'Enter' || event.key === ' ') {
												event.preventDefault();
												fileInputRef.current?.click();
											}
										}}
										onDragEnter={(event) => {
											event.preventDefault();
											setIsDragActive(true);
										}}
										onDragOver={(event) => {
											event.preventDefault();
											setIsDragActive(true);
										}}
										onDragLeave={(event) => {
											event.preventDefault();
											setIsDragActive(false);
										}}
										onDrop={handleDrop}
										className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-12 text-center transition md:px-8 ${isDragActive ? 'scale-[1.01] border-[#6C63FF] bg-[rgba(108,99,255,0.08)]' : 'border-white/10 bg-[rgba(108,99,255,0.03)] hover:border-[#6C63FF] hover:bg-[rgba(108,99,255,0.08)]'}`}
									>
										<input
											ref={fileInputRef}
											type="file"
											accept=".mp3,.wav,.m4a,.ogg,.webm,.flac,.aac,.mp4"
											onChange={handleFileInputChange}
											className="hidden"
										/>

										<div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[rgba(108,99,255,0.12)] text-[#6C63FF]">
											<Upload size={36} />
										</div>
										<h4 className="text-[1.05rem] font-semibold text-white">Drag & drop your file here</h4>
										<p className="mt-1 text-sm text-slate-400">or click to browse</p>
										<p className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
											MP3 · WAV · M4A · OGG · WebM · FLAC · AAC · MP4 · Max 50MB
										</p>
									</div>
								) : (
									<div className="flex items-start gap-4 rounded-xl border border-white/10 bg-[rgba(108,99,255,0.08)] p-4">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(108,99,255,0.12)] text-[#6C63FF]">
											<FileAudio size={28} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-white">{audioFile.name}</p>
											<p className="mt-1 text-xs text-slate-400">
												{formatFileSize(audioFile.size)} · {audioFile.type || 'audio/video file'}
											</p>
											{audioFile.name.toLowerCase().endsWith('.mp4') ? (
												<p className="mt-2 inline-block rounded-md bg-amber-200 px-2.5 py-1 text-xs text-amber-800">
													Video file detected. Audio will be extracted automatically.
												</p>
											) : null}
										</div>
										<button
											type="button"
											className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
											onClick={() => {
												setAudioFile(null);
												setFeedback(null);
											}}
										>
											<X size={16} />
										</button>
									</div>
								)}
							</>
						) : (
							<>
								<h3 className="mb-5 flex items-center text-lg font-bold text-white">
									<FileText size={18} className="mr-2" />
									Text Format Speech
								</h3>
								<textarea
									className="min-h-[200px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/8"
									placeholder="Paste the transcription or speech text here..."
									value={textContent}
									onChange={(event) => setTextContent(event.target.value)}
								/>
							</>
						)}

						<button
							type="submit"
							className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(108,99,255,0.35)] transition hover:translate-y-[-1px] hover:bg-[#5d54f4] disabled:cursor-not-allowed disabled:opacity-50"
							disabled={inputType === 'audio' ? !audioFile : !textContent.trim()}
						>
							<Mic size={18} />
							Run AI Analysis Pipeline
							<ChevronRight size={16} />
						</button>
					</section>
				</form>

				<div className="flex flex-col gap-6">
					<section className={cardClassName}>
						<h3 className="mb-4 flex items-center text-lg font-bold text-white">
							<Info size={16} className="mr-2" />
							What AI Detects
						</h3>
						<div>
							{DETECTION_ITEMS.map((item) => (
								<div key={item.label} className="flex items-start gap-3 border-b border-white/8 py-2.5 last:border-b-0">
									<span className="mt-0.5 shrink-0 text-xl">{item.icon}</span>
									<div>
										<p className="text-sm font-semibold text-white">{item.label}</p>
										<p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
									</div>
								</div>
							))}
						</div>
					</section>

					<section className={cardClassName}>
						<h3 className="mb-4 text-lg font-bold text-white">⚡ AI Pipeline Steps</h3>
						<div>
							{PIPELINE_ITEMS.map((item, index) => (
								<div key={item} className="flex items-center gap-3 py-2 text-sm text-slate-300">
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[rgba(108,99,255,0.15)] text-xs font-bold text-[#6C63FF]">
										{index + 1}
									</div>
									<span>{item}</span>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export default AnalyzeCall;
