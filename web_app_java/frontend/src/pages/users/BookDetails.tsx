import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../axiosConfig";
import { AxiosError } from "axios";
import styles from "../../css/users/book/BookDetails.module.css";
import homeStyles from "../../css/HomePage.module.css";
import { useAuth } from "../../context/AuthContext";

const getSubjectFromToken = () => {
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
    return payload.sub || null; // 'sub' là trường Subject (MaDocGia)
  } catch (e) {
    console.error("Failed to decode JWT payload:", e);
    return null;
  }
};

interface SachDTO {
  maSach: string;
  tenSach: string;
  donGia: number;
  giamGia: number;
  anhBia: string;
}

interface SachDetailsDTO {
  maSach: string;
  tenSach: string;
  donGia: number;
  giamGia: number;
  soQuyen: number;
  soSachMuonConLai: number;
  soLuongCoTheMua: number;
  anhBia: string;
  soLuong: number;
  namXuatBan: string;
  tacGia: string;
  moTa: string;
  diemDanhGia: number;
  nhaXuatBan: string;
  theLoais: string[];
}

interface GioHangRequestDTO {
  maDocGia: string;
  maSach: string;
  soLuong: number;
}

interface BorrowRequestDTO {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  trangThaiMuon: string;
  maNhanVien: string | null;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const renderRatingStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++)
    stars.push(<i key={i} className="fas fa-star"></i>);
  if (halfStar) stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
  for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++)
    stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
  return stars;
};

const BookCard = ({ book }: { book: SachDTO }) => {
  const donGia = Number(book.donGia);
  const giamGia = Number(book.giamGia || 0);
  const discountedPrice = donGia * (1 - giamGia);

  return (
    <div className={homeStyles["book-card"]}>
      <Link to={`/sach/${book.maSach}`}>
        <div className={homeStyles["book-image-container"]}>
          <img src={`/api/sach/image/${book.anhBia}`} alt={book.tenSach} />
          {giamGia > 0 && (
            <span className={homeStyles["discount-badge"]}>
              -{((giamGia || 0) * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <p className={homeStyles["book-title"]}>{book.tenSach}</p>
        <p className={homeStyles["book-price"]}>
          {formatCurrency(discountedPrice)}
          {giamGia > 0 && (
            <span className={homeStyles["original-price"]}>
              {formatCurrency(donGia)}
            </span>
          )}
        </p>
      </Link>
    </div>
  );
};

export default function BookDetails() {
  const { role } = useAuth();
  const { maSach } = useParams<{ maSach: string }>();
  const [book, setBook] = useState<SachDetailsDTO | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recommendedBooks, setRecommendedBooks] = useState<SachDTO[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  useEffect(() => {
    if (!maSach) return;
    axios.get(`/api/sach/id/${maSach}`).then((res) => {
      const data = res.data;
      setBook({
        ...data,
        donGia: Number(data.donGia),
        giamGia: Number(data.giamGia || 0),
        diemDanhGia: Number(data.diemDanhGia || 0),
        soQuyen: Number(data.soQuyen || 0),
        soSachMuonConLai: Number(data.soSachMuonConLai || 0),
        soLuongCoTheMua: Number(data.soLuongCoTheMua || 0), // Thêm field mới
      });
      axios
        .get(`/api/sach/goi-y/${maSach}`)
        .then((res) => {
          setRecommendedBooks(res.data.slice(0, 15));
        })
        .catch((error) =>
          console.error("Error fetching recommended books:", error)
        );
    });
  }, [maSach]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAddToCart = async () => {
    if (!book || !maSach) return;

    // 1. Kiểm tra vai trò và token
    if (role !== "DOCGIA") {
      setMessage({
        text: "Chức năng chỉ dành cho Độc Giả. Vui lòng đăng nhập.",
        type: "error",
      });
      return;
    }

    // 2. Kiểm tra số lượng có thể mua
    if (book.soLuongCoTheMua <= 0) {
      setMessage({
        text: "Sách đã hết hàng, không thể thêm vào giỏ hàng.",
        type: "error",
      });
      return;
    }

    // 3. Kiểm tra số lượng muốn mua
    if (quantity > book.soLuongCoTheMua) {
      setMessage({
        text: `Chỉ còn ${book.soLuongCoTheMua} cuốn sách, không thể thêm ${quantity} cuốn.`,
        type: "error",
      });
      return;
    }

    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) {
      setMessage({
        text: "Vui lòng đăng nhập để thêm vào giỏ hàng.",
        type: "error",
      });
      return;
    }

    // 4. Lấy maDocGia từ token
    const maDocGia = getSubjectFromToken();
    if (!maDocGia) {
      setMessage({
        text: "Không tìm thấy thông tin Độc Giả. Vui lòng đăng nhập lại.",
        type: "error",
      });
      return;
    }

    const payload: GioHangRequestDTO = {
      maDocGia: maDocGia,
      maSach: maSach,
      soLuong: quantity,
    };

    try {
      console.log("Adding to cart:", payload);

      const response = await axios.post("/api/giohang/add", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Add to cart success:", response.data);

      // 5. Cập nhật số lượng có thể mua trong state
      setBook((prev) =>
        prev
          ? {
              ...prev,
              soLuongCoTheMua: Math.max(0, prev.soLuongCoTheMua - quantity),
            }
          : null
      );

      setMessage({
        text: "Đã thêm sản phẩm vào giỏ hàng thành công!",
        type: "success",
      });

      // Thông báo header cập nhật giỏ hàng
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setMessage({
            text: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            type: "error",
          });
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          const errorMessage =
            error.response?.data || "Không thể thêm sản phẩm vào giỏ hàng";
          setMessage({
            text: `Lỗi: ${errorMessage}`,
            type: "error",
          });
        }
      } else {
        setMessage({
          text: "Lỗi: Không thể thêm sản phẩm vào giỏ hàng.",
          type: "error",
        });
      }
    }
  };

  const handleBorrow = async () => {
    if (!book || !maSach) return;

    // 1. Kiểm tra vai trò
    if (role !== "DOCGIA") {
      setMessage({
        text: "Chức năng chỉ dành cho Độc Giả. Vui lòng đăng nhập.",
        type: "error",
      });
      return;
    }

    // 2. Kiểm tra số sách mượn còn lại trước
    if (book.soSachMuonConLai <= 0) {
      setMessage({
        text: "Sách đã được mượn hết, vui lòng quay lại sau.",
        type: "error",
      });
      return;
    }

    try {
      // 3. Kiểm tra trạng thái mượn từ server
      const checkResponse = await axios.get(
        `/api/theodoimuonsach/check-borrow-status?maSach=${maSach}`
      );

      if (!checkResponse.data.canBorrow) {
        setMessage({
          text: checkResponse.data.message,
          type: "error",
        });
        return;
      }

      // 4. Lấy maDocGia từ token
      const maDocGia = getSubjectFromToken();
      if (!maDocGia) {
        setMessage({
          text: "Không tìm thấy thông tin Độc Giả. Vui lòng đăng nhập lại.",
          type: "error",
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const payload: BorrowRequestDTO = {
        maDocGia: maDocGia,
        maSach: maSach,
        ngayMuon: today,
        trangThaiMuon: "CHODUYET",
        maNhanVien: null,
      };

      // 5. Gửi yêu cầu mượn
      await axios.post("/api/theodoimuonsach", payload);

      // 6. Cập nhật số sách mượn còn lại trong state
      setBook((prev) =>
        prev
          ? {
              ...prev,
              soSachMuonConLai: Math.max(0, prev.soSachMuonConLai - 1),
            }
          : null
      );

      setMessage({
        text: "Yêu cầu mượn sách đã được gửi thành công. Vui lòng chờ phê duyệt!",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending borrow request:", error);

      let errorMessage = "Lỗi: Không thể gửi yêu cầu mượn.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (
          axiosError.response?.data &&
          typeof axiosError.response.data === "object" &&
          "message" in axiosError.response.data
        ) {
          errorMessage = (axiosError.response.data as { message: string })
            .message;
        } else if (
          axiosError.response?.data &&
          typeof axiosError.response.data === "string"
        ) {
          errorMessage = axiosError.response.data;
        }
      }

      setMessage({
        text: errorMessage,
        type: "error",
      });
    }
  };

  if (!book) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;

  const discountedPrice = book.donGia * (1 - book.giamGia);

  return (
    <div className={styles.container}>
      {/* Thông báo */}
      {message.text && (
        <div
          className={`alert alert-${
            message.type === "success" ? "success" : "danger"
          } mb-4`}
          role="alert"
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: message.type === "success" ? "#155724" : "#721c24",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            borderColor: message.type === "success" ? "#c3e6cb" : "#f5c6cb",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          {message.text}
        </div>
      )}
      <div className={styles.layout}>
        {/* ẢNH */}
        <div className={styles.imageBox}>
          <img
            src={`/api/sach/image/${book.anhBia}`}
            alt={book.tenSach}
            className={styles.mainImage}
          />
        </div>

        {/* THÔNG TIN */}
        <div className={styles.infoBox}>
          <h1 className={styles.title}>{book.tenSach}</h1>
          <div className={styles.meta}>
            <span className={styles.stars}>
              {renderRatingStars(book.diemDanhGia)}
            </span>
            <span className={styles.score}>
              ({book.diemDanhGia.toFixed(1)}/5)
            </span>
            <span className={styles.divider}>|</span>
            <span>Tác giả: </span>
            <b>{book.tacGia}</b>
            <span className={styles.divider}>|</span>
            <span>NXB: </span>
            <b>{book.nhaXuatBan}</b>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.discounted}>
              {formatCurrency(discountedPrice)}
            </span>
            {book.giamGia > 0 && (
              <>
                <span className={styles.original}>
                  {formatCurrency(book.donGia)}
                </span>
                <span className={styles.badge}>
                  -{(book.giamGia * 100).toFixed(0)}%
                </span>
              </>
            )}
          </div>

          <div className={styles.quantity}>
            <label>Số lượng:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.addCart} onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button
              className={styles.borrow}
              onClick={handleBorrow}
              disabled={book.soSachMuonConLai <= 0}
              style={{
                opacity: book.soSachMuonConLai <= 0 ? 0.6 : 1,
                cursor: book.soSachMuonConLai <= 0 ? "not-allowed" : "pointer",
              }}
            >
              {book.soSachMuonConLai <= 0 ? "Hết sách mượn" : "Mượn"}
            </button>
          </div>

          <div className={styles.shipping}>
            <p>
              <b>Chính sách Fahasa:</b>
            </p>
            <ul>
              <li>🚚 Giao hàng nhanh & uy tín</li>
              <li>🔁 Đổi trả miễn phí toàn quốc</li>
              <li>💳 Ưu đãi khi mua số lượng lớn</li>
            </ul>
          </div>
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT */}
      <div className={styles.details}>
        <h2>Thông tin chi tiết</h2>
        <table>
          <tbody>
            <tr>
              <th>Mã hàng</th>
              <td>{book.maSach}</td>
            </tr>
            <tr>
              <th>Tác giả</th>
              <td>{book.tacGia}</td>
            </tr>
            <tr>
              <th>NXB</th>
              <td>{book.nhaXuatBan}</td>
            </tr>
            <tr>
              <th>Năm XB</th>
              <td>{book.namXuatBan}</td>
            </tr>
            <tr>
              <th>Thể loại</th>
              <td>{book.theLoais.join(", ")}</td>
            </tr>
            <tr>
              <th>Số sách mượn còn lại</th>
              <td>{book.soSachMuonConLai || 0} quyển</td>
            </tr>
            <tr>
              <th>Số lượng</th>
              <td>{book.soLuong} quyển</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MÔ TẢ */}
      <div className={styles.description}>
        <h2>Mô tả sản phẩm</h2>
        <p>{book.moTa || "Chưa có mô tả cho sản phẩm này."}</p>
      </div>

      {/* ĐÁNH GIÁ */}
      <div className={styles.rating}>
        <h2>Đánh giá sản phẩm</h2>
        <div className={styles.ratingBox}>
          <span className={styles.ratingScore}>4.5/5</span>
          <div className={styles.ratingStars}>{renderRatingStars(4.5)}</div>
        </div>
      </div>
      {/* GỢI Ý */}
      {recommendedBooks.length > 0 && (
        <div className={styles.recommendationSection}>
          <h2 className={styles.recommendationTitle}>Gợi ý cho bạn</h2>
          <div className={styles.recommendationGrid}>
            {recommendedBooks.map((book) => (
              <BookCard key={book.maSach} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
