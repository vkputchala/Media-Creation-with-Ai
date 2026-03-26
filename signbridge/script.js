/* ═══ SIGNBRIDGE — script.js ═══ */

// ─── Custom Cursor ───
const dot = document.querySelector('.cursor-dot');
const trail = document.querySelector('.cursor-trail');
document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    gsap.to(trail, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
});
document.querySelectorAll('button,a,input,.card-glass,.step-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(trail, { scale: 1.8, borderColor: 'rgba(0,245,255,0.6)', duration: 0.2 }));
    el.addEventListener('mouseleave', () => gsap.to(trail, { scale: 1, borderColor: 'rgba(0,245,255,0.35)', duration: 0.2 }));
});

// ─── Neural Mesh Canvas ───
const meshCanvas = document.getElementById('neural-mesh-canvas');
const mCtx = meshCanvas.getContext('2d');
let mW, mH;
function resizeMesh() { mW = meshCanvas.width = window.innerWidth; mH = meshCanvas.height = window.innerHeight; }
window.addEventListener('resize', resizeMesh); resizeMesh();

const NODE_COUNT = 55;
const nodes = [];
for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
        x: Math.random() * mW, y: Math.random() * mH,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2
    });
}

function drawMesh(t) {
    mCtx.clearRect(0, 0, mW, mH);
    // Update + draw nodes
    for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > mW) n.vx *= -1;
        if (n.y < 0 || n.y > mH) n.vy *= -1;
        const brightness = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.001 + n.phase + n.x * 0.005));
        mCtx.beginPath();
        mCtx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        mCtx.fillStyle = `rgba(0,245,255,${brightness * 0.7})`;
        mCtx.fill();
    }
    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 150) {
                const opacity = (1 - d / 150) * 0.35;
                mCtx.beginPath();
                mCtx.moveTo(nodes[i].x, nodes[i].y);
                mCtx.lineTo(nodes[j].x, nodes[j].y);
                mCtx.strokeStyle = `rgba(0,245,255,${opacity})`;
                mCtx.lineWidth = 0.4;
                mCtx.stroke();
            }
        }
    }
    requestAnimationFrame(drawMesh);
}
requestAnimationFrame(drawMesh);

// ─── Floating Particles (CSS-driven, created in JS) ───
const particlesEl = document.getElementById('particles');
for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    const isCyan = i < 14;
    p.className = 'particle ' + (isCyan ? 'cyan' : 'violet');
    const dur = 6 + Math.random() * 10; // 6-16s
    const drift = (Math.random() - 0.5) * 80; // ±40px
    p.style.cssText = `
        left: ${Math.random() * 100}%;
        bottom: -10px;
        --drift: ${drift}px;
        animation-duration: ${dur}s;
        animation-delay: ${Math.random() * dur}s;
    `;
    particlesEl.appendChild(p);
}

// ─── Hero Parallax ───
document.addEventListener('mousemove', e => {
    const x = (window.innerWidth / 2 - e.clientX) / 60;
    const y = (window.innerHeight / 2 - e.clientY) / 60;
    gsap.to('.display-title', { x: x * 0.4, y: y * 0.4, duration: 1, ease: 'power1.out' });
});

// ─── GSAP ScrollTrigger ───
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.persona-spotlight, .features, .site-footer').forEach(sec => {
    gsap.from(sec, { y: 60, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: 'top 88%', toggleActions: 'play none none reverse' }
    });
});
gsap.from('.feature-card', { y: 30, opacity: 0, duration: 0.5, stagger: 0.08,
    scrollTrigger: { trigger: '.bento-grid', start: 'top 85%' }
});

// ─── Persona Typewriter ───
const personaText = 'Senior Product Manager | Deaf Leader | SignBridge User';
const personaSub = document.querySelector('.typewriter-subtitle');
let pi = 0;
function typePersona() {
    if (pi < personaText.length) { personaSub.textContent += personaText[pi++]; setTimeout(typePersona, 50); }
}
ScrollTrigger.create({ trigger: '.quote-card', start: 'top 80%', onEnter: () => { if (!pi) typePersona(); } });

// ═══ PIPELINE DEMO ENGINE ═══

const VOICE_COLORS = { executive: '#00F5FF', confident: '#8B3DFF', warm: '#E8956D' };

const OUTPUT_TEXT = {
    pitch: {
        executive: "Our Q3 roadmap positions us ahead of the competitive curve. I'm recommending we accelerate the ML infra investment by 40% — here's the business case.",
        confident: "I'm confident our Q3 roadmap will outperform. Let's push the ML infra investment up 40% — the data fully supports this move.",
        warm: "I believe our Q3 roadmap creates real opportunity. I'd love for us to consider accelerating the ML infra investment by 40% together."
    },
    directive: {
        executive: "We need a decision on vendor selection by EOD Thursday. Delaying further creates a 3-week slip in our launch timeline.",
        confident: "I'm calling for a vendor decision by Thursday close of business. Any delay introduces a three-week setback we can't afford.",
        warm: "I'd really appreciate if we could finalize vendor selection by Thursday. A delay here could push our launch back three weeks."
    },
    question: {
        executive: "What's the risk mitigation strategy if the API integration underperforms at scale? I'd like this addressed before we sign off.",
        confident: "I need clarity on our fallback if the API integration doesn't scale. Let's resolve this before final sign-off.",
        warm: "I'm curious about our plan if the API integration doesn't perform at scale. Could we discuss this before moving forward?"
    },
    close: {
        executive: "I'm aligned on the commercial terms. Let's lock this and move to legal review. My team is ready to execute immediately.",
        confident: "The commercial terms work. Let's finalize and get legal moving — my team is standing by to execute.",
        warm: "I feel good about where we've landed on terms. Let's wrap this up and get to legal — my team is eager to get started."
    }
};

const METRICS = { latency: '2ms', confidence: '97.4%', grammar: 'ASL→EN', voice: '99.1%' };

let currentVoice = 'executive';
let currentGesture = 'pitch';
let pipelineRunning = false;
let twInterval = null;

const stepCards = document.querySelectorAll('.step-card');
const arrows = document.querySelectorAll('.arrow-track');
const packets = document.querySelectorAll('.data-packet');
const metricValues = document.querySelectorAll('.metric-value');
const twText = document.querySelector('.tw-text');
const liveCamStage = document.getElementById('live-cam-stage');
const gestureVideo = document.getElementById('gesture-video');
const gestureOverlayCanvas = document.getElementById('gesture-overlay-canvas');
const gestureOverlayCtx = gestureOverlayCanvas.getContext('2d');
const detectedGestureText = document.getElementById('detected-gesture-text');
const detectedMappingText = document.getElementById('detected-mapping-text');
const startCameraBtn = document.getElementById('start-camera-btn');
const startScreenBtn = document.getElementById('start-screen-btn');
const uploadVideoBtn = document.getElementById('upload-video-btn');
const uploadVideoInput = document.getElementById('upload-video-input');
const stopCameraBtn = document.getElementById('stop-camera-btn');
const autoSpeakBtn = document.getElementById('auto-speak-btn');
const speakTranscriptBtn = document.getElementById('speak-transcript-btn');
const clearTranscriptBtn = document.getElementById('clear-transcript-btn');
const liveTranscriptText = document.getElementById('live-transcript-text');
const aslModelUrlInput = document.getElementById('asl-model-url');
const loadAslModelBtn = document.getElementById('load-asl-model-btn');
const aslModelStatus = document.getElementById('asl-model-status');

const GESTURE_MAP = {
    open_palm: { pipeline: 'pitch', label: 'Open Palm', liveText: 'Hello' },
    fist: { pipeline: 'directive', label: 'Fist', liveText: 'Stop' },
    peace: { pipeline: 'question', label: 'Peace', liveText: 'Please repeat' },
    thumbs_up: { pipeline: 'close', label: 'Thumbs Up', liveText: 'Yes' },
    point: { pipeline: 'directive', label: 'Point', liveText: 'You' },
    ily: { pipeline: 'close', label: 'ILY', liveText: 'I love you' }
};

let liveHands = null;
let liveStream = null;
let liveFrameRaf = null;
let liveGestureActive = false;
let liveSourceType = 'camera';
let liveVideoObjectUrl = null;
let stableGestureKey = null;
let stableGestureFrames = 0;
let lastTriggerAt = 0;
let autoSpeakEnabled = true;
const transcriptLines = [];
let letterBuffer = '';
let lastLetterCommitAt = 0;
let aslModel = null;
let aslModelInputShape = null;
let aslModelLabels = [];
const predictionHistory = [];
const DEFAULT_PREDICTION_WINDOW = 12;
const DEFAULT_MIN_STABLE_FRAMES = 7;
const DEFAULT_MIN_CONFIDENCE = 0.62;
let lastIndexTip = null;
let lastPinkyTip = null;
let isOcrRunning = false;
let hasFinalLivePhrase = false;
let ocrLastRunAtSec = -1;
const OCR_INTERVAL_SEC = 1.0;
const ocrPhraseScores = new Map();

function updateTranscriptText() {
    liveTranscriptText.textContent = transcriptLines.length
        ? transcriptLines.join(' ')
        : 'Waiting for live input...';
}

function addTranscriptLine(text) {
    if (!text) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (transcriptLines[transcriptLines.length - 1] === trimmed) return;
    transcriptLines.push(trimmed);
    if (transcriptLines.length > 8) transcriptLines.shift();
    updateTranscriptText();
}

function getAdaptiveThresholds() {
    if (liveSourceType === 'video') {
        return { window: 8, stableFrames: 4, minConfidence: 0.48 };
    }
    if (liveSourceType === 'screen') {
        return { window: 10, stableFrames: 5, minConfidence: 0.54 };
    }
    return {
        window: DEFAULT_PREDICTION_WINDOW,
        stableFrames: DEFAULT_MIN_STABLE_FRAMES,
        minConfidence: aslModel ? 0.5 : DEFAULT_MIN_CONFIDENCE
    };
}

function clearTranscript() {
    transcriptLines.length = 0;
    letterBuffer = '';
    hasFinalLivePhrase = false;
    updateTranscriptText();
}

function setActiveGestureButton(gestureKey) {
    document.querySelectorAll('.gesture-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gesture === gestureKey);
    });
}

function speakText(text, interrupt = false) {
    if (!window.speechSynthesis || !text) return;
    if (interrupt) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = currentVoice === 'confident' ? 1.05 : currentVoice === 'warm' ? 0.95 : 1.0;
    utterance.pitch = currentVoice === 'warm' ? 1.08 : 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

function updateModelStatus(message) {
    aslModelStatus.textContent = message;
}

const DEFAULT_ASL_LABELS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y',
    'HELLO', 'YES', 'NO', 'PLEASE', 'THANK_YOU', 'SORRY', 'QUESTION', 'HELP', 'I_DONT_UNDERSTAND',
    'OPEN_PALM', 'FIST', 'PEACE', 'THUMBS_UP', 'POINT', 'ILY'
];

function normalizePhraseLabel(label) {
    return String(label || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function looksLikeMeaningfulPhrase(text) {
    const cleaned = text.trim();
    if (cleaned.length < 6) return false;
    if (!/[A-Za-z]/.test(cleaned)) return false;
    const words = cleaned.split(/\s+/);
    return words.length >= 2;
}

function normalizeNoisyCaption(text) {
    return String(text || '')
        .toUpperCase()
        .replace(/[^A-Z0-9'\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function resolveCaptionToPhrase(rawText) {
    const normalized = normalizeNoisyCaption(rawText);
    if (!normalized) return null;

    // Strong intent match for common noisy OCR variants.
    const hasDont =
        /\bDONT\b/.test(normalized) ||
        /\bDON\s*T\b/.test(normalized) ||
        /\bDON[' ]?T\b/.test(normalized) ||
        /\bDO NOT\b/.test(normalized);
    const hasUnderstand = /\bUNDERSTAND\b/.test(normalized);
    if (hasDont && hasUnderstand) {
        return "I DON'T UNDERSTAND";
    }

    // A few practical phrase-level fallbacks from short signer clips.
    if (/\bTHANK\b/.test(normalized) && /\bYOU\b/.test(normalized)) return 'THANK YOU';
    if (/\bHELP\b/.test(normalized)) return 'I NEED HELP';
    if (/\bPLEASE\b/.test(normalized)) return 'PLEASE';
    if (/\bHELLO\b/.test(normalized) || /\bHI\b/.test(normalized)) return 'HELLO';
    if (/\bYES\b/.test(normalized)) return 'YES';
    if (/\bNO\b/.test(normalized)) return 'NO';

    if (looksLikeMeaningfulPhrase(normalized)) return normalized;
    return null;
}

function addOcrPhraseScore(phrase, confidence = 0) {
    if (!phrase) return;
    const key = phrase.toUpperCase();
    const existing = ocrPhraseScores.get(key) || { score: 0, hits: 0 };
    // Favor repeated hits; confidence is useful but noisy.
    existing.score += 1 + Math.max(0, Math.min(100, confidence)) / 100;
    existing.hits += 1;
    ocrPhraseScores.set(key, existing);
}

function getBestOcrPhrase(minHits = 2) {
    let bestKey = null;
    let bestScore = -1;
    for (const [key, value] of ocrPhraseScores.entries()) {
        if (value.hits < minHits) continue;
        if (value.score > bestScore) {
            bestScore = value.score;
            bestKey = key;
        }
    }
    return bestKey;
}

async function extractCaptionFromUploadedVideo(force = false) {
    if (liveSourceType !== 'video' || !window.Tesseract || isOcrRunning || hasFinalLivePhrase) return;
    if (!gestureVideo || gestureVideo.readyState < 2) return;
    if (!force) {
        const t = Number(gestureVideo.currentTime || 0);
        if (t - ocrLastRunAtSec < OCR_INTERVAL_SEC) return;
        ocrLastRunAtSec = t;
    }

    isOcrRunning = true;
    try {
        const offscreen = document.createElement('canvas');
        const ctx = offscreen.getContext('2d');
        const targetW = 960;
        const scale = targetW / Math.max(1, gestureVideo.videoWidth);
        offscreen.width = targetW;
        offscreen.height = Math.max(1, Math.floor(gestureVideo.videoHeight * scale));
        ctx.drawImage(gestureVideo, 0, 0, offscreen.width, offscreen.height);

        const result = await Tesseract.recognize(offscreen, 'eng');
        const extracted = (result?.data?.text || '').trim();
        const resolvedPhrase = resolveCaptionToPhrase(extracted);

        if (resolvedPhrase) {
            addOcrPhraseScore(resolvedPhrase, result?.data?.confidence || 0);
            detectedGestureText.textContent = `CAPTION DETECTED (${Math.round((result?.data?.confidence || 0))}%)`;
            detectedMappingText.textContent = 'Caption-assisted phrase';
            // If confidence is strong, emit immediately; otherwise keep collecting consensus.
            const conf = Number(result?.data?.confidence || 0);
            if (conf >= 72 || /\bI DON'T UNDERSTAND\b/.test(resolvedPhrase)) {
                clearTranscript();
                addTranscriptLine(resolvedPhrase);
                typewriterAnimate(resolvedPhrase);
                waveformActive = true;
                hasFinalLivePhrase = true;
                if (autoSpeakEnabled) speakText(resolvedPhrase, true);
            }
        }
    } catch (err) {
        console.error('OCR extraction failed:', err);
    } finally {
        isOcrRunning = false;
    }
}

function getModelInputShape(model) {
    const input = model?.inputs?.[0];
    if (!input || !input.shape) return null;
    return input.shape.slice();
}

function normalizeLandmarks(landmarks) {
    const wrist = landmarks[0];
    const normalized = landmarks.map(pt => [
        pt.x - wrist.x,
        pt.y - wrist.y,
        pt.z - wrist.z
    ]);

    let scale = 0;
    for (const [x, y, z] of normalized) {
        const d = Math.sqrt(x * x + y * y + z * z);
        if (d > scale) scale = d;
    }
    scale = Math.max(scale, 1e-6);

    return normalized.map(([x, y, z]) => [x / scale, y / scale, z / scale]);
}

async function predictGestureWithModel(landmarks) {
    if (!aslModel || !window.tf) return null;

    const normalized = normalizeLandmarks(landmarks);
    const flat = normalized.flat();
    let inputTensor;
    let outputTensor;
    try {
        const shape = aslModelInputShape || getModelInputShape(aslModel);
        if (shape && shape.length === 3 && shape[1] === 21 && shape[2] === 3) {
            inputTensor = tf.tensor(flat, [1, 21, 3], 'float32');
        } else {
            inputTensor = tf.tensor(flat, [1, flat.length], 'float32');
        }

        outputTensor = aslModel.predict(inputTensor);
        const probs = await outputTensor.data();
        if (!probs || !probs.length) return null;

        let bestIndex = 0;
        for (let i = 1; i < probs.length; i++) {
            if (probs[i] > probs[bestIndex]) bestIndex = i;
        }

        const label = aslModelLabels[bestIndex] || `CLASS_${bestIndex}`;
        return {
            key: `model_${label.toLowerCase()}`,
            label,
            confidence: Number(probs[bestIndex] || 0)
        };
    } catch (err) {
        console.error('Model prediction failed:', err);
        updateModelStatus('Model loaded, but inference failed. Check expected input shape.');
        return null;
    } finally {
        if (inputTensor) inputTensor.dispose();
        if (outputTensor) outputTensor.dispose();
    }
}

async function loadCustomAslModel() {
    const modelUrl = aslModelUrlInput.value.trim();
    if (!modelUrl) {
        updateModelStatus('Please provide a valid model.json URL.');
        return;
    }
    if (!window.tf || !window.tf.loadGraphModel) {
        updateModelStatus('TensorFlow.js not available in this browser.');
        return;
    }

    loadAslModelBtn.disabled = true;
    updateModelStatus('Loading ASL model...');
    try {
        aslModel = await tf.loadGraphModel(modelUrl);
        aslModelInputShape = getModelInputShape(aslModel);
        aslModelLabels = DEFAULT_ASL_LABELS.slice();
        updateModelStatus(`Model loaded. Input shape: ${JSON.stringify(aslModelInputShape)}`);
    } catch (err) {
        console.error(err);
        aslModel = null;
        aslModelInputShape = null;
        updateModelStatus('Failed to load model. Check URL/CORS and model format.');
    } finally {
        loadAslModelBtn.disabled = false;
    }
}

function estimateGesture(landmarks) {
    const wrist = landmarks[0];
    const fingerDefs = [
        { name: 'index', tip: 8, pip: 6, mcp: 5 },
        { name: 'middle', tip: 12, pip: 10, mcp: 9 },
        { name: 'ring', tip: 16, pip: 14, mcp: 13 },
        { name: 'pinky', tip: 20, pip: 18, mcp: 17 }
    ];

    function dist(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    function fingerExtended(def) {
        const tip = landmarks[def.tip];
        const pip = landmarks[def.pip];
        const mcp = landmarks[def.mcp];
        const wristToTip = dist(wrist, tip);
        const wristToPip = dist(wrist, pip);
        const tipToMcp = dist(tip, mcp);
        const pipToMcp = dist(pip, mcp);
        return wristToTip > wristToPip * 1.08 && tipToMcp > pipToMcp * 1.02;
    }

    function thumbExtended() {
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const thumbMcp = landmarks[2];
        const indexMcp = landmarks[5];
        const thumbReach = dist(thumbTip, indexMcp);
        const thumbBend = dist(thumbIp, indexMcp);
        const thumbSpan = dist(thumbTip, thumbMcp);
        return thumbReach > thumbBend * 1.08 || thumbSpan > 0.09;
    }

    const indexUp = fingerExtended(fingerDefs[0]);
    const middleUp = fingerExtended(fingerDefs[1]);
    const ringUp = fingerExtended(fingerDefs[2]);
    const pinkyUp = fingerExtended(fingerDefs[3]);
    const thumbUp = thumbExtended();
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinkyTip = landmarks[20];
    const thumbToIndex = dist(thumbTip, indexTip);
    const raisedCount = [thumbUp, indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
    const indexDx = lastIndexTip ? indexTip.x - lastIndexTip.x : 0;
    const indexDy = lastIndexTip ? indexTip.y - lastIndexTip.y : 0;
    const pinkyDx = lastPinkyTip ? pinkyTip.x - lastPinkyTip.x : 0;
    const pinkyDy = lastPinkyTip ? pinkyTip.y - lastPinkyTip.y : 0;
    lastIndexTip = { x: indexTip.x, y: indexTip.y };
    lastPinkyTip = { x: pinkyTip.x, y: pinkyTip.y };

    const indexMovingZLike = indexUp && Math.abs(indexDx) > 0.015 && Math.abs(indexDy) > 0.008;
    const pinkyMovingJLike = pinkyUp && !indexUp && Math.abs(pinkyDx) > 0.01 && pinkyDy > 0.004;

    if (indexMovingZLike) {
        return { key: 'model_z', label: 'Z', confidence: 0.68 };
    }
    if (pinkyMovingJLike) {
        return { key: 'model_j', label: 'J', confidence: 0.66 };
    }

    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
        return { key: 'point', confidence: 0.9 };
    }
    if (thumbUp && indexUp && !middleUp && !ringUp && pinkyUp) {
        return { key: 'ily', confidence: 0.85 };
    }
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
        return { key: 'thumbs_up', confidence: 0.92 };
    }
    if (indexUp && middleUp && !ringUp && !pinkyUp && !thumbUp) {
        return { key: 'peace', confidence: 0.9 };
    }
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) {
        return { key: 'fist', confidence: 0.87 };
    }
    if (indexUp && middleUp && ringUp && pinkyUp && thumbUp) {
        return { key: 'open_palm', confidence: 0.9 };
    }
    if (thumbToIndex < 0.05 && middleUp && ringUp && pinkyUp) {
        return { key: 'open_palm', confidence: 0.65 };
    }

    if (raisedCount >= 4) return { key: 'open_palm', confidence: 0.72 };
    if (raisedCount <= 1) return { key: 'fist', confidence: 0.68 };
    return null;
}

function updateGestureOverlaySize() {
    if (!gestureVideo || !gestureOverlayCanvas) return;
    const rect = gestureVideo.getBoundingClientRect();
    gestureOverlayCanvas.width = Math.max(1, Math.floor(rect.width));
    gestureOverlayCanvas.height = Math.max(1, Math.floor(rect.height));
}

function resetLiveDetectionUI(message) {
    detectedGestureText.textContent = message;
    detectedMappingText.textContent = '—';
    gestureOverlayCtx.clearRect(0, 0, gestureOverlayCanvas.width, gestureOverlayCanvas.height);
}

function triggerFromLiveGesture(gestureKey) {
    const mapped = GESTURE_MAP[gestureKey];
    if (!mapped) return;

    currentGesture = mapped.pipeline;
    setActiveGestureButton(currentGesture);
    detectedMappingText.textContent = mapped.label;
    const liveText = mapped.liveText || mapped.label;
    const outputText = liveGestureActive ? liveText : OUTPUT_TEXT[currentGesture][currentVoice];
    addTranscriptLine(outputText);

    // In live modes, emit output immediately for conversational flow.
    if (liveGestureActive) {
        hasFinalLivePhrase = true;
        waveformActive = true;
        typewriterAnimate(outputText);
        if (autoSpeakEnabled) speakText(outputText, true);
        return;
    }

    if (!pipelineRunning) runPipeline();
}

function reducePredictionNoise(prediction) {
    const thresholds = getAdaptiveThresholds();
    predictionHistory.push(prediction);
    if (predictionHistory.length > thresholds.window) predictionHistory.shift();

    const counters = new Map();
    for (const pred of predictionHistory) {
        const existing = counters.get(pred.key) || { count: 0, confSum: 0, pred };
        existing.count += 1;
        existing.confSum += pred.confidence;
        counters.set(pred.key, existing);
    }

    let best = null;
    for (const entry of counters.values()) {
        if (!best || entry.count > best.count) best = entry;
    }
    if (!best) return null;

    const avgConf = best.confSum / best.count;
    if (best.count < thresholds.stableFrames || avgConf < thresholds.minConfidence) return null;

    return { ...best.pred, confidence: avgConf };
}

function flushLetterBuffer() {
    if (!letterBuffer) return;
    addTranscriptLine(letterBuffer);
    if (autoSpeakEnabled) speakText(letterBuffer);
    letterBuffer = '';
}

function mapModelLabelToPhrase(label) {
    const upper = normalizePhraseLabel(label);
    const phraseMap = {
        HELLO: 'Hello',
        YES: 'Yes',
        NO: 'No',
        PLEASE: 'Please',
        THANK_YOU: 'Thank you',
        SORRY: 'Sorry',
        QUESTION: 'Question',
        HELP: 'I need help',
        I_DONT_UNDERSTAND: "I don't understand",
        IDONTUNDERSTAND: "I don't understand",
        DONT_UNDERSTAND: "I don't understand",
        DO_NOT_UNDERSTAND: "I don't understand"
    };
    return phraseMap[upper] || null;
}

function handleStablePrediction(prediction) {
    if (liveSourceType === 'video' && hasFinalLivePhrase) return;

    const thresholds = getAdaptiveThresholds();
    const now = Date.now();
    if (stableGestureKey === prediction.key) {
        stableGestureFrames += 1;
    } else {
        stableGestureKey = prediction.key;
        stableGestureFrames = 1;
    }

    if (stableGestureFrames < thresholds.stableFrames || now - lastTriggerAt < 1300) return;
    lastTriggerAt = now;

    const mapped = GESTURE_MAP[prediction.key];
    if (mapped) {
        // For uploaded videos without a dedicated ASL model, avoid forcing
        // heuristic gesture intents into transcript (causes wrong phrases).
        if (liveSourceType === 'video' && !aslModel) {
            detectedMappingText.textContent = mapped.label;
            return;
        }
        flushLetterBuffer();
        triggerFromLiveGesture(prediction.key);
        return;
    }

    if (prediction.label) {
        const phrase = mapModelLabelToPhrase(prediction.label);
        if (phrase) {
            flushLetterBuffer();
            detectedMappingText.textContent = phrase;
            addTranscriptLine(phrase);
            typewriterAnimate(phrase);
            waveformActive = true;
            hasFinalLivePhrase = true;
            if (autoSpeakEnabled) speakText(phrase);
            return;
        }

        const isSingleLetter = /^[A-Z]$/.test(prediction.label);
        if (isSingleLetter) {
            if (now - lastLetterCommitAt > 600) {
                letterBuffer += prediction.label;
                if (letterBuffer.length > 24) letterBuffer = letterBuffer.slice(-24);
                liveTranscriptText.textContent = transcriptLines.length
                    ? `${transcriptLines.join(' ')} ${letterBuffer}`
                    : letterBuffer;
                lastLetterCommitAt = now;
                detectedMappingText.textContent = `Spelling: ${letterBuffer}`;
            }
            return;
        }

        detectedMappingText.textContent = prediction.label;
    }
}

async function onHandsResults(results) {
    if (liveSourceType === 'video' && !hasFinalLivePhrase) {
        extractCaptionFromUploadedVideo();
    }

    updateGestureOverlaySize();
    gestureOverlayCtx.save();
    gestureOverlayCtx.clearRect(0, 0, gestureOverlayCanvas.width, gestureOverlayCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(gestureOverlayCtx, landmarks, HAND_CONNECTIONS, { color: '#00F5FF', lineWidth: 2 });
        drawLandmarks(gestureOverlayCtx, landmarks, { color: '#8B3DFF', lineWidth: 1, radius: 3 });

        const heuristicPrediction = estimateGesture(landmarks);
        const modelPrediction = await predictGestureWithModel(landmarks);
        const estimated = modelPrediction && modelPrediction.confidence >= 0.5
            ? modelPrediction
            : heuristicPrediction;
        if (estimated) {
            const displayToken = estimated.label || estimated.key.replace('model_', '').replace('_', ' ');
            detectedGestureText.textContent = `${String(displayToken).toUpperCase()} (${Math.round(estimated.confidence * 100)}%)`;

            const smoothed = reducePredictionNoise(estimated);
            if (smoothed) {
                handleStablePrediction(smoothed);
            }
        } else {
            stableGestureKey = null;
            stableGestureFrames = 0;
            predictionHistory.length = 0;
            flushLetterBuffer();
            detectedGestureText.textContent = 'Hand found, unclear gesture';
            detectedMappingText.textContent = 'Hold a supported sign longer';
        }
    } else {
        stableGestureKey = null;
        stableGestureFrames = 0;
        predictionHistory.length = 0;
        flushLetterBuffer();
        detectedGestureText.textContent = 'Show one hand to camera';
        detectedMappingText.textContent = 'Supported: open palm, fist, peace, thumbs up, point, ILY';
    }

    gestureOverlayCtx.restore();
}

async function startLiveGestureDetection(sourceType = 'camera', selectedFile = null) {
    if (liveGestureActive) {
        stopLiveGestureDetection();
    }

    if (!window.Hands || !window.drawConnectors || !window.drawLandmarks) {
        resetLiveDetectionUI('Gesture libraries failed to load');
        return;
    }

    if (sourceType !== 'video' && !navigator.mediaDevices) {
        resetLiveDetectionUI('Media devices not supported in this browser');
        return;
    }

    try {
        liveSourceType = sourceType;
        liveCamStage.classList.toggle('mirror-input', sourceType === 'camera');

        let stream = null;
        if (sourceType === 'screen') {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            const track = stream.getVideoTracks()[0];
            if (track) {
                track.onended = () => {
                    if (liveGestureActive) stopLiveGestureDetection();
                };
            }
            gestureVideo.srcObject = stream;
            gestureVideo.onended = null;
            liveStream = stream;
        } else if (sourceType === 'camera') {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: false
            });
            const track = stream.getVideoTracks()[0];
            if (track) {
                track.onended = () => {
                    if (liveGestureActive) stopLiveGestureDetection();
                };
            }
            gestureVideo.srcObject = stream;
            gestureVideo.onended = null;
            liveStream = stream;
        } else if (sourceType === 'video') {
            if (!selectedFile) {
                throw new Error('No uploaded file selected');
            }
            if (liveVideoObjectUrl) {
                URL.revokeObjectURL(liveVideoObjectUrl);
            }
            liveVideoObjectUrl = URL.createObjectURL(selectedFile);
            gestureVideo.srcObject = null;
            gestureVideo.src = liveVideoObjectUrl;
            gestureVideo.loop = false;
            gestureVideo.playbackRate = 0.8;
            gestureVideo.onended = () => {
                if (!liveGestureActive) return;
                flushLetterBuffer();
                const bestPhrase = getBestOcrPhrase(1);
                if (!hasFinalLivePhrase && bestPhrase) {
                    clearTranscript();
                    addTranscriptLine(bestPhrase);
                    typewriterAnimate(bestPhrase);
                    waveformActive = true;
                    hasFinalLivePhrase = true;
                    if (autoSpeakEnabled) speakText(bestPhrase, true);
                }
                stopLiveGestureDetection({ preserveUi: true });
                if (!hasFinalLivePhrase) {
                    detectedGestureText.textContent = 'Video analyzed';
                    detectedMappingText.textContent = 'No confident ASL phrase detected';
                } else {
                    detectedGestureText.textContent = 'Video analyzed';
                }
            };
            liveStream = null;
        }

        await gestureVideo.play();

        updateGestureOverlaySize();
        liveHands = new Hands({
            locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        liveHands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });
        liveHands.onResults(onHandsResults);

        const runFrameLoop = async () => {
            if (!liveGestureActive || !liveHands) return;
            if (gestureVideo.readyState >= 2) {
                if (liveHands) {
                    await liveHands.send({ image: gestureVideo });
                }
            }
            liveFrameRaf = requestAnimationFrame(runFrameLoop);
        };

        liveGestureActive = true;
        stableGestureKey = null;
        stableGestureFrames = 0;
        predictionHistory.length = 0;
        letterBuffer = '';
        lastIndexTip = null;
        lastPinkyTip = null;
        hasFinalLivePhrase = false;
        ocrLastRunAtSec = -1;
        ocrPhraseScores.clear();
        startCameraBtn.disabled = true;
        startScreenBtn.disabled = true;
        uploadVideoBtn.disabled = true;
        stopCameraBtn.disabled = false;
        detectedGestureText.textContent = sourceType === 'screen'
            ? 'Screen shared. Show signer on call window...'
            : sourceType === 'video'
                ? 'Video loaded. Running gesture detection...'
                : 'Camera live. Show a gesture...';
        detectedMappingText.textContent = '—';
        if (sourceType === 'video') {
            setTimeout(() => {
                if (liveGestureActive) extractCaptionFromUploadedVideo();
            }, 450);
        }
        runFrameLoop();
    } catch (err) {
        console.error(err);
        resetLiveDetectionUI('Permission denied or input source unavailable');
        liveGestureActive = false;
        startCameraBtn.disabled = false;
        startScreenBtn.disabled = false;
        uploadVideoBtn.disabled = false;
        stopCameraBtn.disabled = true;
    }
}

function stopLiveGestureDetection(options = {}) {
    const { preserveUi = false } = options;
    flushLetterBuffer();
    if (liveFrameRaf) cancelAnimationFrame(liveFrameRaf);
    if (liveStream && typeof liveStream.getTracks === 'function') {
        liveStream.getTracks().forEach(track => track.stop());
    }
    if (gestureVideo) {
        gestureVideo.pause();
        gestureVideo.playbackRate = 1;
        gestureVideo.srcObject = null;
        gestureVideo.onended = null;
        if (liveSourceType === 'video') {
            gestureVideo.removeAttribute('src');
            gestureVideo.load();
        }
    }
    if (liveVideoObjectUrl) {
        URL.revokeObjectURL(liveVideoObjectUrl);
        liveVideoObjectUrl = null;
    }

    liveHands = null;
    liveStream = null;
    liveFrameRaf = null;
    liveGestureActive = false;
    stableGestureKey = null;
    stableGestureFrames = 0;
    predictionHistory.length = 0;
    lastIndexTip = null;
    lastPinkyTip = null;
    ocrLastRunAtSec = -1;
    ocrPhraseScores.clear();
    startCameraBtn.disabled = false;
    startScreenBtn.disabled = false;
    uploadVideoBtn.disabled = false;
    stopCameraBtn.disabled = true;
    if (!preserveUi) {
        resetLiveDetectionUI(
            liveSourceType === 'screen'
                ? 'Screen input stopped'
                : liveSourceType === 'video'
                    ? 'Uploaded video stopped'
                    : 'Camera stopped'
        );
    }
}

// ── Voice Chip Toggle ──
document.querySelectorAll('.voice-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.voice-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentVoice = chip.dataset.voice;
        // Update waveform color live
        drawWaveformColor = VOICE_COLORS[currentVoice];
        // If not running, update text immediately
        if (!pipelineRunning && !liveGestureActive) {
            typewriterAnimate(OUTPUT_TEXT[currentGesture][currentVoice]);
        }
    });
});

// ── Gesture Trigger Buttons ──
document.querySelectorAll('.gesture-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (pipelineRunning) return;
        setActiveGestureButton(btn.dataset.gesture);
        currentGesture = btn.dataset.gesture;
        runPipeline();
    });
});

startCameraBtn.addEventListener('click', () => startLiveGestureDetection('camera'));
startScreenBtn.addEventListener('click', () => startLiveGestureDetection('screen'));
uploadVideoBtn.addEventListener('click', () => uploadVideoInput.click());
uploadVideoInput.addEventListener('change', event => {
    const [file] = event.target.files || [];
    if (!file) return;
    startLiveGestureDetection('video', file);
    uploadVideoInput.value = '';
});
stopCameraBtn.addEventListener('click', stopLiveGestureDetection);
autoSpeakBtn.addEventListener('click', () => {
    autoSpeakEnabled = !autoSpeakEnabled;
    autoSpeakBtn.classList.toggle('active', autoSpeakEnabled);
    autoSpeakBtn.textContent = `Auto Speak: ${autoSpeakEnabled ? 'ON' : 'OFF'}`;
});
speakTranscriptBtn.addEventListener('click', () => {
    const transcript = transcriptLines.join(' ');
    if (transcript) speakText(transcript, true);
});
clearTranscriptBtn.addEventListener('click', clearTranscript);
loadAslModelBtn.addEventListener('click', loadCustomAslModel);
window.addEventListener('resize', updateGestureOverlaySize);
if (!window.tf) {
    updateModelStatus('Model: TensorFlow.js unavailable; using heuristic ASL prototype only');
}

// ── Pipeline Animation ──
function runPipeline() {
    if (pipelineRunning) return;
    pipelineRunning = true;

    // Reset
    stepCards.forEach(c => { c.classList.remove('active', 'complete'); });
    metricValues.forEach(v => v.textContent = '—');
    twText.textContent = '';
    waveformActive = false;

    const metricKeys = ['latency', 'confidence', 'grammar', 'voice'];
    const stagger = 600;

    stepCards.forEach((card, i) => {
        // Activate step
        setTimeout(() => {
            card.classList.add('active');
            // Fire data packet on preceding arrow
            if (i > 0) {
                const pkt = packets[i - 1];
                gsap.fromTo(pkt, { left: '0%', opacity: 1 }, {
                    left: '100%', opacity: 1, duration: 0.7,
                    ease: 'cubic-bezier(0.4,0,0.2,1)',
                    onComplete: () => gsap.set(pkt, { opacity: 0 })
                });
            }
            // Metric reveal
            const mc = document.querySelector(`.metric-card[data-metric="${metricKeys[i]}"] .metric-value`);
            setTimeout(() => { mc.textContent = METRICS[metricKeys[i]]; gsap.from(mc, { y: 10, opacity: 0, duration: 0.3 }); }, 300);
        }, i * stagger);

        // Complete step (after next starts)
        setTimeout(() => {
            card.classList.remove('active');
            card.classList.add('complete');
        }, (i + 1) * stagger);
    });

    // After all steps done → voice output
    const totalTime = stepCards.length * stagger + 200;
    setTimeout(() => {
        const outputText = OUTPUT_TEXT[currentGesture][currentVoice];
        waveformActive = true;
        typewriterAnimate(outputText);
        if (autoSpeakEnabled) speakText(outputText, true);
    }, totalTime);

    // Mark done
    setTimeout(() => { pipelineRunning = false; }, totalTime + 2500);
}

// ── Typewriter ──
function typewriterAnimate(text) {
    clearInterval(twInterval);
    twText.textContent = '';
    let idx = 0;
    twInterval = setInterval(() => {
        if (idx < text.length) {
            twText.textContent += text[idx++];
        } else {
            clearInterval(twInterval);
        }
    }, 24);
}

// ── Waveform Canvas ──
const wfCanvas = document.getElementById('waveform-canvas');
const wfCtx = wfCanvas.getContext('2d');
let waveformActive = false;
let drawWaveformColor = VOICE_COLORS.executive;

function resizeWf() { wfCanvas.width = wfCanvas.parentElement.clientWidth; }
window.addEventListener('resize', resizeWf); resizeWf();

function drawWaveform(t) {
    const w = wfCanvas.width, h = wfCanvas.height;
    wfCtx.clearRect(0, 0, w, h);
    const mid = h / 2;

    if (!waveformActive) {
        // Idle flat line
        wfCtx.beginPath();
        wfCtx.moveTo(0, mid);
        wfCtx.lineTo(w, mid);
        wfCtx.strokeStyle = 'rgba(238,241,255,0.08)';
        wfCtx.lineWidth = 1;
        wfCtx.stroke();
    } else {
        const layers = [
            { amp: 10, freq: 1.8, opacity: 1.0 },
            { amp: 6, freq: 3.2, opacity: 0.5 },
            { amp: 3, freq: 5.0, opacity: 0.3 }
        ];
        layers.forEach(l => {
            wfCtx.beginPath();
            for (let x = 0; x < w; x++) {
                const y = mid + Math.sin((x * l.freq * 0.01) + t * 0.003) * l.amp;
                x === 0 ? wfCtx.moveTo(x, y) : wfCtx.lineTo(x, y);
            }
            wfCtx.strokeStyle = drawWaveformColor;
            wfCtx.globalAlpha = l.opacity;
            wfCtx.lineWidth = 1.5;
            wfCtx.shadowBlur = 8;
            wfCtx.shadowColor = drawWaveformColor;
            wfCtx.stroke();
            wfCtx.globalAlpha = 1;
            wfCtx.shadowBlur = 0;
        });
    }
    requestAnimationFrame(drawWaveform);
}
requestAnimationFrame(drawWaveform);

// ── Auto-demo on page load ──
setTimeout(() => { runPipeline(); }, 1400);

// Ensure camera stream is released if user closes/reloads.
window.addEventListener('beforeunload', () => {
    if (liveGestureActive) stopLiveGestureDetection();
});
