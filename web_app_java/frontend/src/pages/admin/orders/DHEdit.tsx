import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/orders/DHEdit.module.css";

interface DonHang {
  maDonHang?: string;
  maDocGia: string;
  ngayDat: string;
  tongTien: number;
  trangThai: string;
}

const DHEdit: React.FC = () => {
  const { maDonHang } = useParams<{ maDonHang: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<DonHang>({
    maDocGia: "",
    ngayDat: "",
    tongTien: 0,
    trangThai: "",
  });

  useEffect(() => {
    if (maDonHang) {
      axios
        .get(`/api/donhang/id/${maDonHang}`)
        .then((res) => {
          console.log("DEBUG GET /api/donhang:", res.data.ngayDat); // <- xem shape thực tế
          const data = res.data;
          // Chuẩn hóa ngayDat về "yyyy-MM-dd" trước khi setForm
          data.ngayDat = toDateInputString(data.ngayDat);
          setForm(data);
        })
        .catch(console.error);
    }
  }, [maDonHang]);

  // cập nhật form khi thay đổi input/select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "tongTien"
          ? // đảm bảo là number cho trường số
            Number(value === "" ? 0 : value)
          : value,
    }));
  };

  // submit form: PUT khi đang edit, POST khi tạo mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (maDonHang) {
        await axios.put(`/api/donhang/${maDonHang}`, form);
      } else {
        await axios.post("/api/donhang", form);
      }
      navigate("/admin/donhang");
    } catch (err) {
      console.error("Lỗi lưu đơn hàng:", err);
      alert("Lưu đơn hàng thất bại. Kiểm tra console để biết thêm chi tiết.");
    }
  };

  // robust type-guard + converter
  function isLocalDateLike(
    v: unknown
  ): v is { year: number; month: number; day: number } {
    if (typeof v !== "object" || v === null) return false;
    const obj = v as Record<string, unknown>;
    // handle different shapes: {year, month, day} OR {year, monthValue, dayOfMonth}
    return (
      (typeof obj.year === "number" &&
        (typeof obj.month === "number" || typeof obj.monthValue === "number") &&
        (typeof obj.day === "number" || typeof obj.dayOfMonth === "number")) ||
      // also allow strings that look like numbers
      (typeof obj.year === "string" &&
        (typeof obj.month === "string" || typeof obj.monthValue === "string") &&
        (typeof obj.day === "string" || typeof obj.dayOfMonth === "string"))
    );
  }

  function toDateInputString(
    dateVal:
      | string
      | number
      | Date
      | {
          year?: number | string;
          month?: number | string;
          day?: number | string;
          monthValue?: number | string;
          dayOfMonth?: number | string;
        }
      | Array<number | string>
      | undefined
      | null
  ): string {
    if (dateVal === undefined || dateVal === null) return "";

    // If it's already a yyyy-MM-dd string
    if (typeof dateVal === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
      // ISO datetime -> take date part
      const isoMatch = dateVal.match(/^\d{4}-\d{2}-\d{2}/);
      if (isoMatch) return isoMatch[0];
      // formats like "yyyy,MM,dd" or "yyyy, M, d"
      const parts = dateVal.split(",");
      if (parts.length >= 3) {
        const y = parts[0].trim();
        const m = String(Number(parts[1])).padStart(2, "0");
        const d = String(Number(parts[2])).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      // dd/MM/yyyy -> convert
      const dm = dateVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;
      // fallback parse
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
      return "";
    }

    // If it's a numeric timestamp (ms)
    if (typeof dateVal === "number") {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return "";
    }

    // If array [y,m,d]
    if (Array.isArray(dateVal) && dateVal.length >= 3) {
      const [y, m, d] = dateVal;
      return `${String(y)}-${String(Number(m)).padStart(2, "0")}-${String(
        Number(d)
      ).padStart(2, "0")}`;
    }

    // If LocalDate-like object (various shapes)
    if (isLocalDateLike(dateVal)) {
      const obj = dateVal as Record<string, unknown>;
      const y = obj.year ?? obj.Y ?? obj.y;
      const m = obj.month ?? obj.monthValue ?? obj.m;
      const d = obj.day ?? obj.dayOfMonth ?? obj.d;
      return `${String(y)}-${String(Number(m)).padStart(2, "0")}-${String(
        Number(d)
      ).padStart(2, "0")}`;
    }

    // If native Date
    if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return "";
      return dateVal.toISOString().slice(0, 10);
    }

    return "";
  }

  return (
    <div className={styles["dh-edit"]}>
      <h2>{maDonHang ? "Cập nhật đơn hàng" : "Thêm đơn hàng mới"}</h2>

      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <div className={styles["form-group"]}>
          <label>Mã độc giả</label>
          <input
            type="text"
            name="maDocGia"
            value={form.maDocGia}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Ngày đặt</label>
          <input
            type="date"
            name="ngayDat"
            value={form.ngayDat}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Tổng tiền</label>
          <input
            type="number"
            name="tongTien"
            value={form.tongTien}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Trạng thái</label>
          <select
            name="trangThai"
            value={form.trangThai}
            onChange={handleChange}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="DANGXULY">Đang xử lý</option>
            <option value="DAGIAO">Hoàn tất</option>
            <option value="DAHUY">Đã hủy</option>
            <option value="GIAOTHATBAI">Giao thất bại</option>
          </select>
        </div>

        <div className={styles["form-actions"]}>
          <button type="submit" className={styles["save-btn"]}>
            💾 Lưu
          </button>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={() => navigate("/admin/donhang")}
          >
            ↩ Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default DHEdit;
