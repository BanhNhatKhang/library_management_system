import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/readers/DGEdit.module.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
  trangThai?: string;
  matKhau?: string;
}

const DGEdit: React.FC = () => {
  const { maDocGia } = useParams<{ maDocGia: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<DocGia | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const formatToInputDate = (value: unknown): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const parts = value.split(",");
      if (parts.length >= 3) {
        const y = parts[0].trim();
        const m = String(Number(parts[1])).padStart(2, "0");
        const d = String(Number(parts[2])).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      const dObj = new Date(value);
      if (!isNaN(dObj.getTime())) return dObj.toISOString().slice(0, 10);
      return "";
    }
    if (Array.isArray(value) && value.length >= 3) {
      const [y, m, d] = value as (string | number)[];
      return `${String(y)}-${String(Number(m)).padStart(2, "0")}-${String(
        Number(d)
      ).padStart(2, "0")}`;
    }
    if (value instanceof Date && !isNaN(value.getTime()))
      return value.toISOString().slice(0, 10);
    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      const y = obj.year ?? obj.y;
      const m = obj.month ?? obj.m;
      const d = obj.day ?? obj.d;
      if (y != null && m != null && d != null) {
        return `${String(y)}-${String(Number(m)).padStart(2, "0")}-${String(
          Number(d)
        ).padStart(2, "0")}`;
      }
    }
    return "";
  };

  useEffect(() => {
    if (!maDocGia) return;
    axios
      .get(`/api/docgia/${maDocGia}`)
      .then((r) => {
        const data = r.data;
        data.ngaySinh = formatToInputDate(data.ngaySinh);
        setForm(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [maDocGia]);

  function changeField<K extends keyof DocGia>(key: K, value: DocGia[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      const payload = { ...form };
      if (newPassword.trim() !== "") {
        payload.matKhau = newPassword;
      }
      await axios.put(`/api/docgia/${form.maDocGia}`, payload);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/docgia");
    } catch (err) {
      console.error(err);
      alert("❌ Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "HOATDONG", label: "Hoạt động" },
    { value: "TAMKHOA", label: "Tạm khóa" },
    { value: "CAM", label: "Cấm" },
  ];

  const cycleLock = () => {
    if (!form) return;
    const order = ["HOATDONG", "TAMKHOA", "CAM"];
    const current = form.trangThai || "HOATDONG";
    const next = order[(order.indexOf(current) + 1) % order.length];
    if (next === "CAM") {
      const ok = window.confirm(
        "Bạn sắp đặt trạng thái thành CAM (khóa vĩnh viễn). Xác nhận?"
      );
      if (!ok) return;
    }
    changeField("trangThai", next);
  };

  const handleStatusSelect = (value: string) => {
    if (value === "CAM") {
      const ok = window.confirm(
        "Bạn sắp đặt trạng thái thành CAM (khóa vĩnh viễn). Xác nhận?"
      );
      if (!ok) return;
    }
    changeField("trangThai", value as DocGia["trangThai"]);
  };

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!form) return <div className="p-3">Không tìm thấy độc giả</div>;

  return (
    <div className={styles["dg-edit"]}>
      <Link to="/admin/docgia" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2>✏️ Chỉnh sửa độc giả</h2>

      <form onSubmit={submit} className={styles["dg-edit-form"]}>
        <div className={styles["form-container"]}>
          <div className={styles["form-group"]}>
            <label>Mã độc giả</label>
            <input type="text" value={form.maDocGia} readOnly />
          </div>

          <div className={styles["form-group"]}>
            <label>Họ lót</label>
            <input
              type="text"
              value={form.hoLot}
              onChange={(e) => changeField("hoLot", e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Tên</label>
            <input
              type="text"
              value={form.ten}
              onChange={(e) => changeField("ten", e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Điện thoại</label>
            <input
              type="text"
              value={form.dienThoai}
              onChange={(e) => changeField("dienThoai", e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => changeField("email", e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Ngày sinh</label>
            <input
              type="date"
              value={form.ngaySinh || ""}
              onChange={(e) => changeField("ngaySinh", e.target.value)}
            />
          </div>

          <div
            className={styles["form-group"]}
            style={{ gridColumn: "1 / -1" }}
          >
            <label>Địa chỉ</label>
            <input
              type="text"
              value={form.diaChi || ""}
              onChange={(e) => changeField("diaChi", e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Đổi mật khẩu (để trống nếu không đổi)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Trạng thái tài khoản</label>
            <div className="d-flex align-items-center gap-2">
              <select
                value={form.trangThai || "HOATDONG"}
                onChange={(e) => handleStatusSelect(e.target.value)}
                className="form-select form-select-sm"
                style={{ maxWidth: 180 }}
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <span
                className={`${styles["status-badge"]} ${
                  form.trangThai === "HOATDONG"
                    ? styles["status-active"]
                    : form.trangThai === "CAM"
                    ? styles["status-ban"]
                    : styles["status-locked"]
                }`}
              >
                {form.trangThai === "HOATDONG"
                  ? "Hoạt động"
                  : form.trangThai === "TAMKHOA"
                  ? "Tạm khóa"
                  : "Cấm"}
              </span>

              <button
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={cycleLock}
                title="Chuyển trạng thái (HOATDONG → TAMKHOA → CAM)"
              >
                Chuyển
              </button>
            </div>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          <button
            type="submit"
            className={styles["submit-btn"]}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <Link to="/admin/docgia" className={styles["cancel-btn"]}>
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DGEdit;
