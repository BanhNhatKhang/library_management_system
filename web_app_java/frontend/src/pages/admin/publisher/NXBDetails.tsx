import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/publisher/NXBDetails.module.css";

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
  diaChi: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  anhBia: string;
  soLuong: number;
  donGia: number;
}

const NXBDetails = () => {
  const { maNhaXuatBan } = useParams<{ maNhaXuatBan: string }>();
  const [nxb, setNxb] = useState<NhaXuatBan | null>(null);
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!maNhaXuatBan) return;

    setLoading(true);
    setError("");

    // Lấy thông tin nhà xuất bản và sách của nhà xuất bản
    Promise.all([
      axios.get(`/api/nhaxuatban/${maNhaXuatBan}`),
      axios.get(`/api/sach/nxb/${encodeURIComponent(maNhaXuatBan)}`),
    ])
      .then(([nxbRes, sachRes]) => {
        setNxb(nxbRes.data);
        setSachList(sachRes.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin nhà xuất bản");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maNhaXuatBan]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  if (loading) {
    return (
      <div className={styles["nxb-details"]}>
        <div className={styles["loading"]}>
          ⏳ Đang tải thông tin nhà xuất bản...
        </div>
      </div>
    );
  }

  if (error || !nxb) {
    return (
      <div className={styles["nxb-details"]}>
        <Link to="/admin/nxb" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>
          {error || "❌ Không tìm thấy nhà xuất bản!"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["nxb-details"]}>
      <Link to="/admin/nxb" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2 className={styles["page-title"]}>🏢 Chi tiết nhà xuất bản</h2>

      <div className={styles["main-container"]}>
        {/* Cột trái - Thông tin nhà xuất bản */}
        <div className={styles["nxb-info-section"]}>
          <h3 className={styles["nxb-info-title"]}>Thông tin chi tiết</h3>

          <div className={styles["nxb-content"]}>
            <div className={styles["nxb-info"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã NXB:</span>
                <span className={styles["info-value"]}>{nxb.maNhaXuatBan}</span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tên NXB:</span>
                <span className={styles["info-value"]}>
                  {nxb.tenNhaXuatBan}
                </span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Địa chỉ:</span>
                <span className={styles["info-value"]}>{nxb.diaChi}</span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Số lượng sách:</span>
                <span className={`${styles["info-value"]} ${styles["stats"]}`}>
                  {sachList.length} cuốn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Sách của nhà xuất bản */}
        <div className={styles["sach-section"]}>
          <h3 className={styles["sach-title"]}>
            📚 Sách của nhà xuất bản ({sachList.length})
          </h3>

          {sachList.length === 0 ? (
            <div className={styles["no-data"]}>
              <p>📚 Hiện tại chưa có sách nào của nhà xuất bản này</p>
            </div>
          ) : (
            <div className={styles["sach-grid"]}>
              {sachList.map((sach) => (
                <div key={sach.maSach} className={styles["sach-card"]}>
                  <div className={styles["sach-image"]}>
                    <img
                      src={
                        sach.anhBia
                          ? (() => {
                              const pathParts = sach.anhBia.split("/");
                              const folder = pathParts[0];
                              const filename = pathParts[1];
                              return `http://localhost:8080/api/sach/image/${folder}/${filename}`;
                            })()
                          : "/default-book.png"
                      }
                      alt={sach.tenSach}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-book.png";
                      }}
                    />
                  </div>

                  <div className={styles["sach-info"]}>
                    <h4 className={styles["sach-name"]}>{sach.tenSach}</h4>
                    <p className={styles["sach-author"]}>👤 {sach.tacGia}</p>
                    <p className={styles["sach-price"]}>
                      💰 {formatPrice(sach.donGia)}
                    </p>
                    <p className={styles["sach-quantity"]}>
                      📦 Còn lại: {sach.soLuong}
                    </p>

                    <div className={styles["sach-actions"]}>
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className={styles["view-btn"]}
                      >
                        👁️ Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NXBDetails;
