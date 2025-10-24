import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/users/AppHeader.module.css";
import axios from "axios";

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
  title: string;
  message: string;
  time: string;
  isRead: boolean;
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

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedToken = localStorage.getItem("authToken");

    const isUserLoggedIn = !!storedToken;

    if (isUserLoggedIn) {
      setIsLoggedIn(true);
      setUserName(storedUserName || "Khang Bành Nhật");
    } else {
      setIsLoggedIn(false);
      setUserName("Tài Khoản");
    }

    axios
      .get("/api/home/sach-theo-theloai")
      .then((res) => {
        setCategoriesWithBooks(res.data);
      })
      .catch(() => setCategoriesWithBooks([]));

    axios
      .get("/api/home/thongbao")
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifications([]));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    // Xóa tất cả các khóa liên quan đến người dùng trong Local Storage
    localStorage.removeItem("userName"); // Key giả định
    localStorage.removeItem("role"); // Key thực tế bạn đang dùng
    // Nếu bạn có lưu token, hãy xóa nó: localStorage.removeItem("token");

    setIsLoggedIn(false); // Cập nhật state
    setUserName("Tài Khoản");
    setIsUserDropdownOpen(false);
    // Có thể thêm lệnh chuyển hướng người dùng đến trang chủ hoặc đăng nhập
    // navigate('/');
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
    >
      {/* <div className="user-info-header">
        <div className="user-avatar-placeholder">
          <i className="fas fa-crown"></i>
        </div>
        <div className="user-text-info">
          <div className="user-name">{userName}</div>{" "}
        </div>
      </div> */}
      <Link to="/don-hang" className={styles["dropdown-item"]}>
        <i className="fas fa-receipt me-2"></i>
        Đơn hàng của tôi
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
                <div className={styles["search-wrapper"]}>
                  <input
                    type="text"
                    className={styles["search-input"]}
                    placeholder="Tìm kiếm sách, tác giả, thể loại..."
                  />
                  <button className={styles["search-btn"]}>
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <div className={styles["icons-group"]}>
                  {/* Notification icon với dropdown */}
                  <div
                    className={styles["notification-icon-container"]}
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                    <button className={styles["notification-btn"]}>
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && (
                        <span className={styles["notification-badge"]}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <span className={styles["icon-label"]}>Thông Báo</span>

                    {/* Notification dropdown */}
                    {isNotificationsOpen && (
                      <div className={styles["notification-dropdown"]}>
                        <div className={styles["notification-header"]}>
                          <h3>Thông báo</h3>
                        </div>
                        <div className={styles["notification-list"]}>
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`${styles["notification-item"]} ${
                                notification.isRead
                                  ? styles["read"]
                                  : styles["unread"]
                              }`}
                            >
                              <div className={styles["notification-content"]}>
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className={styles["notification-time"]}>
                                  {notification.time}
                                </span>
                              </div>
                              {!notification.isRead && (
                                <div className={styles["unread-dot"]}></div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className={styles["notification-footer"]}>
                          <a href="#">Xem tất cả</a>
                        </div>
                      </div>
                    )}
                  </div>

                  <button>
                    <i className="fas fa-shopping-cart"></i>
                    <span className={styles["icon-label"]}>Giỏ Hàng</span>
                  </button>

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
