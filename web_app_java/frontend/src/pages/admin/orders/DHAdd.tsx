import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/orders/DHAdd.css";

const DHAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    maDocGia: "",
    ngayDat: "",
    tongTien: 0,
    trangThai: "Đang xử lý",
    maUuDaiList: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "tongTien" ? Number(value) : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uuDaiArray =
        form.maUuDaiList.trim() === ""
          ? []
          : form.maUuDaiList.split(",").map((s) => s.trim());

      const requestBody = {
        donHang: {
          ngayDat: form.ngayDat,
          tongTien: form.tongTien,
          trangThaiDonHang: form.trangThai,
        },
        maDocGia: form.maDocGia,
        maUuDaiList: uuDaiArray,
      };

      await axios.post("/api/donhang", requestBody);
      alert("Thêm đơn hàng thành công");
      navigate("/admin/donhang");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi thêm đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dh-add p-3">
      <Link to="/admin/donhang" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Thêm đơn hàng</h4>

      <form onSubmit={submit} className="mt-3 bg-white p-3 rounded">
        <div className="row">
          <div className="col-md-6 mb-2">
            <label>Mã độc giả</label>
            <input
              name="maDocGia"
              className="form-control"
              value={form.maDocGia}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Ngày đặt</label>
            <input
              name="ngayDat"
              type="date"
              className="form-control"
              value={form.ngayDat}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Tổng tiền (₫)</label>
            <input
              name="tongTien"
              type="number"
              className="form-control"
              min="0"
              value={form.tongTien}
              onChange={handleChange}
            />
            <div className="help">Nhập tổng tiền của đơn hàng.</div>
          </div>

          <select
            name="trangThai"
            className="form-select"
            value={form.trangThai}
            onChange={handleChange}
          >
            <option value="DANGXULY">Đang xử lý</option>
            <option value="DAGIAO">Đã giao</option>
            <option value="GIAOTHATBAI">Giao thất bại</option>
            <option value="DAHUY">Đã hủy</option>
          </select>

          <div className="col-12 mb-2">
            <label>Mã ưu đãi (nếu có)</label>
            <input
              name="maUuDaiList"
              className="form-control"
              value={form.maUuDaiList}
              onChange={handleChange}
              placeholder="Nhập mã ưu đãi, ngăn cách bằng dấu phẩy (VD: KM01,KM02)"
            />
            <div className="help">Nếu không có ưu đãi, có thể để trống.</div>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <Link to="/admin/donhang" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DHAdd;
