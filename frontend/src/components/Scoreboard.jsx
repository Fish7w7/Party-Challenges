import React from 'react'

const Scoreboard = ({ scoreboard, onClose }) => {
  const getMedal = (position) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈' 
      case 3: return '🥉'
      default: return `${position}°`
    }
  }

  const getPositionClass = (position) => {
    if (position <= 3) return `top-${position}`
    return 'other'
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
    if (percentage >= 80) return 'excellent'
    if (percentage >= 60) return 'good'
    if (percentage >= 40) return 'average'
    return 'poor'
  }

  const maxScore = scoreboard?.length > 0 ? scoreboard[0].score : 0

  return (
    <div className="scoreboard-overlay">
      <div className="scoreboard-modal">
        <div className="scoreboard-header">
          <h2>📊 Placar</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="scoreboard-content">
          {!scoreboard || scoreboard.length === 0 ? (
            <div className="empty-scoreboard">
              <div className="empty-icon">🎯</div>
              <p>Nenhum jogador ainda</p>
            </div>
          ) : (
            <>
              <div className="scoreboard-stats">
                <div className="stat-item">
                  <span className="stat-value">{scoreboard.length}</span>
                  <span className="stat-label">Jogadores</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{maxScore}</span>
                  <span className="stat-label">Melhor Score</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {Math.round(scoreboard.reduce((sum, p) => sum + p.score, 0) / scoreboard.length)}
                  </span>
                  <span className="stat-label">Média</span>
                </div>
              </div>

              <div className="scoreboard-list">
                {scoreboard.map((player, index) => {
                  const position = index + 1
                  return (
                    <div 
                      key={player.id} 
                      className={`scoreboard-item ${getPositionClass(position)}`}
                    >
                      <div className="player-position">
                        <span className="position-medal">{getMedal(position)}</span>
                      </div>
                      
                      <div className="player-info">
                        <div className="player-name">{player.name}</div>
                        <div className="player-details">
                          {player.answered_current_round !== undefined && (
                            <span className={`answer-status ${player.answered_current_round ? 'answered' : 'waiting'}`}>
                              {player.answered_current_round ? '✅ Respondeu' : '⏳ Aguardando'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="player-score">
                        <div className={`score-value ${getScoreColor(player.score, maxScore)}`}>
                          {player.score}
                        </div>
                        <div className="score-label">pontos</div>
                      </div>
                      
                      <div className="score-bar">
                        <div 
                          className={`score-fill ${getScoreColor(player.score, maxScore)}`}
                          style={{
                            width: maxScore > 0 ? `${(player.score / maxScore) * 100}%` : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {scoreboard.length > 3 && (
                <div className="scoreboard-summary">
                  <p>
                    🏆 <strong>{scoreboard[0].name}</strong> está liderando com {scoreboard[0].score} pontos!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="scoreboard-footer">
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color excellent"></span>
              <span>Excelente (80%+)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color good"></span>
              <span>Bom (60-79%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color average"></span>
              <span>Médio (40-59%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color poor"></span>
              <span>Baixo (&lt;40%)</span>
            </div>
          </div>
          
          <button onClick={onClose} className="close-scoreboard-button">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Scoreboard