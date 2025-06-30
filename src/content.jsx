import React from 'react';
import ReactDOM from 'react-dom/client';
import FloatingControlPanel from './components/FloatingControlPanel';
import '../style.css';

// Inject Tailwind CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('assets/style.css');
document.head.appendChild(link);

console.log("✅ Content script loaded");

// Render React control panel
const root = document.createElement('div');
root.id = 'shorts-enhancer-root';
document.body.appendChild(root);
ReactDOM.createRoot(root).render(<FloatingControlPanel />);

// ---- Auto-scroll logic ---- //
let video;
let onTimeUpdate;

function setupAutoScroll() {
  video = document.querySelector('video');
  if (!video) {
    console.warn("🎥 No video element found");
    return;
  }

  // Avoid multiple listeners
  removeAutoScroll();

  onTimeUpdate = () => {
    if (video.duration - video.currentTime <= 0.3) {
      simulateArrowDown();
    }
  };

  video.addEventListener('timeupdate', onTimeUpdate);
  console.log("✅ Auto-scroll enabled");
}

function removeAutoScroll() {
  if (video && onTimeUpdate) {
    video.removeEventListener('timeupdate', onTimeUpdate);
    console.log("🛑 Auto-scroll disabled");
  }
}

function simulateArrowDown() {
  const e = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'ArrowDown',
    code: 'ArrowDown'
  });
  document.dispatchEvent(e);
  console.log("⏭️ Triggered ArrowDown");
}

function simulateArrowUp() {
  const e = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'ArrowUp',
    code: 'ArrowUp'
  });
  document.dispatchEvent(e);
  console.log("⬆️ Triggered ArrowUp");
}


// Initial setup on page load
chrome.storage.local.get(['scrollMode'], ({ scrollMode = 'video-end' }) => {
  if (scrollMode === 'video-end') {
    setupAutoScroll();
  }
});

// Watch for scroll mode changes (live toggle handling)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.scrollMode) {
    const newMode = changes.scrollMode.newValue;
    if (newMode === 'video-end') {
      setupAutoScroll();
    } else {
      removeAutoScroll();
    }
  }
});

// Voice recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

let lastCommandTime = 0;

recognition.onresult = (event) => {
  let interimTranscript = '';
  let finalTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const transcript = event.results[i][0].transcript.toLowerCase();
    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    } else {
      interimTranscript += transcript + ' ';
    }
  }

  const commandText = finalTranscript || interimTranscript;
  const words = commandText.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  const currentTime = Date.now();

  if (currentTime - lastCommandTime < 1000) return;

  console.log("🗣️ Heard:", lastWord);

  switch (lastWord) {
    case "next":
      simulateArrowDown();
      break;
    case "previous":
    case "back":
      simulateArrowUp();
      break;
    case "pause":
      document.querySelector("video")?.pause();
      break;
    case "play":
      document.querySelector("video")?.play();
      break;
    case "mute":
      document.querySelector("video").muted = true;
      break;
    case "unmute":
      document.querySelector("video").muted = false;
      break;
    case "stop":
    case "stoplistening":
    case "stop-listening":
      stopListening();
      break;
    default:
      // No command matched
      return;
  }

  lastCommandTime = currentTime;
};



recognition.onerror = (e) => {
  console.error("🎤 Recognition error:", e.error);
};

chrome.storage.local.get(['isListening'], ({ isListening }) => {
  if (isListening) {
    try {
      recognition.start();
    } catch (error) {
      console.warn("🎤 Recognition already started or errored");
    }
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isListening) {
    const isNowListening = changes.isListening.newValue;
    if (isNowListening) {
      try {
        recognition.start();
      } catch (error) {
        console.warn("🎤 Recognition already started or errored");
      }
    } else {
      recognition.stop();
    }
  }
});

let inactivityTimeout;
const collapseDelay = 5000; // 3 seconds

