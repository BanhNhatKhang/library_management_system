import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/orders/DHDetails.css";

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
  soLuong: number;
  donGia: number;
  tongTien: number;
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
    axios
      .get(`/api/chitietdonhang/donhang/${maDonHang}`)
      .then((res) => setChiTietList(res.data))
      .catch(() => setChiTietList([]));
  }, [maDonHang]);

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
    <div className="dh-details">
      <div className="header-container">
        <Link to="/admin/donhang" className="back-link">
          ← Quay lại danh sách
        </Link>
        <h2 className="page-title">📦 Chi tiết đơn hàng</h2>
        <div className="spacer"></div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${active === "docgia" ? "active" : ""}`}
          onClick={() => setActive("docgia")}
        >
          👤 Độc giả
        </button>
        <button
          className={`tab-button ${active === "chitiet" ? "active" : ""}`}
          onClick={() => setActive("chitiet")}
        >
          📚 Sách trong đơn ({chiTietList.length})
        </button>
        <button
          className={`tab-button ${active === "uudai" ? "active" : ""}`}
          onClick={() => setActive("uudai")}
        >
          🎁 Ưu đãi ({donHang.uuDais?.length || 0})
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {/* Thông tin độc giả */}
        {active === "docgia" && (
          <div className="tab-panel">
            {docGia ? (
              <div className="info-section">
                <div className="info-item">
                  <span className="info-label">Mã độc giả:</span>
                  <span className="info-value">{docGia.maDocGia}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Họ tên:</span>
                  <span className="info-value">
                    {docGia.hoLot} {docGia.ten}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Điện thoại:</span>
                  <span className="info-value">{docGia.dienThoai}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{docGia.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày đặt hàng:</span>
                  <span className="info-value">
                    {formatDate(donHang.ngayDat)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tổng tiền:</span>
                  <span className="info-value">
                    {formatPrice(donHang.tongTien)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-data">❌ Không tìm thấy thông tin độc giả</div>
            )}
          </div>
        )}

        {/* Chi tiết sách trong đơn */}
        {active === "chitiet" && (
          <div className="tab-panel">
            {chiTietList.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {chiTietList.map((ct) => (
                    <tr key={`${ct.maSach}-${ct.maDonHang}`}>
                      <td>{ct.maSach}</td>
                      <td>{ct.soLuong}</td>
                      <td>{formatPrice(ct.donGia)}</td>
                      <td>{formatPrice(ct.tongTien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">📚 Không có sách trong đơn hàng</div>
            )}
          </div>
        )}

        {/* Ưu đãi */}
        {active === "uudai" && (
          <div className="tab-panel">
            {donHang.uuDais && donHang.uuDais.length > 0 ? (
              <table>
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
            ) : (
              <div className="no-data">🎁 Không có ưu đãi áp dụng</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DHDetails;
