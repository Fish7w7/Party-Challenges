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
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('start');
  const [message, setMessage] = useState('');
  const [hasCompleted, setHasCompleted] = useState(false);

  // Gerar nova sequência
  const generateSequence = (length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(colors[Math.floor(Math.random() * colors.length)].id);
    }
    return newSequence;
  };

  // Mostrar sequência
  const playSequence = async (seq) => {
    setIsPlaying(true);
    setGameState('showing');
    setMessage('Memorize a sequência!');

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(null);
    }

    setIsPlaying(false);
    setGameState('input');
    setMessage('Agora repita a sequência!');
  };

  // Iniciar rodada
  const startRound = () => {
    const newSequence = generateSequence(round + 3);
    setSequence(newSequence);
    setUserSequence([]);
    playSequence(newSequence);
  };

  // Iniciar jogo
  const startGame = () => {
    setRound(1);
    setScore(0);
    setGameState('playing');
    setHasCompleted(false);
  };

  // Quando a rodada muda
  useEffect(() => {
    if (gameState === 'playing' && round > 0 && round <= rounds) {
      startRound();
    }
  }, [round, gameState]);

  // Click no botão colorido
  const handleColorClick = (colorId) => {
    if (isPlaying || gameState !== 'input') return;

    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);

    // Feedback visual
    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    // Verificar se errou
    if (colorId !== sequence[userSequence.length]) {
      setGameState('wrong');
      setMessage('❌ Errado! Tente novamente.');
      
      setTimeout(() => {
        if (round >= rounds) {
          finishGame();
        } else {
          setRound(prev => prev + 1);
        }
      }, 2000);
      return;
    }

    // Verificar se completou a sequência
    if (newUserSequence.length === sequence.length) {
      const roundPoints = sequence.length * 10;
      setGameState('correct');
      setScore(prev => prev + roundPoints);
      setMessage(`✅ Correto! +${roundPoints} pontos`);
      
      setTimeout(() => {
        if (round >= rounds) {
          finishGame();
        } else {
          setRound(prev => prev + 1);
        }
      }, 1500);
    }
  };

  const finishGame = () => {
    if (hasCompleted) return; // Prevenir múltiplas chamadas
    
    setHasCompleted(true);
    setGameState('finished');
    setMessage(`🎉 Jogo finalizado! Pontuação: ${score}`);
    
    // Chamar callback imediatamente
    if (onComplete) {
      const result = {
        score: score,
        rounds: round,
        maxSequence: round + 2
      };
      
      console.log('Enviando resultado do jogo da memória:', result);
      onComplete(result);
    }
  };

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
            Memorize a sequência de cores e depois repita na ordem correta!<br/>
            A sequência fica mais longa a cada rodada.
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
            fontWeight: '600'
          }}>
            <div>Rodada: {round}/{rounds}</div>
            <div>Pontos: {score}</div>
            <div>Sequência: {sequence.length}</div>
          </div>

          <div style={{
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '30px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '15px'
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
            {colors.map(({ id, color, activeColor }) => (
              <button
                key={id}
                onClick={() => handleColorClick(id)}
                disabled={isPlaying || gameState !== 'input'}
                style={{
                  height: '120px',
                  background: activeColor === id ? activeColor : color,
                  border: 'none',
                  borderRadius: '16px',
                  cursor: (isPlaying || gameState !== 'input') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  transform: activeColor === id ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  opacity: (isPlaying || gameState !== 'input') ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isPlaying && gameState === 'input') {
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeColor !== id) {
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              />
            ))}
          </div>

          {gameState === 'input' && (
            <div style={{
              marginTop: '20px',
              fontSize: '16px',
              opacity: 0.8
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
            <div>Pontuação Final: <strong>{score}</strong></div>
            <div>Rodadas: <strong>{round}/{rounds}</strong></div>
            <div>Maior Sequência: <strong>{round + 2}</strong></div>
          </div>
          <p style={{ marginTop: '20px', fontSize: '16px', opacity: 0.8 }}>
            Resultado enviado! Aguardando outros jogadores...
          </p>
        </div>
      )}
    </div>
  );
};

export default MemorySequenceChallenge;