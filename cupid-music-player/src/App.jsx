import React, { useState, useEffect } from 'react';
import './App.css';

const defaultModifiers = {
  "Anatomy Focus": ["Practicing hand anatomy", "Focusing on dynamic hair flow", "Full body proportions", "Facial expressions"],
  "Pose": ["Standing confidently", "Sitting", "Action pose / Jumping", "Looking over shoulder", "Adjusting glasses"],
  "Theme": ["Cyberpunk", "Casual streetwear", "School uniform", "Fantasy RPG armor", "Summer beachwear"],
  "Prop": ["Holding a weapon", "Drinking boba", "Reading a book", "Using a smartphone"]
};

export default function App() {
  const [theme, setTheme] = useState('pink');
  const [pool, setPool] = useState(null);
  const [rolledCharacter, setRolledCharacter] = useState(null);
  const [rolledModifier, setRolledModifier] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const onlineModifiers = defaultModifiers; 

        // FIX 1: Bumped the cache key to '_v2'. This forces the app to ignore 
        // the broken URLs you currently have saved in memory and fetch fresh data.
        const cachedSchale = localStorage.getItem('schaledb_characters_v2');
        let characters = [];

        if (cachedSchale) {
          characters = JSON.parse(cachedSchale);
        } else {
          const schaleResponse = await fetch('https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/students.min.json');
          
          if (!schaleResponse.ok) {
            throw new Error("Network response was not ok");
          }
          
          const schaleData = await schaleResponse.json();
          const studentArray = Array.isArray(schaleData) ? schaleData : Object.values(schaleData);
          
          characters = studentArray.map(student => ({
            name: student.Name,
            game: "Blue Archive",
            // FIX 2: Switched to GitHub's raw CDN for the images. 
            imageUrl: `https://raw.githubusercontent.com/lonqie/SchaleDB/main/images/student/collection/${student.Id}.webp`
          }));
          
          localStorage.setItem('schaledb_characters_v2', JSON.stringify(characters));
        }

        setPool({ characters, modifiers: onlineModifiers });

      } catch (error) {
        console.error("Error loading data:", error);
        setFetchError(true);
      }
    }

    loadData();
  }, []);

  const handleRoll = () => {
    if (!pool || pool.characters.length === 0) return;
    setIsRolling(true);
    
    let cycles = 0;
    const interval = setInterval(() => {
      const tempChar = pool.characters[Math.floor(Math.random() * pool.characters.length)];
      setRolledCharacter(tempChar);
      
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
                
                {/* FIX 3: Added a wrapper with a fixed height so the layout doesn't collapse while rolling */}
                <div style={{ minHeight: '155px', display: 'flex', justifyContent: 'center' }}>
                  
                  {/* FIX 4: `!isRolling` prevents network spam. `key` forces React to reset the display state. */}
                  {!isRolling && rolledCharacter.imageUrl && (
                    <img 
                      key={rolledCharacter.name}
                      src={rolledCharacter.imageUrl} 
                      alt={rolledCharacter.name} 
                      style={{ 
                        width: '140px', height: '140px', objectFit: 'contain', 
                        marginBottom: '15px', borderRadius: '12px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        display: 'block'
                      }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>

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
            className={`roll-button ${isRolling || !pool || fetchError ? 'disabled' : ''}`}
            onClick={handleRoll}
            disabled={isRolling || !pool || fetchError}
          >
            {fetchError ? 'CONNECTION FAILED' : 
             !pool ? 'CONNECTING TO SCHALEDB...' : 
             isRolling ? 'ROLLING...' : 
             'PULL CHARACTER'}
          </button>
        </div>
      </div>
    </div>
  );
}