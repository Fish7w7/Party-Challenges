import React, { useState, useEffect } from 'react'
import TargetClickChallenge from './challenges/TargetClickChallenge'
import MemorySequenceChallenge from './challenges/MemorySequenceChallenge'
import MathChallenge from './challenges/MathChallenge'

const Challenge = ({ challenge, onSubmitAnswer, onShowScoreboard, answerResult }) => {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(challenge?.time_limit || 30)

  // Timer countdown (apenas para quiz e action tradicionais)
  useEffect(() => {
    if (submitted || timeLeft <= 0 || ['target', 'math'].includes(challenge?.type)) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, submitted, challenge?.type])

  // Reset state when challenge changes
  useEffect(() => {
    setAnswer('')
    setSubmitted(false)
    setTimeLeft(challenge?.time_limit || 30)
  }, [challenge])

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    
    if (submitted || (!answer.trim() && challenge?.type === 'quiz')) return
    
    setSubmitted(true)
    const finalAnswer = challenge?.type === 'action' ? 'completed' : answer.trim()
    onSubmitAnswer(finalAnswer)
  }

  // ✅ NOVO: Handler para completar minigames
  const handleMiniGameComplete = (result) => {
    setSubmitted(true)
    // Enviar resultado como JSON string
    onSubmitAnswer(JSON.stringify(result))
  }

  const getTimerColor = () => {
    if (timeLeft > 20) return 'green'
    if (timeLeft > 10) return 'orange'
    return 'red'
  }

  if (!challenge) {
    return (
      <div className="challenge-loading">
        <div className="loading-spinner"></div>
        <p>Carregando próximo desafio...</p>
      </div>
    )
  }

  // ✅ NOVO: Renderizar Target Click Challenge
  if (challenge.type === 'target') {
    return (
      <div className="challenge-container">
        <div className="challenge-header">
          <div className="challenge-type">
            <span className="type-badge target">
              🎯 Reflexo
            </span>
          </div>
          <div className="challenge-points">
            <span className="points-value">{challenge.points}</span>
            <span className="points-label">pontos base</span>
          </div>
        </div>
        
        <div className="challenge-content">
          {!submitted ? (
            <TargetClickChallenge 
              onComplete={handleMiniGameComplete}
              timeLimit={challenge.time_limit || 30}
              targetCount={challenge.config?.targetCount || 10}
            />
          ) : (
            <div className="answer-status">
              <div className="status-content">
                <div className="status-icon">⏳</div>
                <div className="status-text">
                  <p>Desafio concluído! Aguardando outros jogadores...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ✅ NOVO: Renderizar Memory Sequence Challenge
  if (challenge.type === 'memory') {
    return (
      <div className="challenge-container">
        <div className="challenge-header">
          <div className="challenge-type">
            <span className="type-badge memory">
              🧠 Memória
            </span>
          </div>
          <div className="challenge-points">
            <span className="points-value">{challenge.points}</span>
            <span className="points-label">pontos base</span>
          </div>
        </div>
        
        <div className="challenge-content">
          {!submitted ? (
            <MemorySequenceChallenge 
              onComplete={handleMiniGameComplete}
              rounds={challenge.config?.rounds || 5}
            />
          ) : (
            <div className="answer-status">
              <div className="status-content">
                <div className="status-icon">⏳</div>
                <div className="status-text">
                  <p>Desafio concluído! Aguardando outros jogadores...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ✅ NOVO: Renderizar Math Challenge
  if (challenge.type === 'math') {
    return (
      <div className="challenge-container">
        <div className="challenge-header">
          <div className="challenge-type">
            <span className="type-badge math">
              🧮 Matemática
            </span>
          </div>
          <div className="challenge-points">
            <span className="points-value">{challenge.points}</span>
            <span className="points-label">pontos base</span>
          </div>
        </div>
        
        <div className="challenge-content">
          {!submitted ? (
            <MathChallenge 
              onComplete={handleMiniGameComplete}
              timeLimit={challenge.time_limit || 60}
              questionCount={challenge.config?.questionCount || 10}
            />
          ) : (
            <div className="answer-status">
              <div className="status-content">
                <div className="status-icon">⏳</div>
                <div className="status-text">
                  <p>Desafio concluído! Aguardando outros jogadores...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Quiz e Action tradicionais (código original)
  return (
    <div className="challenge-container">
      <div className="challenge-header">
        <div className="challenge-type">
          <span className={`type-badge ${challenge.type}`}>
            {challenge.type === 'quiz' ? '❓' : '🎭'}
            {challenge.type === 'quiz' ? 'Quiz' : 'Desafio'}
          </span>
        </div>
        
        <div className={`timer ${getTimerColor()}`}>
          <div className="timer-circle">
            <span className="timer-text">{timeLeft}</span>
          </div>
          <div className="timer-label">segundos</div>
        </div>
        
        <div className="challenge-points">
          <span className="points-value">{challenge.points}</span>
          <span className="points-label">pontos</span>
        </div>
      </div>

      <div className="challenge-content">
        {challenge.type === 'quiz' ? (
          <div className="quiz-challenge">
            <h2 className="question">{challenge.question}</h2>
            
            {challenge.options && challenge.options.length > 0 ? (
              <div className="multiple-choice">
                {challenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !submitted && setAnswer(index.toString())}
                    className={`option-button ${answer === index.toString() ? 'selected' : ''} ${submitted ? 'disabled' : ''}`}
                    disabled={submitted}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="answer-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="answer-input"
                    disabled={submitted}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={submitted || !answer.trim()}
                  >
                    {submitted ? '✅ Enviado' : '📤 Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="action-challenge">
            <h2 className="action-description">{challenge.description}</h2>
            <div className="action-instructions">
              <p>💡 Complete a ação e clique em "Concluído" quando terminar</p>
            </div>
            <button
              onClick={() => handleSubmit()}
              className={`action-complete-button ${submitted ? 'completed' : ''}`}
              disabled={submitted}
            >
              {submitted ? '✅ Concluído!' : '🎯 Marcar como Concluído'}
            </button>
          </div>
        )}

        {submitted && (
          <div className="answer-status">
            <div className="status-content">
              <div className="status-icon">
                {answerResult ? (answerResult.correct ? '✅' : '❌') : '⏳'}
              </div>
              <div className="status-text">
                {answerResult ? (
                  <>
                    <p className={`result ${answerResult.correct ? 'correct' : 'incorrect'}`}>
                      {answerResult.correct ? 'Resposta Correta!' : 'Resposta Incorreta'}
                    </p>
                    {challenge.type === 'quiz' && (
                      <p className="your-answer">Sua resposta: "{answerResult.answer}"</p>
                    )}
                  </>
                ) : (
                  <p>Resposta enviada! Aguardando resultado...</p>
                )}
              </div>
            </div>
            
            <div className="waiting-indicator">
              <div className="waiting-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Aguardando outros jogadores terminarem...</p>
            </div>
          </div>
        )}
      </div>

      <div className="challenge-footer">
        <button 
          onClick={onShowScoreboard}
          className="scoreboard-button"
        >
          Ver Placar
        </button>
        
        <div className="challenge-info">
          {challenge.type === 'quiz' ? (
            <p>Dica: Respostas mais rápidas ganham pontos extras!</p>
          ) : (
            <p>Seja criativo e divirta-se com o desafio!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Challenge