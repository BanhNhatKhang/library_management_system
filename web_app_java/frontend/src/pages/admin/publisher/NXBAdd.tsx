import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/publisher/NXBAdd.module.css";

const NXBAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tenNhaXuatBan: "",
    diaChi: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/nhaxuatban", formData);
      alert("Thêm nhà xuất bản thành công!");
      navigate("/admin/nxb");
    } catch {
      alert("Có lỗi xảy ra khi thêm nhà xuất bản!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["add-nxb"]}>
      <Link to="/admin/nxb" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Thêm nhà xuất bản</h4>
      <form
        onSubmit={handleSubmit}
        className={`mt-3 ${styles["bg-white"]} p-3 rounded`}
      >
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className={styles["label"]}>Tên nhà xuất bản</label>
            <input
              name="tenNhaXuatBan"
              className={`form-control ${styles["input"]}`}
              value={formData.tenNhaXuatBan}
              onChange={handleInputChange}
              required
              maxLength={100}
              placeholder="Nhập tên nhà xuất bản"
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className={styles["label"]}>Địa chỉ</label>
            <input
              name="diaChi"
              className={`form-control ${styles["input"]}`}
              value={formData.diaChi}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="Nhập địa chỉ nhà xuất bản"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            className="btn btn-primary me-2"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <Link to="/admin/nxb" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NXBAdd;
