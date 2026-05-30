import { useState, useEffect, useRef } from 'react';
import './App.css';
import { YoutubeAPI } from './youtube/index';
import useAudioPlayer from './useAudioPlayer';
import useSpotifyPlayer from './useSpotifyPlayer';

function App() {
  // Theme state
  const [theme, setTheme] = useState('blue'); // 'blue' or 'pink'
  
  // Data state
  const [playlist, setPlaylist] = useState([]);
  const [students, setStudents] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Player state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // APIs
  const youtubeAPI = useRef(null);
  
  // Custom hooks for players
  const {
    initAudio,
    playAudio,
    pauseAudio,
    setAudioVolume,
    seekAudio,
    cleanupAudio
  } = useAudioPlayer();

  const {
    initSpotify,
    playSpotify,
    pauseSpotify,
    setSpotifyVolume,
    seekSpotify,
    cleanupSpotify
  } = useSpotifyPlayer();

  // Load Data Automatically from SchaleDB
  useEffect(() => {
    async function fetchSchaleData() {
      try {
        setDataLoading(true);
        // Fetch students data from the live mirror
        const response = await fetch('https://schaledb.com/data/en/students.min.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load database: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform data if needed for your app structure
        // Assuming your app expects an object mapping IDs or names to student data
        const studentMap = {};
        if (Array.isArray(data)) {
          data.forEach(student => {
            studentMap[student.Id] = student;
          });
        }
        
        setStudents(studentMap);
        
        // --- FETCH PLAYLIST DATA (Modify if your playlist comes from SchaleDB too) ---
        // If your playlist is still local or from another source, load it here.
        // For this example, I'm fetching a local playlist.json. Change if needed!
        try {
            const playlistResponse = await fetch('/audio/playlist.json');
            if (playlistResponse.ok) {
                const playlistData = await playlistResponse.json();
                setPlaylist(playlistData.tracks || playlistData);
            } else {
                 console.warn("Could not load local playlist.json");
                 // fallback empty playlist
                 setPlaylist([]);
            }
        } catch (e) {
             console.warn("Failed to fetch local playlist", e);
             setPlaylist([]);
        }


        setDataLoading(false);
      } catch (err) {
        console.error("Error loading application data:", err);
        setDataError(err.message);
        setDataLoading(false);
      }
    }

    fetchSchaleData();

    // Initialize YouTube API
    youtubeAPI.current = new YoutubeAPI();
    youtubeAPI.current.init();

    return () => {
      // Cleanup
      cleanupAudio();
      cleanupSpotify();
    };
  }, []);

  // Handle Play/Pause
  const togglePlay = () => {
    if (playlist.length === 0) return;
    
    const track = playlist[currentTrackIndex];
    if (!track) return;

    if (isPlaying) {
      if (track.source === 'local') pauseAudio();
      else if (track.source === 'spotify') pauseSpotify();
      setIsPlaying(false);
    } else {
      if (track.source === 'local') {
          playAudio(track.url).then(() => setIsPlaying(true));
      }
      else if (track.source === 'spotify') {
          playSpotify(track.id).then(() => setIsPlaying(true));
      }
    }
  };

  // Handle Next Track
  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    // You'd want to auto-play the next track here depending on your logic
    setIsPlaying(false); // Reset state temporarily
  };

  // Handle Previous Track
  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
     // You'd want to auto-play the prev track here depending on your logic
    setIsPlaying(false);
  };

  // Volume Control
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setAudioVolume(newVol);
    setSpotifyVolume(newVol);
    if (newVol > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setAudioVolume(volume);
      setSpotifyVolume(volume);
    } else {
      setIsMuted(true);
      setAudioVolume(0);
      setSpotifyVolume(0);
    }
  };

  // Render UI
  if (dataLoading) {
    return <div className="loading-screen">Loading SchaleDB Assets...</div>;
  }

  if (dataError) {
    return <div className="error-screen">Error: {dataError}</div>;
  }

  const currentTrack = playlist[currentTrackIndex] || { title: "No Track Selected", artist: "" };

  return (
    <div className={`app-container theme-${theme}`}>
      <div className="player-card">
        
        {/* Header / Theme Toggle */}
        <div className="header">
          <button 
            className="theme-toggle"
            onClick={() => setTheme(theme === 'blue' ? 'pink' : 'blue')}
          >
            Toggle Theme
          </button>
        </div>

        {/* Album Art Area */}
        <div className="album-art-container">
           {/* Replace with actual album art logic based on track or student */}
          <div className="placeholder-art">
             {Object.keys(students).length > 0 ? "Students Loaded!" : "No Art"}
          </div>
        </div>

        {/* Track Info */}
        <div className="track-info">
          <h2>{currentTrack.title}</h2>
          <p>{currentTrack.artist}</p>
        </div>

        {/* Progress Bar (Placeholder) */}
        <div className="progress-container">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress} 
              onChange={() => {}} 
              className="progress-bar"
            />
        </div>

        {/* Controls */}
        <div className="controls">
          <button className="control-btn" onClick={prevTrack}>Prev</button>
          <button className="control-btn play-btn" onClick={togglePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button className="control-btn" onClick={nextTrack}>Next</button>
        </div>

        {/* Volume */}
        <div className="volume-control">
          <button onClick={toggleMute}>{isMuted ? 'Muted' : 'Vol'}</button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume} 
            onChange={handleVolumeChange} 
          />
        </div>

      </div>
    </div>
  );
}

export default App;