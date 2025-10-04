import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="welcome-section">
          <h2 className="welcome-title">Bem-vindo ao Party Challenges!</h2>
          <p className="welcome-description">
            Um jogo multiplayer online de quiz e desafios interativos para jogar com seus amigos em tempo real.
            Escolha seu avatar, crie uma sala ou entre em uma existente e mostre suas habilidades!
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
                <h4>Escolha seu Avatar</h4>
                <p>Personalize sua identidade com dezenas de emojis disponíveis</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-number">2</span>
              <div className="feature-content">
                <h4>Crie ou Entre</h4>
                <p>Crie uma sala nova ou entre em uma existente com o código</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-number">3</span>
              <div className="feature-content">
                <h4>Aguarde Jogadores</h4>
                <p>Compartilhe o código da sala e aguarde no mínimo 2 jogadores</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-number">4</span>
              <div className="feature-content">
                <h4>Jogue e Divirta-se</h4>
                <p>Responda perguntas, complete desafios e conquiste a liderança!</p>
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
            <div className="type-badge target">
              <span className="type-icon">🎯</span>
              Reflexo
            </div>
            <div className="type-badge memory">
              <span className="type-icon">🧠</span>
              Memória
            </div>
            <div className="type-badge math">
              <span className="type-icon">🧮</span>
              Matemática
            </div>
          </div>
        </div>

        <div className="game-info-section">
          <h3>📋 Informações do Jogo:</h3>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">👥</span>
              <h4>2-10 Jogadores</h4>
              <p>Mínimo de 2 jogadores para iniciar</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🎮</span>
              <h4>10 Rodadas</h4>
              <p>Diversos tipos de desafios</p>
            </div>
            <div className="info-card">
              <span className="info-icon">⚡</span>
              <h4>Tempo Limitado</h4>
              <p>30-90 segundos por desafio</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🏆</span>
              <h4>Sistema de Pontos</h4>
              <p>Velocidade e precisão contam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home