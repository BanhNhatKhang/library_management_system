import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/orders/DHDetails.module.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
}

interface UuDai {
  maUuDai: string;
  tenUuDai: string;
  phanTramGiam: number;
  ngayBatDau?: string;
  ngayKetThuc?: string;
}

interface DonHang {
  maDonHang: string;
  ngayDat: string;
  tongTien: number;
  trangThaiDonHang: string;
  maDocGia: string;
  uuDais?: UuDai[];
}

interface ChiTietDonHang {
  maDonHang: string;
  maSach: string;
  tenSach?: string; // THÊM
  tacGia?: string; // THÊM
  anhBia?: string; // THÊM
  soLuong: number;
  donGia: number;
  thanhTien?: number;
}

const DHDetails: React.FC = () => {
  const { maDonHang } = useParams<{ maDonHang: string }>();
  const [donHang, setDonHang] = useState<DonHang | null>(null);
  const [docGia, setDocGia] = useState<DocGia | null>(null);
  const [chiTietList, setChiTietList] = useState<ChiTietDonHang[]>([]);
  const [active, setActive] = useState<"docgia" | "chitiet" | "uudai">(
    "docgia"
  );
  const [loading, setLoading] = useState(true);

  // Lấy thông tin đơn hàng (chung)
  useEffect(() => {
    if (!maDonHang) return;
    setLoading(true);
    axios
      .get(`/api/donhang/id/${maDonHang}`)
      .then((res) => setDonHang(res.data))
      .catch(() => setDonHang(null))
      .finally(() => setLoading(false));
  }, [maDonHang]);

  // Lấy thông tin độc giả
  useEffect(() => {
    if (donHang?.maDocGia) {
      axios
        .get(`/api/docgia/${donHang.maDocGia}`)
        .then((res) => setDocGia(res.data))
        .catch(() => setDocGia(null));
    }
  }, [donHang]);

  // Lấy chi tiết đơn hàng
  useEffect(() => {
    if (!maDonHang) return;

    console.log("🔍 Fetching chi tiet for order:", maDonHang);

    // SỬA: Sử dụng endpoint có sẵn trong DonHangController
    axios
      .get(`/api/donhang/${maDonHang}/chitiet`) // Endpoint mới
      .then((res) => {
        console.log("✅ Chi tiet response:", res.data);
        setChiTietList(res.data || []);
      })
      .catch((error) => {
        console.error("❌ Error fetching chi tiet:", error);
        console.error("❌ Error response:", error.response?.data);

        // FALLBACK: Nếu endpoint không có, thử cách khác
        console.log("🔄 Trying alternative approach...");

        // Lấy từ thông tin đơn hàng đã có
        if (donHang) {
          // Có thể backend đã include chi tiết trong response đơn hàng
          console.log("📦 Current donHang data:", donHang);
        }

        setChiTietList([]);
      });
  }, [maDonHang, donHang]); // Thêm donHang vào dependency

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";
  const formatPrice = (p?: number) =>
    p != null ? new Intl.NumberFormat("vi-VN").format(p) + " đ" : "—";

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!donHang)
    return (
      <div className="p-3">
        <Link to="/admin/donhang" className="btn btn-secondary mb-3">
          ← Quay lại
        </Link>
        <div>Không tìm thấy đơn hàng</div>
      </div>
    );

  return (
    <div className={styles["dh-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/donhang" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <h2 className={styles["page-title"]}>📦 Chi tiết đơn hàng</h2>
        <div className={styles["spacer"]}></div>
      </div>

      {/* Tabs */}
      <div className={styles["tab-navigation"]}>
        <button
          className={styles["tab-button"]}
          onClick={() => setActive("docgia")}
          style={
            active === "docgia"
              ? {
                  color: "#0d6efd",
                  borderBottomColor: "#0d6efd",
                  fontWeight: 600,
                }
              : undefined
          }
        >
          👤 Độc giả
        </button>
        <button
          className={styles["tab-button"]}
          onClick={() => setActive("chitiet")}
          style={
            active === "chitiet"
              ? {
                  color: "#0d6efd",
                  borderBottomColor: "#0d6efd",
                  fontWeight: 600,
                }
              : undefined
          }
        >
          📚 Sách trong đơn ({chiTietList.length})
        </button>
        <button
          className={styles["tab-button"]}
          onClick={() => setActive("uudai")}
          style={
            active === "uudai"
              ? {
                  color: "#0d6efd",
                  borderBottomColor: "#0d6efd",
                  fontWeight: 600,
                }
              : undefined
          }
        >
          🎁 Ưu đãi ({donHang.uuDais?.length || 0})
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {/* Thông tin độc giả */}
        {active === "docgia" && (
          <div className={styles["tab-panel"]}>
            {docGia ? (
              <div className={styles["info-section"]}>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Mã độc giả:</span>
                  <span className={styles["info-value"]}>
                    {docGia.maDocGia}
                  </span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Họ tên:</span>
                  <span className={styles["info-value"]}>
                    {docGia.hoLot} {docGia.ten}
                  </span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Điện thoại:</span>
                  <span className={styles["info-value"]}>
                    {docGia.dienThoai}
                  </span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Email:</span>
                  <span className={styles["info-value"]}>{docGia.email}</span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Ngày đặt hàng:</span>
                  <span className={styles["info-value"]}>
                    {formatDate(donHang.ngayDat)}
                  </span>
                </div>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Tổng tiền:</span>
                  <span className={styles["info-value"]}>
                    {formatPrice(donHang.tongTien)}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles["no-data"]}>
                ❌ Không tìm thấy thông tin độc giả
              </div>
            )}
          </div>
        )}

        {/* Chi tiết sách trong đơn */}
        {active === "chitiet" && (
          <div className={styles["tab-panel"]}>
            {chiTietList.length > 0 ? (
              <div className={styles["table-container"]}>
                <table className={styles["data-table"]}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã sách</th>
                      <th>Tên sách</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chiTietList.map((ct, index) => (
                      <tr key={`${ct.maSach}-${ct.maDonHang}`}>
                        <td>{index + 1}</td>
                        <td>
                          <span className={styles["ma-sach"]} title={ct.maSach}>
                            {ct.maSach}
                          </span>
                        </td>
                        <td>
                          <span
                            className={styles["ten-sach"]}
                            title={ct.tenSach}
                          >
                            {ct.tenSach || "—"}
                          </span>
                        </td>
                        <td className={styles["so-luong"]}>{ct.soLuong}</td>
                        <td className={styles["gia-tien"]}>
                          {formatPrice(ct.donGia)}
                        </td>
                        <td className={styles["thanh-tien"]}>
                          {formatPrice(ct.thanhTien || ct.donGia * ct.soLuong)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles["total-section"]}>
                  <div className={styles["total-row"]}>
                    <span>Tổng số lượng:</span>
                    <span>
                      {chiTietList.reduce((sum, ct) => sum + ct.soLuong, 0)}{" "}
                      cuốn
                    </span>
                  </div>
                  <div className={styles["total-row"]}>
                    <span>Tổng tiền:</span>
                    <span className={styles["total-amount"]}>
                      {formatPrice(
                        chiTietList.reduce(
                          (sum, ct) =>
                            sum + (ct.thanhTien || ct.donGia * ct.soLuong),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles["no-data"]}>
                <div className={styles["empty-state"]}>
                  <h3>📦 Không có sách trong đơn hàng</h3>
                  <p>
                    Đơn hàng <strong>{maDonHang}</strong> chưa có chi tiết sách.
                  </p>
                  <p className={styles["suggestion"]}>
                    💡 Có thể đơn hàng này đang được xử lý hoặc chưa được thêm
                    sách.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ưu đãi */}
        {active === "uudai" && (
          <div className={styles["tab-panel"]}>
            {donHang.uuDais && donHang.uuDais.length > 0 ? (
              <div className={styles["table-container"]}>
                <table className={styles["data-table"]}>
                  <thead>
                    <tr>
                      <th>Mã ưu đãi</th>
                      <th>Tên ưu đãi</th>
                      <th>Phần trăm giảm</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donHang.uuDais.map((u) => (
                      <tr key={u.maUuDai}>
                        <td>{u.maUuDai}</td>
                        <td>{u.tenUuDai}</td>
                        <td>{u.phanTramGiam}%</td>
                        <td>{formatDate(u.ngayBatDau)}</td>
                        <td>{formatDate(u.ngayKetThuc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles["no-data"]}>
                <div className={styles["empty-state"]}>
                  <h3>🎁 Không có ưu đãi áp dụng</h3>
                  <p>Đơn hàng này chưa sử dụng ưu đãi nào.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DHDetails;
