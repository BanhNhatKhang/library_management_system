import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/category/TheLoaiAdd.module.css";

const TheLoaiAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [prefix, setPrefix] = useState<"TL" | "FB">("TL");
  const [formData, setFormData] = useState({
    tenTheLoai: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrefix(e.target.value as "TL" | "FB");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/api/theloai?prefix=${prefix}`, {
        tenTheLoai: formData.tenTheLoai,
      });
      alert("Thêm thể loại thành công!");
      navigate("/admin/theloai");
    } catch {
      alert("Có lỗi xảy ra khi thêm thể loại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["add-theloai"]}>
      <Link to="/admin/theloai" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>🏷️ Thêm thể loại</h4>
      <form
        onSubmit={handleSubmit}
        className={`mt-3 ${styles["add-theloai-form"]} p-3 rounded`}
      >
        <div className="row">
          <div className="col-md-4 mb-2">
            <label className={styles["form-group"]}>Loại</label>
            <select
              name="loai"
              className="form-select"
              value={prefix}
              onChange={handlePrefixChange}
            >
              <option value="TL">Trong nước (TL)</option>
              <option value="FB">Ngoài nước (FB)</option>
            </select>
          </div>
          <div className="col-md-8 mb-2">
            <label className={styles["form-group"]}>Tên thể loại</label>
            <input
              type="text"
              name="tenTheLoai"
              className="form-control"
              value={formData.tenTheLoai}
              onChange={handleInputChange}
              required
              maxLength={30}
              placeholder="Nhập tên thể loại"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            className="btn btn-primary me-2"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang thêm..." : "Lưu"}
          </button>
          <Link to="/admin/theloai" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TheLoaiAdd;
