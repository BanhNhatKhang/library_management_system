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
        <h2 className={styles["page-title"]}>📖 Chi tiết nhân viên</h2>
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
          <span className={styles["info-label"]}>Điện thoại:</span>
          <span className={styles["info-value"]}>{nhanVien.dienThoai}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Email:</span>
          <span className={styles["info-value"]}>{nhanVien.email}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Địa chỉ:</span>
          <span className={styles["info-value"]}>{nhanVien.diaChi || "—"}</span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Ngày sinh:</span>
          <span className={styles["info-value"]}>
            {nhanVien.ngaySinh || "—"}
          </span>
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Trạng thái:</span>
          <span className={styles["info-value"]}>
            {nhanVien.trangThai || "—"}
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

export default NVDetails;
