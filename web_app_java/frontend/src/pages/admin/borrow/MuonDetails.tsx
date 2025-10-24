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
  theLoai: string;
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

  useEffect(() => {
    const fetchMuonSachDetails = async () => {
      try {
        const response = await axios.get(
          `/api/theodoimuonsach/item?maDocGia=${maDocGia}&maSach=${maSach}&ngayMuon=${ngayMuon}`
        );
        setMuonSach(response.data);
      } catch (error) {
        console.error("Error fetching loan details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMuonSachDetails();
  }, [maDocGia, maSach, ngayMuon]);

  if (loading) {
    return <div>⏳ Đang tải...</div>;
  }

  if (!muonSach) {
    return (
      <div className="p-3">
        <Link to="/admin/muontra" className="btn btn-secondary mb-3">
          ← Quay lại danh sách
        </Link>
        <div>Không tìm thấy thông tin phiếu mượn.</div>
      </div>
    );
  }

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
            {muonSach.docGia.maDocGia}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Họ và tên: </span>
          <span className={styles["info-value"]}>
            {muonSach.docGia.hoLot} {muonSach.docGia.ten}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Điện thoại: </span>
          <span className={styles["info-value"]}>
            {muonSach.docGia.dienThoai}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Email: </span>
          <span className={styles["info-value"]}>{muonSach.docGia.email}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Địa chỉ: </span>
          <span className={styles["info-value"]}>{muonSach.docGia.diaChi}</span>
        </p>
      </div>

      <div className={styles["info-section"]}>
        <h3>Thông tin sách</h3>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Mã sách: </span>
          <span className={styles["info-value"]}>{muonSach.sach.maSach}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Tên sách: </span>
          <span className={styles["info-value"]}>{muonSach.sach.tenSach}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Tác giả: </span>
          <span className={styles["info-value"]}>{muonSach.sach.tacGia}</span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Thể loại: </span>
          <span className={styles["info-value"]}>{muonSach.sach.theLoai}</span>
        </p>
      </div>

      <div className={styles["info-section"]}>
        <h3>Thông tin phiếu mượn</h3>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Ngày mượn: </span>
          <span className={styles["info-value"]}>
            {new Date(muonSach.ngayMuon).toLocaleDateString("vi-VN")}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Ngày trả: </span>
          <span className={styles["info-value"]}>
            {muonSach.ngayTra
              ? new Date(muonSach.ngayTra).toLocaleDateString("vi-VN")
              : "Chưa trả"}
          </span>
        </p>
        <p className={styles["info-item"]}>
          <span className={styles["info-label"]}>Trạng thái: </span>
          <span className={styles["info-value"]}>{muonSach.trangThaiMuon}</span>
        </p>
      </div>
    </div>
  );
};

export default MuonDetails;
