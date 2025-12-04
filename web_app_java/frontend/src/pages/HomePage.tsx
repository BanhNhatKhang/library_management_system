import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "../css/HomePage.module.css";
import { useAuth } from "../context/AuthContext";

interface SachDTO {
  maSach: string;
  tenSach: string;
  donGia: number;
  giamGia: number;
  anhBia: string;
}

interface TheLoaiDTO {
  maTheLoai: string;
  tenTheLoai: string;
}

interface UuDaiDTO {
  maUuDai: string;
  tenUuDai: string;
  moTa: string;
  phanTramGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
}

// Utility function để decode token
const getEmailFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    return payload.sub; // Trả về email trực tiếp
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};

function HomePage() {
  const { role } = useAuth();
  const [flashSaleBooks, setFlashSaleBooks] = useState<SachDTO[]>([]);
  const [allBooks, setAllBooks] = useState<SachDTO[]>([]);
  const [allTheLoai, setAllTheLoai] = useState<TheLoaiDTO[]>([]);
  const [availableUuDai, setAvailableUuDai] = useState<UuDaiDTO[]>([]);
  const [savedUuDai, setSavedUuDai] = useState<string[]>([]);
  const [loadingUuDai, setLoadingUuDai] = useState<string[]>([]);

  const userEmail = getEmailFromToken();
  const MAX_DISPLAY_BOOKS = 35;

  // Logic lọc và nhóm 9 thể loại
  const homeCategoriesDisplay = useMemo(() => {
    return allTheLoai.slice(0, 9);
  }, [allTheLoai]);

  const categoryImages: Record<string, string> = {
    TL001: "/category-icons/banner6.jpg",
    TL002: "/category-icons/banner1.webp",
    TL003: "/category-icons/banner1.webp",
    FB001: "/category-icons/banner7.webp",
    FB002: "/category-icons/banner3.webp",
    FB003: "/category-icons/banner2.webp",
    TL004: "/category-icons/banner6.jpg",
    TL005: "/category-icons/banner6.jpg",
    TL006: "/category-icons/banner2.webp",
  };

  useEffect(() => {
    // SỬA: Gộp tất cả fetch logic vào một function
    const fetchAllData = async () => {
      try {
        // Fetch flash sale books
        const flashSaleResponse = await axios.get("/api/home/sach-uu-dai");
        setFlashSaleBooks(flashSaleResponse.data);

        // Fetch all books
        const allBooksResponse = await axios.get("/api/home/sach/all");
        setAllBooks(allBooksResponse.data);

        // Fetch categories
        const categoriesResponse = await axios.get("/api/home/theloai");
        setAllTheLoai(categoriesResponse.data);

        // Fetch available promotions
        const uudaiResponse = await axios.get("/api/uudai/public");
        setAvailableUuDai(uudaiResponse.data);

        // Fetch saved promotions if logged in
        if (userEmail && role === "DOCGIA") {
          const token = localStorage.getItem("authToken");
          const savedResponse = await axios.get(`/api/uudai/saved`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const savedIds = savedResponse.data.map(
            (uudai: UuDaiDTO) => uudai.maUuDai
          );
          setSavedUuDai(savedIds);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, [userEmail, role]); // SỬA: Chỉ gọi một lần khi userEmail hoặc role thay đổi

  const handleSaveUuDai = async (maUuDai: string) => {
    if (!userEmail || role !== "DOCGIA") {
      alert("Vui lòng đăng nhập để lưu ưu đãi!");
      return;
    }

    setLoadingUuDai((prev) => [...prev, maUuDai]);

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (savedUuDai.includes(maUuDai)) {
        // Bỏ lưu
        await axios.delete(`/api/uudai/unsave/${maUuDai}`, { headers });
        setSavedUuDai((prev) => prev.filter((id) => id !== maUuDai));
        alert("Đã bỏ lưu ưu đãi!");
      } else {
        // Lưu
        await axios.post(`/api/uudai/save/${maUuDai}`, {}, { headers });
        setSavedUuDai((prev) => [...prev, maUuDai]);
        alert("Đã lưu ưu đãi thành công!");
      }
    } catch (error) {
      console.error("Error saving/unsaving uu dai:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          alert("Không có quyền thực hiện thao tác này!");
        } else if (error.response?.status === 401) {
          alert("Vui lòng đăng nhập lại!");
        } else {
          alert(
            `Lỗi: ${
              error.response?.data?.error || "Không thể thực hiện thao tác"
            }`
          );
        }
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setLoadingUuDai((prev) => prev.filter((id) => id !== maUuDai));
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getPromoIcon = (tenUuDai: string, moTa: string) => {
    const text = `${tenUuDai} ${moTa}`.toLowerCase();

    if (
      text.includes("freeship") ||
      text.includes("miễn phí vận chuyển") ||
      text.includes("giao hàng")
    ) {
      return {
        icon: "fas fa-shipping-fast",
        bg: "linear-gradient(135deg, #66bb6a, #43a047)",
      };
    }
    if (
      text.includes("thiếu nhi") ||
      text.includes("trẻ em") ||
      text.includes("children")
    ) {
      return {
        icon: "fas fa-child",
        bg: "linear-gradient(135deg, #42a5f5, #1e88e5)",
      };
    }
    if (
      text.includes("đồ chơi") ||
      text.includes("toy") ||
      text.includes("game")
    ) {
      return {
        icon: "fas fa-gamepad",
        bg: "linear-gradient(135deg, #ab47bc, #8e24aa)",
      };
    }
    if (
      text.includes("ngoại văn") ||
      text.includes("foreign") ||
      text.includes("english")
    ) {
      return {
        icon: "fas fa-globe",
        bg: "linear-gradient(135deg, #26a69a, #00695c)",
      };
    }

    return {
      icon: "fas fa-percentage",
      bg: "linear-gradient(135deg, #ffa726, #fb8c00)",
    };
  };

  const BookCard = ({ book }: { book: SachDTO }) => {
    const donGia = Number(book.donGia);
    const giamGia = Number(book.giamGia || 0);
    const discountedPrice = donGia * (1 - giamGia);

    return (
      <div className={styles["book-card"]}>
        <Link to={`/sach/${book.maSach}`}>
          <div className={styles["book-image-container"]}>
            <img src={`/api/sach/image/${book.anhBia}`} alt={book.tenSach} />
            {giamGia > 0 && (
              <span className={styles["discount-badge"]}>
                -{((giamGia || 0) * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <p className={styles["book-title"]}>{book.tenSach}</p>
          <p className={styles["book-price"]}>
            {formatCurrency(discountedPrice)}
            {giamGia > 0 && (
              <span className={styles["original-price"]}>
                {formatCurrency(donGia)}
              </span>
            )}
          </p>
        </Link>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      {/* Flash Sale Section */}
      <div className={styles["flash-sale-section"]}>
        <div className={styles["sale-header"]}>
          <h2 className={styles["sale-title"]}>
            <i className="fas fa-bolt me-2"></i>
            FLASH SALE
          </h2>
          <div className={styles["countdown"]}>
            Kết thúc trong: <span className={styles["timer"]}>00:00:00</span>{" "}
          </div>
          <Link to="/flash-sale" className={styles["btn-view-all-books"]}>
            Xem tất cả
          </Link>
        </div>

        <div className={styles["sale-books-grid"]}>
          {flashSaleBooks.map((book) => (
            <BookCard key={book.maSach} book={book} />
          ))}
        </div>
      </div>

      <hr className="my-5" />

      {/* Category Section */}
      <div className={styles["category-display-section"]}>
        <h2 className={styles["section-title"]}>Danh mục sản phẩm</h2>
        <div className={styles["home-categories-grid"]}>
          {homeCategoriesDisplay.map((cat) => {
            const imgSrc = categoryImages[cat.maTheLoai];
            return (
              <div key={cat.maTheLoai} className={styles["home-category-item"]}>
                <Link
                  to={`/the-loai/${cat.maTheLoai}`}
                  className={styles["home-category-link"]}
                >
                  <img
                    src={imgSrc}
                    alt={cat.tenTheLoai}
                    className={styles["category-image"]}
                  />
                </Link>
                <Link
                  to={`/the-loai/${cat.maTheLoai}`}
                  className={styles["category-name-link"]}
                >
                  <span className={styles["category-name"]}>
                    {cat.tenTheLoai}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="my-5" />

      {/* Promotion Section */}
      <div className={styles["promotion-section"]}>
        <div className={styles["promotion-header"]}>
          <h2 className={styles["section-title"]}>Ưu đãi đặc biệt</h2>
          <p className={styles["promotion-subtitle"]}>
            Lưu ngay để sử dụng khi thanh toán
          </p>
        </div>

        {availableUuDai.length === 0 ? (
          <div className={styles["no-promotion"]}>
            <div className={styles["empty-state"]}>
              <i className="fas fa-gift fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">Hiện tại chưa có ưu đãi nào</h4>
              <p className="text-muted">
                Vui lòng quay lại sau để xem các ưu đãi mới!
              </p>
            </div>
          </div>
        ) : (
          <div className={styles["promotion-grid"]}>
            {availableUuDai.map((uudai) => {
              const iconInfo = getPromoIcon(uudai.tenUuDai, uudai.moTa);

              return (
                <div key={uudai.maUuDai} className={styles["promotion-card"]}>
                  {/* Icon category */}
                  <div
                    className={styles["promo-icon"]}
                    style={{ background: iconInfo.bg }}
                  >
                    <i className={iconInfo.icon}></i>
                  </div>

                  {/* Content */}
                  <div className={styles["promo-content"]}>
                    <div className={styles["promo-main-content"]}>
                      <h4 className={styles["promo-title"]}>
                        {uudai.tenUuDai}
                      </h4>
                      <p className={styles["promo-description"]}>
                        {uudai.moTa}
                      </p>
                    </div>

                    <div className={styles["promo-validity"]}>
                      <i className="far fa-clock"></i>
                      <span>HSD: {formatDate(uudai.ngayKetThuc)}</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className={styles["promo-action"]}>
                    <button
                      className={`${styles["save-button"]} ${
                        savedUuDai.includes(uudai.maUuDai)
                          ? styles["saved"]
                          : ""
                      }`}
                      onClick={() => handleSaveUuDai(uudai.maUuDai)}
                      disabled={loadingUuDai.includes(uudai.maUuDai)}
                    >
                      {loadingUuDai.includes(uudai.maUuDai) ? (
                        <span>
                          <i className="fas fa-spinner fa-spin me-1"></i>
                          Đang xử lý
                        </span>
                      ) : savedUuDai.includes(uudai.maUuDai) ? (
                        <span>
                          <i className="fas fa-check me-1"></i>
                          Đã lưu
                        </span>
                      ) : (
                        "Lưu mã"
                      )}
                    </button>
                  </div>

                  {/* Category label */}
                  <div className={styles["promo-category"]}>
                    {uudai.tenUuDai.includes("freeship") ||
                    uudai.tenUuDai.includes("miễn phí") ? (
                      <span className={styles["category-label-freeship"]}>
                        Freeship
                      </span>
                    ) : (
                      <span className={styles["category-label-discount"]}>
                        Mã giảm
                      </span>
                    )}
                  </div>

                  {/* Discount percentage badge */}
                  <div className={styles["discount-badge-corner"]}>
                    {uudai.phanTramGiam}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="my-5" />

      {/* All Books Section */}
      <div className={styles["all-books-section"]}>
        <h2 className={styles["section-title"]}>Gợi ý hôm nay</h2>
        <div className={styles["all-books-grid"]}>
          {allBooks.slice(0, MAX_DISPLAY_BOOKS).map((book) => (
            <BookCard key={book.maSach} book={book} />
          ))}
        </div>
        <div className="text-center mt-5">
          <Link to="/sach/tat-ca" className={styles["btn-view-all-books"]}>
            Xem tất cả
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
