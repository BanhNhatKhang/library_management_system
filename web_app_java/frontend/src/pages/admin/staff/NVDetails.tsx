import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/staff/NVDetails.module.css";

interface NhanVien {
  maNhanVien: string;
  hoTen: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
  trangThai?: string;
  vaiTro?: string;
}

const NVDetails: React.FC = () => {
  const { maNhanVien } = useParams<{ maNhanVien: string }>();
  const [nhanVien, setNhanVien] = useState<NhanVien | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maNhanVien) return;
    setLoading(true);
    axios
      .get(`/api/nhanvien/${maNhanVien}`)
      .then((response) => setNhanVien(response.data))
      .catch(() => setNhanVien(null))
      .finally(() => setLoading(false));
  }, [maNhanVien]);

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!nhanVien)
    return (
      <div className="p-3">
        <Link to="/admin/nhanvien" className="btn btn-secondary mb-3">
          ← Quay lại
        </Link>
        <div>Không tìm thấy nhân viên</div>
      </div>
    );

  return (
    <div className={styles["nv-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/nhanvien" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <h2 className={styles["page-title"]}>👨‍💼 Chi tiết nhân viên</h2>
      </div>

      <div className={styles["info-section"]}>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Mã nhân viên:</span>
          <span className={styles["info-value"]}>{nhanVien.maNhanVien}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Họ tên:</span>
          <span className={styles["info-value"]}>{nhanVien.hoTen}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Email:</span>
          <span className={styles["info-value"]}>{nhanVien.email}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Điện thoại:</span>
          <span className={styles["info-value"]}>{nhanVien.dienThoai}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Địa chỉ:</span>
          <span className={styles["info-value"]}>{nhanVien.diaChi || "—"}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Ngày sinh:</span>
          <span className={styles["info-value"]}>
            {nhanVien.ngaySinh
              ? new Date(nhanVien.ngaySinh).toLocaleDateString("vi-VN")
              : "—"}
          </span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Vai trò:</span>
          <span className={styles["info-value"]}>
            {getVaiTroDisplay(nhanVien.vaiTro)}
          </span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Trạng thái:</span>
          <span
            className={`${styles["info-value"]} ${
              styles["trang-thai"]
            } ${getTrangThaiClass(nhanVien.trangThai)}`}
          >
            {getTrangThaiDisplay(nhanVien.trangThai)}
          </span>
        </div>
      </div>

      <Link
        to={`/admin/nhanvien/edit/${nhanVien.maNhanVien}`}
        className={styles["btn-edit"]}
      >
        ✏️ Chỉnh sửa
      </Link>
    </div>
  );
};

// Helper functions
const getVaiTroDisplay = (vaiTro?: string) => {
  switch (vaiTro) {
    case "ADMIN":
      return "Quản trị viên";
    case "QUANLY":
      return "Quản lý";
    case "THUTHU":
      return "Thủ thư";
    case "NHANVIEN":
      return "Nhân viên";
    default:
      return "—";
  }
};

const getTrangThaiDisplay = (trangThai?: string) => {
  switch (trangThai) {
    case "HOATDONG":
      return "Hoạt động";
    case "NGHI":
      return "Nghỉ";
    case "KHOA":
      return "Khóa";
    default:
      return "—";
  }
};

const getTrangThaiClass = (trangThai?: string) => {
  switch (trangThai) {
    case "HOATDONG":
      return styles["hoatdong"];
    case "NGHI":
      return styles["nghi"];
    case "KHOA":
      return styles["khoa"];
    default:
      return "";
  }
};

export default NVDetails;
