import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="welcome-section">
          <h2 className="welcome-title">Bem-vindo ao Party Challenges!</h2>
          <p className="welcome-description">
            Um jogo divertido (nem tanto) de quiz e desafios para jogar com seus amigos em tempo real.
            Crie uma sala ou entre em uma existente para começar!
          </p>
        </div>

        <div className="actions-section">
          <div className="action-card">
            <div className="action-icon">🎯</div>
            <h3>Criar Sala</h3>
            <p>Seja o host e crie uma nova sala para seus amigos</p>
            <Link to="/create" className="action-button primary">
              Criar Nova Sala
            </Link>
          </div>

          <div className="action-card">
            <div className="action-icon">🚪</div>
            <h3>Entrar em Sala</h3>
            <p>Participe de um jogo já criado usando o código da sala</p>
            <Link to="/join" className="action-button secondary">
              Entrar em Sala
            </Link>
          </div>
        </div>

        <div className="features-section">
          <h3>Como funciona:</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-number">1</span>
              <div className="feature-content">
                <h4>Crie ou Entre</h4>
                <p>Crie uma sala nova ou entre em uma existente com o código</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-number">2</span>
              <div className="feature-content">
                <h4>Aguarde Amigos</h4>
                <p>Compartilhe o código da sala e aguarde todos se conectarem</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-number">3</span>
              <div className="feature-content">
                <h4>Jogue e Divirta-se</h4>
                <p>Responda perguntas e complete desafios para ganhar pontos</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-number">4</span>
              <div className="feature-content">
                <h4>Sem Amigos ?</h4>
                <p>Quita dessa merda :D</p>
              </div>
            </div>

          </div>
        </div>

        <div className="game-types">
          <h3>Tipos de Desafios:</h3>
          <div className="types-container">
            <div className="type-badge quiz">
              <span className="type-icon">❓</span>
              Quiz
            </div>
            <div className="type-badge action">
              <span className="type-icon">🎭</span>
              Ações
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home