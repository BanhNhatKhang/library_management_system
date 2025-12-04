import { Routes, Route } from "react-router-dom";
import Header from "./components/users/AppHeader";
import Footer from "./components/users/AppFooter";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/users/Register";
import SidebarAdmin from "./components/admin/SidebarAdmin";
import Dashboard from "./pages/admin/Dashboard";
import { useAuth } from "./context/AuthContext";
// sách
import SachManager from "./pages/admin/books/SachManager";
import SachDetails from "./pages/admin/books/SachDetails";
import SachAdd from "./pages/admin/books/SachAdd";
import SachEdit from "./pages/admin/books/SachEdit";
// thể loại
import TheLoaiManager from "./pages/admin/category/TheLoaiManager";
import TheLoaiDetails from "./pages/admin/category/TheLoaiDetails";
import TheLoaiAdd from "./pages/admin/category/TheLoaiAdd";
import TheLoaiEdit from "./pages/admin/category/TheLoaiEdit";
// nhà xuất bản
import NXBManager from "./pages/admin/publisher/NXBManager";
import NXBDetails from "./pages/admin/publisher/NXBDetails";
import NXBAdd from "./pages/admin/publisher/NXBAdd";
import NXBEdit from "./pages/admin/publisher/NXBEdit";
// độc giả
import DGManager from "./pages/admin/reader/DGManager";
import DGAdd from "./pages/admin/reader/DGAdd";
import DGDetails from "./pages/admin/reader/DGDetails";
import DGEdit from "./pages/admin/reader/DGEdit";
// nhân viên
import NVManager from "./pages/admin/staff/NVManager";
import NVAdd from "./pages/admin/staff/NVAdd";
import NVDetails from "./pages/admin/staff/NVDetails";
import NVEdit from "./pages/admin/staff/NVEdit";
// đơn hàng
import DHManager from "./pages/admin/orders/DHManager";
import DHAdd from "./pages/admin/orders/DHAdd";
import DHDetails from "./pages/admin/orders/DHDetails";
import DHEdit from "./pages/admin/orders/DHEdit";
// theo dõi mượn sách
import MuonManager from "./pages/admin/borrow/MuonManager";
import MuonAdd from "./pages/admin/borrow/MuonAdd";
import MuonDetails from "./pages/admin/borrow/MuonDetails";
import MuonEdit from "./pages/admin/borrow/MuonEdit";
// ưu đãi
import UDManager from "./pages/admin/promotion/UDManager";
import UDAdd from "./pages/admin/promotion/UDAdd";
import UDDetails from "./pages/admin/promotion/UDDetails";
import UDEdit from "./pages/admin/promotion/UDEdit";
// thông báo
import TBManager from "./pages/admin/notification/TBManager";
import TBAdd from "./pages/admin/notification/TBAdd";
import TBDetails from "./pages/admin/notification/TBDetails";
import TBEdit from "./pages/admin/notification/TBEdit";

// chi tiết sách
import BookDetails from "./pages/users/BookDetails";

// giỏ hàng
import Cart from "./pages/users/Cart";

// lọc theo thể loại sách
import AllCatBook from "./pages/users/AllCatBook";

// hồ sơ người dùng
import Profile from "./pages/users/Profile";

// tất cả sách
import AllBooks from "./pages/users/AllBooks";

// tất cả sách giảm giá
import FlashSale from "./pages/users/FlashSale";

// tìm kiếm nổi
import FloatingSearchButton from "./components/users/FloatingSearchButton";

// chuyển hướng tìm kiếm
import SearchPage from "./pages/users/SearchPage";

function App() {
  const { role } = useAuth();

  if (
    role === "ADMIN" ||
    role === "NHANVIEN" ||
    role === "THUTHU" ||
    role === "QUANLY"
  ) {
    return (
      <Routes>
        <Route path="/admin" element={<SidebarAdmin />}>
          <Route path="dashboard" element={<Dashboard />} />
          {/* Sách */}
          <Route path="sach" element={<SachManager />} />
          <Route path="sach/:maSach" element={<SachDetails />} />
          <Route path="sach/add" element={<SachAdd />} />
          <Route path="sach/edit/:maSach" element={<SachEdit />} />
          {/* Thể loại */}
          <Route path="theloai" element={<TheLoaiManager />} />
          <Route path="theloai/:maTheLoai" element={<TheLoaiDetails />} />
          <Route path="theloai/add" element={<TheLoaiAdd />} />
          <Route path="theloai/edit/:maTheLoai" element={<TheLoaiEdit />} />
          {/* Nhà xuất bản */}
          <Route path="nxb" element={<NXBManager />} />
          <Route path="nxb/:maNhaXuatBan" element={<NXBDetails />} />
          <Route path="nxb/add" element={<NXBAdd />} />
          <Route path="nxb/edit/:maNhaXuatBan" element={<NXBEdit />} />
          {/* Độc giả */}
          <Route path="docgia" element={<DGManager />} />
          <Route path="docgia/:maDocGia" element={<DGDetails />} />
          <Route path="docgia/add" element={<DGAdd />} />
          <Route path="docgia/edit/:maDocGia" element={<DGEdit />} />
          {/* Nhân viên */}
          <Route path="nhanvien" element={<NVManager />} />
          <Route path="nhanvien/:maNhanVien" element={<NVDetails />} />
          <Route path="nhanvien/add" element={<NVAdd />} />
          <Route path="nhanvien/edit/:maNhanVien" element={<NVEdit />} />
          {/* Đơn hàng*/}
          <Route path="donhang" element={<DHManager />} />
          <Route path="donhang/:maDonHang" element={<DHDetails />} />
          <Route path="donhang/add" element={<DHAdd />} />
          <Route path="donhang/edit/:maDonHang" element={<DHEdit />} />
          {/* Mượn Sách */}
          <Route path="muontra" element={<MuonManager />} />
          <Route path="muon/add" element={<MuonAdd />} />
          <Route
            path="muon/edit/:maDocGia/:maSach/:ngayMuon"
            element={<MuonEdit />}
          />
          <Route
            path="muon/:maDocGia/:maSach/:ngayMuon"
            element={<MuonDetails />}
          />
          {/* Ưu đãi */}
          <Route path="uudai" element={<UDManager />} />
          <Route path="uudai/:maUuDai" element={<UDDetails />} />
          <Route path="uudai/add" element={<UDAdd />} />
          <Route path="uudai/edit/:maUuDai" element={<UDEdit />} />
          {/* Thông báo */}
          <Route path="thongbao" element={<TBManager />} />
          <Route path="thongbao/:id" element={<TBDetails />} />
          <Route path="thongbao/add" element={<TBAdd />} />
          <Route path="thongbao/edit/:id" element={<TBEdit />} />
        </Route>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/*"
        element={
          <>
            <Header />
            <Routes>
              {/* Trang chủ */}
              <Route path="/" element={<HomePage />} />
              {/* Chi tiết sách */}
              <Route path="/sach/:maSach" element={<BookDetails />} />
              <Route path="/giohang" element={<Cart />} />
              {/* Trang lọc tất cả thể loại */}
              <Route path="/the-loai/:maTheLoai" element={<AllCatBook />} />
              {/* Hồ sơ người dùng */}
              <Route path="/profile" element={<Profile />} />
              {/* Tất cả sách */}
              <Route path="/sach/tat-ca" element={<AllBooks />} />
              {/* Tất cả sách giảm giá */}
              <Route path="/flash-sale" element={<FlashSale />} />
              {/* Chuyển hướng trang tìm kiếm */}
              <Route path="/search" element={<SearchPage />} />
            </Routes>
            <FloatingSearchButton />
            <Footer />
          </>
        }
      />
    </Routes>
  );
}

export default App;
