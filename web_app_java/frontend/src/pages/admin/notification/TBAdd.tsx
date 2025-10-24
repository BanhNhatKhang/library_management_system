import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/notification/TBAdd.module.css";

const TBAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    maDocGia: "",
    maSach: "",
    noiDung: "",
    loaiThongBao: "THONGBAOCHUNG",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/thongbao", form);
      alert("Tạo thông báo thành công");
      navigate("/admin/thongbao");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi tạo thông báo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles["tb-add"]} p-3`}>
      <Link to="/admin/thongbao" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Tạo Thông báo mới</h4>
      <form
        onSubmit={submit}
        className={`mt-3 ${styles["bg-white"]} p-3 rounded`}
      >
        <div className="row">
          <div className="col-md-6 mb-2">
            <label>Mã độc giả (nếu là thông báo riêng)</label>
            <input
              name="maDocGia"
              className="form-control"
              value={form.maDocGia}
              onChange={handleChange}
            />
            <small className="help">
              Để trống nếu là thông báo chung cho tất cả độc giả.
            </small>
          </div>

          <div className="col-md-6 mb-2">
            <label>Mã sách (nếu liên quan đến sách)</label>
            <input
              name="maSach"
              className="form-control"
              value={form.maSach}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Loại Thông báo</label>
            <select
              name="loaiThongBao"
              className="form-select"
              value={form.loaiThongBao}
              onChange={handleChange}
              required
            >
              <option value="THONGBAOCHUNG">THONGBAOCHUNG</option>
              <option value="QUA_HAN">QUÁ HẠN</option>
              <option value="SAP_DEN_HAN">SẮP ĐẾN HẠN</option>
              <option value="HETHONG">HỆ THỐNG</option>
            </select>
          </div>

          <div className="col-12 mb-2">
            <label>Nội dung</label>
            <textarea
              name="noiDung"
              className="form-control"
              rows={5}
              value={form.noiDung}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi Thông báo"}
          </button>
          <Link to="/admin/thongbao" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TBAdd;
