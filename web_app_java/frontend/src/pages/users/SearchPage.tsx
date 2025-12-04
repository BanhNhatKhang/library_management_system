import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "../../css/users/SearchPage.module.css";

interface SachDTO {
  maSach: string;
  tenSach: string;
  donGia: number;
  giamGia: number;
  anhBia: string;
  tacGia: string;
  nhaXuatBan: string;
  theLoais: string[];
}

interface SearchResponse {
  results: SachDTO[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  query: string;
  searchType: string;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const page = parseInt(searchParams.get("page") || "0");

  const BOOKS_PER_PAGE = 75; // Match AllBooks.tsx
  const BOOKS_PER_ROW = 5;

  useEffect(() => {
    if (query) {
      performSearch(query, type, page);
    }
  }, [query, type, page]);

  const performSearch = async (
    searchQuery: string,
    searchType: string,
    currentPage: number = 0
  ) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.get("/api/search", {
        params: {
          q: searchQuery,
          type: searchType,
          page: currentPage,
          size: BOOKS_PER_PAGE,
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      q: query,
      type: type,
      page: newPage.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const BookCard = ({ book }: { book: SachDTO }) => {
    const donGia = Number(book.donGia);
    const giamGia = Number(book.giamGia || 0);
    const discountedPrice = donGia * (1 - giamGia);

    return (
      <div className={styles["book-card"]}>
        <Link to={`/sach/${book.maSach}`}>
          <div className={styles["book-image-container"]}>
            <img
              src={`/api/sach/image/${book.anhBia}`}
              alt={book.tenSach}
              loading="lazy"
            />
            {giamGia > 0 && (
              <span className={styles["discount-badge"]}>
                -{((giamGia || 0) * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <p className={styles["book-title"]}>{book.tenSach}</p>
          <p className={styles["book-price"]}>
            {formatCurrency(discountedPrice)}
            {giamGia > 0 && (
              <span className={styles["original-price"]}>
                {formatCurrency(donGia)}
              </span>
            )}
          </p>
        </Link>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-spinner"]}>
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  // Calculate pagination and rows for search results
  const currentBooks = searchResults?.results || [];
  const bookRows = [];
  for (let i = 0; i < currentBooks.length; i += BOOKS_PER_ROW) {
    bookRows.push(currentBooks.slice(i, i + BOOKS_PER_ROW));
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item active">Tìm kiếm</li>
        </ol>
      </nav>

      {/* Results Header - Simple info display */}
      {searchResults && (
        <div className={styles["page-header"]}>
          <div className={styles["header-content"]}>
            <h1 className={styles["page-title"]}>Kết quả tìm kiếm</h1>
            <p className={styles["page-subtitle"]}>
              {searchResults.query && (
                <>
                  Từ khóa: "<em>{searchResults.query}</em>"
                </>
              )}
            </p>
          </div>
          <div className={styles["stats-bar"]}>
            <div className={styles["stat-item"]}>
              <i className="fas fa-search"></i>
              <span>{searchResults.totalResults} kết quả</span>
            </div>
            {searchResults.searchType !== "all" && (
              <div className={styles["stat-item"]}>
                <i className="fas fa-filter"></i>
                <span>
                  Trong {getSearchTypeLabel(searchResults.searchType)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results - Grid Layout like AllBooks */}
      {searchResults && (
        <>
          {currentBooks.length > 0 ? (
            <div className={styles["search-results-section"]}>
              {bookRows.map((row, rowIndex) => (
                <div key={rowIndex} className={styles["books-row"]}>
                  {row.map((book) => (
                    <BookCard key={book.maSach} book={book} />
                  ))}
                  {/* Add placeholder if row doesn't have 5 books */}
                  {row.length < BOOKS_PER_ROW &&
                    Array.from({ length: BOOKS_PER_ROW - row.length }).map(
                      (_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className={styles["book-placeholder"]}
                        />
                      )
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["no-results"]}>
              <i className="fas fa-search fa-3x mb-3"></i>
              <h3>Không tìm thấy kết quả</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả</p>
            </div>
          )}

          {/* Pagination - Same style as AllBooks */}
          {searchResults.totalPages > 1 && (
            <div className={styles["pagination-container"]}>
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      searchResults.currentPage === 0 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handlePageChange(searchResults.currentPage - 1)
                      }
                      disabled={searchResults.currentPage === 0}
                    >
                      <i className="fas fa-chevron-left me-1"></i>
                      Trước
                    </button>
                  </li>

                  {/* Page numbers */}
                  {Array.from(
                    { length: searchResults.totalPages },
                    (_, index) => {
                      if (
                        index === 0 ||
                        index === searchResults.totalPages - 1 ||
                        (index >= searchResults.currentPage - 2 &&
                          index <= searchResults.currentPage + 2)
                      ) {
                        return (
                          <li
                            key={index}
                            className={`page-item ${
                              searchResults.currentPage === index
                                ? "active"
                                : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(index)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        );
                      } else if (
                        index === searchResults.currentPage - 3 ||
                        index === searchResults.currentPage + 3
                      ) {
                        return (
                          <li key={index} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    }
                  )}

                  <li
                    className={`page-item ${
                      searchResults.currentPage === searchResults.totalPages - 1
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handlePageChange(searchResults.currentPage + 1)
                      }
                      disabled={
                        searchResults.currentPage ===
                        searchResults.totalPages - 1
                      }
                    >
                      Sau
                      <i className="fas fa-chevron-right ms-1"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Back to top - Same as AllBooks */}
      <div className={styles["back-to-top"]}>
        <button
          className={styles["back-to-top-btn"]}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>
    </div>
  );
};

const getSearchTypeLabel = (type: string) => {
  switch (type) {
    case "name":
      return "tên sách";
    case "author":
      return "tác giả";
    case "publisher":
      return "nhà xuất bản";
    case "category":
      return "thể loại";
    default:
      return "tất cả";
  }
};

export default SearchPage;
