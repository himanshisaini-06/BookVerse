import React, { useEffect, useState } from 'react';

const GenreSection = ({ genre, onBookClick }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooksByGenre = async () => {
      try {
        const response = await fetch(`https://openlibrary.org/subjects/${genre}.json?limit=10`);
        const data = await response.json();
        const filteredBooks = data.works.filter(b => b.cover_id && b.authors);
        
        // Format books to match the expected structure for popup
        const formattedBooks = filteredBooks.map(book => ({
          title: book.title,
          author_name: book.authors?.map(author => author.name) || ['Unknown Author'],
          cover_i: book.cover_id,
          first_publish_year: book.first_publish_year,
          subject: [genre],
          key: book.key
        }));
        
        setBooks(formattedBooks);
      } catch (error) {
        console.error(`Failed to fetch books for genre ${genre}`, error);
      }
    };
    fetchBooksByGenre();
  }, [genre]);

  return (
    <div className="genre-section">
      <h3 className="genre-title">{genre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
      <div className="carousel-wrapper">
        <div className="book-slider" id={`slider-${genre}`}>
          {books.map(book => (
            <div 
              key={book.key} 
              className="book-card"
              onClick={() => {
                console.log('Genre book clicked:', book); // Debug log
                onBookClick(book); // Trigger popup
              }}
            >
              <img 
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`} 
                alt={book.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h3>{book.title}</h3>
              <p>{book.author_name?.join(', ')}</p>
              <button 
                className="read-btn" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent double firing
                  console.log('Read button clicked for:', book); // Debug log
                  onBookClick(book);
                }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreSection;