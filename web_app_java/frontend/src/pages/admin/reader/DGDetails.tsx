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
      .then((r) => setMuonList(r.data || []))
      .catch(console.error);

    // load đơn hàng theo điện thoại (backend có endpoint /api/donhang/sdt/{dienThoai})
    // we will load later after fetching docgia to get phone
  }, [maDocGia]);

  useEffect(() => {
    if (docGia?.dienThoai) {
      axios
        .get(`/api/donhang/sdt/${docGia.dienThoai}`)
        .then((r) => setDonHangList(r.data || []))
        .catch(console.error);
    }
  }, [docGia]);

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

        {active === "sach-muon" && (
          <div className={styles["tab-panel"]}>
            {muonList.length === 0 ? (
              <div className={styles["no-data"]}>📚 Không có sách mượn</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {muonList.map((m) => {
                    const statusKey = (
                      m.trangThaiMuon || "dang-muon"
                    ).toLowerCase();
                    return (
                      <tr key={`${m.maSach}-${m.ngayMuon}`}>
                        <td>{m.maSach}</td>
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
            )}
          </div>
        )}

        {active === "don-hang" && (
          <div className={styles["tab-panel"]}>
            {donHangList.length === 0 ? (
              <div className={styles["no-data"]}>🧾 Chưa có đơn hàng</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Tên sách</th>
                    <th>Tổng tiền</th>
                    <th>Ngày đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {donHangList.map((d) => (
                    <tr key={d.maDonHang}>
                      <td>{d.maDonHang}</td>
                      <td>{d.tenSach || "—"}</td>
                      <td>{formatPrice(d.tongTien)}</td>
                      <td>{formatDate(d.ngayDat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DGDetails;
