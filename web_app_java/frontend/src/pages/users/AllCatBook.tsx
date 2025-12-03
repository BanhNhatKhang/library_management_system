import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../../axiosConfig";
import { Link, useParams } from "react-router-dom";
import styles from "../../css/users/book/AllCatBook.module.css";

// Tương tự interface trong HomePage.tsx nhưng có thêm theLoais (cho chi tiết lọc)
interface SachDTO {
  maSach: string;
  tenSach: string;
  donGia: number;
  giamGia: number;
  anhBia: string;
  diemDanhGia: number; // Thêm điểm đánh giá để sắp xếp
  nhaXuatBan: string; // Thêm nhà xuất bản để lọc
}

interface TheLoaiDTO {
  maTheLoai: string;
  tenTheLoai: string;
}

interface NhaXuatBanDTO {
  maNXB: string;
  tenNXB: string;
}

// Giả định các loại sắp xếp có sẵn
type SortOption = "macDinh" | "giaGiam" | "giaTang" | "diemCao" | "moiNhat";

const MAX_ITEMS_PER_PAGE = 24; // Số sản phẩm trên mỗi trang, dựa trên hình ảnh

// Component Card sách, tái sử dụng logic từ HomePage.tsx
const BookCard = ({ book }: { book: SachDTO }) => {
  const donGia = Number(book.donGia);
  const giamGia = Number(book.giamGia || 0);
  // Tính toán giá chiết khấu, sử dụng giá trị number/string từ DTO
  const discountedPrice = donGia * (1 - giamGia);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <div className={styles["book-card"]}>
      <Link to={`/sach/${book.maSach}`}>
        <div className={styles["book-image-container"]}>
          <img src={`/api/sach/image/${book.anhBia}`} alt={book.tenSach} />
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
          {/* Thêm điểm đánh giá nếu có */}
          {book.diemDanhGia > 0 && (
            <div className={styles["rating"]}>
              <i className="fas fa-star text-warning"></i>{" "}
              {book.diemDanhGia.toFixed(1)}
            </div>
          )}
        </p>
      </Link>
    </div>
  );
};

function AllCatBook() {
  const { maTheLoai } = useParams<{ maTheLoai: string }>(); // Lấy mã thể loại từ URL
  const [currentCategory, setCurrentCategory] = useState<TheLoaiDTO | null>(
    null
  );
  const [books, setBooks] = useState<SachDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("macDinh");
  const [selectedNXB, setSelectedNXB] = useState<string>(""); // Lọc theo Nhà xuất bản
  const [nxbList, setNxbList] = useState<NhaXuatBanDTO[]>([]);

  // State cho các bộ lọc khác (nếu cần mở rộng)
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  // --- Data Fetching ---
  useEffect(() => {
    if (!maTheLoai) return;

    setIsLoading(true);

    // 1. Lấy sách theo mã thể loại
    axios
      .get(`/api/sach/theloai/${maTheLoai}`)
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => console.error("Error fetching books by category:", err))
      .finally(() => setIsLoading(false));

    // 2. Lấy thông tin thể loại (Giả định có API để lấy tên thể loại)
    // Nếu không có, ta sẽ cần dùng state 'currentCategory' chỉ chứa tên
    axios
      .get(`/api/theloai/id/${maTheLoai}`) // Giả định có API này
      .then((res) => setCurrentCategory(res.data))
      .catch((err) => console.error("Error fetching category info:", err));

    // 3. Lấy danh sách Nhà Xuất Bản để lọc (Giả định có API này)
    axios
      .get("/api/nhaxuatban")
      .then((res) => setNxbList(res.data))
      .catch((err) => console.error("Error fetching publishers:", err));
  }, [maTheLoai]);

  // --- Logic Lọc và Sắp xếp ---
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // 1. Lọc theo Nhà Xuất Bản
    if (selectedNXB) {
      result = result.filter((book) => book.nhaXuatBan === selectedNXB);
    }

    // 2. Lọc theo khoảng giá (Uncomment và chỉnh sửa)
    if (minPrice > 0 || maxPrice > 0) {
      // SỬ DỤNG minPrice VÀ maxPrice
      result = result.filter((book) => {
        const finalPrice =
          Number(book.donGia) * (1 - Number(book.giamGia || 0));
        // Lọc: Giá phải lớn hơn hoặc bằng minPrice VÀ (maxPrice = 0 HOẶC Giá nhỏ hơn hoặc bằng maxPrice)
        return (
          finalPrice >= minPrice && (maxPrice === 0 || finalPrice <= maxPrice)
        );
      });
    }

    // 3. Sắp xếp
    result.sort((a, b) => {
      const priceA = Number(a.donGia) * (1 - Number(a.giamGia || 0));
      const priceB = Number(b.donGia) * (1 - Number(b.giamGia || 0));

      switch (sortOption) {
        case "giaGiam": // Giá giảm dần
          return priceB - priceA;
        case "giaTang": // Giá tăng dần
          return priceA - priceB;
        case "diemCao": // Điểm đánh giá cao nhất
          return Number(b.diemDanhGia || 0) - Number(a.diemDanhGia || 0);
        // case "moiNhat": // Mới nhất (Giả định có trường ngày xuất bản/tạo)
        //   return new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime();
        case "macDinh":
        default:
          return 0;
      }
    });

    return result;
  }, [books, sortOption, selectedNXB, minPrice, maxPrice]);

  // --- Logic Phân trang ---
  const totalPages = Math.ceil(
    filteredAndSortedBooks.length / MAX_ITEMS_PER_PAGE
  );

  const displayedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * MAX_ITEMS_PER_PAGE;
    return filteredAndSortedBooks.slice(
      startIndex,
      startIndex + MAX_ITEMS_PER_PAGE
    );
  }, [filteredAndSortedBooks, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên đầu trang
      }
    },
    [totalPages]
  );

  // Reset về trang 1 khi filter/sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, selectedNXB]);

  // Lấy ra các trang sẽ hiển thị trong phân trang
  const renderPagination = () => {
    const pagesToShow = [];
    const maxPages = 5; // Hiển thị tối đa 5 nút trang
    const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Điều chỉnh lại startPage nếu bị lệch do endPage bị giới hạn
    const finalStartPage = Math.max(
      1,
      Math.min(startPage, totalPages - maxPages + 1)
    );

    for (let i = finalStartPage; i <= endPage; i++) {
      pagesToShow.push(
        <li
          key={i}
          className={`page-item ${i === currentPage ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    return pagesToShow;
  };

  // Lấy danh sách NXB duy nhất từ sách đang hiển thị
  const uniqueNXBs = useMemo(() => {
    const nxbNames = new Set(books.map((b) => b.nhaXuatBan));
    // Chỉ lấy các NXB có sách trong thể loại hiện tại
    return nxbList.filter((nxb) => nxbNames.has(nxb.tenNXB));
  }, [books, nxbList]);

  if (isLoading) {
    return <div className="container mt-4 text-center">Đang tải sách...</div>;
  }

  return (
    <div className="container mt-4">
      <div className={styles["breadcrumb"]}>
        <Link to="/">Trang chủ</Link> / <Link to="/sach/tat-ca">Sách</Link> /{" "}
        <span className={styles["current-page"]}>
          {currentCategory ? currentCategory.tenTheLoai : "Thể loại"}
        </span>
      </div>

      <div className={styles["page-header"]}>
        <h1>
          {currentCategory ? currentCategory.tenTheLoai : "Sách theo Thể loại"}
        </h1>
      </div>

      <div className="row">
        {/* --- Cột trái: Bộ lọc (Sidebar) --- */}
        <div className="col-lg-3">
          <div className={styles["sidebar"]}>
            <h3 className={styles["sidebar-title"]}>Nhóm sản phẩm</h3>
            <ul className={styles["category-list"]}>
              {/* Giả lập danh mục sản phẩm như trong ảnh */}
              <li>
                <Link to="#">Văn học</Link>
              </li>
              <li className={styles["active-item"]}>
                <Link to={`/the-loai/${maTheLoai}`}>
                  {currentCategory ? currentCategory.tenTheLoai : "Tiểu thuyết"}
                </Link>
              </li>
              <li>
                <Link to="#">Truyện Ngắn - Tản Văn</Link>
              </li>
              {/* ... Thêm các danh mục khác nếu cần ... */}
            </ul>

            <hr />

            {/* Bộ lọc Giá (Giả lập) */}
            <h3 className={styles["sidebar-title"]}>Giá</h3>
            <div className={styles["price-filter-inputs"]}>
              <input
                type="number"
                placeholder="Giá tối thiểu"
                value={minPrice} // SỬ DỤNG minPrice
                onChange={(e) => setMinPrice(Number(e.target.value) || 0)} // SỬ DỤNG setMinPrice
                className="form-control mb-2"
              />
              <input
                type="number"
                placeholder="Giá tối đa"
                value={maxPrice} // SỬ DỤNG maxPrice
                onChange={(e) => setMaxPrice(Number(e.target.value) || 0)} // SỬ DỤNG setMaxPrice
                className="form-control"
              />
            </div>

            <hr />

            {/* Bộ lọc Nhà Xuất Bản */}
            <h3 className={styles["sidebar-title"]}>Nhà Xuất Bản</h3>
            <select
              className={`form-select ${styles["filter-select"]}`}
              value={selectedNXB}
              onChange={(e) => setSelectedNXB(e.target.value)}
            >
              <option value="">Tất cả Nhà Xuất Bản</option>
              {uniqueNXBs.map((nxb) => (
                <option key={nxb.maNXB} value={nxb.tenNXB}>
                  {nxb.tenNXB}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Cột phải: Danh sách sách và Sắp xếp --- */}
        <div className="col-lg-9">
          <div className={styles["sort-bar"]}>
            <span className={styles["sort-label"]}>Sắp xếp theo:</span>

            <button
              className={`${styles["sort-button"]} ${
                sortOption === "macDinh" ? styles["active"] : ""
              }`}
              onClick={() => setSortOption("macDinh")}
            >
              Bán Chạy
            </button>
            <button
              className={`${styles["sort-button"]} ${
                sortOption === "diemCao" ? styles["active"] : ""
              }`}
              onClick={() => setSortOption("diemCao")}
            >
              Điểm Đánh Giá Cao
            </button>
            <button
              className={`${styles["sort-button"]} ${
                sortOption === "giaTang" ? styles["active"] : ""
              }`}
              onClick={() => setSortOption("giaTang")}
            >
              Giá Tăng Dần
            </button>
            <button
              className={`${styles["sort-button"]} ${
                sortOption === "giaGiam" ? styles["active"] : ""
              }`}
              onClick={() => setSortOption("giaGiam")}
            >
              Giá Giảm Dần
            </button>
          </div>

          <div className={styles["products-count"]}>
            Hiển thị {displayedBooks.length} trong{" "}
            {filteredAndSortedBooks.length} sản phẩm
          </div>

          <div className={styles["books-grid"]}>
            {displayedBooks.length > 0 ? (
              displayedBooks.map((book) => (
                <BookCard key={book.maSach} book={book} />
              ))
            ) : (
              <p>Không tìm thấy sách nào.</p>
            )}
          </div>

          {/* --- Phân trang --- */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang sách" className="mt-5">
              <ul
                className={`pagination justify-content-center ${styles["custom-pagination"]}`}
              >
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    &laquo;
                  </button>
                </li>
                {/* Trang đầu tiên nếu không nằm trong phạm vi hiển thị */}
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  </>
                )}

                {renderPagination()}

                {/* Trang cuối cùng nếu không nằm trong phạm vi hiển thị */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllCatBook;
