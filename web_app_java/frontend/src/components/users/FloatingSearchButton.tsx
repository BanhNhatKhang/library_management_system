import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/users/FloatingSearchButton.module.css";

const FloatingSearchButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsExpanded(false);
      setSearchQuery("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsExpanded(false);
      setSearchQuery("");
    }
  };

  return (
    <div className={styles["floating-search-container"]}>
      {/* Search Bar - Slide from right */}
      <div
        className={`${styles["search-bar"]} ${
          isExpanded ? styles["expanded"] : ""
        }`}
      >
        <form onSubmit={handleSearchSubmit} className={styles["search-form"]}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Tìm kiếm sách..."
            className={styles["search-input"]}
            autoFocus={isExpanded}
          />
          <button type="submit" className={styles["search-submit-btn"]}>
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      {/* Floating Search Button */}
      <button
        className={`${styles["floating-search-btn"]} ${
          isExpanded ? styles["btn-expanded"] : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Tìm kiếm"
      >
        <i className={isExpanded ? "fas fa-times" : "fas fa-search"}></i>
        <span className={styles["btn-label"]}>
          {isExpanded ? "Đóng" : "Tìm kiếm"}
        </span>
      </button>
    </div>
  );
};

export default FloatingSearchButton;
