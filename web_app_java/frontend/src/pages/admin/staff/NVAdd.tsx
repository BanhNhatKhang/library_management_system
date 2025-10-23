import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/staff/NVAdd.css";

const NVAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hoLot: "",
    ten: "",
    dienThoai: "",
    email: "",
    matKhau: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/nhanvien", form);
      alert("Thêm nhân viên thành công");
      navigate("/admin/nhanvien");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi thêm nhân viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nv-add p-3">
      <Link to="/admin/nhanvien" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Thêm nhân viên</h4>
      <form onSubmit={submit} className="mt-3 bg-white p-3 rounded">
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
          <div className="col-md-6 mb-2">
            <label>Điện thoại</label>
            <input
              name="dienThoai"
              className="form-control"
              value={form.dienThoai}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Email</label>
            <input
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
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
          <Link to="/admin/nhanvien" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NVAdd;
