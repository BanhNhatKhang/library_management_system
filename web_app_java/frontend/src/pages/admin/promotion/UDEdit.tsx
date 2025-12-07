import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/promotion/UDEdit.module.css";

interface UuDai {
  maUuDai: string;
  tenUuDai: string;
  moTa: string;
  phanTramGiam: number | string; // Use string/number for form input
  ngayBatDau: string;
  ngayKetThuc: string;
  maSachList: string[];
}

interface Sach {
  maSach: string;
  tenSach: string;
}

const UDEdit: React.FC = () => {
  const { maUuDai } = useParams<{ maUuDai: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<UuDai>({
    maUuDai: "",
    tenUuDai: "",
    moTa: "",
    phanTramGiam: 0,
    ngayBatDau: "",
    ngayKetThuc: "",
    maSachList: [],
  });
  const [sachList, setSachList] = useState<Sach[]>([]);

  useEffect(() => {
    if (maUuDai) {
      axios
        .get(`/api/uudai/${maUuDai}`)
        .then((res) => {
          const data = res.data || {};

          setForm({
            maUuDai: String(data.maUuDai ?? ""),
            tenUuDai: String(data.tenUuDai ?? ""),
            moTa: String(data.moTa ?? ""),
            phanTramGiam: String(data.phanTramGiam ?? "0"),
            ngayBatDau: toDateInputString(data.ngayBatDau ?? data.ngayBatDau),
            ngayKetThuc: toDateInputString(
              data.ngayKetThuc ?? data.ngayKetThuc
            ),
            maSachList: Array.isArray(data.maSachList) ? data.maSachList : [],
          });
        })
        .catch(console.error);
    }
    axios
      .get("/api/sach")
      .then((res) => setSachList(res.data))
      .catch(() => setSachList([]));
  }, [maUuDai]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (maUuDai) {
        const updateData = {
          ...form,
          phanTramGiam: Number(form.phanTramGiam), // Convert back to number for API
        };
        await axios.put(`/api/uudai/${maUuDai}`, updateData);
        alert("Cập nhật ưu đãi thành công!");
      }
      navigate("/admin/uudai");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    }
  };

  function toDateInputString(
    dateStr:
      | string
      | number
      | Date
      | Array<number | string>
      | { year?: number; month?: number; day?: number }
      | undefined
      | null
  ): string {
    if (!dateStr && dateStr !== 0) return "";

    // array [yyyy, MM, dd]
    if (Array.isArray(dateStr) && dateStr.length >= 3) {
      const [yRaw, mRaw, dRaw] = dateStr;
      const y = Number(yRaw);
      const m = Number(mRaw);
      const d = Number(dRaw);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return `${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0"
        )}`;
      }
      return "";
    }

    if (typeof dateStr === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const parts = dateStr.split(",");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${y.trim()}-${m.trim().padStart(2, "0")}-${d
          .trim()
          .padStart(2, "0")}`;
      }
      const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
      if (isoMatch) return isoMatch[0];
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
      return "";
    }

    if (dateStr instanceof Date) {
      if (isNaN(dateStr.getTime())) return "";
      return dateStr.toISOString().slice(0, 10);
    }

    if (typeof dateStr === "object" && dateStr !== null) {
      // dùng Record<string, unknown> thay vì any
      const obj = dateStr as Record<string, unknown>;
      const maybeY = obj["year"] ?? obj["Y"];
      const maybeM = obj["month"] ?? obj["monthValue"];
      const maybeD = obj["day"] ?? obj["dayOfMonth"];

      const y =
        typeof maybeY === "number"
          ? maybeY
          : typeof maybeY === "string"
          ? parseInt(maybeY, 10)
          : NaN;
      const m =
        typeof maybeM === "number"
          ? maybeM
          : typeof maybeM === "string"
          ? parseInt(maybeM, 10)
          : NaN;
      const d =
        typeof maybeD === "number"
          ? maybeD
          : typeof maybeD === "string"
          ? parseInt(maybeD, 10)
          : NaN;

      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return `${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0"
        )}`;
      }
    }

    if (typeof dateStr === "number") {
      const dt = new Date(dateStr);
      if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    }

    return "";
  }

  return (
    <div className={styles["ud-edit"]}>
      <h2>Cập nhật ưu đãi</h2>

      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <div className={styles["form-group"]}>
          <label>Mã ưu đãi</label>
          <input
            type="text"
            name="maUuDai"
            value={form.maUuDai}
            onChange={handleChange}
            required
            disabled // Mã ưu đãi thường không được sửa
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Tên ưu đãi</label>
          <input
            type="text"
            name="tenUuDai"
            value={form.tenUuDai}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Phần trăm giảm (%)</label>
          <input
            type="number"
            name="phanTramGiam"
            value={form.phanTramGiam}
            onChange={handleChange}
            min={0}
            max={100}
            step="0.01"
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Ngày bắt đầu</label>
          <input
            type="date"
            name="ngayBatDau"
            value={toDateInputString(form.ngayBatDau)}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Ngày kết thúc</label>
          <input
            type="date"
            name="ngayKetThuc"
            value={toDateInputString(form.ngayKetThuc)}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Mô tả</label>
          <textarea
            name="moTa"
            value={form.moTa}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Chọn sách áp dụng (có thể chọn nhiều)</label>
          <select
            multiple
            className="form-control"
            value={form.maSachList}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (opt) => opt.value
              );
              setForm({ ...form, maSachList: selected });
            }}
          >
            {sachList.map((sach) => (
              <option key={sach.maSach} value={sach.maSach}>
                {sach.tenSach}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["form-actions"]}>
          <button type="submit" className={styles["save-btn"]}>
            💾 Lưu
          </button>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={() => navigate("/admin/uudai")}
          >
            ↩ Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default UDEdit;
