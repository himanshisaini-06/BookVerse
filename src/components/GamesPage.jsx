import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Using react-router-dom for navigation
import { auth, db } from '../firebase'; // Assuming firebase.js is in ../firebase
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

import './GamesPage.css'; // Import the CSS

// --- Constants for Game Data ---
const scenarios = [
    { quote: "He’s not my boyfriend. He’s my watcher.", character: "Edward Cullen", book: "Twilight", type: "red", explanation: "Stalking is presented as romantic. That's a classic red flag." },
    { quote: "I would have come for you. And if I couldn't walk, I'd crawl to you.", character: "Kaz Brekker", book: "Six of Crows", type: "green", explanation: "Shows immense loyalty and devotion, a definite green light for a fantasy hero." },
    { quote: "Whatever our souls are made of, his and mine are the same.", character: "Catherine Earnshaw", book: "Wuthering Heights", type: "red", explanation: "While iconic, this reflects a deeply obsessive and destructive relationship. It's a major red flag." },
    { quote: "To be loved by you is to be truly seen.", character: "Simon Spier", book: "Simon vs. the Homo Sapiens Agenda", type: "green", explanation: "This highlights acceptance and understanding, the cornerstones of a healthy relationship. Green light!" }
];

const emojiPuzzles = [
    { emojis: "🧙‍♂️⚡🏰", answer: "Harry Potter", options: ["The Hobbit", "Harry Potter", "Lord of the Rings", "Eragon"] },
    { emojis: "🦁🧙‍♀️🚪", answer: "The Lion, the Witch and the Wardrobe", options: ["The Golden Compass", "Alice in Wonderland", "The Lion, the Witch and the Wardrobe", "Narnia"] },
    { emojis: "🏹👩‍🍳🔥", answer: "The Hunger Games", options: ["Divergent", "The Maze Runner", "The 5th Wave", "The Hunger Games"] },
    { emojis: "🧛‍♂️❤️👩", answer: "Twilight", options: ["Vampire Academy", "Twilight", "Interview with the Vampire", "Dracula"] }
];

const readingPassages = [
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
    "The story so far: in the beginning, the universe was created. This has made a lot of people very angry and been widely regarded as a bad move. Many races believe that it was created by some sort of god, though the Jatravartid people of Viltvodle VI believe that the entire universe was in fact sneezed out of the nose of a being called the Great Green Arkleseizure.",
    "There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further out-door exercise was now out of the question. I was glad of it: I never liked long walks, especially on chilly afternoons."
];


const GamesPage = () => {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [currentUser, setCurrentUser] = useState(null);
    const [myBooks, setMyBooks] = useState([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMyBooksPopupOpen, setMyBooksPopupOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [activeGame, setActiveGame] = useState('menu'); // 'menu', 'flag-game', 'emoji-game', 'speed-game'

    // --- Game States ---
    // Flag Game
    const [currentScenario, setCurrentScenario] = useState({});
    const [flagFeedback, setFlagFeedback] = useState({ show: false, text: '', correct: false });
    const [flagButtonsDisabled, setFlagButtonsDisabled] = useState(false);

    // Emoji Game
    const [currentEmojiPuzzle, setCurrentEmojiPuzzle] = useState({});
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [selectedEmojiAnswer, setSelectedEmojiAnswer] = useState(null);

    // Speed Reading Game
    const [speedGameState, setSpeedGameState] = useState('setup'); // 'setup', 'active', 'finished'
    const [passage, setPassage] = useState({ text: '', wordCount: 0 });
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [wpm, setWpm] = useState({ value: 0, badge: '', color: '' });
    const timerRef = useRef(null);

    // --- Toast Notification Logic ---
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type });
        }, 3000);
    };

    // --- Authentication & Data Fetching ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setCurrentUser(user);
            } else {
                navigate('/login'); // Redirect to login if not authenticated
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchMyBooks = useCallback(async () => {
        if (!currentUser) return;
        try {
            // NOTE: The original HTML had a complex Firestore path. A simpler, more common path is used here.
            // Original: collection(db, 'artifacts', firebaseConfig.appId, 'users', currentUser.uid, 'books')
            // Simplified:
            const booksRef = collection(db, 'users', currentUser.uid, 'books');
            const querySnapshot = await getDocs(booksRef);
            const books = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMyBooks(books.sort((a, b) => a.title.localeCompare(b.title)));
        } catch (error) {
            console.error("Error fetching books:", error);
            showToast("Error loading your books.", "error");
        }
    }, [currentUser]);
    
    useEffect(() => {
        fetchMyBooks();
    }, [currentUser, fetchMyBooks]);

    // --- UI Interaction Handlers ---
    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    };

    const closePopups = () => {
        setSidebarOpen(false);
        setMyBooksPopupOpen(false);
    };

    const handleMyBooksClick = (e) => {
        e.preventDefault();
        fetchMyBooks(); // Refresh book list on open
        setMyBooksPopupOpen(true);
    };

    const removeBookFromShelf = async (bookId) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'books', bookId));
            setMyBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
            showToast("Book removed.", "success");
        } catch(error) {
            console.error("Error removing book:", error);
            showToast("Could not remove book.", "error");
        }
    };
    
    // --- Game Logic ---

    // General
    const showGame = (gameId) => {
        setActiveGame(gameId);
        // Initialize the selected game
        if (gameId === 'flag-game') loadFlagScenario();
        if (gameId === 'emoji-game') loadEmojiPuzzle();
        if (gameId === 'speed-game') setSpeedGameState('setup');
    };

    const showMenu = () => {
        setActiveGame('menu');
    };
    
    // --- Flag Game Logic ---
    const loadFlagScenario = useCallback(() => {
        setCurrentScenario(scenarios[Math.floor(Math.random() * scenarios.length)]);
        setFlagFeedback({ show: false, text: '', correct: false });
        setFlagButtonsDisabled(false);
    }, []);

    const checkFlag = (choice) => {
        const isCorrect = choice === currentScenario.type;
        setFlagFeedback({ show: true, text: currentScenario.explanation, correct: isCorrect });
        setFlagButtonsDisabled(true);
    };

    // --- Emoji Game Logic ---
    const loadEmojiPuzzle = useCallback(() => {
        const puzzle = emojiPuzzles[Math.floor(Math.random() * emojiPuzzles.length)];
        setCurrentEmojiPuzzle(puzzle);
        setShuffledOptions([...puzzle.options].sort(() => Math.random() - 0.5));
        setSelectedEmojiAnswer(null);
    }, []);
    
    const checkEmojiAnswer = (selected) => {
        setSelectedEmojiAnswer(selected);
    };

    // --- Speed Reading Logic ---
    useEffect(() => {
        return () => clearInterval(timerRef.current); // Cleanup timer on component unmount
    }, []);
    
    const startSpeedChallenge = useCallback(() => {
        setSpeedGameState('active');
        const randomPassage = readingPassages[Math.floor(Math.random() * readingPassages.length)];
        setPassage({
            text: randomPassage,
            wordCount: randomPassage.split(/\s+/).length
        });
        setSecondsElapsed(0);
        
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setSecondsElapsed(prev => prev + 0.1);
        }, 100);
    }, []);

    const finishSpeedChallenge = () => {
        clearInterval(timerRef.current);
        setSpeedGameState('finished');
        
        const calculatedWpm = Math.round((passage.wordCount / secondsElapsed) * 60);
        let badgeText = "Casual Reader", badgeColor = "#3498db";
        if (calculatedWpm > 250) {
            badgeText = "Speed Demon"; badgeColor = "#e74c3c";
        } else if (calculatedWpm > 180) {
            badgeText = "Bookworm"; badgeColor = "#2ecc71";
        }
        setWpm({ value: calculatedWpm, badge: badgeText, color: badgeColor });
    };

    // --- Initial Game Load ---
    useEffect(() => {
        loadFlagScenario();
        loadEmojiPuzzle();
    }, [loadFlagScenario, loadEmojiPuzzle]);

    const displayName = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Reader');

    return (
        <div className="games-body">
            {/* --- Header --- */}
            <header className="games-header">
                <div className="navbar">
                    <div className="logo">
                        <span className="logo-icon">📚</span>
                        <span>BookVerse</span>
                    </div>
                    <nav className="games-nav">
                        <ul>
                            <li><a href="#" onClick={() => navigate('/explore')}>Home</a></li>
                            <li><a href="#" onClick={() => navigate('/explore')}>Explore</a></li>
                            <li><a href="#" onClick={() => navigate('/games')} className="active">Games</a></li>
                            <li><a href="#" onClick={handleMyBooksClick}>My Books</a></li>
                        </ul>
                    </nav>
                    <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                </div>
            </header>

            {/* --- Sidebar --- */}
            <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <h2>👤 Hello, {displayName}!</h2>
                <ul>
                    <li><a href="#" onClick={() => { closePopups(); navigate('/explore'); }}>🏠 Home</a></li>
                    <li><a href="#" onClick={() => { closePopups(); navigate('/explore'); }}>🔍 Explore</a></li>
                    <li><a href="#" onClick={() => { closePopups(); navigate('/games'); }} className="active">🎮 Games</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); closePopups(); handleMyBooksClick(e); }}>📚 My Books</a></li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
            </div>
            
            {/* --- Main Arcade Content --- */}
            <main className="arcade-container">
                <button id="back-to-menu" className={`back-to-menu-btn ${activeGame !== 'menu' ? 'active' : ''}`} onClick={showMenu}>← Back to Games</button>
                
                {activeGame === 'menu' && (
                    <>
                        <h1 className="main-title">BookVerse Arcade</h1>
                        <div id="game-selection-menu">
                            <div className="game-selection-card" onClick={() => showGame('flag-game')}>
                                <div className="game-icon">🚩</div>
                                <h3>Red Flag or Green Light</h3>
                                <p>Judge book characters' relationships. Is it love or is it toxic?</p>
                            </div>
                            <div className="game-selection-card" onClick={() => showGame('emoji-game')}>
                                <div className="game-icon">🧙‍♂️</div>
                                <h3>Guess the Book by Emoji</h3>
                                <p>Can you decipher the story from a few simple emojis?</p>
                            </div>
                            <div className="game-selection-card" onClick={() => showGame('speed-game')}>
                                <div className="game-icon">⏱️</div>
                                <h3>Speed Reading Challenge</h3>
                                <p>Test your reading speed and earn badges for your prowess.</p>
                            </div>
                        </div>
                    </>
                )}

                {/* --- Flag Game View --- */}
                <div id="flag-game" className={`game-view ${activeGame === 'flag-game' ? 'active' : ''}`}>
                    <h2 className="game-title">Red Flag or Green Light</h2>
                    <div id="flag-game-card">
                        <p id="flag-quote">"{currentScenario.quote}"</p>
                        <p id="flag-character-book">- {currentScenario.character}, from {currentScenario.book}</p>
                    </div>
                    <div className="flag-controls">
                        <button className="flag-btn" id="green-light-btn" onClick={() => checkFlag('green')} disabled={flagButtonsDisabled}>💚</button>
                        <button className="flag-btn" id="red-flag-btn" onClick={() => checkFlag('red')} disabled={flagButtonsDisabled}>🚩</button>
                    </div>
                    {flagFeedback.show && (
                        <div id="flag-feedback" className={flagFeedback.correct ? 'correct' : 'wrong'}>{flagFeedback.text}</div>
                    )}
                    {flagButtonsDisabled && <button onClick={loadFlagScenario} className="game-btn">Next Scenario</button>}
                </div>

                {/* --- Emoji Game View --- */}
                <div id="emoji-game" className={`game-view ${activeGame === 'emoji-game' ? 'active' : ''}`}>
                    <h2 className="game-title">Guess the Book by Emoji</h2>
                    <div id="emoji-display">{currentEmojiPuzzle.emojis}</div>
                    <div id="emoji-options-container">
                        {shuffledOptions.map(option => {
                            const isCorrect = option === currentEmojiPuzzle.answer;
                            const isSelected = option === selectedEmojiAnswer;
                            let btnClass = 'emoji-option-btn';
                            if (selectedEmojiAnswer) {
                                if (isCorrect) btnClass += ' correct';
                                else if (isSelected) btnClass += ' wrong';
                            }
                            return (
                                <button 
                                    key={option} 
                                    className={btnClass}
                                    onClick={() => checkEmojiAnswer(option)}
                                    disabled={!!selectedEmojiAnswer}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                    {selectedEmojiAnswer && <button onClick={loadEmojiPuzzle} className="game-btn">Next Puzzle</button>}
                </div>

                {/* --- Speed Reading Game View --- */}
                <div id="speed-game" className={`game-view ${activeGame === 'speed-game' ? 'active' : ''}`}>
                    <h2 className="game-title">Speed Reading Challenge</h2>
                    {speedGameState === 'setup' && (
                        <div id="speed-challenge-setup">
                            <p>Read the paragraph below as quickly as you can. Click "Finished" when you're done!</p>
                            <button onClick={startSpeedChallenge} className="game-btn">Start Challenge</button>
                        </div>
                    )}
                    {speedGameState === 'active' && (
                        <div id="speed-challenge-active">
                            <p id="timer-display">Time: {secondsElapsed.toFixed(1)}s</p>
                            <div id="reading-paragraph">{passage.text}</div>
                            <button onClick={finishSpeedChallenge} className="game-btn">I'm Finished!</button>
                        </div>
                    )}
                    {speedGameState === 'finished' && (
                         <div id="speed-results">
                            <p>Your speed: <strong>{wpm.value} WPM</strong> 
                                <span id="wpm-badge" style={{ backgroundColor: wpm.color }}>
                                    {wpm.badge}
                                </span>
                            </p>
                            <button onClick={startSpeedChallenge} className="game-btn">Try Again</button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Popups & Overlays --- */}
            {(isSidebarOpen || isMyBooksPopupOpen) && <div className="overlay active" onClick={closePopups}></div>}

            <div className={`my-books-popup ${isMyBooksPopupOpen ? 'active' : ''}`}>
                <div className="my-books-header">
                    <h2>📚 My Books</h2>
                    <span className="close-my-books" onClick={closePopups}>&times;</span>
                </div>
                <div className="my-books-content">
                    {myBooks.length > 0 ? (
                        myBooks.map(book => (
                            <div key={book.id} className="my-book-item">
                                <img src={book.image} alt={book.title} onError={(e) => e.currentTarget.src='https://placehold.co/160x180/f0f0f0/ccc?text=No+Cover'} />
                                <h4>{book.title}</h4>
                                <button className="remove-book-btn" onClick={() => removeBookFromShelf(book.id)}>Remove</button>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign: 'center', padding: '20px', color: '#555'}}>Your bookshelf is empty.</p>
                    )}
                </div>
            </div>

            <div id="toastMessageBox" className={`message-box ${toast.type} ${toast.show ? 'show' : ''}`}>
                {toast.message}
            </div>
        </div>
    );
};

export default GamesPage;