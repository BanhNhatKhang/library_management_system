import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "../css/HomePage.module.css";

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

function HomePage() {
  const [flashSaleBooks, setFlashSaleBooks] = useState<SachDTO[]>([]);
  const [allBooks, setAllBooks] = useState<SachDTO[]>([]);
  const [allTheLoai, setAllTheLoai] = useState<TheLoaiDTO[]>([]);

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
    axios
      .get("/api/home/sach-uu-dai")
      .then((res) => setFlashSaleBooks(res.data))
      .catch((error) =>
        console.error("Error fetching flash sale books:", error)
      );

    axios
      .get("/api/home/sach/all")
      .then((res) => setAllBooks(res.data))
      .catch((error) => console.error("Error fetching all books:", error));

    axios
      .get("/api/home/theloai")
      .then((res) => {
        console.log("API /theloai response:", res.data);
        setAllTheLoai(res.data);
      })
      .catch((error) => console.error("Error fetching all categories:", error));
  }, []);

  const BookCard = ({ book }: { book: SachDTO }) => {
    const donGia = Number(book.donGia);
    const giamGia = Number(book.giamGia || 0);
    const discountedPrice = donGia * (1 - giamGia);

    const formatCurrency = (amount: number) => {
      return amount.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    };

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
      <div className={styles["flash-sale-section"]}>
        <div className={styles["sale-header"]}>
          <h2 className={styles["sale-title"]}>
            <i className="fas fa-bolt me-2"></i>
            FLASH SALE
          </h2>
          <div className={styles["countdown"]}>
            Kết thúc trong: <span className={styles["timer"]}>00:00:00</span>{" "}
          </div>
          <Link to="/flash-sale" className={styles["view-all-link"]}>
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
