import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/category/TheLoaiDetails.css";

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

  useEffect(() => {
    if (!maTheLoai) return;

    setLoading(true);
    setError("");

    // Lấy thông tin thể loại và sách thuộc thể loại
    Promise.all([
      axios.get(`/api/theloai/${maTheLoai}`),
      axios.get(`/api/sach/theloai/${maTheLoai}`),
    ])
      .then(([theLoaiRes, sachRes]) => {
        setTheLoai(theLoaiRes.data);
        setSachList(sachRes.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin thể loại");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maTheLoai]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  if (loading) {
    return (
      <div className="theloai-details">
        <div className="loading">⏳ Đang tải thông tin thể loại...</div>
      </div>
    );
  }

  if (error || !theLoai) {
    return (
      <div className="theloai-details">
        <Link to="/admin/theloai" className="back-link">
          ← Quay lại danh sách
        </Link>
        <div className="error">{error || "❌ Không tìm thấy thể loại!"}</div>
      </div>
    );
  }

  return (
    <div className="theloai-details">
      <Link to="/admin/theloai" className="back-link">
        ← Quay lại danh sách
      </Link>

      <h2 className="page-title">🏷️ Chi tiết thể loại</h2>

      <div className="main-container">
        {/* Cột trái - Thông tin thể loại */}
        <div className="theloai-info-section">
          <h3 className="theloai-info-title">Thông tin chi tiết</h3>

          <div className="theloai-content">
            <div className="theloai-info">
              <div className="info-item">
                <span className="info-label">Mã thể loại:</span>
                <span className="info-value">{theLoai.maTheLoai}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Tên thể loại:</span>
                <span className="info-value">{theLoai.tenTheLoai}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Số sách thuộc thể loại:</span>
                <span className="info-value stats">{sachList.length} sách</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Sách thuộc thể loại */}
        <div className="sach-section">
          <h3 className="sach-title">
            📚 Sách thuộc thể loại ({sachList.length})
          </h3>

          {sachList.length === 0 ? (
            <div className="no-data">
              <p>📚 Hiện tại chưa có sách nào thuộc thể loại này</p>
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
                          : "/images/no-image.png"
                      }
                      alt={sach.tenSach}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/no-image.png";
                      }}
                    />
                  </div>
                  <div className="sach-info">
                    <h4 className="sach-name">{sach.tenSach}</h4>
                    <p className="sach-author">Tác giả: {sach.tacGia}</p>
                    <p className="sach-price">{formatPrice(sach.donGia)}</p>
                    <p className="sach-quantity">Số lượng: {sach.soLuong}</p>
                    <div className="sach-actions">
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className="view-btn"
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i> Xem
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

export default TheLoaiDetails;
