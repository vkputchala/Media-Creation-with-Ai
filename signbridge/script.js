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
        document.querySelectorAll('.gesture-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentGesture = btn.dataset.gesture;
        runPipeline();
    });
});

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
