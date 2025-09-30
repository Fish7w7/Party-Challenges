import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getRoomInfo, validatePlayerName, validateRoomId } from '../services/api'
import AvatarPicker from '../components/AvatarPicker'

const JoinRoom = ({ onRoomJoined }) => {
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('😎')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomInfo, setRoomInfo] = useState(null)
  const navigate = useNavigate()

  const handleRoomIdChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 8) {
      setRoomId(value)
      setError('')
      setRoomInfo(null)
    }
  }

  const checkRoom = async () => {
    if (roomId.length !== 8) return

    const roomValidation = validateRoomId(roomId)
    if (!roomValidation.valid) {
      setError(roomValidation.message)
      return
    }

    setLoading(true)
    try {
      const info = await getRoomInfo(roomValidation.roomId)
      setRoomInfo(info)
      setError('')
    } catch (err) {
      setError(err.message)
      setRoomInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar dados
    const roomValidation = validateRoomId(roomId)
    if (!roomValidation.valid) {
      setError(roomValidation.message)
      return
    }

    const nameValidation = validatePlayerName(playerName)
    if (!nameValidation.valid) {
      setError(nameValidation.message)
      return
    }

    if (!roomInfo) {
      setError('Verifique se a sala existe primeiro')
      return
    }

    if (roomInfo.game_started) {
      setError('Esta sala já iniciou o jogo')
      return
    }

    // Verificar se sala não está cheia
    if (roomInfo.player_count >= 10) {
      setError('Esta sala está cheia (máximo 10 jogadores)')
      return
    }

    onRoomJoined(roomValidation.roomId, nameValidation.name, false, selectedAvatar) // Passa avatar
    navigate(`/room/${roomValidation.roomId}`)
  }

  React.useEffect(() => {
    if (roomId.length === 8) {
      checkRoom()
    }
  }, [roomId])

  return (
    <div className="join-room-container">
      <div className="join-room-content">
        <div className="page-header">
          <Link to="/" className="back-button">
            ← Voltar
          </Link>
          <h2>Entrar em Sala</h2>
          <p>Digite o código da sala fornecido pelo host para participar</p>
        </div>

        <form onSubmit={handleSubmit} className="join-room-form">
          <div className="form-group">
            <label htmlFor="roomId">Código da Sala</label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={handleRoomIdChange}
              placeholder="XXXXXXXX"
              maxLength={8}
              required
              disabled={loading}
              className={`room-id-input ${error ? 'error' : ''} ${roomInfo ? 'success' : ''}`}
            />
            <div className="form-help">
              Código de 8 caracteres (letras e números)
            </div>
          </div>

          {roomInfo && (
            <div className="room-info">
              <h3>✅ Sala Encontrada!</h3>
              <div className="room-details">
                <div className="room-stat">
                  <span className="stat-label">Jogadores:</span>
                  <span className="stat-value">{roomInfo.player_count}/10</span>
                </div>
                <div className="room-stat">
                  <span className="stat-label">Status:</span>
                  <span className={`stat-value ${roomInfo.game_started ? 'game-started' : 'waiting'}`}>
                    {roomInfo.game_started ? '🎮 Jogo Iniciado' : '⏳ Aguardando'}
                  </span>
                </div>
              </div>
              
              {roomInfo.players && roomInfo.players.length > 0 && (
                <div className="players-preview">
                  <h4>Jogadores na sala:</h4>
                  <div className="players-list">
                    {roomInfo.players.slice(0, 5).map((player, index) => (
                      <span key={player.id} className="player-tag">
                        {player.avatar || '👤'} {player.name} {index === 0 && '👑'}
                      </span>
                    ))}
                    {roomInfo.players.length > 5 && (
                      <span className="player-tag more">
                        +{roomInfo.players.length - 5} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="avatar">Escolha seu Avatar</label>
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onAvatarSelect={setSelectedAvatar}
              disabled={loading || !roomInfo}
            />
          </div>

          <div className="form-group">
            <label htmlFor="playerName">Seu Nome</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome..."
              maxLength={20}
              required
              disabled={loading || !roomInfo}
              className={error ? 'error' : ''}
            />
            <div className="form-help">
              Entre 2 e 20 caracteres (letras, números, espaços e - _ .)
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button secondary"
            disabled={loading || !roomInfo || !playerName.trim() || roomInfo?.game_started}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                🚪 Entrar na Sala
              </>
            )}
          </button>
        </form>

        <div className="help-section">
          <h3>Não tem o código?</h3>
          <p>
            Peça para o host da sala compartilhar o código de 8 caracteres com você.
            O código aparece na tela do host após criar a sala.
          </p>
          
          <div className="alternative-action">
            <p>Ou que tal criar sua própria sala?</p>
            <Link to="/create" className="alt-button">
              Criar Nova Sala
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinRoom