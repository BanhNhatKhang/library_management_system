import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/staff/NVAdd.module.css";

const NVAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hoLot: "",
    ten: "",
    dienThoai: "",
    email: "",
    matKhau: "",
    ngaySinh: "",
    diaChi: "",
    vaiTro: "NHANVIEN",
    trangThai: "HOATDONG",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gộp họ lót và tên thành hoTen
      const payload = {
        hoTen: `${form.hoLot} ${form.ten}`.trim(),
        dienThoai: form.dienThoai,
        email: form.email,
        matKhau: form.matKhau,
        ngaySinh: form.ngaySinh, // Định dạng YYYY-MM-DD
        diaChi: form.diaChi,
        vaiTro: form.vaiTro,
        trangThai: form.trangThai,
      };
      await axios.post("/api/nhanvien", payload);
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
    <div className={`${styles["nv-add"]} p-3`}>
      <Link to="/admin/nhanvien" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Thêm nhân viên</h4>
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
          <div className="col-md-6 mb-2">
            <label>Ngày sinh</label>
            <input
              name="ngaySinh"
              type="date"
              className="form-control"
              value={form.ngaySinh}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Địa chỉ</label>
            <input
              name="diaChi"
              className="form-control"
              value={form.diaChi}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Vai trò</label>
            <select
              name="vaiTro"
              className="form-select"
              value={form.vaiTro}
              onChange={handleChange}
              required
            >
              <option value="NHANVIEN">Nhân viên</option>
              <option value="THUTHU">Thủ thư</option>
              <option value="QUANLY">Quản lý</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="col-md-6 mb-2">
            <label>Trạng thái</label>
            <select
              name="trangThai"
              className="form-select"
              value={form.trangThai}
              onChange={handleChange}
              required
            >
              <option value="HOATDONG">Hoạt động</option>
              <option value="NGHI">Nghỉ</option>
              <option value="KHOA">Khóa</option>
            </select>
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
