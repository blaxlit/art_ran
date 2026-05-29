import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('pink'); // Toggles custom themes
  const [pool, setPool] = useState(null);
  const [rolledCharacter, setRolledCharacter] = useState(null);
  const [rolledModifier, setRolledModifier] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    // Replace this URL with your actual Raw Gist URL
    const gistUrl = 'https://gist.githubusercontent.com/blaxlit/0fedb2c923ff3e418763872a3f56b4fc/raw/84a77a25b27e4064ad9e5ff5c3585a159ffc04a0/pool.json';
    
    fetch(gistUrl)
      .then(response => response.json())
      .then(data => setPool(data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const handleRoll = () => {
    if (!pool || pool.characters.length === 0) return;

    setIsRolling(true);
    
    // Quick gacha-like cycle animation effect before showing the result
    let cycles = 0;
    const interval = setInterval(() => {
      const tempChar = pool.characters[Math.floor(Math.random() * pool.characters.length)];
      setRolledCharacter(tempChar);
      
      const modTypes = Object.keys(pool.modifiers);
      const randomType = modTypes[Math.floor(Math.random() * modTypes.length)];
      const modArray = pool.modifiers[randomType];
      const tempMod = modArray[Math.floor(Math.random() * modArray.length)];
      
      setRolledModifier({
        type: randomType === 'poses' ? 'Pose Reference' : 'Outfit / Theme',
        text: tempMod
      });

      cycles++;
      if (cycles > 8) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'pink' ? 'blue' : 'pink'));
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      {/* Invisible drag region allows moving the borderless app widget freely around the desktop */}
      <div className="window-header drag-region">
        <span className="app-title">art randomizer</span>
        
        <div className="header-controls no-drag">
          <button className="icon-btn btn-settings" onClick={toggleTheme} title="Change Theme" />
          <button className="icon-btn btn-minimize" onClick={() => window.cupid?.minimize()} />
          <button className="icon-btn btn-exit" onClick={() => window.cupid?.close()} />
        </div>
      </div>

      <div className="app-content">
        <div className="display-card">
          {rolledCharacter ? (
            <div className={`result-layout ${isRolling ? 'rolling' : ''}`}>
              <div className="char-info">
                <h2 className="character-name">{rolledCharacter.name}</h2>
                <span className="game-tag">{rolledCharacter.game}</span>
              </div>

              {rolledModifier && (
                <div className="modifier-box">
                  <div className="modifier-label">{rolledModifier.type}</div>
                  <p className="modifier-text">"{rolledModifier.text}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-prompt">
              <p>Ready to sketch?</p>
              <span>Hit roll to find an idea!</span>
            </div>
          )}
        </div>

        <div className="action-footer">
          <button 
            className={`roll-button ${isRolling ? 'disabled' : ''}`}
            onClick={handleRoll}
            disabled={isRolling}
          >
            {isRolling ? 'ROLLING...' : 'PULL CHARACTER'}
          </button>
        </div>
      </div>
    </div>
  );
}