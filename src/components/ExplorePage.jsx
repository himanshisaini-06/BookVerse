// src/components/ExplorePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path if needed
import GenreSection from './GenreSection';
import './ExplorePage.css';

const genres = [
  'fiction', 'romance', 'fantasy', 'mystery', 'thriller',
  'science_fiction', 'self_help', 'biography', 'history', 'cooking', 'children'
];

const ExplorePage = () => {
  const navigate = useNavigate(); // ✅ Navigation hook
  const [showSidebar, setShowSidebar] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [showMyBooks, setShowMyBooks] = useState(false);
  const [messageBox, setMessageBox] = useState(null);
  const searchInputRef = useRef();
  const genreSelectRef = useRef();
  const [searchResults, setSearchResults] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bookSummary, setBookSummary] = useState('');

  // ✅ Firebase auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    document.body.classList.remove('no-js');
  }, []);

  const handleHamburger = () => setShowSidebar(prev => !prev);

  const handleSearch = async () => {
    const query = searchInputRef.current.value.trim();
    const genre = genreSelectRef.current.value;
    let books = [];

    try {
      if (query) {
        const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
        const data = await resp.json();
        books = data.docs;
      } else if (genre) {
        const resp = await fetch(`https://openlibrary.org/subjects/${genre}.json?limit=20`);
        const data = await resp.json();
        books = data.works.map(w => ({
          title: w.title,
          author_name: [w.authors[0]?.name],
          cover_i: w.cover_id,
          first_publish_year: w.first_publish_year
        }));
      }

      setSearchResults(books.slice(0, 20));
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const openModal = (book) => {
    console.log('Opening modal for:', book); // Debug log
    setModalBook(book);
    setBookSummary(''); // Reset summary when opening new modal
  };
  
  const closeModal = () => {
    console.log('Closing modal'); // Debug log
    setModalBook(null);
    setBookSummary('');
  };

  const addToMyBooks = (book) => {
    setMyBooks(prev => [...prev, book]);
    showMessage('Added to your shelf!', 'success');
  };

  const removeFromMyBooks = (idx) => {
    setMyBooks(prev => {
      const arr = [...prev];
      arr.splice(idx, 1);
      return arr;
    });
    showMessage('Removed from your shelf', 'success');
  };

  const showMessage = (text, type) => {
    setMessageBox({ text, type });
    setTimeout(() => setMessageBox(null), 3000);
  };

  // Generate summary function with real API
  const generateSummary = async () => {
    if (!modalBook) return;
    
    setSummaryLoading(true);
    try {
      // Real API call to OpenAI (you can replace with any LLM API)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY || 'your-api-key-here'}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates concise, engaging book summaries. Keep summaries under 150 words and make them interesting for readers.'
            },
            {
              role: 'user',
              content: `Generate a brief summary for the book "${modalBook.title}" by ${modalBook.author_name?.join(', ') || 'Unknown Author'}. Genre: ${modalBook.subject?.[0] || 'Fiction'}. Published: ${modalBook.first_publish_year || 'Unknown year'}.`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || 'Unable to generate summary.';
      setBookSummary(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Fallback to mock summary if API fails
      const fallbackSummary = `"${modalBook.title}" by ${modalBook.author_name?.join(', ') || 'Unknown Author'} is a captivating literary work that explores themes of human nature and society. This book offers readers a unique perspective on life and relationships, making it a must-read for anyone interested in thought-provoking literature.`;
      setBookSummary(fallbackSummary);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to login
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  // Handle click on book card - FIXED VERSION
  const handleBookClick = (book) => {
    console.log('Book clicked:', book); // Debug log
    openModal(book);
  };

  // Handle navigation to games page
  const handleGamesNavigation = (e) => {
    e.preventDefault();
    console.log('Navigating to games page...'); // Debug log
    navigate('/games');
  };

  return (
    <div>
      <div className="loader-overlay" style={{ display: 'none' }}>
        <div className="loader"></div>
      </div>

      <header>
        <div className="navbar">
          <div className="logo">
            <span className="logo-icon">📚</span> BookVerse
          </div>
          <nav>
            <ul>
              <li><a href="#" className="nav-link">Home</a></li>
              <li><a href="#" className="nav-link active">Explore</a></li>
              <li><a href="#" className="nav-link" onClick={handleGamesNavigation}>Games</a></li>
              <li><a href="#" className="nav-link" onClick={() => setShowMyBooks(true)}>My Books</a></li>
            </ul>
          </nav>
          <button className="hamburger" onClick={handleHamburger}>☰</button>
        </div>
      </header>

      <div className={`sidebar ${showSidebar ? 'active' : ''}`}>
        <h2>👤 Hello, Reader!</h2>
        <ul>
          <li><a href="#" className="nav-link">Home</a></li>
          <li><a href="#" className="nav-link active">Explore</a></li>
          <li><a href="#" className="nav-link" onClick={handleGamesNavigation}>Games</a></li>
          <li><a href="#" className="nav-link" onClick={() => setShowMyBooks(true)}>My Books</a></li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <main>
        <div className="search-container">
          <div className="search-bar">
            <input ref={searchInputRef} type="search" placeholder="Search title or author" />
            <select ref={genreSelectRef}>
              <option value="">All Genres</option>
              <option value="fiction">Fiction</option>
              <option value="romance">Romance</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="thriller">Thriller</option>
              <option value="science_fiction">Science Fiction</option>
              <option value="self_help">Self-Help</option>
              <option value="biography">Biography</option>
              <option value="history">History</option>
              <option value="cooking">Cooking</option>
              <option value="children">Children</option>
            </select>
            <button onClick={handleSearch}>🔍 Search</button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <section id="searchResults">
            <h2 className="section-title">Search Results</h2>
            <div className="book-grid">
              {searchResults.map((b, i) => (
                <div key={i} className="book-card" onClick={() => handleBookClick(b)}>
                  {b.cover_i && (
                    <img src={`https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`} alt={b.title} />
                  )}
                  <h3>{b.title}</h3>
                  <p>{b.author_name?.join(', ')}</p>
                  <button className="read-btn" onClick={(e) => { e.stopPropagation(); handleBookClick(b); }}>View</button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div id="mainContent">
          {genres.map((g) => (
            <GenreSection key={g} genre={g} onBookClick={handleBookClick} />
          ))}
        </div>
      </main>

      {/* Enhanced Book Modal */}
      {modalBook && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>&times;</span>
            {modalBook.cover_i && (
              <img src={`https://covers.openlibrary.org/b/id/${modalBook.cover_i}-L.jpg`} alt={modalBook.title} />
            )}
            <h3>{modalBook.title}</h3>
            <p><strong>Author:</strong> {modalBook.author_name?.join(', ') || 'Unknown Author'}</p>
            <p><strong>Genre:</strong> {modalBook.subject ? modalBook.subject[0] : 'Fiction'}</p>
            <p><strong>First Published:</strong> {modalBook.first_publish_year || 'Unknown'}</p>
            
            <button className="add-to-shelf" onClick={() => { addToMyBooks(modalBook); closeModal(); }}>
              Add to My Books
            </button>
            
            <button 
              className="generate-summary-btn" 
              onClick={generateSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? 'Generating...' : 'Generate Summary ✨'}
            </button>

            {bookSummary && (
              <div className="summary-section">
                <h4>Summary:</h4>
                <p className="summary-content">{bookSummary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showMyBooks && (
        <>
          <div className="overlay active" onClick={() => setShowMyBooks(false)} />
          <div className="my-books-popup active">
            <div className="my-books-header">
              <h2>📚 My Shelf</h2>
              <span className="close-my-books" onClick={() => setShowMyBooks(false)}>&times;</span>
            </div>
            <div className="my-books-content">
              {myBooks.map((b, i) => (
                <div key={i} className="my-book-item">
                  {b.cover_i && (
                    <img src={`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`} alt={b.title} />
                  )}
                  <h4>{b.title}</h4>
                  <button className="remove-book-btn" onClick={() => removeFromMyBooks(i)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {messageBox && (
        <div className={`message-box ${messageBox.type} show`}>
          {messageBox.text}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;