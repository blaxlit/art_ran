import { useState, useEffect } from 'react';
import './ArtPromptGenerator.css'; // We are adding a real stylesheet!

function ArtPromptGenerator() {
  const [trend, setTrend] = useState("Loading trend...");
  const [isRolling, setIsRolling] = useState(false);

  const fetchLiveTrend = async () => {
    // Show the user that we are fetching
    setIsRolling(true);
    setTrend("... scrounging the internet ...");
    
    try {
      // The `?limit=50&t=${Date.now()}` trick forces the browser to bypass the cache
      const response = await fetch(`https://www.reddit.com/r/characterdrawing/new.json?limit=50&t=${Date.now()}`);
      const data = await response.json();
      
      const titles = data.data.children.map(post => post.data.title);
      
      const cleanIdeas = titles
        .filter(t => t.includes('[LFA]'))
        .map(t => t.replace('[LFA]', '').trim());

      if (cleanIdeas.length > 0) {
        const randomIdea = cleanIdeas[Math.floor(Math.random() * cleanIdeas.length)];
        setTrend(randomIdea);
      } else {
        setTrend("Modern tactical streetwear (Fallback)");
      }
    } catch (error) {
      console.error("Failed to fetch live trends:", error);
      setTrend("Cyberpunk casual (Fallback)");
    } finally {
      setIsRolling(false);
    }
  };

  useEffect(() => {
    fetchLiveTrend();
  }, []);

  return (
    <div className="prompt-card">
      <h3 className="prompt-title">Current Trend</h3>
      <div className="prompt-content">
        <p>{trend}</p>
      </div>
      <button 
        className="prompt-button" 
        onClick={fetchLiveTrend}
        disabled={isRolling}
      >
        {isRolling ? "Rolling..." : "Reroll Trend"}
      </button>
    </div>
  );
}

export default ArtPromptGenerator;