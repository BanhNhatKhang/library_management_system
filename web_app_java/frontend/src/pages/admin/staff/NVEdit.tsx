import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/staff/NVEdit.module.css";

interface NhanVien {
  maNhanVien: string;
  hoTen: string; // dùng tên đầy đủ như backend trả về
  dienThoai: string;
  email: string;
  matKhau?: string;
  trangThai?: string;
}

const NVEdit: React.FC = () => {
  const { maNhanVien } = useParams<{ maNhanVien: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<NhanVien | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maNhanVien) return;
    axios
      .get(`/api/nhanvien/${maNhanVien}`)
      .then((response) => setForm(response.data))
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [maNhanVien]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (form) {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      await axios.put(`/api/nhanvien/${form.maNhanVien}`, form);
      alert("Cập nhật thành công!");
      navigate("/admin/nhanvien");
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>⏳ Đang tải...</div>;
  if (!form) return <div>Không tìm thấy nhân viên</div>;

  return (
    <div className={styles["nv-edit"]}>
      <Link to="/admin/nhanvien" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>
      <h2>✏️ Chỉnh sửa nhân viên</h2>
      <form onSubmit={handleSubmit} className={styles["nv-edit-form"]}>
        <div className={styles["form-group"]}>
          <label>Mã nhân viên</label>
          <input type="text" value={form.maNhanVien} readOnly />
        </div>
        <div className={styles["form-group"]}>
          <label>Họ và tên</label>
          <input
            name="hoTen"
            value={form.hoTen}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label>Điện thoại</label>
          <input
            name="dienThoai"
            value={form.dienThoai}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label>Trạng thái</label>
          <input
            name="trangThai"
            value={form.trangThai || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles["form-actions"]}>
          <button
            type="submit"
            className={styles["submit-btn"]}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <Link to="/admin/nhanvien" className={styles["cancel-btn"]}>
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NVEdit;
