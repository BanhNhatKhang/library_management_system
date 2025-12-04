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

  useEffect(() => {
    const fetchMuonSachDetails = async () => {
      try {
        console.log("Fetching details for:", { maDocGia, maSach, ngayMuon });

        const response = await axios.get(
          `/api/theodoimuonsach/item?maDocGia=${maDocGia}&maSach=${maSach}&ngayMuon=${ngayMuon}`
        );

        console.log("API Response:", response.data);
        setMuonSach(response.data);
      } catch (error) {
        console.error("Error fetching loan details:", error);
        setError("Không thể tải thông tin phiếu mượn");
      } finally {
        setLoading(false);
      }
    };

    if (maDocGia && maSach && ngayMuon) {
      fetchMuonSachDetails();
    }
  }, [maDocGia, maSach, ngayMuon]);

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
      </div>

      <div className={styles["info-section"]}>
        <h3>Thông tin độc giả</h3>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Mã độc giả: </span>
          <span className={styles["info-value"]}>
            {docGia?.maDocGia || muonSach.maDocGia || "N/A"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Họ và tên: </span>
          <span className={styles["info-value"]}>
            {docGia
              ? `${docGia.hoLot || ""} ${docGia.ten || ""}`.trim()
              : "N/A"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Điện thoại: </span>
          <span className={styles["info-value"]}>
            {docGia?.dienThoai || "N/A"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Email: </span>
          <span className={styles["info-value"]}>{docGia?.email || "N/A"}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Địa chỉ: </span>
          <span className={styles["info-value"]}>
            {docGia?.diaChi || "N/A"}
          </span>
        </p>
      </div>

      <div className={styles["info-section"]}>
        <h3>Thông tin sách</h3>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Mã sách: </span>
          <span className={styles["info-value"]}>
            {sach?.maSach || muonSach.maSach || "N/A"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Tên sách: </span>
          <span className={styles["info-value"]}>{sach?.tenSach || "N/A"}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Tác giả: </span>
          <span className={styles["info-value"]}>{sach?.tacGia || "N/A"}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Thể loại: </span>
          <span className={styles["info-value"]}>
            {sach?.theLoais?.join(", ") || "N/A"}
          </span>
        </p>
      </div>

      <div className={styles["info-section"]}>
        <h3>Thông tin phiếu mượn</h3>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Ngày mượn: </span>
          <span className={styles["info-value"]}>
            {muonSach.ngayMuon
              ? new Date(muonSach.ngayMuon).toLocaleDateString("vi-VN")
              : "N/A"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Ngày trả: </span>
          <span className={styles["info-value"]}>
            {muonSach.ngayTra
              ? new Date(muonSach.ngayTra).toLocaleDateString("vi-VN")
              : "Chưa có ngày trả"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Trạng thái: </span>
          <span
            className={`${styles["info-value"]} ${styles["status"]} ${
              styles[muonSach.trangThaiMuon?.toLowerCase() || ""]
            }`}
          >
            {muonSach.trangThaiMuon || "N/A"}
          </span>
        </p>
      </div>

      <div className={styles["action-section"]}>
        <Link
          to={`/admin/muon/edit/${maDocGia}/${maSach}/${ngayMuon}`}
          className={styles["edit-btn"]}
        >
          ✏️ Chỉnh sửa phiếu mượn
        </Link>
      </div>
    </div>
  );
};

export default MuonDetails;
