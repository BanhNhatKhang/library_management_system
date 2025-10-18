import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../../css/admins/SidebarAdmin.css";

const SidebarAdmin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar${isCollapsed ? " collapsed" : ""}`}
        tabIndex={0}
      >
        <div className="sidebar-header">
          <h2>Admin</h2>
          <button
            className="collapse-btn"
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

        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link
                to="/admin/dashboard"
                className={
                  location.pathname === "/admin/dashboard" ? "active" : ""
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
                  location.pathname.startsWith("/admin/sach") ? "active" : ""
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
                  location.pathname.startsWith("/admin/theloai") ? "active" : ""
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
                  location.pathname.startsWith("/admin/nxb") ? "active" : ""
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
                  location.pathname.startsWith("/admin/docgia") ? "active" : ""
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
                    ? "active"
                    : ""
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
                  location.pathname.startsWith("/admin/donhang") ? "active" : ""
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
                  location.pathname.startsWith("/admin/muontra") ? "active" : ""
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
                  location.pathname.startsWith("/admin/uudai") ? "active" : ""
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
                    ? "active"
                    : ""
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
                  location.pathname.startsWith("/admin/ai") ? "active" : ""
                }
              >
                <i className="fas fa-robot"></i>
                <span>Quản Lý AI</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarAdmin;
