import React, { useEffect, useState } from 'react'
import { useGameSocket } from '../hooks/useSocket'
import Lobby from './Lobby'
import Challenge from './Challenge'
import Scoreboard from './Scoreboard'

const GameRoom = ({ roomId, playerName, isHost, avatar, socket, onLeaveRoom }) => {
  const [currentView, setCurrentView] = useState('lobby')
  const [showScoreboard, setShowScoreboard] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [currentAnswerResult, setCurrentAnswerResult] = useState(null)
  
  const {
    players,
    currentChallenge,
    scoreboard,
    gameStarted,
    gameEnded,
    roundResults,
    winner,
    joinRoom,
    startGame,
    submitAnswer,
    nextRound,
    getScoreboard,
    resetGame
  } = useGameSocket(socket, roomId)

  // Auto-entrar na sala quando componente monta
  useEffect(() => {
    if (socket && roomId && playerName && !hasJoined) {
      setHasJoined(true)
      joinRoom(playerName, avatar)
    }
  }, [socket, roomId, playerName, avatar, hasJoined, joinRoom])

  // Escutar evento answer_result do socket
  useEffect(() => {
    if (!socket) return

    const handleAnswerResult = (result) => {
      setCurrentAnswerResult(result)
    }

    socket.on('answer_result', handleAnswerResult)

    return () => {
      socket.off('answer_result', handleAnswerResult)
    }
  }, [socket])

  // Resetar answerResult quando mudar de desafio
  useEffect(() => {
    setCurrentAnswerResult(null)
  }, [currentChallenge])

  // Gerenciar mudanças de view baseado no estado do jogo
  useEffect(() => {
    if (gameEnded) {
      setCurrentView('final-results')
    } else if (roundResults) {
      setCurrentView('round-results')
    } else if (gameStarted && currentChallenge) {
      setCurrentView('challenge')
    } else if (gameStarted) {
      setCurrentView('loading')
    } else {
      setCurrentView('lobby')
    }
  }, [gameStarted, gameEnded, currentChallenge, roundResults])

  const handleLeaveRoom = () => {
    if (window.confirm('Tem certeza que deseja sair da sala?')) {
      onLeaveRoom()
    }
  }

  const handleShowScoreboard = () => {
    getScoreboard()
    setShowScoreboard(true)
  }

  const handleStartGame = () => {
    if (players.length < 2) {
      alert('Você precisa de pelo menos 2 jogadores para iniciar o jogo!')
      return
    }
    startGame()
  }

  const handleNextRound = () => {
    nextRound()
  }

  const handleNewGame = () => {
    if (window.confirm('Voltar para o lobby e começar uma nova partida?')) {
      resetGame()
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'lobby':
        return (
          <Lobby
            roomId={roomId}
            players={players}
            isHost={isHost}
            onStartGame={handleStartGame}
            onShowScoreboard={handleShowScoreboard}
            onLeaveRoom={handleLeaveRoom}
          />
        )

      case 'loading':
        return (
          <div className="loading-view">
            <div className="loading-content">
              <div className="loading-spinner large"></div>
              <h2>Preparando próximo desafio...</h2>
              <p>Aguarde um momento</p>
            </div>
          </div>
        )

      case 'challenge':
        return (
          <Challenge
            challenge={currentChallenge}
            onSubmitAnswer={submitAnswer}
            onShowScoreboard={handleShowScoreboard}
            answerResult={currentAnswerResult}
          />
        )

      case 'round-results':
        return (
          <div className="round-results-view">
            <div className="round-results-content">
              <h2>Resultados da Rodada</h2>
              
              {roundResults && (
                <>
                  <div className="challenge-recap">
                    {roundResults.challenge?.type === 'quiz' ? (
                      <>
                        <p className="question">"{roundResults.challenge.question}"</p>
                        <p className="correct-answer">
                          Resposta correta: <strong>{roundResults.correct_answer}</strong>
                        </p>
                      </>
                    ) : (
                      <p className="action-description">
                        Desafio: {roundResults.challenge?.description}
                      </p>
                    )}
                  </div>

                  <div className="players-results">
                    {roundResults.players_results?.map((result) => (
                      <div key={result.player_id} className={`player-result ${result.correct ? 'correct' : 'incorrect'}`}>
                        <div className="player-info">
                          <span className="player-avatar">{result.player_avatar || '👤'}</span>
                          <span className="player-name">{result.player_name}</span>
                        </div>
                        <span className="player-answer">{result.answer || 'Não respondeu'}</span>
                        <span className="result-icon">
                          {result.correct ? '✅' : '❌'}
                        </span>
                        {result.points_earned > 0 && (
                          <span className="points-earned">+{result.points_earned}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="current-scoreboard">
                    <h3>Placar Atual</h3>
                    <div className="mini-scoreboard">
                      {roundResults.scoreboard?.slice(0, 3).map((player, index) => (
                        <div key={player.id} className={`mini-score-item position-${index + 1}`}>
                          <span className="position">{index + 1}°</span>
                          <div className="player-info">
                            <span className="player-avatar-mini">{player.avatar || '👤'}</span>
                            <span className="name">{player.name}</span>
                          </div>
                          <span className="score">{player.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="round-actions">
                <button 
                  onClick={handleShowScoreboard}
                  className="action-button secondary"
                >
                  📊 Ver Placar Completo
                </button>
                
                {isHost && (
                  <button 
                    onClick={handleNextRound}
                    className="action-button primary"
                  >
                    ⏭️ Próxima Pergunta
                  </button>
                )}
                
                {!isHost && (
                  <p className="waiting-host">Aguardando o host avançar para a próxima pergunta...</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'final-results':
        return (
          <div className="final-results-view">
            <div className="final-results-content">
              <h2>🎉 Jogo Finalizado!</h2>
              
              {winner && (
                <div className="winner-announcement">
                  <div className="winner-crown">👑</div>
                  <div className="winner-info">
                    <span className="winner-avatar">{winner.avatar || '👤'}</span>
                    <h3>Vencedor: {winner.name}</h3>
                  </div>
                  <p className="winner-score">{winner.score} pontos</p>
                </div>
              )}

              <div className="final-scoreboard">
                <h3>Classificação Final</h3>
                {scoreboard?.map((player, index) => (
                  <div key={player.id} className={`final-score-item position-${index + 1}`}>
                    <span className="position">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                    </span>
                    <div className="player-info">
                      <span className="player-avatar">{player.avatar || '👤'}</span>
                      <span className="name">{player.name}</span>
                    </div>
                    <span className="score">{player.score} pts</span>
                  </div>
                ))}
              </div>

              <div className="final-actions">
                {isHost && (
                  <button 
                    onClick={handleNewGame}
                    className="action-button primary"
                  >
                    🔄 Nova Partida
                  </button>
                )}
                
                <button 
                  onClick={handleLeaveRoom}
                  className="action-button secondary"
                >
                  🏠 Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="error-view">
            <h2>Erro desconhecido</h2>
            <button onClick={handleLeaveRoom}>Voltar ao início</button>
          </div>
        )
    }
  }

  return (
    <div className="game-room">
      <div className="game-room-header">
        <div className="room-info">
          <h2>Sala: {roomId}</h2>
          <span className="player-info">
            <span className="player-avatar-header">{avatar || '👤'}</span>
            {playerName} {isHost && '(Host)'}
          </span>
        </div>
        
        <div className="room-status">
          {gameEnded ? (
            <span className="status finished">🏆 Finalizado</span>
          ) : gameStarted ? (
            <span className="status playing">🎮 Jogando</span>
          ) : (
            <span className="status waiting">⏳ Aguardando</span>
          )}
          
          <span className="players-count">{players.length} jogadores</span>
        </div>
      </div>

      <div className="game-room-content">
        {renderCurrentView()}
      </div>

      {showScoreboard && (
        <Scoreboard
          scoreboard={scoreboard}
          onClose={() => setShowScoreboard(false)}
        />
      )}
    </div>
  )
}

export default GameRoom