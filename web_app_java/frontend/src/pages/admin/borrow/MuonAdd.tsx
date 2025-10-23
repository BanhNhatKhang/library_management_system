import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/borrow/MuonAdd.css";

const MuonAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    maDocGia: "",
    maSach: "",
    ngayMuon: "",
    ngayTra: "",
    trangThaiMuon: "DANGMUON", // Thêm trường trạng thái mượn (giá trị mặc định)
    maNhanVien: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        maDocGia: form.maDocGia,
        maSach: form.maSach,
        ngayMuon: form.ngayMuon,
        ngayTra: form.ngayTra, // Gửi ngày trả
        trangThaiMuon: form.trangThaiMuon, // Gửi trạng thái mượn
        maNhanVien: form.maNhanVien, // Gửi mã nhân viên
      };

      await axios.post("/api/theodoimuonsach", requestBody);
      alert("Thêm phiếu mượn thành công");
      navigate("/admin/muon");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi thêm phiếu mượn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="muon-add p-3">
      <Link to="/admin/muontra" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4> Thêm Phiếu Mượn</h4>

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
            <label>Mã sách</label>
            <input
              name="maSach"
              className="form-control"
              value={form.maSach}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Ngày mượn</label>
            <input
              name="ngayMuon"
              type="date"
              className="form-control"
              value={form.ngayMuon}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Ngày trả</label>
            <input
              name="ngayTra"
              type="date"
              className="form-control"
              value={form.ngayTra}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-2">
            <label>Trạng thái mượn</label>
            <select
              name="trangThaiMuon"
              className="form-control"
              value={form.trangThaiMuon}
              onChange={handleChange}
              required
            >
              <option value="DANG_MUON">Đang mượn</option>
              <option value="DA_TRA">Đã trả</option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <label>Mã nhân viên</label>
            <input
              name="maNhanVien"
              className="form-control"
              value={form.maNhanVien}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <Link to="/admin/muontra" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default MuonAdd;
