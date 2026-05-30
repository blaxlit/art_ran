import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const defaultModifiers = {
  "Anatomy Focus": [
    "Practicing hand anatomy (relaxed)",
    "Practicing hand anatomy (gripping objects)",
    "Practicing hand anatomy (interlocking fingers)",
    "Practicing hand anatomy (pressing against flat glass)",
    "Focusing on dynamic hair flow (windy conditions)",
    "Focusing on dynamic hair flow (underwater)",
    "Focusing on dynamic hair flow (complex braids or twin-tails)",
    "Focusing on dynamic hair flow (wet hair clinging to skin)",
    "Full body proportions (standard 8-head hero)",
    "Full body proportions (stylized/chibi)",
    "Full body proportions (heavy-set/muscular build)",
    "Full body proportions (tall and lanky)",
    "Facial expressions (smug and confident)",
    "Facial expressions (intense crying or anguish)",
    "Facial expressions (subtle micro-expressions/disgust)",
    "Facial expressions (manic laughter)",
    "Foreshortening (arm reaching out towards the viewer)",
    "Foreshortening (dynamic kicking angle directly at camera)",
    "Foreshortening (looking down from a bird's-eye view)",
    "Foreshortening (looking up from a worm's-eye view)",
    "Torso twists and contrapposto (weight heavily on one leg)",
    "Torso twists (looking completely behind them)",
    "Foot anatomy and diverse footwear (sneakers)",
    "Foot anatomy (bare feet on tiptoes)",
    "Foot anatomy (high heels altering leg muscles)",
    "Collarbones, shoulders, and neck muscles (looking up)",
    "Back anatomy (shoulder blades and spine definition)",
    "Eye shapes, pupil detailing, and gaze direction",
    "Mouth interiors (teeth, tongue, shouting)",
    "Fabric tension (tight clothing pulling across chest/shoulders)",
    "Drapery over body forms (loose flowing robes)",
    "Complex lighting (under-lighting/spooky lighting)",
    "Complex lighting (harsh rim light from behind)",
    "Complex lighting (dappled light through tree leaves)",
    "Line of action (exaggerated C or S curve of the spine)",
    "Pushing the silhouette (ensuring pose reads perfectly as a solid black shape)"
  ],
  "Pose": [
    "Standing confidently with hands on hips",
    "Sitting cross-legged on the floor",
    "Sitting with legs dangling off a high ledge",
    "Sitting backward on a chair with arms resting on the back",
    "Action pose: Mid-air dodge or backflip",
    "Action pose: Heavy weapon wind-up",
    "Action pose: Sliding on the ground while firing/attacking",
    "Action pose: Superhero landing",
    "Action pose: Vaulting over an obstacle",
    "Looking over the shoulder with a slight smirk",
    "Adjusting glasses while looking down",
    "Leaning casually against a brick wall with one foot up",
    "Floating freely in zero gravity",
    "Crouching or kneeling in a tactical stance",
    "Stretching arms overhead lazily after waking up",
    "Curled up pulling knees tightly to the chest",
    "Mid-dance step (idol choreography or hip-hop)",
    "Walking directly towards the camera",
    "Falling backward with limbs outstretched",
    "Drawing a weapon from a holster or scabbard",
    "Looking up at the sky with hands clasped behind the back",
    "Tying shoelaces while balanced on one foot",
    "Pulling a shirt on or off over the head",
    "Fixing a tie or buttoning up a collar",
    "Defensive guard stance (boxing or martial arts)",
    "Casting a spell with dramatic arm sweeps",
    "Pinning someone (or being pinned) against a wall",
    "Carrying someone on their back (piggyback)",
    "Meditating in a lotus position",
    "Sprinting with full exertion",
    "Skidding to a halt, kicking up dust"
  ],
  "Theme": [
    "Cyberpunk (neon lights, mechanical augmentations, wires)",
    "Steampunk (brass gears, leather corsets, aviator goggles)",
    "Solarpunk (futuristic eco-friendly, lots of plants, bright fabrics)",
    "Casual streetwear (oversized hoodies, cargo pants, chunky sneakers)",
    "High fashion/Avant-garde (runway concepts, exaggerated shapes)",
    "School uniform (classic sailor fuku)",
    "School uniform (blazer, tie, and sweater vest)",
    "Fantasy RPG armor (heavy paladin plates)",
    "Fantasy RPG armor (light rogue leather)",
    "Fantasy RPG caster (elaborate mage robes and cloaks)",
    "Summer beachwear (swimsuits, sundresses, sun hats)",
    "Winter cozy clothing (thick scarves, puffy coats, mittens)",
    "Sci-fi space exploration suit (sleek zero-G suits)",
    "Gothic Lolita (intricate lace, parasols, ribbons)",
    "Dark Academia (tweed coats, satchels, vintage styling)",
    "Traditional Japanese (kimono, yukata, or samurai hakama)",
    "Traditional Chinese (hanfu or qipao)",
    "Tactical operator (techwear, tactical vests, holsters)",
    "Idol stage outfit (frills, sequins, energetic colors)",
    "Post-apocalyptic survivor (scavenged gear, gas masks, dirt)",
    "Magical Girl / Magical Boy (transformative sparkly outfits)",
    "Spy / Espionage (sleek suits or tactical stealth gear)",
    "Medical / Hospital (doctor's coat, scrub suit, nurse uniform)",
    "Maid or Butler uniform (classic Victorian style)",
    "Pirate / Swashbuckler (tricorn hats, ruffled shirts, long coats)",
    "Egyptian / Desert fantasy (light airy silks, gold jewelry)",
    "Retro 80s/90s (windbreakers, bright colors, retro sneakers)",
    "Royalty / Nobility (crowns, heavy velvet capes, jewels)",
    "Sports / Athletics (tracksuits, jerseys, spandex)"
  ],
  "Prop": [
    "Holding a melee weapon (katana, greatsword, scythe, dagger)",
    "Holding a ranged weapon (sniper rifle, tactical pistol, bow)",
    "Drinking boba tea or a can of energy drink",
    "Eating a quick snack (pocky, dango, slice of pizza, burger)",
    "Reading a thick grimoire or a dusty old tome",
    "Holding a casual manga volume or magazine",
    "Using a smartphone (texting or taking a selfie)",
    "Interacting with a glowing holographic interface",
    "Wearing oversized gaming headphones",
    "Holding a microphone and singing on stage",
    "Carrying a heavy tactical backpack or messenger bag",
    "Playing a musical instrument (electric guitar, keytar, violin)",
    "Holding a clear vinyl umbrella in the rain",
    "Holding a traditional paper parasol",
    "Interacting with a small floating drone or robot",
    "Holding a pet (cat, small dog, magical familiar)",
    "Tying a ribbon, adjusting a hair tie, or fixing a hairpin",
    "Holding a glowing magical artifact, orb, or crystal",
    "Holding a smoking cigarette or a long pipe",
    "Looking into a hand mirror",
    "Holding a bouquet of intricate flowers",
    "Wearing a dramatic mask (kitsune, masquerade, Oni)",
    "Holding a steaming cup of coffee or tea",
    "Throwing or holding playing cards / tarot cards",
    "Carrying sports equipment (baseball bat, basketball, skateboard)",
    "Holding an old-school film camera up to the eye",
    "Holding a glowing potion flask",
    "Twirling a set of keys on a lanyard"
  ]
};

export default function App() {
  const [theme, setTheme] = useState('pink');
  const [pool, setPool] = useState(null);
  const [rolledCharacter, setRolledCharacter] = useState(null);
  const [rolledModifier, setRolledModifier] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // ---> NEW: The Pity Tracker for Characters <---
  const characterPity = useRef({});

// CLOUD FETCHING + SMART CACHING
  useEffect(() => {
    async function loadData() {
      try {
        const onlineModifiers = defaultModifiers; 

        const cacheKey = 'schaledb_data';
        const cacheTimeKey = 'schaledb_time';
        const now = new Date().getTime();
        
        const cachedSchale = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        
        let characters = [];

        // Check if we have data AND if it's less than 24 hours old (86,400,000 milliseconds)
        if (cachedSchale && cachedTime && (now - parseInt(cachedTime)) < 86400000) {
          characters = JSON.parse(cachedSchale);
        } else {
          // Data is old or missing. Fetch fresh data from GitHub!
          const schaleResponse = await fetch('https://schaledb.com/data/jp/students.min.json');
          if (!schaleResponse.ok) {
            throw new Error("Network response was not ok");
          }
          
          const schaleData = await schaleResponse.json();
          const studentArray = Array.isArray(schaleData) ? schaleData : Object.values(schaleData);
          
          characters = studentArray.map(student => ({
            name: student.Name,
            game: "Blue Archive",
            imageUrl: `https://schaledb.com/images/student/collection/${student.Id}.webp`
          }));
          
          // Save the fresh data AND the exact time we fetched it
          localStorage.setItem(cacheKey, JSON.stringify(characters));
          localStorage.setItem(cacheTimeKey, now.toString());
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
    
    // ---> NEW: PRE-CALCULATE THE WINNER USING PITY BEFORE ANIMATING <---
    pool.characters.forEach(char => {
      if (characterPity.current[char.name] === undefined) {
        characterPity.current[char.name] = 1;
      } else {
        characterPity.current[char.name] += 1;
      }
    });

    let totalWeight = 0;
    pool.characters.forEach(char => {
      totalWeight += characterPity.current[char.name];
    });

    let roll = Math.random() * totalWeight;
    let winningChar = pool.characters[0];

    for (let char of pool.characters) {
      roll -= characterPity.current[char.name];
      if (roll <= 0) {
        winningChar = char;
        break;
      }
    }

    // Reset pity for the winner so they go back to standard odds
    characterPity.current[winningChar.name] = 1;

    // ---> ADD THIS DEBUG BLOCK <---
    const topPity = Object.entries(characterPity.current)
      .sort((a, b) => b[1] - a[1]) // Sort from highest pity to lowest
      .slice(0, 5); // Grab the top 5
    
    console.log(`🎉 Winner: ${winningChar.name}`);
    console.log("📈 Top 5 characters closest to pity:", topPity);
    // --

    // ---> EXISTING ANIMATION LOGIC <---
    let cycles = 0;
    const interval = setInterval(() => {
      cycles++;
      
      if (cycles > 8) {
        // Stop animation and lock in our predetermined winner
        setRolledCharacter(winningChar);
        clearInterval(interval);
        setIsRolling(false);
      } else {
        // While rolling, flash random characters rapidly for the visual effect
        const tempChar = pool.characters[Math.floor(Math.random() * pool.characters.length)];
        setRolledCharacter(tempChar);
      }
      
      // Roll a random modifier every tick (keeping this true random)
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