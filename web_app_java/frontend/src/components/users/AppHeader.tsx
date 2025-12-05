import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/users/AppHeader.module.css";
import axios from "../../../axiosConfig";
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
    if (payload.role === "DOCGIA" || payload.role === "ROLE_DOCGIA") {
      return payload.sub || null;
    }
    return null;
  } catch {
    return null;
  }
};

interface SachDTO {
  maSach: string;
  tenSach: string;
}

interface HomeDTO {
  maTheLoai: string;
  tenTheLoai: string;
  sachList: SachDTO[];
}

interface HeaderCategory {
  id: "domestic" | "foreign";
  name: string;
  icon: string;
}

interface Notification {
  id: number;
  maDocGia: string;
  maSach: string;
  noiDung: string;
  thoiGianGui: string;
  loaiThongBao: string;
  trangThaiDaDoc: boolean;
}

interface FineInfo {
  totalUnpaidFines: number;
  formattedAmount: string;
  maDocGia: string;
}

const mainCategories: HeaderCategory[] = [
  {
    id: "domestic",
    name: "Sách Trong Nước",
    icon: "fa-earth-asia",
  },
  {
    id: "foreign",
    name: "Sách Ngoài Nước",
    icon: "fa-globe",
  },
];

const Header = () => {
  useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<
    "domestic" | "foreign" | null
  >(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Tài Khoản");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [categoriesWithBooks, setCategoriesWithBooks] = useState<HomeDTO[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fineInfo, setFineInfo] = useState<FineInfo | null>(null);

  const [cartCount, setCartCount] = useState<number>(0);

  const [fullName, setFullName] = useState("");

  const isDocGia = !!getSubjectFromToken();

  const fetchCartCount = useCallback(async () => {
    const maDocGia = getSubjectFromToken();
    if (!maDocGia) {
      setCartCount(0);
      return;
    }
    try {
      const res = await axios.get(`/api/giohang/${maDocGia}`);
      setCartCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error("Error fetching cart count:", err);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    // Lắng nghe thay đổi localStorage (khác tab) và sự kiện tùy chỉnh 'cartUpdated'
    const onStorage = (e: StorageEvent) => {
      if (e.key === "authToken") fetchCartCount();
    };
    const onCartUpdated = () => fetchCartCount();

    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdated", onCartUpdated as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdated", onCartUpdated as EventListener);
    };
  }, [fetchCartCount]);

  // Wrap fetchNotifications với useCallback
  const fetchNotifications = useCallback(async () => {
    try {
      console.log("Fetching notifications for current user");
      const res = await axios.get(`/api/thongbao/current-user`);
      console.log("Notifications received:", res.data);

      // Kiểm tra nếu response có cấu trúc phân trang
      if (res.data && res.data.content && Array.isArray(res.data.content)) {
        setNotifications(res.data.content);
      } else if (Array.isArray(res.data)) {
        // Nếu trả về trực tiếp là mảng
        setNotifications(res.data);
      } else {
        // Nếu không có dữ liệu hoặc cấu trúc khác
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, []); // Empty dependency array vì không phụ thuộc vào state/props nào

  const fetchFineInfo = useCallback(async () => {
    if (!isLoggedIn || !isDocGia) {
      setFineInfo(null);
      return;
    }

    try {
      const response = await axios.get("/api/phat/docgia/me/total");
      setFineInfo(response.data);
    } catch (error) {
      console.error("Error fetching fine info:", error);
      setFineInfo(null);
    }
  }, [isLoggedIn, isDocGia]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedToken = localStorage.getItem("authToken");
    const storedFullName = localStorage.getItem("fullName") || storedUserName;
    const isUserLoggedIn = !!storedToken;

    if (isUserLoggedIn) {
      setIsLoggedIn(true);
      setUserName(storedUserName || "Tài Khoản");
      setFullName(storedFullName || storedUserName || "Khách hàng");

      // Lấy thông báo cho user đã đăng nhập - không cần truyền tham số
      fetchNotifications();
      fetchFineInfo();
    } else {
      setIsLoggedIn(false);
      setUserName("Tài Khoản");
      setFullName("");
      setNotifications([]);
    }

    // Lấy danh mục sách
    axios
      .get("/api/home/sach-theo-theloai")
      .then((res) => {
        setCategoriesWithBooks(res.data);
      })
      .catch(() => setCategoriesWithBooks([]));
  }, [fetchNotifications, fetchFineInfo]); // Bây giờ dependencies sẽ stable

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.trangThaiDaDoc).length;

  // Function để format thời gian
  const formatNotificationTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString("vi-VN");
    } catch {
      return timeString;
    }
  };

  // Function để lấy màu cho từng loại thông báo
  const getNotificationColor = (loaiThongBao: string) => {
    switch (loaiThongBao) {
      case "DADUYET":
        return "#10b981"; // Green
      case "QUAHAN":
        return "#ef4444"; // Red
      case "SAPTOIHAN":
        return "#f59e0b"; // Orange
      case "DATRASACH":
        return "#3b82f6"; // Blue
      default:
        return "#6b7280"; // Gray
    }
  };

  // Function để lấy icon cho từng loại thông báo
  const getNotificationIcon = (loaiThongBao: string) => {
    switch (loaiThongBao) {
      case "DADUYET":
        return "fa-check-circle";
      case "QUAHAN":
        return "fa-exclamation-triangle";
      case "SAPTOIHAN":
        return "fa-clock";
      case "DATRASACH":
        return "fa-book";
      default:
        return "fa-bell";
    }
  };

  // Function để mark thông báo là đã đọc
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await axios.put(`/api/thongbao/${notificationId}/mark-read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, trangThaiDaDoc: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = () => {
    // Xóa tất cả các khóa liên quan đến người dùng trong Local Storage
    localStorage.removeItem("userName"); // Key giả định
    localStorage.removeItem("role"); // Key thực tế bạn đang dùng
    localStorage.removeItem("authToken"); // xoa token

    setIsLoggedIn(false); // Cập nhật state
    setUserName("Tài Khoản");
    setIsUserDropdownOpen(false);
  };

  const getSubcategoriesWithBooks = (
    activeId: "domestic" | "foreign"
  ): HomeDTO[] => {
    let filteredCategories: HomeDTO[] = [];
    if (activeId === "domestic") {
      filteredCategories = categoriesWithBooks.filter((cat) =>
        cat.maTheLoai.startsWith("TL")
      );
    } else if (activeId === "foreign") {
      filteredCategories = categoriesWithBooks.filter((cat) =>
        cat.maTheLoai.startsWith("FB")
      );
    }
    // Giới hạn chỉ lấy 4 thể loại đầu tiên
    return filteredCategories.slice(0, 4);
  };

  const LoggedInUserDropdown = () => (
    <div
      className={`${styles["user-dropdown"]} ${styles["logged-in-dropdown"]}`}
      style={{ width: "220px" }}
    >
      {/* Tên người dùng đầy đủ */}
      <Link
        to="/profile"
        className={styles["dropdown-item"]}
        style={{
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "8px",
          paddingBottom: "8px",
          fontWeight: "bold",
        }}
      >
        <i className="fas fa-user-gear me-2"></i>
        {fullName}
      </Link>

      {/* Hiển thị thông tin phạt nếu có */}
      {fineInfo && fineInfo.totalUnpaidFines > 0 && (
        <div
          className={styles["dropdown-item"]}
          style={{
            borderBottom: "1px solid #e5e7eb",
            marginBottom: "8px",
            paddingBottom: "8px",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            fontWeight: "bold",
          }}
        >
          <i className="fas fa-exclamation-triangle me-2"></i>
          Phạt: {fineInfo.formattedAmount}
        </div>
      )}

      <Link to="/profile?tab=orders" className={styles["dropdown-item"]}>
        <i className="fas fa-receipt me-2"></i>
        Đơn hàng của tôi
      </Link>

      <Link to="/profile?tab=fines" className={styles["dropdown-item"]}>
        <i className="fas fa-money-bill-wave me-2"></i>
        Thông tin phạt
      </Link>

      <Link to="/" onClick={handleLogout} className={styles["dropdown-item"]}>
        <i className="fas fa-sign-out-alt me-2"></i>
        Thoát tài khoản
      </Link>
    </div>
  );

  const LoggedOutUserDropdown = () => (
    <div className={styles["user-dropdown"]}>
      <Link to="/login" className={styles["dropdown-item"]}>
        <i className="fas fa-sign-in-alt me-2"></i>
        Đăng nhập
      </Link>
      <Link to="/register" className={styles["dropdown-item"]}>
        <i className="fas fa-user-plus me-2"></i>
        Đăng ký
      </Link>
    </div>
  );

  const currentCategoriesWithBooks = activeCategoryId
    ? getSubcategoriesWithBooks(activeCategoryId)
    : [];

  // Nếu muốn thêm delay, bạn có thể sử dụng useRef và setTimeout:
  const notificationTimeoutRef = useRef<number | null>(null);

  const handleNotificationMouseEnter = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setIsNotificationsOpen(true);
  };

  const handleNotificationMouseLeave = () => {
    notificationTimeoutRef.current = setTimeout(() => {
      setIsNotificationsOpen(false);
    }, 200); // 200ms delay
  };

  return (
    <header className={styles["app-header"]}>
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-10">
            <div className={styles["header-content"]}>
              {/* Danh mục bên trái */}
              <div
                className={styles["category-menu"]}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => {
                  setIsDropdownOpen(false);
                  setActiveCategoryId(null);
                }}
              >
                <button className={styles["category-toggle"]}>
                  <i className="fas fa-bars me-2"></i>
                  <span>Danh mục</span>
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div
                    className={styles["category-dropdown"]}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => {
                      setIsDropdownOpen(false);
                      setActiveCategoryId(null);
                    }}
                  >
                    <div className={styles["dropdown-content"]}>
                      {/* Phần danh mục chính bên trái */}
                      <div className={styles["main-categories"]}>
                        <ul>
                          {mainCategories.map((category) => (
                            <li
                              key={category.id}
                              className={
                                activeCategoryId === category.id ? "active" : ""
                              }
                              onMouseEnter={() =>
                                setActiveCategoryId(category.id)
                              }
                            >
                              <i
                                className={`fa-solid ${category.icon} me-2`}
                              ></i>
                              <span>{category.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Phần subcategories bên phải */}
                      <div className={styles["subcategories-panel"]}>
                        {activeCategoryId ? (
                          <div
                            className={styles["subcategories-4-column-grid"]}
                          >
                            {currentCategoriesWithBooks.map((category) => (
                              <div
                                key={category.maTheLoai}
                                className={styles["category-column"]}
                              >
                                {/* Tên Thể Loại (Heading) */}
                                <h5 className={styles["category-title"]}>
                                  {category.tenTheLoai}
                                </h5>

                                {/* Danh sách 4 cuốn sách đầu tiên */}
                                <ul className={styles["book-list"]}>
                                  {category.sachList.slice(0, 4).map((book) => (
                                    <li key={book.maSach}>
                                      <Link to={`/sach/${book.maSach}`}>
                                        {book.tenSach}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>

                                {/* Nút Xem tất cả */}
                                <Link
                                  to={`/the-loai/${category.maTheLoai}`}
                                  className={styles["view-all-link"]}
                                >
                                  Xem tất cả
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles["placeholder-content"]}>
                            <i className="fas fa-book-reader"></i>
                            <p>Chọn danh mục để xem chi tiết</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo ở giữa */}
              <div className={styles["logo-container"]}>
                <a href="/">
                  <i className="fas fa-book-open me-2"></i>
                  BookShare
                </a>
              </div>

              {/* Các icon bên phải */}
              <div className={styles["header-icons"]}>
                <div className={styles["icons-group"]}>
                  {/* Notification icon với dropdown */}
                  <div
                    className={styles["notification-icon-container"]}
                    onMouseEnter={handleNotificationMouseEnter}
                    onMouseLeave={handleNotificationMouseLeave}
                  >
                    <button className={styles["notification-btn"]}>
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && (
                        <span className={styles["notification-badge"]}>
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>
                    <span className={styles["icon-label"]}>Thông Báo</span>

                    {/* Notification dropdown */}
                    {isNotificationsOpen && (
                      <div
                        className={styles["notification-dropdown"]}
                        onMouseEnter={() => setIsNotificationsOpen(true)}
                        onMouseLeave={() => setIsNotificationsOpen(false)}
                      >
                        <div className={styles["notification-header"]}>
                          <h3>Thông báo ({notifications.length})</h3>
                        </div>
                        <div className={styles["notification-list"]}>
                          {notifications.length === 0 ? (
                            <div className={styles["notification-item"]}>
                              <div className={styles["notification-content"]}>
                                <p
                                  style={{
                                    textAlign: "center",
                                    color: "#9ca3af",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Không có thông báo nào
                                </p>
                              </div>
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                className={`${styles["notification-item"]} ${
                                  !notification.trangThaiDaDoc
                                    ? styles["unread"]
                                    : ""
                                }`}
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <div className={styles["notification-content"]}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <i
                                      className={`fas ${getNotificationIcon(
                                        notification.loaiThongBao
                                      )}`}
                                      style={{
                                        color: getNotificationColor(
                                          notification.loaiThongBao
                                        ),
                                        marginRight: "8px",
                                        fontSize: "0.9rem",
                                      }}
                                    />
                                    <h4
                                      style={{ margin: 0, fontSize: "0.95rem" }}
                                    >
                                      Sách: {notification.maSach}
                                    </h4>
                                  </div>
                                  <p
                                    style={{
                                      margin: "0 0 4px 0",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {notification.noiDung.length > 80
                                      ? notification.noiDung.substring(0, 80) +
                                        "..."
                                      : notification.noiDung}
                                  </p>
                                  <span className={styles["notification-time"]}>
                                    {formatNotificationTime(
                                      notification.thoiGianGui
                                    )}
                                  </span>
                                </div>
                                {!notification.trangThaiDaDoc && (
                                  <div className={styles["unread-dot"]}></div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className={styles["notification-footer"]}>
                            <Link to="/profile">Xem tất cả</Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Link to={"/giohang"}>
                    <div className={styles["cart-icon-container"]}>
                      <button>
                        <i className="fas fa-shopping-cart"></i>
                        <span className={styles["icon-label"]}>Giỏ Hàng</span>
                      </button>

                      {/* Hiển thị badge chỉ khi user là ĐỘC GIẢ (từ token) */}
                      {isDocGia && cartCount > 0 && (
                        <span className={styles["cart-badge"]}>
                          {cartCount}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div
                    className={styles["user-icon-container"]}
                    onMouseEnter={() => setIsUserDropdownOpen(true)}
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <button>
                      <i className="fas fa-user"></i>
                      <span className={styles["icon-label"]}>
                        {isLoggedIn ? userName : "Tài Khoản"}
                      </span>
                    </button>

                    {/* User dropdown menu */}
                    {isUserDropdownOpen &&
                      (isLoggedIn ? (
                        <LoggedInUserDropdown />
                      ) : (
                        <LoggedOutUserDropdown />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
