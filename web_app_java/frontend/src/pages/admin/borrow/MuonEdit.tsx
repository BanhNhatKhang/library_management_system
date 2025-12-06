import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/borrow/MuonEdit.module.css";

interface LoanRequest {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra?: string;
  trangThaiMuon: string;
  maNhanVien?: string;
}

const MuonEdit: React.FC = () => {
  const { maDocGia, maSach, ngayMuon } = useParams<{
    maDocGia: string;
    maSach: string;
    ngayMuon: string;
  }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoanRequest>({
    maDocGia: "",
    maSach: "",
    ngayMuon: "",
    ngayTra: "",
    trangThaiMuon: "",
    maNhanVien: "",
  });

  useEffect(() => {
    if (maDocGia && maSach && ngayMuon) {
      axios
        .get(
          `/api/theodoimuonsach/item?maDocGia=${maDocGia}&maSach=${maSach}&ngayMuon=${ngayMuon}`
        )
        .then((res) => setForm(res.data))
        .catch(console.error);
    }
  }, [maDocGia, maSach, ngayMuon]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/theodoimuonsach`, form);
      alert("Cập nhật phiếu mượn thành công!");
      navigate("/admin/muontra");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    }
  };

  function toDateInputString(
    dateStr:
      | string
      | Date
      | { year: number; month: number; day: number }
      | undefined
      | null
  ): string {
    if (!dateStr) return "";
    if (typeof dateStr === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const parts = dateStr.split(",");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${y.trim()}-${m.trim().padStart(2, "0")}-${d
          .trim()
          .padStart(2, "0")}`;
      }
      return "";
    }
    // Nếu là đối tượng Date
    if (dateStr instanceof Date) {
      if (isNaN(dateStr.getTime())) return "";
      return dateStr.toISOString().slice(0, 10);
    }
    // Nếu là object LocalDate (có year, month, day)
    if (
      typeof dateStr === "object" &&
      "year" in dateStr &&
      "month" in dateStr &&
      "day" in dateStr
    ) {
      return `${dateStr.year}-${String(dateStr.month).padStart(
        2,
        "0"
      )}-${String(dateStr.day).padStart(2, "0")}`;
    }
    return "";
  }

  return (
    <div
      className={`${styles["library-loan-management-muon-edit"]} ${
        styles["muo-edit"] ?? ""
      }`}
    >
      <h2>Chỉnh sửa phiếu mượn</h2>
      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <div className={styles["form-group"]}>
          <label htmlFor="maDocGia">Mã độc giả</label>
          <input
            type="text"
            id="maDocGia"
            name="maDocGia"
            value={form.maDocGia}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="maSach">Mã sách</label>
          <input
            type="text"
            id="maSach"
            name="maSach"
            value={form.maSach}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="ngayMuon">Ngày mượn</label>
          <input
            type="date"
            id="ngayMuon"
            name="ngayMuon"
            value={toDateInputString(form.ngayMuon)}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="ngayTra">Ngày trả</label>
          <input
            type="date"
            id="ngayTra"
            name="ngayTra"
            value={toDateInputString(form.ngayTra)}
            onChange={handleChange}
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="trangThaiMuon">Trạng thái mượn</label>
          <select
            id="trangThaiMuon"
            name="trangThaiMuon"
            value={form.trangThaiMuon}
            onChange={handleChange}
            required
          >
            <option value="CHODUYET">Chờ duyệt</option>
            <option value="DADUYET">Đã duyệt</option>
            <option value="TUCHOI">Từ chối</option>
            <option value="DATRA">Đã trả</option>
            <option value="DANGMUON">Đang mượn</option>
          </select>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="maNhanVien">Mã nhân viên</label>
          <input
            type="text"
            id="maNhanVien"
            name="maNhanVien"
            value={form.maNhanVien}
            onChange={handleChange}
          />
        </div>
        <div className={styles["form-actions"]}>
          <button type="submit" className={styles["save-btn"]}>
            Lưu
          </button>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={() => navigate("/admin/muontra")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default MuonEdit;
