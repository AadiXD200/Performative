const videoEl = document.getElementById('video');
const canvasEl = document.getElementById('canvas');
const detectedEl = document.getElementById('detected');
const scoreEl = document.getElementById('score');
const suggestionsEl = document.getElementById('suggestions');
const signinBtn = document.getElementById('signin');
const bigPopup = document.getElementById('big-popup');
const popupTitle = document.getElementById('popup-title');
const popupSubtext = document.getElementById('popup-subtext');
const popupItems = document.getElementById('popup-items');
const popupContinue = document.getElementById('popup-continue');
const afterSection = document.getElementById('after');
const snapshotImg = document.getElementById('snapshot');
const musicEl = document.getElementById('music');

const ctx = canvasEl.getContext('2d');

let lastPopupAt = 0;
let unlocked = false;
let capturedImage = null;
let geminiProcessed = false;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoEl.srcObject = stream;
  } catch (e) {
    console.error('Camera error', e);
    alert('Failed to access camera. Please allow camera permissions.');
  }
}

function captureFrame() {
  const w = videoEl.videoWidth || 640;
  const h = videoEl.videoHeight || 480;
  canvasEl.width = w;
  canvasEl.height = h;
  ctx.drawImage(videoEl, 0, 0, w, h);
  return canvasEl.toDataURL('image/jpeg', 0.7);
}

function showPopupWithItems(items) {
  const now = Date.now();
  if (now - lastPopupAt < 2500) return; // avoid spam
  lastPopupAt = now;
  popupTitle.textContent = 'YOU ARE PERFORMATIVE. WELCOME';
  popupSubtext.textContent = 'We found the following items:';
  popupItems.innerHTML = '';
  (items || []).forEach(it => {
    const li = document.createElement('li');
    li.textContent = it;
    popupItems.appendChild(li);
  });
  bigPopup.classList.remove('hidden');
}

async function detectLoop() {
  if (videoEl.readyState >= 2) {
    try {
      const dataUrl = captureFrame();
      const res = await fetch('/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const json = await res.json();

      if (!json.ok) throw new Error(json.error || 'Detect error');

      // Update UI
      const labels = json.labels || [];
      detectedEl.textContent = labels.length ? labels.join(', ') : 'None';
      scoreEl.textContent = String(json.score ?? 0);
      suggestionsEl.innerHTML = '';
      (json.suggestions || []).forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        suggestionsEl.appendChild(li);
      });

      if (labels.length && !unlocked) {
        unlocked = true;
        signinBtn.disabled = false;
        
        // Capture image immediately for Gemini
        capturedImage = dataUrl;
        
        // Blast music - play immediately and loudly
        musicEl.volume = 1.0;
        musicEl.loop = true;
        try {
          await musicEl.play();
        } catch (e) {
          console.warn('Autoplay blocked, will play on user interaction', e);
        }
        
        // Show popup
        showPopupWithItems(labels);
        
        // Send to Gemini for transformation
        sendToGemini(dataUrl);
      }
    } catch (e) {
      // Soft-fail in UI, keep looping
      console.warn('Detection loop error', e);
    }
  }

  setTimeout(detectLoop, 600); // ~1.6 fps to keep it light
}

popupContinue.addEventListener('click', () => {
  bigPopup.classList.add('hidden');
  // Ensure music is playing
  if (musicEl.paused) {
    musicEl.play().catch(() => {});
  }
});

async function sendToGemini(imageDataUrl) {
  if (geminiProcessed) return;
  geminiProcessed = true;
  
  try {
    const res = await fetch('/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl })
    });
    const json = await res.json();
    
    if (json.ok && json.response) {
      // Parse Gemini response and create animation
      try {
        const data = JSON.parse(json.response);
        createPerformativeDance(data);
      } catch (e) {
        // If not JSON, still create animation
        createPerformativeDance({
          dance_style: "performative indie dance",
          mood: "nostalgic and soft"
        });
      }
    }
  } catch (e) {
    console.warn('Gemini processing failed', e);
    // Still create animation
    createPerformativeDance({
      dance_style: "performative indie dance",
      mood: "nostalgic and soft"
    });
  }
}

function createPerformativeDance(geminiData) {
  const container = document.getElementById('dance-container');
  if (!container) return;
  
  const canvas = document.getElementById('gemini-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Create animated performative dance
  let frame = 0;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    grad.addColorStop(0, 'rgba(167, 139, 250, 0.3)');
    grad.addColorStop(1, 'rgba(125, 211, 252, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Animated dancer figure - performative pose
    const time = frame * 0.05;
    const wave = Math.sin(time);
    const sway = Math.cos(time * 0.7);
    
    // Body position (gently dancing)
    const bodyX = centerX + sway * 15;
    const bodyY = centerY + wave * 8;
    
    // Draw simplified dancer
    ctx.save();
    ctx.translate(bodyX, bodyY);
    ctx.rotate(sway * 0.2);
    
    // Head (circular)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -40, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Body (soft, flowing)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-8, -25, 16, 40);
    
    // Arms (flowing movement)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(-25 + sway * 5, -15 + wave * 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -10);
    ctx.lineTo(25 - sway * 5, -15 - wave * 10);
    ctx.stroke();
    
    // Legs (gentle movement)
    ctx.beginPath();
    ctx.moveTo(-5, 15);
    ctx.lineTo(-8 - sway * 3, 45 + wave * 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, 15);
    ctx.lineTo(8 + sway * 3, 45 - wave * 5);
    ctx.stroke();
    
    ctx.restore();
    
    // Floating aesthetic items (vinyl, matcha, etc.)
    const items = ['🎵', '📷', '📚', '🍵', '🎧'];
    items.forEach((emoji, i) => {
      const angle = (frame * 0.03 + i * 1.2) % (Math.PI * 2);
      const radius = 100 + wave * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.font = '30px Arial';
      ctx.fillText(emoji, x - 15, y + 10);
    });
    
    frame++;
    requestAnimationFrame(animate);
  }
  
  animate();
}

signinBtn.addEventListener('click', () => {
  // Reveal Gemini section with animation
  afterSection.classList.remove('hidden');
  
  // Use captured image or take new one
  if (capturedImage) {
    snapshotImg.src = capturedImage;
    snapshotImg.classList.remove('hidden');
  } else {
    const img = captureFrame();
    snapshotImg.src = img;
    snapshotImg.classList.remove('hidden');
  }
  
  // Ensure music is blasting
  musicEl.volume = 1.0;
  musicEl.loop = true;
  musicEl.play().catch(() => {});
  
  // Process with Gemini if not already done
  if (geminiProcessed) {
    // Animation already created, just ensure it's visible
    setTimeout(() => createPerformativeDance({
      dance_style: "performative indie dance",
      mood: "nostalgic and soft"
    }), 100);
  } else if (capturedImage) {
    sendToGemini(capturedImage);
  } else {
    // Fallback: create animation anyway
    setTimeout(() => createPerformativeDance({
      dance_style: "performative indie dance",
      mood: "nostalgic and soft"
    }), 100);
  }

  // Generate the GIF server-side, then navigate to /play with it in localStorage
  const baseSource = capturedImage || snapshotImg.src;
  if (baseSource) {
    const styleUrl = 'https://i.redd.it/j8scetmmo0ef1.jpeg';
    // First, try Gemini conversion with the style reference; if it fails, fall back to local overlay
    fetch('/gemini_convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: baseSource, style_url: styleUrl })
    }).then(r => r.json()).then(conv => {
      const source = (conv && conv.ok && conv.image) ? conv.image : baseSource;
      return fetch('/generate_gif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: source })
      });
    }).then(r => r.json()).then(json => {
      if (json && json.ok && json.gif) {
        localStorage.setItem('performativeGif', json.gif);
        window.location.href = '/play';
      } else {
        window.location.href = '/play';
      }
    }).catch(() => {
      window.location.href = '/play';
    });
  } else {
    window.location.href = '/play';
  }
});

initCamera().then(() => detectLoop());


