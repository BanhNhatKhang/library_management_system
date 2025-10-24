import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/notification/TBDetails.module.css";

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

const TBDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [thongBao, setThongBao] = useState<ThongBao | null>(null);
  const [loading, setLoading] = useState(true);
  const thongBaoId = id ? parseInt(id) : undefined;

  useEffect(() => {
    if (!thongBaoId) return;
    setLoading(true);
    axios
      .get(`/api/thongbao/id/${thongBaoId}`)
      .then((r) => setThongBao(r.data))
      .catch(() => setThongBao(null))
      .finally(() => setLoading(false));
  }, [thongBaoId]);

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!thongBao)
    return (
      <div className="p-3">
        <Link to="/admin/thongbao" className="btn btn-secondary mb-3">
          ← Quay lại
        </Link>
        <div>Không tìm thấy thông báo</div>
      </div>
    );

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "—";

  return (
    <div className={styles["tb-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/thongbao" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <h2 className={styles["page-title"]}>✉️ Chi tiết Thông báo</h2>
        <div className={styles["spacer"]}></div>
      </div>

      <div>
        <div className={styles["tab-panel"]}>
          <div className={styles["info-section"]}>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>ID Thông báo:</span>
              <span className={styles["info-value"]}>{thongBao.id}</span>
            </div>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>Mã độc giả:</span>
              <span className={styles["info-value"]}>
                {thongBao.maDocGia || "Tất cả"}
              </span>
            </div>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>Mã sách liên quan:</span>
              <span className={styles["info-value"]}>
                {thongBao.maSach || "—"}
              </span>
            </div>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>Ngày mượn (nếu có):</span>
              <span className={styles["info-value"]}>
                {thongBao.ngayMuon ? formatDate(thongBao.ngayMuon) : "—"}
              </span>
            </div>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>Thời gian gửi:</span>
              <span className={styles["info-value"]}>
                {formatDate(thongBao.thoiGianGui)}
              </span>
            </div>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>Loại thông báo:</span>
              <span className={styles["info-value"]}>
                {thongBao.loaiThongBao}
              </span>
            </div>
            <div className={styles["info-item"]}>
              <span className={styles["info-label"]}>Trạng thái:</span>
              <span
                className={`${styles["status-value"]} ${
                  thongBao.trangThaiDaDoc
                    ? styles["status-read"]
                    : styles["status-unread"]
                }`}
              >
                {thongBao.trangThaiDaDoc ? "✅ Đã đọc" : "❌ Chưa đọc"}
              </span>
            </div>
          </div>

          <div className={styles["content-section"]}>
            <h3>Nội dung</h3>
            <p className={styles["noi-dung-value"]}>{thongBao.noiDung}</p>
          </div>

          <button
            className={styles["btn-edit"]}
            onClick={() =>
              (window.location.href = `/admin/thongbao/edit/${thongBao.id}`)
            }
          >
            ✏️ Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default TBDetails;
