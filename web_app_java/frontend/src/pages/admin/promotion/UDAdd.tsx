import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/promotion/UDAdd.module.css";

interface Sach {
  maSach: string;
  tenSach: string;
}

const UDAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenUuDai: "",
    moTa: "",
    phanTramGiam: "0",
    ngayBatDau: "",
    ngayKetThuc: "",
    sachIds: [] as string[], // Thêm trường này
  });
  const [loading, setLoading] = useState(false);
  const [sachList, setSachList] = useState<Sach[]>([]);

  useEffect(() => {
    // Lấy danh sách sách
    axios
      .get("/api/sach")
      .then((res) => setSachList(res.data))
      .catch(() => setSachList([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const handleSachChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setForm((p) => ({
      ...p,
      sachIds: selected,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        tenUuDai: form.tenUuDai,
        moTa: form.moTa,
        phanTramGiam: Number(form.phanTramGiam),
        ngayBatDau: form.ngayBatDau,
        ngayKetThuc: form.ngayKetThuc,
        maSachList: form.sachIds,
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
              value={toDateInputString(form.ngayBatDau)}
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
              value={toDateInputString(form.ngayKetThuc)}
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

          <div className="col-12 mb-2">
            <label>
              Chọn sách áp dụng (có thể chọn nhiều, để trống nếu là ưu đãi toàn
              shop)
            </label>
            <select
              multiple
              className="form-control"
              value={form.sachIds}
              onChange={handleSachChange}
            >
              {sachList.map((sach) => (
                <option key={sach.maSach} value={sach.maSach}>
                  {sach.tenSach}
                </option>
              ))}
            </select>
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
