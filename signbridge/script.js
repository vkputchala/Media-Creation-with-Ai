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
const gestureVideo = document.getElementById('gesture-video');
const gestureOverlayCanvas = document.getElementById('gesture-overlay-canvas');
const gestureOverlayCtx = gestureOverlayCanvas.getContext('2d');
const detectedGestureText = document.getElementById('detected-gesture-text');
const detectedMappingText = document.getElementById('detected-mapping-text');
const startCameraBtn = document.getElementById('start-camera-btn');
const stopCameraBtn = document.getElementById('stop-camera-btn');

const GESTURE_MAP = {
    open_palm: { pipeline: 'pitch', label: 'Strategic Pitch' },
    fist: { pipeline: 'directive', label: 'Decision Directive' },
    peace: { pipeline: 'question', label: 'Boardroom Question' },
    thumbs_up: { pipeline: 'close', label: 'Deal Close' }
};

let liveHands = null;
let liveCamera = null;
let liveStream = null;
let liveGestureActive = false;
let stableGestureKey = null;
let stableGestureFrames = 0;
let lastTriggerAt = 0;

function setActiveGestureButton(gestureKey) {
    document.querySelectorAll('.gesture-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gesture === gestureKey);
    });
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
        const verticalLift = mcp.y - tip.y;
        return wristToTip > wristToPip * 1.15 && verticalLift > 0.02;
    }

    function thumbExtended() {
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const indexMcp = landmarks[5];
        const thumbReach = dist(thumbTip, indexMcp);
        const thumbBend = dist(thumbIp, indexMcp);
        return thumbReach > thumbBend * 1.15;
    }

    const indexUp = fingerExtended(fingerDefs[0]);
    const middleUp = fingerExtended(fingerDefs[1]);
    const ringUp = fingerExtended(fingerDefs[2]);
    const pinkyUp = fingerExtended(fingerDefs[3]);
    const thumbUp = thumbExtended();
    const raisedCount = [thumbUp, indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

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
    if (!mapped || pipelineRunning) return;

    currentGesture = mapped.pipeline;
    setActiveGestureButton(currentGesture);
    detectedMappingText.textContent = mapped.label;
    runPipeline();
}

function onHandsResults(results) {
    updateGestureOverlaySize();
    gestureOverlayCtx.save();
    gestureOverlayCtx.clearRect(0, 0, gestureOverlayCanvas.width, gestureOverlayCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(gestureOverlayCtx, landmarks, HAND_CONNECTIONS, { color: '#00F5FF', lineWidth: 2 });
        drawLandmarks(gestureOverlayCtx, landmarks, { color: '#8B3DFF', lineWidth: 1, radius: 3 });

        const estimated = estimateGesture(landmarks);
        if (estimated) {
            const mapEntry = GESTURE_MAP[estimated.key];
            detectedGestureText.textContent = `${estimated.key.replace('_', ' ').toUpperCase()} (${Math.round(estimated.confidence * 100)}%)`;
            detectedMappingText.textContent = mapEntry.label;

            if (stableGestureKey === estimated.key) {
                stableGestureFrames += 1;
            } else {
                stableGestureKey = estimated.key;
                stableGestureFrames = 1;
            }

            const now = Date.now();
            if (stableGestureFrames >= 8 && now - lastTriggerAt > 2800) {
                lastTriggerAt = now;
                triggerFromLiveGesture(estimated.key);
            }
        } else {
            stableGestureKey = null;
            stableGestureFrames = 0;
            detectedGestureText.textContent = 'Hand found, unclear gesture';
            detectedMappingText.textContent = 'Hold a supported sign longer';
        }
    } else {
        stableGestureKey = null;
        stableGestureFrames = 0;
        detectedGestureText.textContent = 'Show one hand to camera';
        detectedMappingText.textContent = 'Supported: open palm, fist, peace, thumbs up';
    }

    gestureOverlayCtx.restore();
}

async function startLiveGestureDetection() {
    if (liveGestureActive) return;

    if (!window.Hands || !window.Camera || !window.drawConnectors || !window.drawLandmarks) {
        resetLiveDetectionUI('Gesture libraries failed to load');
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        resetLiveDetectionUI('Camera not supported in this browser');
        return;
    }

    try {
        updateGestureOverlaySize();
        liveHands = new Hands({
            locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        liveHands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });
        liveHands.onResults(onHandsResults);

        liveCamera = new Camera(gestureVideo, {
            onFrame: async () => {
                if (liveHands) {
                    await liveHands.send({ image: gestureVideo });
                }
            },
            width: 960,
            height: 540
        });

        await liveCamera.start();
        liveStream = gestureVideo.srcObject;
        liveGestureActive = true;
        startCameraBtn.disabled = true;
        stopCameraBtn.disabled = false;
        detectedGestureText.textContent = 'Camera live. Show a gesture...';
        detectedMappingText.textContent = '—';
    } catch (err) {
        console.error(err);
        resetLiveDetectionUI('Camera permission denied or unavailable');
        liveGestureActive = false;
        startCameraBtn.disabled = false;
        stopCameraBtn.disabled = true;
    }
}

function stopLiveGestureDetection() {
    if (liveCamera && typeof liveCamera.stop === 'function') {
        liveCamera.stop();
    }
    if (liveStream && typeof liveStream.getTracks === 'function') {
        liveStream.getTracks().forEach(track => track.stop());
    }

    liveHands = null;
    liveCamera = null;
    liveStream = null;
    liveGestureActive = false;
    stableGestureKey = null;
    stableGestureFrames = 0;
    startCameraBtn.disabled = false;
    stopCameraBtn.disabled = true;
    resetLiveDetectionUI('Camera stopped');
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
        if (!pipelineRunning) {
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

startCameraBtn.addEventListener('click', startLiveGestureDetection);
stopCameraBtn.addEventListener('click', stopLiveGestureDetection);
window.addEventListener('resize', updateGestureOverlaySize);

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
        waveformActive = true;
        typewriterAnimate(OUTPUT_TEXT[currentGesture][currentVoice]);
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
