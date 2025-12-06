import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/promotion/UDDetails.module.css";

interface UuDai {
  maUuDai: string;
  tenUuDai: string;
  moTa: string;
  phanTramGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
}

interface SachApDung {
  maSach: string;
  tenSach: string;
  dongia: number;
}

interface SachDTOFromAPI {
  maSach: string;
  tenSach: string;
  donGia: number;
}

const UDDetails: React.FC = () => {
  const { maUuDai } = useParams<{ maUuDai: string }>();
  const [uuDai, setUuDai] = useState<UuDai | null>(null);
  const [sachList, setSachList] = useState<SachApDung[]>([]);
  const [active, setActive] = useState<"uudai" | "sach">("uudai");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maUuDai) return;
    setLoading(true);
    axios
      .get(`/api/uudai/${maUuDai}`)
      .then((res) => setUuDai(res.data))
      .catch(() => setUuDai(null))
      .finally(() => setLoading(false));
  }, [maUuDai]);

  useEffect(() => {
    if (!maUuDai) return;
    axios
      .get(`/api/uudai/sach/${maUuDai}`)
      .then((res) => {
        const sachDTOList: SachDTOFromAPI[] = res.data;
        const mappedList: SachApDung[] = sachDTOList.map(
          (item: SachDTOFromAPI) => ({
            maSach: item.maSach,
            tenSach: item.tenSach,
            dongia: item.donGia,
          })
        );
        setSachList(mappedList || []);
      })
      .catch(() => setSachList([]));
  }, [maUuDai]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";
  const formatPrice = (p?: number) =>
    p != null ? new Intl.NumberFormat("vi-VN").format(p) + " đ" : "—";

  if (loading) return <div className="p-3">⏳ Đang tải...</div>;
  if (!uuDai)
    return (
      <div className="p-3">
        <Link to="/admin/uudai" className="btn btn-secondary mb-3">
          ← Quay lại
        </Link>
        <div>Không tìm thấy ưu đãi</div>
      </div>
    );

  return (
    <div className={styles["ud-details"]}>
      <div className={styles["header-container"]}>
        <Link to="/admin/uudai" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <h2 className={styles["page-title"]}>🎁 Chi tiết ưu đãi</h2>
        <div className={styles["spacer"]}></div>
      </div>

      {/* Tabs */}
      <div className={styles["tab-navigation"]}>
        <button
          className={`${styles["tab-button"]} ${
            active === "uudai" ? styles["active"] : ""
          }`}
          onClick={() => setActive("uudai")}
        >
          🎁 Ưu đãi
        </button>
        <button
          className={`${styles["tab-button"]} ${
            active === "sach" ? styles["active"] : ""
          }`}
          onClick={() => setActive("sach")}
        >
          📚 Sách thuộc ưu đãi ({sachList.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {/* Thông tin ưu đãi */}
        {active === "uudai" && (
          <div className={styles["tab-panel"]}>
            <div className={styles["info-section"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã ưu đãi:</span>
                <span className={styles["info-value"]}>{uuDai.maUuDai}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tên ưu đãi:</span>
                <span className={styles["info-value"]}>{uuDai.tenUuDai}</span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Phần trăm giảm:</span>
                <span className={styles["info-value"]}>
                  {uuDai.phanTramGiam}%
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Ngày bắt đầu:</span>
                <span className={styles["info-value"]}>
                  {formatDate(uuDai.ngayBatDau)}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Ngày kết thúc:</span>
                <span className={styles["info-value"]}>
                  {formatDate(uuDai.ngayKetThuc)}
                </span>
              </div>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mô tả:</span>
                <span className={styles["info-value"]}>
                  {uuDai.moTa || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sách thuộc ưu đãi */}
        {active === "sach" && (
          <div className={styles["tab-panel"]}>
            {sachList.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Giá bìa</th>
                  </tr>
                </thead>
                <tbody>
                  {sachList.map((s) => (
                    <tr key={s.maSach}>
                      <td>{s.maSach}</td>
                      <td>{s.tenSach}</td>
                      <td>{formatPrice(s.dongia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles["no-data"]}>
                📚 Không có sách nào áp dụng ưu đãi này
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UDDetails;
