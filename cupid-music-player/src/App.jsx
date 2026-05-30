import React, { useState, useEffect } from 'react';
import './App.css';

// You can now edit your drawing prompts directly here, no Gists needed!
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
  const [fetchError, setFetchError] = useState(false); // NEW: Tracks if the connection fails

  // CLOUD FETCHING + SMART CACHING
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Load the built-in modifiers
        const onlineModifiers = defaultModifiers; 

        // 2. Load Blue Archive Characters from SchaleDB
        const cachedSchale = localStorage.getItem('schaledb_characters');
        let characters = [];

        if (cachedSchale) {
          // Load instantly from memory
          characters = JSON.parse(cachedSchale);
        } else {
          // FIXED: Fetch the minified file from the raw GitHub endpoint
          const schaleResponse = await fetch('https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/en/students.min.json');
          
          if (!schaleResponse.ok) {
            throw new Error("Network response was not ok");
          }
          
          const schaleData = await schaleResponse.json();
          
          // FIXED: SchaleDB data is usually an object. We need to convert it to an array safely.
          const studentArray = Array.isArray(schaleData) ? schaleData : Object.values(schaleData);
          
          characters = studentArray.map(student => ({
            name: student.Name,
            game: "Blue Archive",
            // FIXED: Fetch images directly from the actual schale.gg site, not schaledb.com
            imageUrl: `https://schale.gg/images/student/collection/${student.Id}.webp`
          }));
          
          // Save the fixed list to local storage
          localStorage.setItem('schaledb_characters', JSON.stringify(characters));
        }

        // 3. Combine both data sources and start the app
        setPool({ characters, modifiers: onlineModifiers });

      } catch (error) {
        console.error("Error loading data:", error);
        setFetchError(true); // Tell the UI that it failed so it doesn't spin forever
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
                    // FIXED: If an image fails to load, hide it instead of showing a broken link icon
                    onError={(e) => { e.target.style.display = 'none'; }}
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
            className={`roll-button ${isRolling || !pool || fetchError ? 'disabled' : ''}`}
            onClick={handleRoll}
            disabled={isRolling || !pool || fetchError}
          >
            {/* Dynamic button text so you actually know what's happening */}
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