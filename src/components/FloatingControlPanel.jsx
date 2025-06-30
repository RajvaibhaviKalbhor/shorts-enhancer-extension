import { useEffect, useState, useRef } from 'react';

export default function FloatingControlPanel() {
  const [scrollMode, setScrollMode] = useState('video-end');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const buttonRef = useRef(null);
  const [likeBtnPosition, setLikeBtnPosition] = useState({ top: 100, left: 100 });

  useEffect(() => {
    const updateButtonPositionFromVideo = (videoEl) => {
      const shortContainer = videoEl.closest('ytd-reel-video-renderer');
      if (!shortContainer) return;

      const likeBtn = [...shortContainer.querySelectorAll('#like-button')].find(
        btn => btn.offsetParent !== null
      );

      if (likeBtn) {
        const rect = likeBtn.getBoundingClientRect();
        setLikeBtnPosition({
          top: rect.top - 60 + window.scrollY,
          left: rect.left + rect.width / 2 - 24 + window.scrollX,
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          updateButtonPositionFromVideo(visibleEntry.target);
        }
      },
      {
        root: null,
        threshold: 0.9, // ensure it's mostly visible
      }
    );

    // Observe all visible Shorts videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => observer.observe(video));

    // Also watch for new videos loaded dynamically
    const mutationObserver = new MutationObserver(() => {
      const newVideos = document.querySelectorAll('video');
      newVideos.forEach(video => observer.observe(video));
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);



  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('')
          .toLowerCase();

        console.log("🗣️ Heard:", transcript);

        if (transcript.includes('next')) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
        }

        if (transcript.includes('previous')) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', bubbles: true }));
        }

        if (transcript.includes('scroll')) {
          toggleScrollMode();
        }

        if (transcript.includes('stop')) {
          setIsListening(false);
          chrome.storage.local.set({ isListening: false });
          recognition.stop();
        }
      };

      recognition.onerror = (e) => {
        console.error('🎤 Recognition error:', e.error);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (error) {
            console.warn('🎤 Error restarting recognition:', error);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.warn('🎤 Recognition already started or errored');
      }
    } else {
      recognitionRef.current.stop();
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isListening]);

  const timeoutRef = useRef(null);

  const collapsePanelAfterInactivity = (delay = 5000) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      chrome.storage.local.set({ isExpanded: false });
    }, delay);
  };


  const toggleScrollMode = () => {
    const newMode = scrollMode === 'video-end' ? 'manual' : 'video-end';
    setScrollMode(newMode);
    chrome.storage.local.set({ scrollMode: newMode });

    collapsePanelAfterInactivity();
  };

  const togglePanel = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    chrome.storage.local.set({ isExpanded: newExpanded });
  };

  const toggleListening = () => {
    const newState = !isListening;
    setIsListening(newState);
    chrome.storage.local.set({ isListening: newState });
    collapsePanelAfterInactivity();

  };

  if (!isExpanded) {
    return (
      <div
        ref={buttonRef}
        onClick={togglePanel}
        style={{
          position: 'fixed',
          top: `${likeBtnPosition.top}px`,
          left: `${likeBtnPosition.left}px`,
          zIndex: 9999,
          width: '48px',
          height: '48px'
        }}
        className={`
    rounded-full cursor-pointer
    flex items-center justify-center text-white font-bold text-sm
    transition-all duration-300
    overflow-hidden
    shadow-[inset_-3px_-3px_8px_rgba(255,255,255,0.3),inset_3px_3px_8px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.3)]
    border border-white/20 backdrop-blur-sm
    ${scrollMode === 'video-end'
            ? 'bg-gradient-to-b from-red-600 to-red-500'
            : 'bg-gradient-to-b from-gray-400 to-gray-600'}
    ${isListening ? 'ring-4 ring-pink-300 animate-micpulse' : ''}
  `}
      >
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white/30 blur-sm opacity-70 pointer-events-none"></div>
        <span className="z-10">{scrollMode === 'video-end' ? 'ON' : 'OFF'}</span>
      </div>





    );
  }

  return (
    <div className="fixed top-24 right-4 z-50 p-4 w-72 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-md bg-white/20 text-white animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold tracking-wide">Shorts Enhancer</h2>
        <button
          onClick={togglePanel}
          className="text-white/80 hover:text-white text-xl font-bold"
          title="Collapse"
        >
          ×
        </button>
      </div>

      <p className="text-sm mb-3">Auto-Scroll: <strong>{scrollMode === 'video-end' ? 'ON' : 'OFF'}</strong></p>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-100 ml-1">Manual</span>
        <div
          className={`w-14 h-8 flex items-center rounded-full cursor-pointer transition-colors duration-300
          ${scrollMode === 'video-end' ? 'bg-green-400' : 'bg-red-400'}`}
          onClick={toggleScrollMode}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300
            ${scrollMode === 'video-end' ? 'translate-x-6' : 'translate-x-0'}`}
          ></div>
        </div>
        <span className="text-xs text-gray-100 mr-1">Auto</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-3 h-3 rounded-full transition-colors duration-300
            ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`}
          ></div>
          <p className="text-sm">Voice Control: <strong>{isListening ? 'ON' : 'OFF'}</strong></p>
        </div>

        <button
          onClick={toggleListening}
          className={`w-full py-2 mt-2 rounded-xl transition-all font-semibold tracking-wide 
          ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
    </div>
  );
}
