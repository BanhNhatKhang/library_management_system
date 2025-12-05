import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/books/SachDetails.module.css";

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  nhaXuatBan: string;
  namXuatBan: string;
  soLuong: number;
  soQuyen: number;
  donGia: number;
  diemDanhGia: number;
  giamGia: number;
  moTa: string;
  anhBia: string;
  theLoais: string[];
}

interface PhieuMuon {
  maDocGia: string;
  ngayMuon: string;
  ngayTra: string | null;
  trangThaiMuon: string;
  maNhanVien: string;
}

const SachDetails = () => {
  const { maSach } = useParams<{ maSach: string }>();
  const [sach, setSach] = useState<Sach | null>(null);
  const [phieuMuonList, setPhieuMuonList] = useState<PhieuMuon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"info" | "phieu-muon">("info");

  // THÊM: State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Số phiếu mượn mỗi trang

  useEffect(() => {
    if (!maSach) return;

    setLoading(true);
    setError("");

    // Lấy thông tin sách
    Promise.all([
      axios.get(`/api/sach/id/${maSach}`),
      axios.get(`/api/theodoimuonsach/sach/${maSach}`),
    ])
      .then(([sachRes, phieuMuonRes]) => {
        setSach(sachRes.data);
        setPhieuMuonList(phieuMuonRes.data || []);
        // Reset về trang 1 khi load data mới
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin sách");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maSach]);

  // THÊM: Tính toán phân trang
  const totalPages = Math.ceil(phieuMuonList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPhieuMuon = phieuMuonList.slice(startIndex, endIndex);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  const getTrangThaiClass = (trangThai: string) => {
    switch (trangThai?.toLowerCase()) {
      case "đang mượn":
      case "dang_muon":
        return "dang-muon";
      case "quá hạn":
      case "qua_han":
        return "qua-han";
      case "đã trả":
      case "da_tra":
        return "da-tra";
      default:
        return "dang-muon";
    }
  };

  if (loading) {
    return (
      <div className={styles["sach-details"]}>
        <div className={styles["loading"]}>⏳ Đang tải thông tin sách...</div>
      </div>
    );
  }

  if (error || !sach) {
    return (
      <div className={styles["sach-details"]}>
        <Link to="/admin/sach" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>
          {error || "❌ Không tìm thấy sách!"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["sach-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/sach" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>

        <h2 className={styles["page-title"]}>📖 Chi tiết sách</h2>

        <div className={styles["spacer"]}></div>
      </div>

      {/* Tab Navigation */}
      <div className={styles["tab-navigation"]}>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "info" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("info")}
        >
          📄 Thông tin
        </button>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "phieu-muon" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("phieu-muon")}
        >
          📋 Phiếu mượn ({phieuMuonList.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles["tab-content"]}>
        {activeTab === "info" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["sach-info-section"]}>
              <div className={styles["sach-content"]}>
                <img
                  className={styles["img"]}
                  src={
                    sach.anhBia
                      ? (() => {
                          const pathParts = sach.anhBia.split("/");
                          const folder = pathParts[0];
                          const filename = pathParts[1];
                          return `http://localhost:8080/api/sach/image/${folder}/${filename}`;
                        })()
                      : ""
                  }
                  alt={sach.tenSach}
                />

                <div className={styles["sach-info"]}>
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Mã sách:</span>
                    <span className={styles["info-value"]}>{sach.maSach}</span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Tên sách:</span>
                    <span className={styles["info-value"]}>{sach.tenSach}</span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Tác giả:</span>
                    <span className={styles["info-value"]}>{sach.tacGia}</span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Nhà xuất bản:</span>
                    <span className={styles["info-value"]}>
                      {sach.nhaXuatBan}
                    </span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Năm xuất bản:</span>
                    <span className={styles["info-value"]}>
                      {formatDate(sach.namXuatBan)}
                    </span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Thể loại:</span>
                    <div className={styles["info-value"]}>
                      <div className={styles["theloai-tags"]}>
                        {sach.theLoais?.map((theLoai, index) => (
                          <span key={index} className={styles["theloai-tag"]}>
                            {theLoai}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Số quyển:</span>
                    <span className={styles["info-value"]}>{sach.soQuyen}</span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Số lượng:</span>
                    <span className={styles["info-value"]}>{sach.soLuong}</span>
                  </div>

                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Đơn giá:</span>
                    <span
                      className={`${styles["info-value"]} ${styles["price"]}`}
                    >
                      {formatPrice(sach.donGia)}
                    </span>
                  </div>

                  {sach.diemDanhGia && (
                    <div className={styles["info-item"]}>
                      <span className={styles["info-label"]}>Đánh giá:</span>
                      <span
                        className={`${styles["info-value"]} ${styles["rating"]}`}
                      >
                        ⭐ {sach.diemDanhGia}/5
                      </span>
                    </div>
                  )}

                  {sach.giamGia && (
                    <div className={styles["info-item"]}>
                      <span className={styles["info-label"]}>Giảm giá:</span>
                      <span
                        className={`${styles["info-value"]} ${styles["discount"]}`}
                      >
                        {sach.giamGia}%
                      </span>
                    </div>
                  )}

                  {sach.moTa && (
                    <div className={styles["info-item"]}>
                      <span className={styles["info-label"]}>Mô tả:</span>
                      <div
                        className={`${styles["info-value"]} ${styles["mota-content"]}`}
                      >
                        {sach.moTa}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "phieu-muon" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["phieu-muon-section"]}>
              {/* THÊM: Header với thông tin phân trang */}
              {phieuMuonList.length > 0 && (
                <div className={styles["phieu-muon-header"]}>
                  <div className={styles["total-info"]}>
                    📋 Tổng cộng: <strong>{phieuMuonList.length}</strong> phiếu
                    mượn
                    {totalPages > 1 && (
                      <span className={styles["page-info"]}>
                        | Trang {currentPage}/{totalPages} (Hiển thị{" "}
                        {startIndex + 1}-
                        {Math.min(endIndex, phieuMuonList.length)} trong số{" "}
                        {phieuMuonList.length})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {phieuMuonList.length === 0 ? (
                <div className={styles["no-data"]}>
                  <p>📚 Hiện tại không có ai đang mượn sách này</p>
                </div>
              ) : (
                <>
                  <div className={styles["table-container"]}>
                    <table className={styles["data-table"]}>
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Mã độc giả</th>
                          <th>Ngày mượn</th>
                          <th>Ngày trả</th>
                          <th>Trạng thái</th>
                          <th>Mã nhân viên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPhieuMuon.map((pm, idx) => (
                          <tr key={idx}>
                            <td>{startIndex + idx + 1}</td>
                            <td>
                              <span
                                className={styles["ma-docgia"]}
                                title={pm.maDocGia}
                              >
                                {pm.maDocGia}
                              </span>
                            </td>
                            <td>{formatDate(pm.ngayMuon)}</td>
                            <td>
                              {pm.ngayTra ? formatDate(pm.ngayTra) : "Chưa trả"}
                            </td>
                            <td>
                              <span
                                className={`${styles["trang-thai"]} ${
                                  styles[getTrangThaiClass(pm.trangThaiMuon)]
                                }`}
                              >
                                {pm.trangThaiMuon}
                              </span>
                            </td>
                            <td>
                              <span
                                className={styles["ma-nhanvien"]}
                                title={pm.maNhanVien}
                              >
                                {pm.maNhanVien}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* THÊM: Pagination Controls */}
                  {totalPages > 1 && (
                    <nav aria-label="Phân trang phiếu mượn">
                      <ul className={styles["pagination"]}>
                        <li>
                          <button
                            disabled={currentPage === 1}
                            onClick={handlePrevPage}
                          >
                            &laquo; Trước
                          </button>
                        </li>
                        {getPageNumbers().map((pageNum) => (
                          <li key={pageNum}>
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              disabled={pageNum === currentPage}
                            >
                              {pageNum}
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            disabled={currentPage === totalPages}
                            onClick={handleNextPage}
                          >
                            Sau &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SachDetails;
