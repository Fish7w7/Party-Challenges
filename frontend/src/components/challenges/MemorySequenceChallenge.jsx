import React, { useState, useEffect } from 'react';

const MemorySequenceChallenge = ({ onComplete, rounds = 5 }) => {
  const colors = [
    { id: 'red', color: '#ef4444', activeColor: '#fca5a5' },
    { id: 'blue', color: '#3b82f6', activeColor: '#93c5fd' },
    { id: 'green', color: '#10b981', activeColor: '#6ee7b7' },
    { id: 'yellow', color: '#f59e0b', activeColor: '#fcd34d' }
  ];

  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('start');
  const [message, setMessage] = useState('');
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // NOVO: controle de animação por índice
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const [isAnimatingOn, setIsAnimatingOn] = useState(false);

  const generateSequence = (length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      newSequence.push(colors[randomIndex].id);
    }
    return newSequence;
  };

  const startGame = () => {
    setRound(1);
    setScore(0);
    setHasCompleted(false);
    setUserSequence([]);
    setGameState('preparing');
  };

  // Gerar nova sequência quando entrar em 'preparing'
  useEffect(() => {
    if (gameState === 'preparing' && round > 0 && round <= rounds) {
      const newSeq = generateSequence(round + 2);
      setSequence(newSeq);
      setUserSequence([]);
      
      setTimeout(() => {
        setGameState('animating');
        setAnimatingIndex(0);
        setIsAnimatingOn(true);
        setMessage('👀 Memorize a sequência!');
      }, 800);
    }
  }, [gameState, round]);

  // Animação da sequência
  useEffect(() => {
    if (gameState !== 'animating') return;
    
    if (animatingIndex >= sequence.length) {
      setAnimatingIndex(-1);
      setIsAnimatingOn(false);
      setTimeout(() => {
        setGameState('input');
        setMessage('✋ Agora repita a sequência!');
      }, 500);
      return;
    }

    if (isAnimatingOn) {
      setTimeout(() => {
        setIsAnimatingOn(false);
      }, 600);
    } else {
      setTimeout(() => {
        setAnimatingIndex(prev => prev + 1);
        setIsAnimatingOn(true);
      }, 300);
    }
  }, [gameState, animatingIndex, isAnimatingOn, sequence]);

  const handleColorClick = (colorId) => {
    if (gameState !== 'input') return;

    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);

    const expectedColor = sequence[userSequence.length];
    
    if (colorId !== expectedColor) {
      setGameState('wrong');
      setMessage('❌ Errado!');
      
      setTimeout(() => {
        if (round >= rounds) {
          finishGame();
        } else {
          setRound(prev => prev + 1);
          setGameState('preparing');
        }
      }, 1500);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      const roundPoints = sequence.length * 10;
      setGameState('correct');
      setScore(prev => prev + roundPoints);
      setMessage(`✅ Perfeito! +${roundPoints} pts`);
      
      setTimeout(() => {
        if (round >= rounds) {
          finishGame();
        } else {
          setRound(prev => prev + 1);
          setGameState('preparing');
        }
      }, 1500);
    }
  };

  const finishGame = () => {
    if (hasCompleted) return;
    setHasCompleted(true);
    setGameState('finished');
    
    if (onComplete) {
      onComplete({
        score: score,
        rounds: round,
        maxSequence: round + 2
      });
    }
  };

  // Determinar qual cor está ativa
  const getActiveColor = () => {
    if (gameState === 'animating' && isAnimatingOn && animatingIndex >= 0) {
      return sequence[animatingIndex];
    }
    return null;
  };

  const activeColorId = getActiveColor();

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      color: 'white',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>🧠 Sequência de Memória</h2>
      
      {gameState === 'start' && (
        <div style={{
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
            Memorize a sequência de cores que vai <strong>piscar</strong>!<br/>
            Depois, repita clicando nas cores na ordem correta.
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
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            Começar
          </button>
        </div>
      )}

      {gameState !== 'start' && gameState !== 'finished' && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '30px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '15px'
          }}>
            <div>Rodada: {round}/{rounds}</div>
            <div>Pontos: {score}</div>
            <div>Sequência: {sequence.length}</div>
          </div>

          <div style={{
            minHeight: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '30px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            {message}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {colors.map(({ id, color, activeColor }) => {
              const isActive = id === activeColorId;
              return (
                <div
                  key={id}
                  onClick={() => handleColorClick(id)}
                  style={{
                    height: '120px',
                    background: isActive ? activeColor : color,
                    border: isActive ? '6px solid white' : '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    cursor: gameState === 'input' ? 'pointer' : 'default',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isActive 
                      ? '0 0 40px white, 0 0 80px currentColor' 
                      : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    filter: isActive ? 'brightness(1.8) saturate(1.5)' : 'brightness(1)',
                    transition: 'all 0.15s ease-out',
                    opacity: gameState === 'input' ? 1 : 0.7
                  }}
                />
              );
            })}
          </div>

          {gameState === 'input' && (
            <div style={{
              marginTop: '25px',
              fontSize: '18px',
              fontWeight: '600',
              background: 'rgba(16, 185, 129, 0.2)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              Progresso: {userSequence.length}/{sequence.length}
            </div>
          )}
        </>
      )}

      {gameState === 'finished' && (
        <div style={{
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <h3 style={{ fontSize: '32px', marginBottom: '20px' }}>🎉 Desafio Concluído!</h3>
          <div style={{ fontSize: '20px', lineHeight: '2' }}>
            <div>Pontuação: <strong>{score}</strong></div>
            <div>Rodadas: <strong>{round}/{rounds}</strong></div>
          </div>
          <p style={{ marginTop: '20px', fontSize: '16px', opacity: 0.8 }}>
            Resultado enviado!
          </p>
        </div>
      )}
    </div>
  );
};

export default MemorySequenceChallenge;