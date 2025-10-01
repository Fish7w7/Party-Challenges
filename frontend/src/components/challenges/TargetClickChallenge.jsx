import React, { useState, useEffect, useRef } from 'react';

const TargetClickChallenge = ({ onComplete, timeLimit = 30, targetCount = 10 }) => {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameActive, setGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const gameAreaRef = useRef(null);

  // Configurações de dificuldade progressiva
  const getDifficultySettings = () => {
    const progress = score / targetCount;
    return {
      targetSize: Math.max(30, 70 - (progress * 40)), // 70px -> 30px
      targetLifetime: Math.max(800, 1800 - (progress * 1000)), // 1.8s -> 0.8s
      spawnRate: Math.max(600, 1200 - (progress * 600)), // 1.2s -> 0.6s
      maxTargets: Math.min(4, 2 + Math.floor(progress * 2)), // 2 -> 4 alvos simultâneos
      movingChance: Math.min(0.7, progress * 0.7) // 0% -> 70% chance de mover
    };
  };

  const generateTarget = () => {
    if (!gameAreaRef.current) return null;
    
    const settings = getDifficultySettings();
    const id = Date.now() + Math.random();
    const size = settings.targetSize + (Math.random() * 15 - 7.5); // ±7.5px variação
    const bounds = gameAreaRef.current.getBoundingClientRect();
    
    const x = Math.random() * (bounds.width - size - 20) + 10;
    const y = Math.random() * (bounds.height - size - 20) + 10;
    
    const isMoving = Math.random() < settings.movingChance;
    
    return {
      id,
      x,
      y,
      size,
      lifetime: settings.targetLifetime,
      createdAt: Date.now(),
      isMoving,
      velocityX: isMoving ? (Math.random() - 0.5) * 2 : 0,
      velocityY: isMoving ? (Math.random() - 0.5) * 2 : 0
    };
  };

  // Timer do jogo
  useEffect(() => {
    if (!gameActive) return;

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

  // Spawnar alvos com taxa variável
  useEffect(() => {
    if (!gameActive) return;

    const settings = getDifficultySettings();
    const spawnInterval = setInterval(() => {
      const newTarget = generateTarget();
      if (newTarget && targets.length < settings.maxTargets) {
        setTargets(prev => [...prev, newTarget]);
      }
    }, settings.spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameActive, targets.length, score]);

  // Atualizar posição dos alvos em movimento
  useEffect(() => {
    if (!gameActive) return;

    const moveInterval = setInterval(() => {
      setTargets(prev => prev.map(target => {
        if (!target.isMoving || !gameAreaRef.current) return target;

        const bounds = gameAreaRef.current.getBoundingClientRect();
        let newX = target.x + target.velocityX;
        let newY = target.y + target.velocityY;
        let newVelX = target.velocityX;
        let newVelY = target.velocityY;

        // Rebater nas bordas
        if (newX <= 0 || newX >= bounds.width - target.size) {
          newVelX = -target.velocityX;
          newX = Math.max(0, Math.min(bounds.width - target.size, newX));
        }
        if (newY <= 0 || newY >= bounds.height - target.size) {
          newVelY = -target.velocityY;
          newY = Math.max(0, Math.min(bounds.height - target.size, newY));
        }

        return {
          ...target,
          x: newX,
          y: newY,
          velocityX: newVelX,
          velocityY: newVelY
        };
      }));
    }, 16); // ~60fps

    return () => clearInterval(moveInterval);
  }, [gameActive]);

  // Remover alvos expirados
  useEffect(() => {
    if (!gameActive) return;

    const checkExpired = setInterval(() => {
      setTargets(prev => {
        const now = Date.now();
        const expired = prev.filter(t => now - t.createdAt > t.lifetime);
        
        if (expired.length > 0) {
          setMissed(m => m + expired.length);
          setCombo(0); // Quebra combo ao errar
        }
        
        return prev.filter(t => now - t.createdAt <= t.lifetime);
      });
    }, 50);

    return () => clearInterval(checkExpired);
  }, [gameActive]);

  // Fim do jogo
  useEffect(() => {
    if (!gameActive && timeLeft === 0) {
      const totalAttempts = score + missed;
      const accuracy = totalAttempts > 0 ? (score / totalAttempts) * 100 : 0;
      const comboBonus = Math.floor(combo * 5);
      const finalScore = Math.round((score * 10) + (accuracy * 2) + comboBonus);
      
      setTimeout(() => {
        onComplete({
          score: finalScore,
          hits: score,
          missed: missed,
          accuracy: accuracy.toFixed(1),
          maxCombo: combo
        });
      }, 1000);
    }
  }, [gameActive, timeLeft]);

  const handleTargetClick = (targetId, event) => {
    event.stopPropagation();
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 1);
    setCombo(prev => prev + 1);
  };

  const handleMissClick = () => {
    // Penalidade por clicar fora
    if (gameActive && combo > 0) {
      setCombo(prev => Math.max(0, prev - 1));
    }
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setMissed(0);
    setCombo(0);
    setTimeLeft(timeLimit);
    setTargets([]);
    setDifficulty(1);
  };

  const getTargetOpacity = (target) => {
    const now = Date.now();
    const age = now - target.createdAt;
    const remaining = target.lifetime - age;
    
    if (remaining < 300) {
      return 0.3 + (remaining / 300) * 0.7;
    }
    return 1;
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
        alignItems: 'center',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: '600',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>🎯 Acertos: {score}</div>
        <div>⏱️ Tempo: {timeLeft}s</div>
        <div>❌ Erros: {missed}</div>
        {combo > 1 && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.3)',
            padding: '5px 15px',
            borderRadius: '20px',
            border: '2px solid #fbbf24',
            animation: 'pulse 0.5s ease-in-out infinite'
          }}>
            🔥 Combo: {combo}x
          </div>
        )}
      </div>

      {!gameActive && timeLeft === timeLimit ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '28px' }}>🎯 Desafio de Reflexos</h2>
          <p style={{ marginBottom: '30px', fontSize: '16px', opacity: 0.9, lineHeight: '1.6' }}>
            Clique nos alvos antes que desapareçam!<br/>
            <strong>Atenção:</strong> Alvos ficam menores, mais rápidos e podem se mover.<br/>
            Mantenha combo para pontos extras. Não clique fora!
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
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
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
          onClick={handleMissClick}
          style={{
            position: 'relative',
            width: '100%',
            height: '450px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'crosshair',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {gameActive && targets.map(target => {
            const opacity = getTargetOpacity(target);
            const isDisappearing = opacity < 1;
            
            return (
              <button
                key={target.id}
                onClick={(e) => handleTargetClick(target.id, e)}
                style={{
                  position: 'absolute',
                  left: `${target.x}px`,
                  top: `${target.y}px`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  borderRadius: '50%',
                  background: target.isMoving 
                    ? 'radial-gradient(circle, #f59e0b 0%, #d97706 70%, #b45309 100%)'
                    : 'radial-gradient(circle, #ef4444 0%, #dc2626 70%, #991b1b 100%)',
                  border: `3px solid ${target.isMoving ? '#fbbf24' : 'white'}`,
                  cursor: 'pointer',
                  boxShadow: target.isMoving 
                    ? '0 4px 12px rgba(245, 158, 11, 0.6), 0 0 20px rgba(251, 191, 36, 0.4)'
                    : '0 4px 12px rgba(239, 68, 68, 0.5)',
                  transition: 'transform 0.1s, opacity 0.2s',
                  opacity: opacity,
                  transform: isDisappearing ? 'scale(0.8)' : 'scale(1)',
                  animation: target.isMoving ? 'none' : 'targetPulse 0.6s ease-in-out infinite',
                  zIndex: 10
                }}
                onMouseEnter={(e) => !isDisappearing && (e.target.style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => !isDisappearing && (e.target.style.transform = 'scale(1)')}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40%',
                  height: '40%',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none'
                }} />
              </button>
            );
          })}
          
          {!gameActive && timeLeft === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '40px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{ fontSize: '32px', marginBottom: '20px' }}>🎉 Desafio Concluído!</h3>
              <div style={{ fontSize: '18px', lineHeight: '2' }}>
                <div>Acertos: <strong>{score}</strong></div>
                <div>Erros: <strong>{missed}</strong></div>
                <div>Precisão: <strong>{((score / (score + missed)) * 100 || 0).toFixed(1)}%</strong></div>
                <div>Combo Máximo: <strong>{combo}x</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes targetPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default TargetClickChallenge;