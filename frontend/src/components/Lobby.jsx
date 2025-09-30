import React, { useState } from 'react'

const Lobby = ({ roomId, players, isHost, onStartGame, onShowScoreboard, onLeaveRoom }) => {
  const [showRoomCode, setShowRoomCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar código:', err)
      // Fallback para browsers mais antigos
      const textArea = document.createElement('textarea')
      textArea.value = roomId
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareRoom = async () => {
    const shareData = {
      title: 'Party Challenges - Entre na minha sala!',
      text: `Entre na minha sala do Party Challenges! Código: ${roomId}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await copyRoomCode()
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
      await copyRoomCode()
    }
  }

  return (
    <div className="lobby-container">
      <div className="lobby-content">
        <div className="lobby-header">
          <h2>🎯 Sala Criada!</h2>
          <p>Compartilhe o código abaixo para seus amigos entrarem</p>
        </div>

        <div className="room-code-section">
          <div className="room-code-display">
            <span className="room-code-label">Código da Sala:</span>
            <div className="room-code-value">
              <span className="code">{roomId}</span>
              <button 
                onClick={copyRoomCode}
                className={`copy-button ${copied ? 'copied' : ''}`}
                title="Copiar código"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          </div>

          <div className="share-actions">
            <button onClick={shareRoom} className="share-button">
              📤 Compartilhar Sala
            </button>
            <button 
              onClick={() => setShowRoomCode(!showRoomCode)}
              className="show-code-button"
            >
              {showRoomCode ? '🙈 Ocultar' : '👁️ Mostrar'} Código
            </button>
          </div>

          {showRoomCode && (
            <div className="room-code-qr">
              <div className="big-code">{roomId}</div>
              <p>Mostre esta tela para seus amigos</p>
            </div>
          )}
        </div>

        <div className="players-section">
          <div className="players-header">
            <h3>👥 Jogadores Conectados ({players.length}/10)</h3>
            {players.length >= 2 ? (
              <span className="ready-indicator">✅ Pronto para jogar</span>
            ) : (
              <span className="waiting-indicator">⏳ Aguardando mais jogadores</span>
            )}
          </div>

          <div className="players-grid">
            {players.map((player, index) => (
              <div key={player.id} className={`player-card ${index === 0 ? 'host' : ''}`}>
                <div className="player-avatar">
                  <span className="avatar-emoji">
                    {player.avatar || '👤'}
                  </span>
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  {index === 0 && <span className="host-badge">Host</span>}
                </div>
                <div className="player-status">
                  <span className="status-dot online"></span>
                </div>
              </div>
            ))}
            
            {/* Slots vazios */}
            {Array.from({ length: Math.min(10 - players.length, 6) }).map((_, index) => (
              <div key={`empty-${index}`} className="player-card empty">
                <div className="player-avatar">
                  <span className="avatar-emoji">⚪</span>
                </div>
                <div className="player-info">
                  <span className="player-name">Aguardando...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lobby-info">
          <h3>🎮 Como Jogar:</h3>
          <div className="game-rules">
            <div className="rule-item">
              <span className="rule-icon">❓</span>
              <div className="rule-text">
                <strong>Quiz:</strong> Responda perguntas rapidamente para ganhar pontos
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🎭</span>
              <div className="rule-text">
                <strong>Desafios:</strong> Complete ações divertidas em tempo limitado
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">⚡</span>
              <div className="rule-text">
                <strong>Velocidade:</strong> Respostas mais rápidas ganham pontos extras
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🏆</span>
              <div className="rule-text">
                <strong>Vitória:</strong> Quem fizer mais pontos no final vence
              </div>
            </div>
          </div>
        </div>

        <div className="lobby-actions">
          <div className="action-buttons">
            <button 
              onClick={onShowScoreboard}
              className="action-button secondary"
            >
              📊 Ver Placar
            </button>
            
            <button 
              onClick={onLeaveRoom}
              className="action-button danger"
            >
              🚪 Sair da Sala
            </button>
          </div>

          {isHost && (
            <div className="host-actions">
              <button 
                onClick={onStartGame}
                className={`start-game-button ${players.length >= 2 ? 'enabled' : 'disabled'}`}
                disabled={players.length < 2}
              >
                {players.length >= 2 ? '🚀 Iniciar Jogo' : `⏳ Aguarde mais jogadores (${players.length}/2)`}
              </button>
              
              {players.length >= 2 && (
                <p className="start-game-hint">
                  💡 Você pode iniciar o jogo agora ou aguardar mais jogadores entrarem
                </p>
              )}
            </div>
          )}

          {!isHost && (
            <div className="waiting-message">
              <p>⏳ Aguardando o host <strong>{players[0]?.name}</strong> iniciar o jogo...</p>
            </div>
          )}
        </div>

        <div className="lobby-stats">
          <div className="stat-item">
            <span className="stat-value">{players.length}</span>
            <span className="stat-label">Jogadores</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">10</span>
            <span className="stat-label">Rodadas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">30s</span>
            <span className="stat-label">Por pergunta</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby