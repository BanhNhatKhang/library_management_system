import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/readers/DGAdd.module.css";

const DGAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hoLot: "",
    ten: "",
    gioiTinh: "NAM",
    diaChi: "",
    ngaySinh: "",
    dienThoai: "",
    email: "",
    matKhau: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // DTO backend: DocGiaDangKyDTO -> endpoint POST /api/xacthuc/dangky
      await axios.post("/api/xacthuc/dangky", form);
      alert("Thêm độc giả thành công");
      navigate("/admin/docgia");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi thêm độc giả");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles["dg-add"]} p-3`}>
      <Link to="/admin/docgia" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Thêm độc giả</h4>
      <form
        onSubmit={submit}
        className={`mt-3 ${styles["bg-white"]} p-3 rounded`}
      >
        <div className="row">
          <div className="col-md-6 mb-2">
            <label>Họ lót</label>
            <input
              name="hoLot"
              className="form-control"
              value={form.hoLot}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Tên</label>
            <input
              name="ten"
              className="form-control"
              value={form.ten}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <label>Giới tính</label>
            <select
              name="gioiTinh"
              className="form-select"
              value={form.gioiTinh}
              onChange={handleChange}
            >
              <option value="NAM">NAM</option>
              <option value="NU">NỮ</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label>Điện thoại</label>
            <input
              name="dienThoai"
              className="form-control"
              value={form.dienThoai}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4 mb-2">
            <label>Email</label>
            <input
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 mb-2">
            <label>Địa chỉ</label>
            <input
              name="diaChi"
              className="form-control"
              value={form.diaChi}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Ngày sinh</label>
            <input
              name="ngaySinh"
              type="date"
              className="form-control"
              value={form.ngaySinh}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Mật khẩu</label>
            <input
              name="matKhau"
              type="password"
              className="form-control"
              value={form.matKhau}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <Link to="/admin/docgia" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DGAdd;
