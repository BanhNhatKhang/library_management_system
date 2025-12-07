import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/borrow/MuonDetails.module.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  theLoais?: string[];
  anhBia?: string;
}

interface MuonSach {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra: string;
  trangThaiMuon: string;
  docGia: DocGia;
  sach: Sach;
}

const MuonDetails: React.FC = () => {
  const { maDocGia, maSach, ngayMuon } = useParams<{
    maDocGia: string;
    maSach: string;
    ngayMuon: string;
  }>();
  const [muonSach, setMuonSach] = useState<MuonSach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<"docgia" | "sach" | "phieumuon">(
    "docgia"
  );

  useEffect(() => {
    const fetchMuonSachDetails = async (
      mDocGia: string,
      mSach: string,
      nMuon: string
    ) => {
      try {
        const formattedNgayMuon = nMuon.includes(",")
          ? nMuon
              .split(",")
              .map((p) => p.trim())
              .join("-") // "yyyy,MM,dd" -> "yyyy-MM-dd"
          : nMuon;

        const url = `/api/theodoimuonsach/item?maDocGia=${encodeURIComponent(
          mDocGia
        )}&maSach=${encodeURIComponent(mSach)}&ngayMuon=${encodeURIComponent(
          formattedNgayMuon
        )}`;
        console.log("GET", url);
        const res = await axios.get(url);
        console.log("Muon item:", res.data);
        setMuonSach(res.data);
      } catch (err) {
        console.error("Error fetching loan details:", err);
        setError("Không thể tải thông tin phiếu mượn");
      } finally {
        setLoading(false);
      }
    };

    if (maDocGia && maSach && ngayMuon) {
      fetchMuonSachDetails(maDocGia, maSach, ngayMuon);
    }
  }, [maDocGia, maSach, ngayMuon]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  if (loading) {
    return (
      <div className={styles["muon-details"]}>
        <Link to="/admin/muontra" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["loading"]}>⏳ Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["muon-details"]}>
        <Link to="/admin/muontra" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>❌ {error}</div>
      </div>
    );
  }

  if (!muonSach) {
    return (
      <div className={styles["muon-details"]}>
        <Link to="/admin/muontra" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["not-found"]}>
          📋 Không tìm thấy thông tin phiếu mượn.
        </div>
      </div>
    );
  }

  const docGia = muonSach.docGia;
  const sach = muonSach.sach;

  return (
    <div className={styles["muon-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/muontra" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <h2 className={styles["page-title"]}>📖 Chi tiết phiếu mượn</h2>
        <div className={styles["spacer"]}></div>
      </div>

      {/* Tabs Navigation */}
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
          👤 Thông tin độc giả
        </button>
        <button
          className={styles["tab-button"]}
          onClick={() => setActive("sach")}
          style={
            active === "sach"
              ? {
                  color: "#0d6efd",
                  borderBottomColor: "#0d6efd",
                  fontWeight: 600,
                }
              : undefined
          }
        >
          📚 Thông tin sách
        </button>
        <button
          className={styles["tab-button"]}
          onClick={() => setActive("phieumuon")}
          style={
            active === "phieumuon"
              ? {
                  color: "#0d6efd",
                  borderBottomColor: "#0d6efd",
                  fontWeight: 600,
                }
              : undefined
          }
        >
          📋 Thông tin phiếu mượn
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Thông tin độc giả */}
        {active === "docgia" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["info-section"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã độc giả:</span>
                <span className={styles["info-value"]}>
                  {docGia?.maDocGia || muonSach.maDocGia || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Họ và tên:</span>
                <span className={styles["info-value"]}>
                  {docGia
                    ? `${docGia.hoLot || ""} ${docGia.ten || ""}`.trim()
                    : "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Điện thoại:</span>
                <span className={styles["info-value"]}>
                  {docGia?.dienThoai || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Email:</span>
                <span className={styles["info-value"]}>
                  {docGia?.email || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Địa chỉ:</span>
                <span className={styles["info-value"]}>
                  {docGia?.diaChi || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Ngày sinh:</span>
                <span className={styles["info-value"]}>
                  {formatDate(docGia?.ngaySinh)}
                </span>
              </div>

              {/* Action buttons cho độc giả */}
              <div className={styles["action-section"]}>
                <Link
                  to={`/admin/docgia/${docGia?.maDocGia || muonSach.maDocGia}`}
                  className={styles["view-btn"]}
                >
                  👁️ Xem chi tiết độc giả
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Thông tin sách */}
        {active === "sach" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["info-section"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã sách:</span>
                <span className={styles["info-value"]}>
                  {sach?.maSach || muonSach.maSach || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tên sách:</span>
                <span className={styles["info-value"]}>
                  {sach?.tenSach || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tác giả:</span>
                <span className={styles["info-value"]}>
                  {sach?.tacGia || "—"}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Thể loại:</span>
                <span className={styles["info-value"]}>
                  {sach?.theLoais?.join(", ") || "—"}
                </span>
              </div>

              {/* Action buttons cho sách */}
              <div className={styles["action-section"]}>
                <Link
                  to={`/admin/sach/${sach?.maSach || muonSach.maSach}`}
                  className={styles["view-btn"]}
                >
                  📖 Xem chi tiết sách
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Thông tin phiếu mượn */}
        {active === "phieumuon" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["info-section"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã độc giả:</span>
                <span className={styles["info-value"]}>
                  {muonSach.maDocGia}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã sách:</span>
                <span className={styles["info-value"]}>{muonSach.maSach}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Ngày mượn:</span>
                <span className={styles["info-value"]}>
                  {formatDate(muonSach.ngayMuon)}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Ngày trả:</span>
                <span className={styles["info-value"]}>
                  {muonSach.ngayTra
                    ? formatDate(muonSach.ngayTra)
                    : "Chưa có ngày trả"}
                </span>
              </div>

              {/* Thông tin tính toán */}
              <div className={styles["calculated-info"]}>
                <h4>📊 Thông tin tính toán</h4>
                <div className={styles["info-item"]}>
                  <span className={styles["info-label"]}>Số ngày mượn:</span>
                  <span className={styles["info-value"]}>
                    {muonSach.ngayMuon && muonSach.ngayTra
                      ? Math.ceil(
                          (new Date(muonSach.ngayTra).getTime() -
                            new Date(muonSach.ngayMuon).getTime()) /
                            (1000 * 3600 * 24)
                        ) + " ngày"
                      : muonSach.ngayMuon
                      ? Math.ceil(
                          (new Date().getTime() -
                            new Date(muonSach.ngayMuon).getTime()) /
                            (1000 * 3600 * 24)
                        ) + " ngày (đang mượn)"
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Action buttons cho phiếu mượn */}
              <div className={styles["action-section"]}>
                <Link
                  to={`/admin/muon/edit/${maDocGia}/${maSach}/${ngayMuon}`}
                  className={styles["edit-btn"]}
                >
                  ✏️ Chỉnh sửa phiếu mượn
                </Link>
                {muonSach.trangThaiMuon?.toLowerCase() === "dangmuon" && (
                  <button
                    className={styles["return-btn"]}
                    onClick={() => {
                      // TODO: Implement return book functionality
                      console.log("Return book clicked");
                    }}
                  >
                    📥 Trả sách
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MuonDetails;
