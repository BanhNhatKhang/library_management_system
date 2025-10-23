import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/publisher/NXBDetails.css";

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

  useEffect(() => {
    if (!maNhaXuatBan) return;

    setLoading(true);
    setError("");

    // Lấy thông tin nhà xuất bản và sách của nhà xuất bản
    Promise.all([
      axios.get(`/api/nhaxuatban/${maNhaXuatBan}`),
      axios.get(`/api/sach/nxb/${encodeURIComponent(maNhaXuatBan)}`),
    ])
      .then(([nxbRes, sachRes]) => {
        setNxb(nxbRes.data);
        setSachList(sachRes.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin nhà xuất bản");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maNhaXuatBan]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  if (loading) {
    return (
      <div className="nxb-details">
        <div className="loading">⏳ Đang tải thông tin nhà xuất bản...</div>
      </div>
    );
  }

  if (error || !nxb) {
    return (
      <div className="nxb-details">
        <Link to="/admin/nxb" className="back-link">
          ← Quay lại danh sách
        </Link>
        <div className="error">
          {error || "❌ Không tìm thấy nhà xuất bản!"}
        </div>
      </div>
    );
  }

  return (
    <div className="nxb-details">
      <Link to="/admin/nxb" className="back-link">
        ← Quay lại danh sách
      </Link>

      <h2 className="page-title">🏢 Chi tiết nhà xuất bản</h2>

      <div className="main-container">
        {/* Cột trái - Thông tin nhà xuất bản */}
        <div className="nxb-info-section">
          <h3 className="nxb-info-title">Thông tin chi tiết</h3>

          <div className="nxb-content">
            <div className="nxb-info">
              <div className="info-item">
                <span className="info-label">Mã NXB:</span>
                <span className="info-value">{nxb.maNhaXuatBan}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Tên NXB:</span>
                <span className="info-value">{nxb.tenNhaXuatBan}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{nxb.diaChi}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Số lượng sách:</span>
                <span className="info-value stats">{sachList.length} cuốn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Sách của nhà xuất bản */}
        <div className="sach-section">
          <h3 className="sach-title">
            📚 Sách của nhà xuất bản ({sachList.length})
          </h3>

          {sachList.length === 0 ? (
            <div className="no-data">
              <p>📚 Hiện tại chưa có sách nào của nhà xuất bản này</p>
            </div>
          ) : (
            <div className="sach-grid">
              {sachList.map((sach) => (
                <div key={sach.maSach} className="sach-card">
                  <div className="sach-image">
                    <img
                      src={
                        sach.anhBia
                          ? (() => {
                              const pathParts = sach.anhBia.split("/");
                              const folder = pathParts[0];
                              const filename = pathParts[1];
                              return `http://localhost:8080/api/sach/image/${folder}/${filename}`;
                            })()
                          : "/default-book.png"
                      }
                      alt={sach.tenSach}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-book.png";
                      }}
                    />
                  </div>

                  <div className="sach-info">
                    <h4 className="sach-name">{sach.tenSach}</h4>
                    <p className="sach-author">👤 {sach.tacGia}</p>
                    <p className="sach-price">💰 {formatPrice(sach.donGia)}</p>
                    <p className="sach-quantity">📦 Còn lại: {sach.soLuong}</p>

                    <div className="sach-actions">
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className="view-btn"
                      >
                        👁️ Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NXBDetails;
