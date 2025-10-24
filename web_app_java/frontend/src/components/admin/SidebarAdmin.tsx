import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "../../css/admins/SidebarAdmin.module.css";

const SidebarAdmin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      navigate("/dangnhap");
    }
  };

  return (
    <div className={styles["admin-layout"]}>
      {/* Sidebar */}
      <aside
        className={`${styles["sidebar"]} ${
          isCollapsed ? styles["collapsed"] : ""
        }`}
        tabIndex={0}
      >
        <div className={styles["sidebar-header"]}>
          <h2>Admin</h2>
          <button
            className={styles["collapse-btn"]}
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            <i
              className={`fas ${
                isCollapsed ? "fa-angle-right" : "fa-angle-left"
              }`}
            ></i>
          </button>
        </div>

        <nav className={styles["sidebar-menu"]}>
          <ul>
            <li>
              <Link
                to="/admin/dashboard"
                className={
                  location.pathname === "/admin/dashboard"
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/sach"
                className={
                  location.pathname.startsWith("/admin/sach")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-book"></i>
                <span>Quản Lý Sách</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/theloai"
                className={
                  location.pathname.startsWith("/admin/theloai")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-tags"></i>
                <span>Quản Lý Thể Loại</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/nxb"
                className={
                  location.pathname.startsWith("/admin/nxb")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-building"></i>
                <span>Quản Lý NXB</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/docgia"
                className={
                  location.pathname.startsWith("/admin/docgia")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-users"></i>
                <span>Quản Lý Độc Giả</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/nhanvien"
                className={
                  location.pathname.startsWith("/admin/nhanvien")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-user-tie"></i>
                <span>Quản Lý Nhân Viên</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/donhang"
                className={
                  location.pathname.startsWith("/admin/donhang")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-shopping-cart"></i>
                <span>Quản Lý Đơn Hàng</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/muontra"
                className={
                  location.pathname.startsWith("/admin/muontra")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-exchange-alt"></i>
                <span>Quản Lý Mượn/Trả</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/uudai"
                className={
                  location.pathname.startsWith("/admin/uudai")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-gift"></i>
                <span>Quản Lý Ưu Đãi</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/thongbao"
                className={
                  location.pathname.startsWith("/admin/thongbao")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-bell"></i>
                <span>Quản Lý Thông Báo</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/ai"
                className={
                  location.pathname.startsWith("/admin/ai")
                    ? styles["active"]
                    : undefined
                }
              >
                <i className="fas fa-robot"></i>
                <span>Quản Lý AI</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className={styles["logout-btn"]}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Đăng Xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className={styles["main-content"]}>
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarAdmin;
