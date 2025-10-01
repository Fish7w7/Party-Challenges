// CreateRoom.jsx - Atualizado com seletor de avatar
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createRoom, validatePlayerName } from '../services/api'
import AvatarPicker from '../components/AvatarPicker'

const CreateRoom = ({ onRoomCreated }) => {
  const [playerName, setPlayerName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('😀')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar nome
    const nameValidation = validatePlayerName(playerName)
    if (!nameValidation.valid) {
      setError(nameValidation.message)
      return
    }

    setLoading(true)

    try {
      const response = await createRoom(nameValidation.name, selectedAvatar)
      
      if (response.success) {
        onRoomCreated(response.room_id, response.player_name, true, selectedAvatar) // Passa avatar
        navigate(`/room/${response.room_id}`)
      } else {
        setError('Erro ao criar sala')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-room-container">
      <div className="create-room-content">
        <div className="page-header">
          <Link to="/" className="back-button">
            ← Voltar
          </Link>
          <h2>Criar Nova Sala</h2>
          <p>Você será o host da sala e poderá iniciar o jogo quando todos estiverem prontos</p>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form">
          <div className="form-group">
            <label htmlFor="avatar">Escolha seu Avatar</label>
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onAvatarSelect={setSelectedAvatar}
              disabled={loading}
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
              disabled={loading}
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
            className="submit-button primary"
            disabled={loading || !playerName.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Criando...
              </>
            ) : (
              <>
                🎯 Criar Sala
              </>
            )}
          </button>
        </form>

        <div className="info-section">
          <h3>Como Host você pode:</h3>
          <ul className="host-benefits">
            <li>✨ Iniciar o jogo quando todos estiverem prontos</li>
            <li>🎮 Controlar o ritmo das rodadas</li>
            <li>📊 Ver estatísticas em tempo real</li>
            <li>🏆 Avançar para próximos desafios</li>
          </ul>
        </div>

        <div className="tips-section">
          <h4>💡 Dicas:</h4>
          <div className="tips-grid">
            <div className="tip">
              <span className="tip-icon">👥</span>
              <p>Aguarde pelo menos 2 jogadores para começar</p>
            </div>
            <div className="tip">
              <span className="tip-icon">🔗</span>
              <p>Compartilhe o código da sala com seus amigos</p>
            </div>
            <div className="tip">
              <span className="tip-icon">⏱️</span>
              <p>Cada rodada tem tempo limitado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRoom