import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/category/TheLoaiDetails.module.css";

interface TheLoai {
  maTheLoai: string;
  tenTheLoai: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  anhBia: string;
  soLuong: number;
  donGia: number;
}

const TheLoaiDetails = () => {
  const { maTheLoai } = useParams<{ maTheLoai: string }>();
  const [theLoai, setTheLoai] = useState<TheLoai | null>(null);
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!maTheLoai) return;

    setLoading(true);
    setError("");

    // Lấy thông tin thể loại và sách thuộc thể loại
    Promise.all([
      axios.get(`/api/theloai/${maTheLoai}`),
      axios.get(`/api/sach/theloai/${maTheLoai}`),
    ])
      .then(([theLoaiRes, sachRes]) => {
        setTheLoai(theLoaiRes.data);
        setSachList(sachRes.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin thể loại");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [maTheLoai]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  if (loading) {
    return (
      <div className={styles["theloai-details"]}>
        <div className={styles["loading"]}>
          ⏳ Đang tải thông tin thể loại...
        </div>
      </div>
    );
  }

  if (error || !theLoai) {
    return (
      <div className={styles["theloai-details"]}>
        <Link to="/admin/theloai" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>
          {error || "❌ Không tìm thấy thể loại!"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["theloai-details"]}>
      <Link to="/admin/theloai" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2 className={styles["page-title"]}>🏷️ Chi tiết thể loại</h2>

      <div className={styles["main-container"]}>
        {/* Cột trái - Thông tin thể loại */}
        <div className={styles["theloai-info-section"]}>
          <h3 className={styles["theloai-info-title"]}>Thông tin chi tiết</h3>

          <div className={styles["theloai-content"]}>
            <div className={styles["theloai-info"]}>
              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Mã thể loại:</span>
                <span className={styles["info-value"]}>
                  {theLoai.maTheLoai}
                </span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>Tên thể loại:</span>
                <span className={styles["info-value"]}>
                  {theLoai.tenTheLoai}
                </span>
              </div>

              <div className={styles["info-item"]}>
                <span className={styles["info-label"]}>
                  Số sách thuộc thể loại:
                </span>
                <span className={`${styles["info-value"]} ${styles["stats"]}`}>
                  {sachList.length} sách
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Sách thuộc thể loại */}
        <div className={styles["sach-section"]}>
          <h3 className={styles["sach-title"]}>
            📚 Sách thuộc thể loại ({sachList.length})
          </h3>

          {sachList.length === 0 ? (
            <div className={styles["no-data"]}>
              <p>📚 Hiện tại chưa có sách nào thuộc thể loại này</p>
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
                          : "/images/no-image.png"
                      }
                      alt={sach.tenSach}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/no-image.png";
                      }}
                    />
                  </div>
                  <div className={styles["sach-info"]}>
                    <h4 className={styles["sach-name"]}>{sach.tenSach}</h4>
                    <p className={styles["sach-author"]}>
                      Tác giả: {sach.tacGia}
                    </p>
                    <p className={styles["sach-price"]}>
                      {formatPrice(sach.donGia)}
                    </p>
                    <p className={styles["sach-quantity"]}>
                      Số lượng: {sach.soLuong}
                    </p>
                    <div className={styles["sach-actions"]}>
                      <Link
                        to={`/admin/sach/${sach.maSach}`}
                        className={styles["view-btn"]}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i> Xem
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

export default TheLoaiDetails;
