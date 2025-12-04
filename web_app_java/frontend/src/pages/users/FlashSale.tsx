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

function FlashSale() {
  const [flashSaleBooks, setFlashSaleBooks] = useState<SachDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const BOOKS_PER_PAGE = 75; // 5x15 = 75 sách mỗi trang
  const BOOKS_PER_ROW = 5;

  useEffect(() => {
    const fetchFlashSaleBooks = async () => {
      try {
        setIsLoading(true);
        // Sử dụng API flash sale có sẵn
        const response = await axios.get("/api/home/sach-uu-dai");
        setFlashSaleBooks(response.data);
      } catch (error) {
        console.error("Error fetching flash sale books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashSaleBooks();
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
      <div className={`${styles["book-card"]} ${styles["flash-sale-card"]}`}>
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
            {/* Flash sale lightning badge */}
            <div className={styles["flash-badge"]}>
              <i className="fas fa-bolt"></i>
            </div>
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
  const totalPages = Math.ceil(flashSaleBooks.length / BOOKS_PER_PAGE);
  const startIndex = currentPage * BOOKS_PER_PAGE;
  const currentBooks = flashSaleBooks.slice(
    startIndex,
    startIndex + BOOKS_PER_PAGE
  );

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
          <p>Đang tải Flash Sale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item active">Flash Sale</li>
        </ol>
      </nav>

      {/* Flash Sale Header */}
      <div className={styles["flash-sale-header"]}>
        <div className={styles["header-content"]}>
          <h1 className={styles["flash-sale-title"]}>
            <i className="fas fa-bolt me-2"></i>
            FLASH SALE
          </h1>
          <p className={styles["flash-sale-subtitle"]}>
            Giảm giá sốc - Số lượng có hạn
          </p>
        </div>

        {/* Flash Sale Stats */}
        <div className={styles["flash-stats-bar"]}>
          <div className={styles["stat-item"]}>
            <i className="fas fa-fire"></i>
            <span>{flashSaleBooks.length} sách đang giảm giá</span>
          </div>
          <div className={styles["stat-item"]}>
            <i className="fas fa-clock"></i>
            <span className={styles["countdown-timer"]}>Còn lại: 23:59:45</span>
          </div>
          <div className={styles["stat-item"]}>
            <i className="fas fa-list"></i>
            <span>
              Trang {currentPage + 1} / {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Flash Sale Books Grid - 15 rows x 5 columns */}
      <div
        className={`${styles["all-books-section"]} ${styles["flash-sale-section"]}`}
      >
        {flashSaleBooks.length === 0 ? (
          <div className={styles["no-books"]}>
            <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
            <h4>Hiện tại không có sách Flash Sale</h4>
            <p>Vui lòng quay lại sau để không bỏ lỡ các ưu đãi hấp dẫn!</p>
            <Link to="/" className="btn btn-primary mt-3">
              Về trang chủ
            </Link>
          </div>
        ) : (
          bookRows.map((row, rowIndex) => (
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
          ))
        )}
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

export default FlashSale;
