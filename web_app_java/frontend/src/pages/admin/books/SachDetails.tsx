import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/books/SachDetails.css";

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
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin sách");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maSach]);

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
      <div className="sach-details">
        <div className="loading">⏳ Đang tải thông tin sách...</div>
      </div>
    );
  }

  if (error || !sach) {
    return (
      <div className="sach-details">
        <Link to="/admin/sach" className="back-link">
          ← Quay lại danh sách
        </Link>
        <div className="error">{error || "❌ Không tìm thấy sách!"}</div>
      </div>
    );
  }

  return (
    <div className="sach-details">
      <div className="header-container">
        <Link to="/admin/sach" className="back-link">
          ← Quay lại danh sách
        </Link>

        <h2 className="page-title">📖 Chi tiết sách</h2>

        <div className="spacer"></div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          📄 Thông tin
        </button>
        <button
          className={`tab-button ${activeTab === "phieu-muon" ? "active" : ""}`}
          onClick={() => setActiveTab("phieu-muon")}
        >
          📋 Phiếu mượn ({phieuMuonList.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "info" && (
          <div className="tab-panel">
            <div className="sach-info-section">
              <div className="sach-content">
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
                        : ""
                    }
                    alt={sach.tenSach}
                  />
                </div>

                <div className="sach-info">
                  <div className="info-item">
                    <span className="info-label">Mã sách:</span>
                    <span className="info-value">{sach.maSach}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Tên sách:</span>
                    <span className="info-value">{sach.tenSach}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Tác giả:</span>
                    <span className="info-value">{sach.tacGia}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Nhà xuất bản:</span>
                    <span className="info-value">{sach.nhaXuatBan}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Năm xuất bản:</span>
                    <span className="info-value">
                      {formatDate(sach.namXuatBan)}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Thể loại:</span>
                    <div className="info-value">
                      <div className="theloai-tags">
                        {sach.theLoais?.map((theLoai, index) => (
                          <span key={index} className="theloai-tag">
                            {theLoai}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Số quyển:</span>
                    <span className="info-value">{sach.soQuyen}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Số lượng:</span>
                    <span className="info-value">{sach.soLuong}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Đơn giá:</span>
                    <span className="info-value price">
                      {formatPrice(sach.donGia)}
                    </span>
                  </div>

                  {sach.diemDanhGia && (
                    <div className="info-item">
                      <span className="info-label">Đánh giá:</span>
                      <span className="info-value rating">
                        ⭐ {sach.diemDanhGia}/5
                      </span>
                    </div>
                  )}

                  {sach.giamGia && (
                    <div className="info-item">
                      <span className="info-label">Giảm giá:</span>
                      <span className="info-value discount">
                        {sach.giamGia}%
                      </span>
                    </div>
                  )}

                  {sach.moTa && (
                    <div className="info-item">
                      <span className="info-label">Mô tả:</span>
                      <div className="info-value mota-content">{sach.moTa}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "phieu-muon" && (
          <div className="tab-panel">
            <div className="phieu-muon-section">
              {phieuMuonList.length === 0 ? (
                <div className="no-data">
                  <p>📚 Hiện tại không có ai đang mượn sách này</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="phieu-muon-table">
                    <thead>
                      <tr>
                        <th>Mã độc giả</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                        <th>Mã nhân viên</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phieuMuonList.map((pm, idx) => (
                        <tr key={idx}>
                          <td>{pm.maDocGia}</td>
                          <td>{formatDate(pm.ngayMuon)}</td>
                          <td>
                            {pm.ngayTra ? formatDate(pm.ngayTra) : "Chưa trả"}
                          </td>
                          <td>
                            <span
                              className={`trang-thai ${getTrangThaiClass(
                                pm.trangThaiMuon
                              )}`}
                            >
                              {pm.trangThaiMuon}
                            </span>
                          </td>
                          <td>{pm.maNhanVien}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SachDetails;
