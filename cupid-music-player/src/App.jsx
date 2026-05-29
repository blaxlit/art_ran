import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('pink');
  const [pool, setPool] = useState(null);
  const [rolledCharacter, setRolledCharacter] = useState(null);
  const [rolledModifier, setRolledModifier] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  // CLOUD FETCHING + SMART CACHING
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch your custom poses/themes from your GitHub Gist
        // ⚠️ REPLACE THIS LINK WITH YOUR RAW GIST URL ⚠️
        const GIST_URL = 'PASTE_YOUR_RAW_GIST_URL_HERE';
        
        let onlineModifiers = {};
        if (GIST_URL !== 'PASTE_YOUR_RAW_GIST_URL_HERE') {
          const gistResponse = await fetch(GIST_URL);
          const gistData = await gistResponse.json();
          // We only want the modifiers object from your Gist
          onlineModifiers = gistData.modifiers || {}; 
        }

        // 2. Load Blue Archive Characters (with Caching for speed!)
        const cachedSchale = localStorage.getItem('schale_characters');
        let characters = [];

        if (cachedSchale) {
          // If we already downloaded them before, load instantly from memory!
          characters = JSON.parse(cachedSchale);
        } else {
          // If it's the first time, fetch the massive file from SchaleDB
          const schaleResponse = await fetch('https://schale.gg/data/en/students.json');
          const schaleData = await schaleResponse.json();
          
          characters = schaleData.map(student => ({
            name: student.Name,
            game: "Blue Archive",
            imageUrl: `https://schale.gg/images/student/collection/${student.Id}.webp`
          }));
          
          // Save the trimmed-down list to the app's local storage so it's instant next time
          localStorage.setItem('schale_characters', JSON.stringify(characters));
        }

        // 3. Combine both data sources and start the app
        setPool({ characters, modifiers: onlineModifiers });

      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    loadData();
  }, []);

  const handleRoll = () => {
    if (!pool || pool.characters.length === 0) return;
    setIsRolling(true);
    
    let cycles = 0;
    const interval = setInterval(() => {
      // Pick random character
      const tempChar = pool.characters[Math.floor(Math.random() * pool.characters.length)];
      setRolledCharacter(tempChar);
      
      // Pick random modifier
      if (pool.modifiers && Object.keys(pool.modifiers).length > 0) {
        const modTypes = Object.keys(pool.modifiers);
        const randomType = modTypes[Math.floor(Math.random() * modTypes.length)];
        const modArray = pool.modifiers[randomType];
        
        if (modArray && modArray.length > 0) {
          const tempMod = modArray[Math.floor(Math.random() * modArray.length)];
          setRolledModifier({
            type: randomType,
            text: tempMod
          });
        }
      }

      cycles++;
      if (cycles > 8) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'pink' ? 'blue' : 'pink'));

  return (
    <div className={`app-container ${theme}-theme`}>
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
                {rolledCharacter.imageUrl && (
                  <img 
                    src={rolledCharacter.imageUrl} 
                    alt={rolledCharacter.name} 
                    style={{ 
                      width: '140px', height: '140px', objectFit: 'contain', 
                      marginBottom: '15px', borderRadius: '12px',
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }} 
                  />
                )}
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
              <span>Hit roll to pull a student!</span>
            </div>
          )}
        </div>

        <div className="action-footer">
          <button 
            className={`roll-button ${isRolling || !pool ? 'disabled' : ''}`}
            onClick={handleRoll}
            disabled={isRolling || !pool}
          >
            {!pool ? 'CONNECTING TO SCHALE...' : isRolling ? 'ROLLING...' : 'PULL CHARACTER'}
          </button>
        </div>
      </div>
    </div>
  );
}