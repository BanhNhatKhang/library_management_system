import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/publisher/NXBDetails.module.css";

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
  diaChi: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  anhBia: string;
  soLuong: number;
  donGia: number;
}

const NXBDetails = () => {
  const { maNhaXuatBan } = useParams<{ maNhaXuatBan: string }>();
  const [nxb, setNxb] = useState<NhaXuatBan | null>(null);
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // THÊM: State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // 7 sách mỗi trang

  useEffect(() => {
    if (!maNhaXuatBan) return;

    setLoading(true);
    setError("");

    Promise.all([
      axios.get(`/api/nhaxuatban/${maNhaXuatBan}`),
      axios.get(`/api/sach/nxb/${encodeURIComponent(maNhaXuatBan)}`),
    ])
      .then(([nxbRes, sachRes]) => {
        setNxb(nxbRes.data);
        setSachList(sachRes.data || []);
        setCurrentPage(1); // Reset về trang 1
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin nhà xuất bản");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maNhaXuatBan]);

  // THÊM: Tính toán phân trang
  const totalPages = Math.ceil(sachList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSach = sachList.slice(startIndex, endIndex);

  // THÊM: Handlers cho phân trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // THÊM: Generate page numbers
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

  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  // };

  if (loading) {
    return (
      <div className={styles["nxb-details"]}>
        <div className={styles["loading"]}>
          ⏳ Đang tải thông tin nhà xuất bản...
        </div>
      </div>
    );
  }

  if (error || !nxb) {
    return (
      <div className={styles["nxb-details"]}>
        <Link to="/admin/nxb" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>
          {error || "❌ Không tìm thấy nhà xuất bản!"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["nxb-details"]}>
      <Link to="/admin/nxb" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2 className={styles["page-title"]}>🏢 Chi tiết nhà xuất bản</h2>

      <div className={styles["main-container"]}>
        {/* Cột trái - Thông tin nhà xuất bản */}
        <div className={styles["nxb-info-section"]}>
          <h3 className={styles["nxb-info-title"]}>Thông tin chi tiết</h3>

          <div className={styles["nxb-content"]}>
            <div className={styles["nxb-info"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã NXB:</span>
                <span className={styles["info-value"]}>{nxb.maNhaXuatBan}</span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tên NXB:</span>
                <span className={styles["info-value"]}>
                  {nxb.tenNhaXuatBan}
                </span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Địa chỉ:</span>
                <span className={styles["info-value"]}>{nxb.diaChi}</span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Số lượng sách:</span>
                <span className={`${styles["info-value"]} ${styles["stats"]}`}>
                  {sachList.length} cuốn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Sách của nhà xuất bản */}
        <div className={styles["sach-section"]}>
          {/* THÊM: Header với thông tin phân trang */}
          <div className={styles["sach-header"]}>
            <h3 className={styles["sach-title"]}>
              📚 Sách của nhà xuất bản ({sachList.length})
            </h3>

            {/* THÊM: Pagination info */}
            {sachList.length > itemsPerPage && (
              <div className={styles["pagination-info-header"]}>
                Trang {currentPage}/{totalPages}{" "}
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
              <p>📚 Hiện tại chưa có sách nào của nhà xuất bản này</p>
            </div>
          ) : (
            <>
              {/* SỬA: Hiển thị dạng danh sách đơn giản */}
              <div className={styles["sach-list"]}>
                {currentSach.map((sach) => (
                  <div key={sach.maSach} className={styles["sach-item"]}>
                    <div className={styles["sach-content"]}>
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className={styles["sach-link"]}
                        title={`Xem chi tiết: ${sach.tenSach}`}
                      >
                        {sach.tenSach}
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

              {/* THÊM: Pagination Controls */}
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

export default NXBDetails;
