import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../../css/users/book/AllBooks.module.css";

interface SachDTO {
  maSach: string;
  tenSach: string;
  donGia: number;
  giamGia: number;
  anhBia: string;
}

function AllBooks() {
  const [allBooks, setAllBooks] = useState<SachDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const BOOKS_PER_PAGE = 75; // 5x15 = 75 sách mỗi trang
  const BOOKS_PER_ROW = 5;

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/home/sach/all");
        setAllBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBooks();
  }, []);

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

  // Tính toán pagination
  const totalPages = Math.ceil(allBooks.length / BOOKS_PER_PAGE);
  const startIndex = currentPage * BOOKS_PER_PAGE;
  const currentBooks = allBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);

  // Chia sách thành các hàng
  const bookRows = [];
  for (let i = 0; i < currentBooks.length; i += BOOKS_PER_ROW) {
    bookRows.push(currentBooks.slice(i, i + BOOKS_PER_ROW));
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-spinner"]}>
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Đang tải danh sách sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item active">Sách</li>
        </ol>
      </nav>

      {/* Books Grid - 15 rows x 5 columns */}
      <div className={styles["all-books-section"]}>
        {bookRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles["books-row"]}>
            {row.map((book) => (
              <BookCard key={book.maSach} book={book} />
            ))}
            {/* Thêm placeholder nếu hàng không đủ 5 sách */}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles["pagination-container"]}>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 0 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <i className="fas fa-chevron-left me-1"></i>
                  Trước
                </button>
              </li>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, index) => {
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 2)
                ) {
                  return (
                    <li
                      key={index}
                      className={`page-item ${
                        currentPage === index ? "active" : ""
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
                  index === currentPage - 3 ||
                  index === currentPage + 3
                ) {
                  return (
                    <li key={index} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              })}

              <li
                className={`page-item ${
                  currentPage === totalPages - 1 ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Sau
                  <i className="fas fa-chevron-right ms-1"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Back to top */}
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
}

export default AllBooks;
