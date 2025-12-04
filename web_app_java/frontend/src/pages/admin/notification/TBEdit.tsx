import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/notification/TBEdit.module.css";

interface ThongBao {
  id: number;
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  noiDung: string;
  thoiGianGui: string;
  loaiThongBao: string;
  trangThaiDaDoc: boolean;
}

const TBEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<ThongBao | null>(null);
  const [loading, setLoading] = useState(true);
  const thongBaoId = id ? parseInt(id) : undefined;

  useEffect(() => {
    if (!thongBaoId) return;
    axios
      .get(`/api/thongbao/id/${thongBaoId}`)
      .then((r) => setForm(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [thongBaoId]);

  function changeField<K extends keyof ThongBao>(key: K, value: ThongBao[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      const payload = { ...form };
      await axios.put(`/api/thongbao/${form.id}`, payload);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/thongbao");
    } catch (err) {
      console.error(err);
      alert("❌ Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const toggleTrangThaiDaDoc = () => {
    if (!form) return;
    changeField("trangThaiDaDoc", !form.trangThaiDaDoc);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!form) return <div className="p-3">Không tìm thấy thông báo</div>;

  return (
    <div className={styles["tb-edit"]}>
      <Link to="/admin/thongbao" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2>✏️ Chỉnh sửa Thông báo #{form.id}</h2>

      <form onSubmit={submit} className={styles["tb-edit-form"]}>
        <div className={styles["form-container"]}>
          <div className={styles["form-group"]}>
            <label>ID Thông báo</label>
            <input type="text" value={form.id} readOnly />
          </div>

          <div className={styles["form-group"]}>
            <label>Mã độc giả</label>
            <input type="text" value={form.maDocGia || "Tất cả"} readOnly />
          </div>

          <div className={styles["form-group"]}>
            <label>Mã sách</label>
            <input type="text" value={form.maSach || "—"} readOnly />
          </div>

          <div className={styles["form-group"]}>
            <label>Thời gian gửi</label>
            <input type="text" value={formatDate(form.thoiGianGui)} readOnly />
          </div>

          <div className={styles["form-group"]}>
            <label>Loại Thông báo</label>
            <select
              value={form.loaiThongBao}
              onChange={(e) => changeField("loaiThongBao", e.target.value)}
            >
              <option value="DADUYET">Đã duyệt</option>
              <option value="QUAHAN">Quá hạn</option>
              <option value="SAPTOIHAN">Sắp đến hạn</option>
              <option value="DATRASACH">Đã trả sách</option>
            </select>
          </div>

          <div className={styles["form-group"]}>
            <label>Trạng thái đã đọc</label>
            <div className="d-flex align-items-center gap-2">
              <span
                className={`${styles["status-badge"]} ${
                  form.trangThaiDaDoc
                    ? styles["status-read"]
                    : styles["status-unread"]
                }`}
              >
                {form.trangThaiDaDoc ? "Đã đọc" : "Chưa đọc"}
              </span>
              <button
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={toggleTrangThaiDaDoc}
              >
                {form.trangThaiDaDoc ? "Đánh dấu CHƯA đọc" : "Đánh dấu ĐÃ đọc"}
              </button>
            </div>
          </div>

          <div
            className={styles["form-group"]}
            style={{ gridColumn: "1 / -1" }}
          >
            <label>Nội dung</label>
            <textarea
              rows={5}
              value={form.noiDung}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                changeField("noiDung", e.target.value)
              }
            />
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
          <Link to="/admin/thongbao" className={styles["cancel-btn"]}>
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TBEdit;
