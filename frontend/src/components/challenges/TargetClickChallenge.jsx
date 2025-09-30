import React, { useState, useEffect, useRef } from 'react';

const TargetClickChallenge = ({ onComplete, timeLimit = 30, targetCount = 10 }) => {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameActive, setGameActive] = useState(false);
  const gameAreaRef = useRef(null);

  // Gerar posição aleatória para alvos
  const generateTarget = () => {
    const id = Date.now() + Math.random();
    const size = 50 + Math.random() * 30; // 50-80px
    
    if (gameAreaRef.current) {
      const bounds = gameAreaRef.current.getBoundingClientRect();
      const x = Math.random() * (bounds.width - size);
      const y = Math.random() * (bounds.height - size);
      
      return { id, x, y, size, lifetime: 2000 }; // 2s para clicar
    }
    return null;
  };

  // Iniciar jogo
  useEffect(() => {
    if (!gameActive) return;

    // Timer do jogo
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Spawnar alvos
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      const newTarget = generateTarget();
      if (newTarget && targets.length < 5) {
        setTargets(prev => [...prev, newTarget]);
      }
    }, 1000);

    return () => clearInterval(spawnInterval);
  }, [gameActive, targets.length]);

  // Remover alvos expirados
  useEffect(() => {
    if (!gameActive) return;

    const checkExpired = setInterval(() => {
      setTargets(prev => {
        const now = Date.now();
        const expired = prev.filter(t => now - t.id > t.lifetime);
        
        if (expired.length > 0) {
          setMissed(m => m + expired.length);
        }
        
        return prev.filter(t => now - t.id <= t.lifetime);
      });
    }, 100);

    return () => clearInterval(checkExpired);
  }, [gameActive]);

  // Verificar fim do jogo
  useEffect(() => {
    if (!gameActive && timeLeft === 0 && gameAreaRef.current) {
      const accuracy = targetCount > 0 ? (score / targetCount) * 100 : 0;
      const finalScore = Math.round(score * 10 + accuracy);
      
      setTimeout(() => {
        onComplete({
          score: finalScore,
          hits: score,
          missed: missed,
          accuracy: accuracy.toFixed(1)
        });
      }, 1000);
    }
  }, [gameActive, timeLeft, score, missed, targetCount, onComplete]);

  const handleTargetClick = (targetId) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 1);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setMissed(0);
    setTimeLeft(timeLimit);
    setTargets([]);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      color: 'white'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        <div>🎯 Acertos: {score}</div>
        <div>⏱️ Tempo: {timeLeft}s</div>
        <div>❌ Erros: {missed}</div>
      </div>

      {!gameActive && timeLeft === timeLimit ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '28px' }}>🎯 Clique no Alvo!</h2>
          <p style={{ marginBottom: '30px', fontSize: '16px', opacity: 0.9 }}>
            Clique nos alvos que aparecem antes que desapareçam!<br/>
            Quanto mais rápido, mais pontos você ganha.
          </p>
          <button
            onClick={startGame}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: '700',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Iniciar Desafio
          </button>
        </div>
      ) : (
        <div
          ref={gameAreaRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'crosshair'
          }}
        >
          {gameActive && targets.map(target => (
            <button
              key={target.id}
              onClick={() => handleTargetClick(target.id)}
              style={{
                position: 'absolute',
                left: `${target.x}px`,
                top: `${target.y}px`,
                width: `${target.size}px`,
                height: `${target.size}px`,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ef4444 0%, #dc2626 70%, #991b1b 100%)',
                border: '3px solid white',
                cursor: 'pointer',
                animation: 'pulse 0.5s ease-in-out',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
                transition: 'transform 0.1s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          ))}
          
          {!gameActive && timeLeft === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '40px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ fontSize: '32px', marginBottom: '20px' }}>🎉 Desafio Concluído!</h3>
              <div style={{ fontSize: '20px', lineHeight: '2' }}>
                <div>Acertos: <strong>{score}</strong></div>
                <div>Erros: <strong>{missed}</strong></div>
                <div>Precisão: <strong>{((score / (score + missed)) * 100 || 0).toFixed(1)}%</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default TargetClickChallenge;