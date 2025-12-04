import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/category/TheLoaiDetails.module.css";

interface TheLoai {
  maTheLoai: string;
  tenTheLoai: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  anhBia: string;
  soLuong: number;
  donGia: number;
}

const TheLoaiDetails = () => {
  const { maTheLoai } = useParams<{ maTheLoai: string }>();
  const [theLoai, setTheLoai] = useState<TheLoai | null>(null);
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // SỬA: State cho phân trang - 7 sách mỗi trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // SỬA: 7 dòng mỗi trang

  useEffect(() => {
    if (!maTheLoai) return;

    setLoading(true);
    setError("");

    Promise.all([
      axios.get(`/api/theloai/${maTheLoai}`),
      axios.get(`/api/sach/theloai/${maTheLoai}`),
    ])
      .then(([theLoaiRes, sachRes]) => {
        setTheLoai(theLoaiRes.data);
        setSachList(sachRes.data || []);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin thể loại");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maTheLoai]);

  // Tính toán phân trang
  const totalPages = Math.ceil(sachList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSach = sachList.slice(startIndex, endIndex);

  // Handlers cho phân trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const sachSection = document.querySelector(`.${styles["sach-section"]}`);
    if (sachSection) {
      sachSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers với ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className={styles["theloai-details"]}>
        <div className={styles["loading"]}>
          ⏳ Đang tải thông tin thể loại...
        </div>
      </div>
    );
  }

  if (error || !theLoai) {
    return (
      <div className={styles["theloai-details"]}>
        <Link to="/admin/theloai" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>
          {error || "❌ Không tìm thấy thể loại!"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["theloai-details"]}>
      <Link to="/admin/theloai" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2 className={styles["page-title"]}>🏷️ Chi tiết thể loại</h2>

      <div className={styles["main-container"]}>
        {/* Cột trái - Thông tin thể loại */}
        <div className={styles["theloai-info-section"]}>
          <h3 className={styles["theloai-info-title"]}>Thông tin chi tiết</h3>

          <div className={styles["theloai-content"]}>
            <div className={styles["theloai-info"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã thể loại:</span>
                <span className={styles["info-value"]}>
                  {theLoai.maTheLoai}
                </span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tên thể loại:</span>
                <span className={styles["info-value"]}>
                  {theLoai.tenTheLoai}
                </span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>
                  Số sách thuộc thể loại:
                </span>
                <span className={`${styles["info-value"]} ${styles["stats"]}`}>
                  {sachList.length} sách
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Sách thuộc thể loại */}
        <div className={styles["sach-section"]}>
          {/* Header với thông tin phân trang */}
          <div className={styles["sach-header"]}>
            <h3 className={styles["sach-title"]}>
              📚 Sách thuộc thể loại ({sachList.length})
            </h3>

            {/* Pagination info */}
            {sachList.length > itemsPerPage && (
              <div className={styles["pagination-info-header"]}>
                Trang {currentPage}/{totalPages}
                <span className={styles["items-info"]}>
                  (Hiển thị {startIndex + 1}-
                  {Math.min(endIndex, sachList.length)} trong số{" "}
                  {sachList.length})
                </span>
              </div>
            )}
          </div>

          {sachList.length === 0 ? (
            <div className={styles["no-data"]}>
              <p>📚 Hiện tại chưa có sách nào thuộc thể loại này</p>
            </div>
          ) : (
            <>
              {/* SỬA: Hiển thị dạng danh sách đơn giản */}
              <div className={styles["sach-list"]} key={currentPage}>
                {currentSach.map((sach, idx) => (
                  <div
                    key={sach.maSach}
                    className={styles["sach-item"]}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className={styles["sach-content"]}>
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className={styles["sach-link"]}
                        title={`Xem chi tiết: ${sach.tenSach}`}
                      >
                        <span className={styles["sach-name-text"]}>
                          {sach.tenSach}
                        </span>
                      </Link>
                    </div>
                    <div className={styles["sach-actions"]}>
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className={styles["view-btn-small"]}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className={styles["pagination-container"]}>
                  <div className={styles["pagination"]}>
                    {/* Previous button */}
                    <button
                      className={`${styles["pagination-btn"]} ${
                        styles["nav-btn"]
                      } ${currentPage === 1 ? styles["disabled"] : ""}`}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      ◀ Trước
                    </button>

                    {/* First page */}
                    {currentPage > 3 && totalPages > 5 && (
                      <>
                        <button
                          className={styles["pagination-btn"]}
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className={styles["pagination-dots"]}>...</span>
                        )}
                      </>
                    )}

                    {/* Page numbers */}
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        className={`${styles["pagination-btn"]} ${
                          page === currentPage ? styles["active"] : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && totalPages > 5 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className={styles["pagination-dots"]}>...</span>
                        )}
                        <button
                          className={styles["pagination-btn"]}
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Next button */}
                    <button
                      className={`${styles["pagination-btn"]} ${
                        styles["nav-btn"]
                      } ${
                        currentPage === totalPages ? styles["disabled"] : ""
                      }`}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      Sau ▶
                    </button>
                  </div>

                  {/* Items per page indicator */}
                  <div className={styles["pagination-summary"]}>
                    <span className={styles["items-per-page"]}>
                      {itemsPerPage} sách/trang
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheLoaiDetails;
