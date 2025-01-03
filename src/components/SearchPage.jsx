import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Book from "./Books";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import * as BookAPI from "../utils/BookAPI";
import { FaArrowLeft } from "react-icons/fa";

const SearchPage = ({ booksOnShelves, onShelfChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === "" || query === null) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchBooks = debounce(async () => {
      try {
        const data = await BookAPI.search(query, 20);
        if (data.error) {
          setError("No books found.");
          setResults([]);
        } else {
          // Filter books by name
          const filteredBooks = data.filter((book) =>
            book.title.toLowerCase().includes(query.toLowerCase())
          );
          // Merge books with their shelf information
          const updatedResults = filteredBooks.map((book) => {
            const bookOnShelf = booksOnShelves.find((b) => b.id === book.id);
            return {
              ...book,
              shelf: bookOnShelf ? bookOnShelf.shelf : "none",
            };
          });
          setResults(updatedResults);
        }
      } catch {
        setError("No books found.");
        setResults([]);
      }
    }, 500);

    fetchBooks();

    return () => {
      fetchBooks.cancel();
    };
  }, [query, booksOnShelves]);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    setError(null);
  };

  const handleShelfChange = (book, shelf) => {
    if (book) {
      onShelfChange(book, shelf);
      setResults((prevResults) =>
        prevResults.map((b) => (b.id === book.id ? { ...b, shelf: shelf } : b))
      );
    }
  };

  return (
    <div className="search-page">
      <div className="search-bar">
        <button className="close-search" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <label htmlFor="search-input">Search books:</label>
        <input
          className="search-input"
          type="text"
          id="search-input"
          name="search-input"
          value={query}
          width={200}
          height={200}
          onChange={handleSearchChange}
          placeholder="Search books..."
        />
      </div>
      <div className="search-results">
        {error && <p>{error}</p>}
        <ul className="searched-books">
          {results.length > 0 ? (
            results.map((book) => (
              <li key={book.id} className="search-list">
                <Book book={book} onShelfChange={handleShelfChange} />
              </li>
            ))
          ) : (
            <h3>search for results.</h3>
          )}
        </ul>
      </div>
    </div>
  );
};

SearchPage.propTypes = {
  booksOnShelves: PropTypes.array.isRequired,
  onShelfChange: PropTypes.func.isRequired,
};

export default SearchPage;
