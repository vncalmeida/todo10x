import confetti from 'canvas-confetti';

const playSequence = (notes) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    let startTime = audioCtx.currentTime;
    
    // We will chain frequencies
    oscillator.start(startTime);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);

    notes.forEach(({ freq, duration }) => {
      oscillator.frequency.setValueAtTime(freq, startTime);
      startTime += duration;
    });
    
    gainNode.gain.setValueAtTime(0.1, startTime - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime);
    
    oscillator.stop(startTime);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const triggerReward = () => {
  // Confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#fbbf24', '#ffffff'] // Green, Yellow, White
  });

  // Level Up sound
  playSequence([
    { freq: 261.63, duration: 0.1 },
    { freq: 329.63, duration: 0.1 },
    { freq: 392.00, duration: 0.1 },
    { freq: 523.25, duration: 0.3 },
  ]);
};
