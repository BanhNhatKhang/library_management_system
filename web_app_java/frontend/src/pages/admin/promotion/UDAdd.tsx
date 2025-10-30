import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/promotion/UDAdd.module.css";

const UDAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenUuDai: "",
    moTa: "",
    phanTramGiam: "0",
    ngayBatDau: "",
    ngayKetThuc: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        // không gửi maUuDai — service sẽ tự sinh nếu thiếu
        tenUuDai: form.tenUuDai,
        moTa: form.moTa,
        phanTramGiam: Number(form.phanTramGiam),
        ngayBatDau: form.ngayBatDau,
        ngayKetThuc: form.ngayKetThuc,
      };

      await axios.post("/api/uudai", requestBody);
      alert("Thêm ưu đãi thành công");
      navigate("/admin/uudai");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi thêm ưu đãi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles["ud-add"]} p-3`}>
      <Link to="/admin/uudai" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Thêm ưu đãi</h4>

      <form
        onSubmit={submit}
        className={`mt-3 ${styles["bg-white"]} p-3 rounded`}
      >
        <div className="row">
          {/* mã ưu đãi không hiện ở frontend */}

          <div className="col-md-6 mb-2">
            <label>Tên ưu đãi</label>
            <input
              name="tenUuDai"
              className="form-control"
              value={form.tenUuDai}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Ngày bắt đầu</label>
            <input
              name="ngayBatDau"
              type="date"
              className="form-control"
              value={form.ngayBatDau}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label>Ngày kết thúc</label>
            <input
              name="ngayKetThuc"
              type="date"
              className="form-control"
              value={form.ngayKetThuc}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Phần trăm giảm (%)</label>
            <input
              name="phanTramGiam"
              type="number"
              className="form-control"
              min="0"
              max="100"
              step="0.01"
              value={form.phanTramGiam}
              onChange={handleChange}
              required
            />
            <div className="help">Nhập phần trăm giảm (ví dụ: 10.5).</div>
          </div>

          <div className="col-12 mb-2">
            <label>Mô tả</label>
            <textarea
              name="moTa"
              rows={3}
              className="form-control"
              value={form.moTa}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <Link to="/admin/uudai" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default UDAdd;
