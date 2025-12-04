import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/readers/DGDetails.module.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
  trangThai?: string;
}

interface TheoDoi {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra?: string | null;
  trangThaiMuon?: string;
}

interface DonHangItem {
  maDonHang: string;
  tenSach?: string;
  tongTien?: number;
  ngayDat?: string;
  trangThai?: string;
}

const DGDetails: React.FC = () => {
  const { maDocGia } = useParams<{ maDocGia: string }>();
  const [docGia, setDocGia] = useState<DocGia | null>(null);
  const [muonList, setMuonList] = useState<TheoDoi[]>([]);
  const [donHangList, setDonHangList] = useState<DonHangItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<"info" | "sach-muon" | "don-hang">(
    "info"
  );

  // THÊM: States cho phân trang
  const [currentPageMuon, setCurrentPageMuon] = useState(1);
  const [currentPageDonHang, setCurrentPageDonHang] = useState(1);
  const [itemsPerPage] = useState(5); // 5 items mỗi trang

  useEffect(() => {
    if (!maDocGia) return;
    setLoading(true);
    axios
      .get(`/api/docgia/${maDocGia}`)
      .then((r) => setDocGia(r.data))
      .catch(() => setDocGia(null))
      .finally(() => setLoading(false));

    // load sách mượn
    axios
      .get(`/api/theodoimuonsach/${maDocGia}`)
      .then((r) => {
        setMuonList(r.data || []);
        setCurrentPageMuon(1); // Reset page khi load data mới
      })
      .catch(console.error);
  }, [maDocGia]);

  useEffect(() => {
    if (docGia?.dienThoai) {
      console.log("📞 Loading orders for phone:", docGia.dienThoai);
      axios
        .get(`/api/donhang/sdt/${docGia.dienThoai}`)
        .then((r) => {
          console.log("📦 Orders response:", r.data);
          setDonHangList(r.data || []);
          setCurrentPageDonHang(1); // Reset page khi load data mới
        })
        .catch((error) => {
          console.error("❌ Error loading orders:", error);
        });
    }
  }, [docGia]);

  // THÊM: Tính toán phân trang cho sách mượn
  const totalPagesMuon = Math.ceil(muonList.length / itemsPerPage);
  const startIndexMuon = (currentPageMuon - 1) * itemsPerPage;
  const endIndexMuon = startIndexMuon + itemsPerPage;
  const currentMuonList = muonList.slice(startIndexMuon, endIndexMuon);

  // THÊM: Tính toán phân trang cho đơn hàng
  const totalPagesDonHang = Math.ceil(donHangList.length / itemsPerPage);
  const startIndexDonHang = (currentPageDonHang - 1) * itemsPerPage;
  const endIndexDonHang = startIndexDonHang + itemsPerPage;
  const currentDonHangList = donHangList.slice(
    startIndexDonHang,
    endIndexDonHang
  );

  // THÊM: Handlers cho phân trang sách mượn
  const handlePageChangeMuon = (page: number) => {
    setCurrentPageMuon(page);
  };

  const handlePrevPageMuon = () => {
    if (currentPageMuon > 1) {
      setCurrentPageMuon(currentPageMuon - 1);
    }
  };

  const handleNextPageMuon = () => {
    if (currentPageMuon < totalPagesMuon) {
      setCurrentPageMuon(currentPageMuon + 1);
    }
  };

  // THÊM: Handlers cho phân trang đơn hàng
  const handlePageChangeDonHang = (page: number) => {
    setCurrentPageDonHang(page);
  };

  const handlePrevPageDonHang = () => {
    if (currentPageDonHang > 1) {
      setCurrentPageDonHang(currentPageDonHang - 1);
    }
  };

  const handleNextPageDonHang = () => {
    if (currentPageDonHang < totalPagesDonHang) {
      setCurrentPageDonHang(currentPageDonHang + 1);
    }
  };

  // THÊM: Generate page numbers
  const getPageNumbers = (currentPage: number, totalPages: number) => {
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

  // THÊM: Pagination component
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    onPrevPage,
    onNextPage,
    itemType,
    startIndex,
    endIndex,
    totalItems,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    itemType: string;
    startIndex: number;
    endIndex: number;
    totalItems: number;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className={styles["pagination-container"]}>
        <div className={styles["pagination-info"]}>
          Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong số{" "}
          {totalItems} {itemType}
        </div>

        <div className={styles["pagination-controls"]}>
          <button
            className={`${styles["pagination-btn"]} ${styles["nav-btn"]} ${
              currentPage === 1 ? styles["disabled"] : ""
            }`}
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            ◀ Trước
          </button>

          {getPageNumbers(currentPage, totalPages).map((page) => (
            <button
              key={page}
              className={`${styles["pagination-btn"]} ${
                page === currentPage ? styles["active"] : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={`${styles["pagination-btn"]} ${styles["nav-btn"]} ${
              currentPage === totalPages ? styles["disabled"] : ""
            }`}
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Sau ▶
          </button>
        </div>

        <div className={styles["pagination-summary"]}>
          <span className={styles["items-per-page"]}>
            {itemsPerPage} {itemType}/trang
          </span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!docGia)
    return (
      <div className="p-3">
        <Link to="/admin/docgia" className="btn btn-secondary mb-3">
          ← Quay lại
        </Link>
        <div>Không tìm thấy độc giả</div>
      </div>
    );

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";
  const formatPrice = (p?: number) =>
    p != null ? new Intl.NumberFormat("vi-VN").format(p) + " đ" : "—";

  return (
    <div className={styles["dg-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/docgia" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <h2 className={styles["page-title"]}>📖 Chi tiết độc giả</h2>
        <div className={styles["spacer"]}></div>
      </div>

      <div className={styles["tab-navigation"]}>
        <button
          className={`${styles["tab-button"]} ${
            active === "info" ? styles["active"] : ""
          }`}
          onClick={() => setActive("info")}
        >
          📄 Thông tin
        </button>
        <button
          className={`${styles["tab-button"]} ${
            active === "sach-muon" ? styles["active"] : ""
          }`}
          onClick={() => setActive("sach-muon")}
        >
          📚 Sách mượn ({muonList.length})
        </button>
        <button
          className={`${styles["tab-button"]} ${
            active === "don-hang" ? styles["active"] : ""
          }`}
          onClick={() => setActive("don-hang")}
        >
          🧾 Đơn hàng ({donHangList.length})
        </button>
      </div>

      <div className={styles["tab-content"]}>
        {active === "info" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["info-section"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã độc giả:</span>
                <span className={styles["info-value"]}>{docGia.maDocGia}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Họ tên:</span>
                <span className={styles["info-value"]}>
                  {docGia.hoLot} {docGia.ten}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Điện thoại:</span>
                <span className={styles["info-value"]}>{docGia.dienThoai}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Email:</span>
                <span className={styles["info-value"]}>{docGia.email}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Địa chỉ:</span>
                <span className={styles["info-value"]}>
                  {docGia.diaChi || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Ngày sinh:</span>
                <span className={styles["info-value"]}>
                  {formatDate(docGia.ngaySinh)}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Trạng thái:</span>
                <span className={styles["info-value"]}>
                  {docGia.trangThai || "—"}
                </span>
              </div>

              <button
                className={styles["btn-edit"]}
                onClick={() =>
                  (window.location.href = `/admin/docgia/edit/${docGia.maDocGia}`)
                }
              >
                ✏️ Chỉnh sửa
              </button>
            </div>
          </div>
        )}

        {/* SỬA: Tab sách mượn với phân trang */}
        {active === "sach-muon" && (
          <div className={styles["tab-panel"]}>
            {muonList.length === 0 ? (
              <div className={styles["no-data"]}>📚 Không có sách mượn</div>
            ) : (
              <>
                <div className={styles["table-container"]}>
                  <table className={styles["data-table"]}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã sách</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMuonList.map((m, index) => {
                        const statusKey = (
                          m.trangThaiMuon || "dang-muon"
                        ).toLowerCase();
                        return (
                          <tr key={`${m.maSach}-${m.ngayMuon}`}>
                            <td>{startIndexMuon + index + 1}</td>
                            <td>
                              <span
                                className={styles["ma-sach"]}
                                title={m.maSach}
                              >
                                {m.maSach}
                              </span>
                            </td>
                            <td>{formatDate(m.ngayMuon)}</td>
                            <td>{formatDate(m.ngayTra || "")}</td>
                            <td>
                              <span
                                className={`${styles["trang-thai"]} ${
                                  styles[statusKey] ?? ""
                                }`}
                              >
                                {m.trangThaiMuon}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* THÊM: Pagination cho sách mượn */}
                <PaginationControls
                  currentPage={currentPageMuon}
                  totalPages={totalPagesMuon}
                  onPageChange={handlePageChangeMuon}
                  onPrevPage={handlePrevPageMuon}
                  onNextPage={handleNextPageMuon}
                  itemType="sách mượn"
                  startIndex={startIndexMuon}
                  endIndex={endIndexMuon}
                  totalItems={muonList.length}
                />
              </>
            )}
          </div>
        )}

        {/* SỬA: Tab đơn hàng với phân trang */}
        {active === "don-hang" && (
          <div className={styles["tab-panel"]}>
            {donHangList.length === 0 ? (
              <div className={styles["no-data"]}>🧾 Chưa có đơn hàng</div>
            ) : (
              <>
                <div className={styles["table-container"]}>
                  <table className={styles["data-table"]}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã ĐH</th>
                        <th>Tên sách</th>
                        <th>Tổng tiền</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDonHangList.map((d, index) => (
                        <tr key={d.maDonHang}>
                          <td>{startIndexDonHang + index + 1}</td>
                          <td>
                            <span
                              className={styles["ma-don-hang"]}
                              title={d.maDonHang}
                            >
                              {d.maDonHang}
                            </span>
                          </td>
                          <td>
                            <span
                              className={styles["ten-sach"]}
                              title={d.tenSach || "Không có tên sách"}
                            >
                              {d.tenSach || "—"}
                            </span>
                          </td>
                          <td className={styles["gia-tien"]}>
                            {formatPrice(d.tongTien)}
                          </td>
                          <td>{formatDate(d.ngayDat)}</td>
                          <td>
                            <span
                              className={`${styles["trang-thai"]} ${styles["trang-thai-don-hang"]}`}
                            >
                              {d.trangThai || "Đang xử lý"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* THÊM: Pagination cho đơn hàng */}
                <PaginationControls
                  currentPage={currentPageDonHang}
                  totalPages={totalPagesDonHang}
                  onPageChange={handlePageChangeDonHang}
                  onPrevPage={handlePrevPageDonHang}
                  onNextPage={handleNextPageDonHang}
                  itemType="đơn hàng"
                  startIndex={startIndexDonHang}
                  endIndex={endIndexDonHang}
                  totalItems={donHangList.length}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DGDetails;
