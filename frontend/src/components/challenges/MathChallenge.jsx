import React, { useState, useEffect } from 'react';

const MathChallenge = ({ onComplete, timeLimit = 60, questionCount = 10 }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);

  // Gerar pergunta matemática
  const generateQuestion = (difficulty) => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1, num2, answer;
    
    if (difficulty <= 3) {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
    } else if (difficulty <= 6) {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
    } else {
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
    }
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(num1 / 2);
        num2 = Math.floor(num2 / 2);
        answer = num1 * num2;
        break;
      default:
        answer = num1 + num2;
    }
    
    return { num1, num2, operator, answer, text: `${num1} ${operator} ${num2}` };
  };

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setQuestionNumber(1);
    setStreak(0);
    setTimeLeft(timeLimit);
    setFeedback(null);
    setCurrentQuestion(generateQuestion(1));
  };

  const checkAnswer = () => {
    if (!userAnswer.trim() || !currentQuestion) return;

    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;
    
    if (isCorrect) {
      const points = 10 + (streak * 2);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setFeedback({ type: 'correct', points });
    } else {
      setStreak(0);
      setFeedback({ type: 'wrong', correct: currentQuestion.answer });
    }

    setTimeout(() => {
      if (questionNumber >= questionCount) {
        endGame();
      } else {
        setQuestionNumber(prev => prev + 1);
        setCurrentQuestion(generateQuestion(Math.ceil(questionNumber / 2)));
        setUserAnswer('');
        setFeedback(null);
      }
    }, 1000);
  };

  const endGame = () => {
    setGameActive(false);
    setTimeout(() => {
      onComplete({
        score: score,
        correctAnswers: Math.floor(score / 10),
        timeBonus: timeLeft > 0 ? timeLeft * 2 : 0
      });
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '30px',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '16px',
      color: 'white'
    }}>
      <h2 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
        🧮 Desafio Matemático
      </h2>

      {!gameActive && timeLeft === timeLimit ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
            Resolva {questionCount} operações matemáticas o mais rápido possível!<br/>
            Acertos consecutivos valem pontos extras.
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
      ) : gameActive ? (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <div>Pergunta {questionNumber}/{questionCount}</div>
            <div>⏱️ {timeLeft}s</div>
            <div>Pontos: {score}</div>
          </div>

          {streak > 0 && (
            <div style={{
              textAlign: 'center',
              marginBottom: '15px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fbbf24'
            }}>
              🔥 Sequência: {streak}x
            </div>
          )}

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '30px',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {currentQuestion && (
              <>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  marginBottom: '30px',
                  fontFamily: 'monospace'
                }}>
                  {currentQuestion.text} = ?
                </div>

                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Sua resposta"
                  disabled={feedback !== null}
                  autoFocus
                  style={{
                    width: '200px',
                    padding: '15px',
                    fontSize: '24px',
                    textAlign: 'center',
                    border: '3px solid white',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#1f2937',
                    fontWeight: '700',
                    margin: '0 auto',
                    outline: 'none'
                  }}
                />
              </>
            )}

            {feedback && (
              <div style={{
                marginTop: '20px',
                fontSize: '24px',
                fontWeight: '700',
                animation: 'fadeIn 0.3s'
              }}>
                {feedback.type === 'correct' ? (
                  <span>✅ Correto! +{feedback.points}</span>
                ) : (
                  <span>❌ Errado! Resposta: {feedback.correct}</span>
                )}
              </div>
            )}
          </div>

          {!feedback && (
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '18px',
                fontWeight: '700',
                background: userAnswer.trim() ? '#10b981' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Enviar Resposta
            </button>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{ fontSize: '32px', marginBottom: '20px' }}>🎉 Desafio Concluído!</h3>
          <div style={{ fontSize: '20px', lineHeight: '2' }}>
            <div>Pontuação: <strong>{score}</strong></div>
            <div>Tempo restante: <strong>{timeLeft}s</strong></div>
            <div>Bônus de tempo: <strong>+{timeLeft * 2}</strong></div>
            <div style={{ 
              marginTop: '20px', 
              paddingTop: '20px', 
              borderTop: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '24px' 
            }}>
              Total: <strong>{score + (timeLeft * 2)} pontos</strong>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MathChallenge;