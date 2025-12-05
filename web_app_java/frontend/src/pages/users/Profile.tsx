import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "../../css/users/profile/Profile.module.css";
import axios from "../../../axiosConfig";

interface UserProfile {
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  gioiTinh: "NAM" | "NU" | null; // Thay đổi từ boolean thành enum string
  ngaySinh: string; // YYYY-MM-DD
  diaChi: string;
}

interface Achievement {
  soDonHang: number;
  daThanhToan: number;
}

interface ChangePasswordData {
  matKhauHienTai: string;
  matKhauMoi: string;
  nhapLaiMatKhauMoi: string;
}

interface PhatDocGia {
  maPhat: number;
  maDocGia: string;
  maSach: string;
  tenSach: string;
  soTienPhat: number;
  soNgayQuaHan: number;
  ngayTaoPhat: string;
  trangThaiPhat: "CHUATHANHTOAN" | "DATHANHTOAN" | "MIENGIAM";
  ngayThanhToan?: string;
  ghiChu?: string;
  theoDoiMuonSach?: {
    ngayMuon: string;
    ngayTra: string;
    sach: {
      tenSach: string;
      tacGia: string;
      anhBia?: string;
    };
  };
}

interface FineStatusInfo {
  totalUnpaidFines: number;
  formattedAmount: string;
  maDocGia: string;
  trangThaiTaiKhoan: string;
  coTheHoatDong: boolean;
  isAccountLocked: boolean;
  hasUnpaidFines: boolean;
  soLuongPhatChuaThanhToan: number;
}

// Định nghĩa cấu trúc menu
const menuItems = [
  {
    key: "thongTinTaiKhoan",
    label: "Thông tin tài khoản",
    icon: "fas fa-user",
    isTitle: true,
    isIndented: false,
  },
  // ĐÃ THÊM ICON: fas fa-address-card
  {
    key: "hoSoCaNhan",
    label: "Hồ sơ cá nhân",
    icon: "fas fa-address-card",
    isTitle: false,
    isIndented: false,
  },
  // Đổi mật khẩu sẽ hiển thị thụt vào
  {
    key: "doiMatKhau",
    label: "Đổi mật khẩu",
    icon: "fas fa-lock",
    isTitle: false,
    isIndented: true,
  },

  // Các mục cấp cao khác
  {
    key: "donHangCuaToi",
    label: "Đơn hàng của tôi",
    icon: "fas fa-receipt",
    isTitle: false,
    isIndented: false,
  },
  {
    key: "thongBao",
    label: "Thông báo",
    icon: "fas fa-bell",
    isTitle: false,
    isIndented: false,
  },
  {
    key: "sachDaMuon",
    label: "Sách đã mượn",
    icon: "fas fa-book",
    isTitle: false,
    isIndented: false,
  },
  {
    key: "thongTinPhat",
    label: "Thông tin phạt",
    icon: "fas fa-money-bill-wave",
    isTitle: false,
    isIndented: false,
  },
];

// Thêm interface mới cho đơn hàng
interface DonHang {
  maDonHang: string;
  ngayDat: string;
  tongTien: number;
  trangThaiDonHang: "DANGXULY" | "DAGIAO" | "DAHUY" | "GIAOTHATBAI";
}

// Cập nhật interface để match với ChiTietDonHangDTO
interface ChiTietDonHang {
  maDonHang: string;
  maSach: string;
  tenSach: string;
  tacGia?: string;
  anhBia?: string;
  soLuong: number;
  donGia: number;
  thanhTien?: number;
}

// Thêm interface cho pagination
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

// Thêm interface mới cho sách đã mượn
interface TheoDoiMuonSach {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra: string;
  trangThaiMuon: "CHODUYET" | "DADUYET" | "TUCHOI" | "DATRA" | "DANGMUON";
  maNhanVien?: string;
  tenNhanVien?: string; // Thêm field mới
  docGia?: {
    maDocGia: string;
    hoLot: string;
    ten: string;
    email: string;
  };
  sach?: {
    maSach: string;
    tenSach: string;
    tacGia: string;
    anhBia?: string;
  };
}

interface ThongBaoMuonSachDTO {
  id: number;
  maDocGia: string;
  maSach?: string; // Tên sách được lấy từ mã sách khi cần
  ngayMuon?: string;
  noiDung: string;
  thoiGianGui: string; // LocalDateTime
  loaiThongBao: "DADUYET" | "SAPTOIHAN" | "QUAHAN" | "DATRASACH" | string;
  trangThaiDaDoc: boolean;
}

function Profile() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editableData, setEditableData] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [changePasswordData, setChangePasswordData] =
    useState<ChangePasswordData>({
      matKhauHienTai: "",
      matKhauMoi: "",
      nhapLaiMatKhauMoi: "",
    });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedBorrowedBook, setSelectedBorrowedBook] = useState<
    string | null
  >(null);

  const [phatList, setPhatList] = useState<PhatDocGia[]>([]);
  const [isLoadingFines, setIsLoadingFines] = useState(false);
  const [selectedFine, setSelectedFine] = useState<number | null>(null);
  const [fineStatusInfo, setFineStatusInfo] = useState<FineStatusInfo | null>(
    null
  );

  const [finesPagination, setFinesPagination] = useState<Pagination>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 5,
  });

  const [thongBaoList, setThongBaoList] = useState<ThongBaoMuonSachDTO[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationPagination, setNotificationPagination] =
    useState<Pagination>({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10, // Giả định hiển thị 10 thông báo mỗi trang
    });
  // State để lưu trạng thái lọc: null (tất cả), true (đã đọc), false (chưa đọc)
  const [notificationFilter, setNotificationFilter] = useState<boolean | null>(
    null
  );
  const [expandedNotification, setExpandedNotification] = useState<
    number | null
  >(null);

  const today = new Date().getFullYear();

  // Xóa isEditing state vì không cần nữa
  // const [isEditing, setIsEditing] = useState(false);

  // Cập nhật interface Achievement để match với dữ liệu thật
  const [achievement, setAchievement] = useState<Achievement>({
    soDonHang: 0,
    daThanhToan: 0,
  });

  // Đặt default active là "hoSoCaNhan"
  const [activeMenu, setActiveMenu] = useState("hoSoCaNhan");
  const [isLoading, setIsLoading] = useState(true);

  // Thêm states mới cho đơn hàng
  const [donHangList, setDonHangList] = useState<DonHang[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [chiTietDonHang, setChiTietDonHang] = useState<ChiTietDonHang[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);

  // Thêm states mới cho pagination
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 5, // Hiển thị 5 đơn hàng mỗi trang
  });

  // Thêm states mới cho sách đã mượn
  const [sachDaMuonList, setSachDaMuonList] = useState<TheoDoiMuonSach[]>([]);
  const [isLoadingBorrowedBooks, setIsLoadingBorrowedBooks] = useState(false);

  // Thêm states cho phân trang sách đã mượn
  const [borrowedBooksPagination, setBorrowedBooksPagination] =
    useState<Pagination>({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 5,
    });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "orders") {
      setActiveMenu("donHangCuaToi");
    } else if (tabParam === "fines") {
      setActiveMenu("thongTinPhat");
    }
  }, [searchParams]);

  // Dữ liệu giả định cứng
  const memberIconClass = "fas fa-user";
  const currentMemberName = "Khách hàng";

  // Thêm helper functions để hiển thị thống kê - ĐẶT SAU CÁC STATES
  const getCompletedOrdersCount = () => {
    // Đếm số đơn hàng đã giao thành công
    return donHangList.filter((order) => order.trangThaiDonHang === "DAGIAO")
      .length;
  };

  const getOrderStatusStats = () => {
    const stats = {
      DANGXULY: 0,
      DAGIAO: 0, // Thay HOANTHANH -> DAGIAO
      DAHUY: 0, // Thay HUYBO -> DAHUY
      GIAOTHATBAI: 0, // Thêm mới
    };

    donHangList.forEach((order) => {
      if (order.trangThaiDonHang in stats) {
        stats[order.trangThaiDonHang as keyof typeof stats]++;
      }
    });

    return stats;
  };

  // Hàm tính toán thống kê từ danh sách đơn hàng - SỬA ĐỂ DÙNG useCallback
  const calculateAchievements = React.useCallback((orders: DonHang[]) => {
    const totalOrders = orders.length;

    // Đã thanh toán = chỉ những đơn ĐÃ GIAO thành công
    const totalPaid = orders
      .filter((order) => order.trangThaiDonHang === "DAGIAO")
      .reduce((sum, order) => sum + order.tongTien, 0);

    setAchievement({
      soDonHang: totalOrders,
      daThanhToan: totalPaid,
    });
  }, []);

  // Hàm lấy tất cả đơn hàng để tính thống kê - SỬA ĐỂ DÙNG useCallback
  const fetchAllOrdersForStats = React.useCallback(async () => {
    try {
      const response = await axios.get(`/api/docgia/donhang/me/all`);
      const allOrders = response.data;
      calculateAchievements(allOrders);
      console.log("Thống kê đơn hàng:", {
        totalOrders: allOrders.length,
        completedOrders: allOrders.filter(
          (order: DonHang) => order.trangThaiDonHang === "DAGIAO"
        ).length,
        totalPaid: allOrders
          .filter((order: DonHang) => order.trangThaiDonHang === "DAGIAO")
          .reduce((sum: number, order: DonHang) => sum + order.tongTien, 0),
      });
    } catch (error) {
      console.error("Error fetching all orders for statistics:", error);
      // Nếu lỗi, giữ achievement mặc định
    }
  }, [calculateAchievements]);

  const fetchPhatList = React.useCallback(
    async (page = 0) => {
      setIsLoadingFines(true);
      try {
        const response = await axios.get("/api/phat/docgia/me", {
          params: {
            page: page,
            size: finesPagination.pageSize,
            sort: "ngayTaoPhat,desc",
          },
        });

        if (response.data.content) {
          setPhatList(response.data.content);
          setFinesPagination({
            currentPage: response.data.number,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            pageSize: response.data.size,
          });
        } else {
          setPhatList(Array.isArray(response.data) ? response.data : []);
          setFinesPagination((prev) => ({
            ...prev,
            currentPage: 0,
            totalPages: 1,
            totalElements: Array.isArray(response.data)
              ? response.data.length
              : 0,
          }));
        }

        console.log("Danh sách phạt trang", page + 1, ":", response.data);
      } catch (error) {
        console.error("Error fetching fines:", error);
        setPhatList([]);
        setFinesPagination((prev) => ({
          ...prev,
          currentPage: 0,
          totalPages: 0,
          totalElements: 0,
        }));
      } finally {
        setIsLoadingFines(false);
      }
    },
    [finesPagination.pageSize]
  );

  // Thêm function để fetch thông tin tổng hợp phạt
  const fetchFineStatusInfo = React.useCallback(async () => {
    try {
      const response = await axios.get("/api/phat/docgia/me/status");
      setFineStatusInfo(response.data);
    } catch (error) {
      console.error("Error fetching fine status:", error);
      setFineStatusInfo(null);
    }
  }, []);

  // Thêm function để thanh toán phạt
  const handlePayFine = async (maPhat: number) => {
    if (!confirm("Bạn có chắc chắn muốn thanh toán phạt này?")) {
      return;
    }

    try {
      setIsLoadingFines(true);
      const response = await axios.post(`/api/phat/thanhtoan/${maPhat}`);

      if (response.data.success) {
        alert("Thanh toán phạt thành công!");
        // Refresh danh sách phạt và thông tin tổng hợp
        fetchPhatList(finesPagination.currentPage);
        fetchFineStatusInfo();
      } else {
        alert(response.data.message || "Có lỗi xảy ra khi thanh toán");
      }
    } catch (error) {
      console.error("Error paying fine:", error);
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || "Có lỗi xảy ra khi thanh toán phạt"
        );
      } else {
        alert("Có lỗi xảy ra khi thanh toán phạt");
      }
    } finally {
      setIsLoadingFines(false);
    }
  };

  // Thêm function để xử lý click vào phạt
  const handleFineClick = (maPhat: number) => {
    setSelectedFine(selectedFine === maPhat ? null : maPhat);
  };

  // Thêm function để xử lý chuyển trang phạt
  const handleFinesPageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < finesPagination.totalPages) {
      fetchPhatList(newPage);
      setSelectedFine(null);
    }
  };

  // Thêm function để tạo số trang cho phạt
  const getFinesPageNumbers = () => {
    const { currentPage, totalPages } = finesPagination;
    const pages: number[] = [];
    const maxDisplayPages = 5;

    if (totalPages <= maxDisplayPages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 2) {
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 3) {
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  // Thêm helper functions cho phạt
  const getFineStatusText = (status: string) => {
    switch (status) {
      case "CHUATHANHTOAN":
        return "Chưa thanh toán";
      case "DATHANHTOAN":
        return "Đã thanh toán";
      case "MIENGIAM":
        return "Được miễn giảm";
      default:
        return "Không xác định";
    }
  };

  const getFineStatusClass = (status: string) => {
    switch (status) {
      case "CHUATHANHTOAN":
        return styles["status-cancelled"]; // Đỏ
      case "DATHANHTOAN":
        return styles["status-completed"]; // Xanh lá
      case "MIENGIAM":
        return styles["status-processing"]; // Vàng
      default:
        return styles["status-unknown"];
    }
  };

  // Cập nhật hàm lấy danh sách đơn hàng với phân trang - SỬA ĐỂ DÙNG useCallback
  const fetchDonHangList = React.useCallback(
    async (page = 0) => {
      setIsLoadingOrders(true);
      try {
        const response = await axios.get(`/api/docgia/donhang/me`, {
          params: {
            page: page,
            size: pagination.pageSize,
            sort: "ngayDat,desc",
          },
        });

        if (response.data.content) {
          setDonHangList(response.data.content);
          setPagination({
            currentPage: response.data.number,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            pageSize: response.data.size,
          });
        } else {
          setDonHangList(response.data);
          setPagination((prev) => ({
            ...prev,
            currentPage: 0,
            totalPages: 1,
            totalElements: response.data.length,
          }));
        }

        console.log("Đơn hàng trang", page + 1, ":", response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setDonHangList([]);
            setPagination((prev) => ({
              ...prev,
              currentPage: 0,
              totalPages: 0,
              totalElements: 0,
            }));
          } else {
            alert("Có lỗi xảy ra khi tải danh sách đơn hàng!");
          }
        }
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [pagination.pageSize]
  );

  // Thêm hàm format ngày (đã có trong code khác)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Cập nhật hàm lấy danh sách sách đã mượn với phân trang
  const fetchSachDaMuon = React.useCallback(
    async (page = 0) => {
      setIsLoadingBorrowedBooks(true);
      try {
        const response = await axios.get("/api/docgia/theodoimuon/me", {
          params: {
            page: page,
            size: borrowedBooksPagination.pageSize,
            sort: "id.ngayMuon,desc",
          },
        });

        if (response.data.content) {
          setSachDaMuonList(response.data.content);
          setBorrowedBooksPagination({
            currentPage: response.data.number,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            pageSize: response.data.size,
          });
        } else {
          setSachDaMuonList(response.data);
          setBorrowedBooksPagination((prev) => ({
            ...prev,
            currentPage: 0,
            totalPages: 1,
            totalElements: response.data.length,
          }));
        }

        console.log("Sách đã mượn trang", page + 1, ":", response.data);
      } catch (error) {
        console.error("Error fetching borrowed books:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setSachDaMuonList([]);
            setBorrowedBooksPagination((prev) => ({
              ...prev,
              currentPage: 0,
              totalPages: 0,
              totalElements: 0,
            }));
          } else {
            alert("Có lỗi xảy ra khi tải danh sách sách đã mượn!");
          }
        }
      } finally {
        setIsLoadingBorrowedBooks(false);
      }
    },
    [borrowedBooksPagination.pageSize]
  );

  // Hàm lấy danh sách thông báo với phân trang và lọc
  const fetchThongBaoList = React.useCallback(
    async (
      page = 0,
      unreadOnly: boolean | null = null,
      readOnly: boolean | null = null
    ) => {
      setIsLoadingNotifications(true);
      try {
        const response = await axios.get("/api/thongbao/current-user", {
          params: {
            page: page,
            size: notificationPagination.pageSize,
            sort: "thoiGianGui,desc", // Sắp xếp theo thời gian gửi giảm dần
            unreadOnly: unreadOnly, // true/false/null
            readOnly: readOnly, // true/false/null
          },
        });

        // Backend trả về format Spring Data Page (content, totalElements,...)
        if (response.data.content) {
          setThongBaoList(response.data.content);
          setNotificationPagination({
            currentPage: response.data.number,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            pageSize: response.data.size,
          });
        } else {
          // Trường hợp lỗi hoặc không có phân trang
          setThongBaoList([]);
          setNotificationPagination((prev) => ({
            ...prev,
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
          }));
        }

        console.log("Thông báo trang", page + 1, ":", response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setThongBaoList([]);
          setNotificationPagination((prev) => ({
            ...prev,
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
          }));
        } else {
          // alert("Có lỗi xảy ra khi tải danh sách thông báo!"); // Tắt để tránh spam alert
        }
      } finally {
        setIsLoadingNotifications(false);
      }
    },
    [notificationPagination.pageSize]
  );

  // Hàm xử lý chuyển trang cho Thông báo
  const handleNotificationPageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < notificationPagination.totalPages) {
      // Xác định lại các tham số lọc trước khi fetch
      let unread: boolean | null = null;
      let read: boolean | null = null;
      if (notificationFilter !== null) {
        if (notificationFilter === false) unread = true; // Lọc chưa đọc
        if (notificationFilter === true) read = true; // Lọc đã đọc
      }
      fetchThongBaoList(newPage, unread, read);
      setExpandedNotification(null); // Đóng chi tiết khi chuyển trang
    }
  };

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    let filterValue: boolean | null = null;
    let unread: boolean | null = null;
    let read: boolean | null = null;

    if (value === "unread") {
      filterValue = false;
      unread = true;
    } else if (value === "read") {
      filterValue = true;
      read = true;
    }

    setNotificationFilter(filterValue);
    // Fetch lại trang đầu tiên (0) với filter mới
    fetchThongBaoList(0, unread, read);
    setExpandedNotification(null);
  };

  // Hàm tạo số trang hiển thị cho Thông báo (giống như đơn hàng)
  const getNotificationPageNumbers = () => {
    const { currentPage, totalPages } = notificationPagination;
    const pages: number[] = [];
    const maxDisplayPages = 5; // Hiển thị tối đa 5 số trang

    if (totalPages <= maxDisplayPages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị thông minh (giống hàm getPageNumbers đã có)
      if (currentPage < 2) {
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 3) {
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  // Hàm xử lý click vào Thông báo
  const handleNotificationClick = async (notification: ThongBaoMuonSachDTO) => {
    // 1. Mở/đóng chi tiết
    const isExpanded = expandedNotification === notification.id;
    if (isExpanded) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(notification.id);
    }

    // 2. Đánh dấu đã đọc (nếu chưa đọc)
    if (!notification.trangThaiDaDoc) {
      try {
        // Gọi API đánh dấu đã đọc
        await axios.put(`/api/thongbao/${notification.id}/mark-read`);

        // Cập nhật state cục bộ để đổi trạng thái đã đọc ngay lập tức
        setThongBaoList((prevList) =>
          prevList.map((n) =>
            n.id === notification.id ? { ...n, trangThaiDaDoc: true } : n
          )
        );

        // Nếu đang ở trạng thái lọc "chưa đọc", refetch lại list sau một chút
        // để thông báo đã đọc được loại bỏ khỏi danh sách
        if (notificationFilter === false && !isExpanded) {
          // Chỉ refetch nếu không mở chi tiết (click lần 1)
          setTimeout(() => {
            // Đợi một chút cho backend kịp lưu
            // Phải xác định lại tham số lọc (chưa đọc)
            fetchThongBaoList(notificationPagination.currentPage, true, false);
          }, 100);
        }
      } catch (error) {
        console.error("Error marking as read:", error);
        alert("Không thể đánh dấu đã đọc. Vui lòng thử lại!");
      }
    }
  };

  // Hàm format thời gian (ví dụ: 5 phút trước)
  const formatTimeAgo = (dateTimeString: string) => {
    const now = new Date();
    const past = new Date(dateTimeString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else {
      // Hiển thị ngày nếu quá 24h
      return formatDate(dateTimeString);
    }
  };

  // Hàm lấy thông tin icon và màu sắc
  const getNotificationTypeInfo = (type: string) => {
    switch (type) {
      case "DADUYET":
        return {
          text: "Yêu cầu được duyệt",
          icon: "fas fa-check-circle",
          class: styles["status-completed"], // Màu xanh lá
          iconClass: styles["notification-type-daduyet"], // Class cho icon nền lớn
        };
      case "SAPTOIHAN":
        return {
          text: "Sắp tới hạn trả",
          icon: "fas fa-exclamation-triangle",
          class: styles["status-processing"], // Màu vàng
          iconClass: styles["notification-type-saptoihan"],
        };
      case "QUAHAN":
        return {
          text: "Quá hạn trả",
          icon: "fas fa-clock",
          class: styles["status-cancelled"], // Màu đỏ
          iconClass: styles["notification-type-quahan"],
        };
      case "DATRASACH":
        return {
          text: "Đã trả sách",
          icon: "fas fa-book-reader",
          class: styles["status-completed"], // Màu xanh lá
          iconClass: styles["notification-type-datrasach"],
        };
      default:
        return {
          text: "Thông báo chung",
          icon: "fas fa-info-circle",
          class: styles["status-unknown"],
          iconClass: styles["notification-type-default"],
        };
    }
  };

  // Hàm xử lý chuyển trang cho sách đã mượn
  const handleBorrowedBooksPageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < borrowedBooksPagination.totalPages) {
      fetchSachDaMuon(newPage);
    }
  };

  // Hàm tạo số trang hiển thị cho sách đã mượn
  const getBorrowedBooksPageNumbers = () => {
    const { currentPage, totalPages } = borrowedBooksPagination;
    const pages: number[] = [];
    const maxDisplayPages = 5;

    if (totalPages <= maxDisplayPages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 2) {
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 3) {
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Load thống kê khi component mount - SỬA useEffect
  useEffect(() => {
    setIsLoading(true);

    // Load thông tin profile và thống kê đồng thời
    Promise.all([
      axios.get("/api/docgia/thongtin/me"),
      fetchAllOrdersForStats(),
    ])
      .then(([profileRes]) => {
        const data = profileRes.data;
        console.log("Received profile data:", data);

        setProfileData(data);
        setEditableData(data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        // Vẫn load thống kê nếu profile bị lỗi
        fetchAllOrdersForStats();
      })
      .finally(() => setIsLoading(false));
  }, [fetchAllOrdersForStats]); // THÊM dependency

  // Load đơn hàng khi activeMenu thay đổi thành "donHangCuaToi" - SỬA useEffect
  useEffect(() => {
    if (activeMenu === "donHangCuaToi") {
      fetchDonHangList(0); // Load trang đầu tiên
    }
  }, [activeMenu, fetchDonHangList]); // THÊM dependency

  useEffect(() => {
    if (activeMenu === "thongTinPhat") {
      fetchPhatList(0);
      fetchFineStatusInfo();
    }
  }, [activeMenu, fetchPhatList, fetchFineStatusInfo]);

  // Load sách đã mượn và Thông báo khi activeMenu thay đổi
  useEffect(() => {
    if (activeMenu === "sachDaMuon") {
      fetchSachDaMuon(0);
    } else if (activeMenu === "thongBao") {
      // --- THÊM ĐIỀU KIỆN MỚI ---
      let unread: boolean | null = null;
      let read: boolean | null = null;
      if (notificationFilter !== null) {
        if (notificationFilter === false) unread = true; // Lọc chưa đọc
        if (notificationFilter === true) read = true; // Lọc đã đọc
      }
      fetchThongBaoList(0, unread, read);
    }
  }, [activeMenu, fetchSachDaMuon, fetchThongBaoList, notificationFilter]);

  // Load sách đã mượn khi activeMenu thay đổi thành "sachDaMuon"
  useEffect(() => {
    if (activeMenu === "sachDaMuon") {
      fetchSachDaMuon(0);
    }
  }, [activeMenu, fetchSachDaMuon]);

  // Hàm xử lý thay đổi input
  const handleInputChange = (
    field: keyof UserProfile,
    value: string | "NAM" | "NU" | null
  ) => {
    if (editableData) {
      setEditableData({
        ...editableData,
        [field]: value,
      });
    }
  };

  // Hàm xử lý lưu thay đổi
  const handleSaveChanges = async () => {
    if (!editableData) return;

    setIsSaving(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      console.log("Token:", token);

      // Không cần chuyển đổi vì đã cùng format enum
      console.log("Data being sent:", editableData);

      const response = await axios.put("/api/docgia/thongtin/me", editableData);
      setProfileData(response.data);
      setEditableData(response.data);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (axios.isAxiosError(error)) {
        console.log("Response status:", error.response?.status);
        console.log("Response data:", error.response?.data);

        if (error.response?.status === 403) {
          alert("Không có quyền truy cập. Vui lòng đăng nhập lại!");
        } else if (error.response?.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        } else if (error.response?.status === 400) {
          alert("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!");
        } else {
          alert(`Có lỗi xảy ra: ${error.response?.status || "Unknown error"}`);
        }
      } else {
        alert("Có lỗi xảy ra khi cập nhật thông tin!");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Hàm xử lý thay đổi input đổi mật khẩu
  const handlePasswordChange = (
    field: keyof ChangePasswordData,
    value: string
  ) => {
    setChangePasswordData({
      ...changePasswordData,
      [field]: value,
    });
  };

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (
      !changePasswordData.matKhauHienTai ||
      !changePasswordData.matKhauMoi ||
      !changePasswordData.nhapLaiMatKhauMoi
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (
      changePasswordData.matKhauMoi !== changePasswordData.nhapLaiMatKhauMoi
    ) {
      alert("Mật khẩu mới và nhập lại mật khẩu không khớp!");
      return;
    }

    if (changePasswordData.matKhauMoi.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await axios.put(
        "/api/docgia/doimatkhau/me",
        changePasswordData
      );
      console.log("Password change response:", response.data); // Sử dụng response
      alert("Đổi mật khẩu thành công!");

      // Reset form
      setChangePasswordData({
        matKhauHienTai: "",
        matKhauMoi: "",
        nhapLaiMatKhauMoi: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data || "Có lỗi xảy ra khi đổi mật khẩu!";
        alert(errorMessage);
      } else {
        alert("Có lỗi xảy ra khi đổi mật khẩu!");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Thêm function handleMenuClick
  const handleMenuClick = (menuKey: string) => {
    setActiveMenu(menuKey);
  };

  // Thêm function format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm lấy chi tiết đơn hàng (sử dụng endpoint có sẵn)
  const fetchChiTietDonHang = async (maDonHang: string) => {
    setIsLoadingOrderDetails(true);
    try {
      const response = await axios.get(
        `/api/chitietdonhang/donhang/${maDonHang}`
      );
      setChiTietDonHang(response.data);
      console.log("Chi tiết đơn hàng:", response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Có lỗi xảy ra khi tải chi tiết đơn hàng!");
      setChiTietDonHang([]);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  // Hàm xử lý khi click vào đơn hàng
  const handleOrderClick = (maDonHang: string) => {
    if (selectedOrder === maDonHang) {
      // Nếu đang mở thì đóng lại
      setSelectedOrder(null);
      setChiTietDonHang([]);
    } else {
      // Mở chi tiết đơn hàng mới
      setSelectedOrder(maDonHang);
      fetchChiTietDonHang(maDonHang);
    }
  };

  // Hàm format trạng thái đơn hàng
  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "DANGXULY":
        return "Đang xử lý";
      case "DAGIAO":
        return "Đã giao";
      case "DAHUY":
        return "Đã hủy";
      case "GIAOTHATBAI":
        return "Giao thất bại";
      default:
        return "Không xác định";
    }
  };

  // Hàm get class CSS cho trạng thái
  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case "DANGXULY":
        return styles["status-processing"]; // Màu vàng
      case "DAGIAO":
        return styles["status-completed"]; // Màu xanh lá
      case "DAHUY":
        return styles["status-cancelled"]; // Màu đỏ
      case "GIAOTHATBAI":
        return styles["status-failed"]; // Màu cam
      default:
        return styles["status-unknown"];
    }
  };

  // Hàm format trạng thái mượn sách
  const getBorrowStatusText = (status: string) => {
    switch (status) {
      case "CHODUYET":
        return "Chờ duyệt";
      case "DADUYET":
        return "Đã duyệt";
      case "TUCHOI":
        return "Từ chối";
      case "DATRA":
        return "Đã trả";
      case "DANGMUON":
        return "Đang mượn";
      default:
        return "Không xác định";
    }
  };

  // Hàm get class CSS cho trạng thái mượn
  const getBorrowStatusClass = (status: string) => {
    switch (status) {
      case "CHODUYET":
        return styles["borrow-status-choduyet"]; // Màu vàng
      case "DADUYET":
        return styles["borrow-status-daduyet"]; // Màu xanh lá
      case "TUCHOI":
        return styles["borrow-status-tuchoi"]; // Màu đỏ
      case "DATRA":
        return styles["borrow-status-datra"]; // Màu xanh lá
      case "DANGMUON":
        return styles["borrow-status-dangmuon"]; // Màu xanh lá
      default:
        return styles["borrow-status-unknown"];
    }
  };

  // Hàm xử lý khi click vào sách đã mượn
  const handleBorrowedBookClick = (key: string) => {
    if (selectedBorrowedBook === key) {
      // Nếu đang mở thì đóng lại
      setSelectedBorrowedBook(null);
    } else {
      // Mở chi tiết sách đã mượn
      setSelectedBorrowedBook(key);
    }
  };

  // Hàm tính ngày quá hạn
  const calculateOverdueDays = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchDonHangList(newPage);
      // Đóng chi tiết đơn hàng khi chuyển trang
      setSelectedOrder(null);
      setChiTietDonHang([]);
    }
  };

  // Hàm tạo số trang hiển thị
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages: number[] = [];

    // Hiển thị tối đa 5 số trang
    const maxDisplayPages = 5;

    if (totalPages <= maxDisplayPages) {
      // Nếu tổng số trang <= 5, hiển thị tất cả
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu tổng số trang > 5, hiển thị thông minh
      if (currentPage < 2) {
        // Hiển thị 0,1,2,3,4
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 3) {
        // Hiển thị (totalPages-5)...(totalPages-1)
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Hiển thị currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Hàm render nội dung chính
  const renderContent = () => {
    const currentData = editableData || profileData;

    if (!currentData) return null;

    // Xử lý ngày sinh
    const ngaySinhParts = currentData.ngaySinh
      ? currentData.ngaySinh.split("-").reverse()
      : ["", "", ""];

    // Xử lý giới tính từ enum string
    const gioiTinh = currentData.gioiTinh; // "NAM", "NU", hoặc null

    switch (activeMenu) {
      case "hoSoCaNhan":
        return (
          <div className={styles["form-section"]}>
            <h2 className="mb-4">Hồ sơ cá nhân</h2>

            {/* 1. HỌ */}
            <div className={styles["form-group-horizontal"]}>
              <label>Họ*</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="text"
                  className={styles["form-control"]}
                  value={currentData.hoLot || ""}
                  onChange={(e) => handleInputChange("hoLot", e.target.value)}
                />
              </div>
            </div>

            {/* 2. TÊN */}
            <div className={styles["form-group-horizontal"]}>
              <label>Tên*</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="text"
                  className={styles["form-control"]}
                  value={currentData.ten || ""}
                  onChange={(e) => handleInputChange("ten", e.target.value)}
                />
              </div>
            </div>

            {/* 3. SỐ ĐIỆN THOẠI */}
            <div className={styles["form-group-horizontal"]}>
              <label>Số điện thoại</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="text"
                  className={styles["form-control"]}
                  value={currentData.dienThoai || ""}
                  onChange={(e) =>
                    handleInputChange("dienThoai", e.target.value)
                  }
                />
              </div>
            </div>

            {/* 4. EMAIL */}
            <div className={styles["form-group-horizontal"]}>
              <label>Email</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="email"
                  className={styles["form-control"]}
                  value={currentData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            {/* 5. ĐỊA CHỈ */}
            <div className={styles["form-group-horizontal"]}>
              <label>Địa chỉ</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="text"
                  className={styles["form-control"]}
                  value={currentData.diaChi || ""}
                  onChange={(e) => handleInputChange("diaChi", e.target.value)}
                />
              </div>
            </div>

            {/* 6. GIỚI TÍNH */}
            <div className={styles["form-group-horizontal"]}>
              <label>Giới tính*</label>
              <div className={styles["radio-group"]}>
                <label className={styles["radio-label"]}>
                  <input
                    type="radio"
                    name="gioiTinh"
                    value="NAM"
                    checked={gioiTinh === "NAM"}
                    onChange={() => handleInputChange("gioiTinh", "NAM")}
                  />
                  <span className={styles["radio-text"]}>Nam</span>
                </label>
                <label className={styles["radio-label"]}>
                  <input
                    type="radio"
                    name="gioiTinh"
                    value="NU"
                    checked={gioiTinh === "NU"}
                    onChange={() => handleInputChange("gioiTinh", "NU")}
                  />
                  <span className={styles["radio-text"]}>Nữ</span>
                </label>
              </div>
            </div>

            {/* 7. BIRTHDAY */}
            <div className={styles["form-group-horizontal"]}>
              <label>Birthday*</label>
              <div className={styles["birthday-inputs"]}>
                <input
                  type="text"
                  className={styles["form-control-small"]}
                  value={ngaySinhParts[0] || ""}
                  placeholder="DD"
                  onChange={(e) => {
                    const newParts = [...ngaySinhParts];
                    newParts[0] = e.target.value;
                    const newDate = `${newParts[2]}-${newParts[1].padStart(
                      2,
                      "0"
                    )}-${newParts[0].padStart(2, "0")}`;
                    handleInputChange("ngaySinh", newDate);
                  }}
                />
                <input
                  type="text"
                  className={styles["form-control-small"]}
                  value={ngaySinhParts[1] || ""}
                  placeholder="MM"
                  onChange={(e) => {
                    const newParts = [...ngaySinhParts];
                    newParts[1] = e.target.value;
                    const newDate = `${newParts[2]}-${newParts[1].padStart(
                      2,
                      "0"
                    )}-${newParts[0].padStart(2, "0")}`;
                    handleInputChange("ngaySinh", newDate);
                  }}
                />
                <input
                  type="text"
                  className={styles["form-control-year"]}
                  value={ngaySinhParts[2] || ""}
                  placeholder="YYYY"
                  onChange={(e) => {
                    const newParts = [...ngaySinhParts];
                    newParts[2] = e.target.value;
                    const newDate = `${newParts[2]}-${newParts[1].padStart(
                      2,
                      "0"
                    )}-${newParts[0].padStart(2, "0")}`;
                    handleInputChange("ngaySinh", newDate);
                  }}
                />
              </div>
            </div>

            {/* 8. NÚT LƯU THAY ĐỔI - Hiển thị luôn */}
            <div className={styles["save-button-container"]}>
              <button
                className={styles["save-button"]}
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        );
      case "doiMatKhau":
        return (
          <div className={styles["form-section"]}>
            <h2 className="mb-4">Đổi mật khẩu</h2>

            {/* Mật khẩu hiện tại */}
            <div className={styles["form-group-horizontal"]}>
              <label>Mật khẩu hiện tại*</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="password"
                  className={styles["form-control"]}
                  placeholder="Mật khẩu hiện tại"
                  value={changePasswordData.matKhauHienTai}
                  onChange={(e) =>
                    handlePasswordChange("matKhauHienTai", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className={styles["form-group-horizontal"]}>
              <label>Mật khẩu mới*</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="password"
                  className={styles["form-control"]}
                  placeholder="Mật khẩu mới"
                  value={changePasswordData.matKhauMoi}
                  onChange={(e) =>
                    handlePasswordChange("matKhauMoi", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Nhập lại mật khẩu mới */}
            <div className={styles["form-group-horizontal"]}>
              <label>Nhập lại mật khẩu mới*</label>
              <div className={styles["input-wrapper"]}>
                <input
                  type="password"
                  className={styles["form-control"]}
                  placeholder="Nhập lại mật khẩu mới"
                  value={changePasswordData.nhapLaiMatKhauMoi}
                  onChange={(e) =>
                    handlePasswordChange("nhapLaiMatKhauMoi", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Nút lưu thay đổi */}
            <div className={styles["save-button-container"]}>
              <button
                className={styles["save-button"]}
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        );
      case "donHangCuaToi":
        return (
          <div className={styles["form-section"]}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Đơn hàng của tôi</h2>
              {pagination.totalElements > 0 && (
                <span className="text-muted">
                  Tổng: {pagination.totalElements} đơn hàng
                </span>
              )}
            </div>

            {isLoadingOrders ? (
              <div className="text-center p-4">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang tải danh sách đơn hàng...
              </div>
            ) : donHangList.length === 0 ? (
              <div className={styles["empty-orders"]}>
                <div className="text-center p-5">
                  <i
                    className="fas fa-shopping-cart mb-3"
                    style={{ fontSize: "3rem", color: "#ccc" }}
                  ></i>
                  <h4>Chưa có đơn hàng nào</h4>
                  <p className="text-muted">
                    Bạn chưa thực hiện đơn hàng nào. Hãy mua sắm ngay!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Danh sách đơn hàng */}
                <div className={styles["orders-container"]}>
                  {donHangList.map((donHang) => (
                    <div
                      key={donHang.maDonHang}
                      className={styles["order-card"]}
                    >
                      {/* Header đơn hàng */}
                      <div
                        className={styles["order-header"]}
                        onClick={() => handleOrderClick(donHang.maDonHang)}
                      >
                        <div className={styles["order-info"]}>
                          <div className={styles["order-id"]}>
                            <strong>#{donHang.maDonHang}</strong>
                          </div>
                          <div className={styles["order-date"]}>
                            Ngày đặt:{" "}
                            {new Date(donHang.ngayDat).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>

                        <div className={styles["order-summary"]}>
                          <div className={styles["order-total"]}>
                            {formatCurrency(donHang.tongTien)}
                          </div>
                          <div
                            className={`${
                              styles["order-status"]
                            } ${getOrderStatusClass(donHang.trangThaiDonHang)}`}
                          >
                            {getOrderStatusText(donHang.trangThaiDonHang)}
                          </div>
                          <div className={styles["expand-icon"]}>
                            <i
                              className={`fas ${
                                selectedOrder === donHang.maDonHang
                                  ? "fa-chevron-up"
                                  : "fa-chevron-down"
                              }`}
                            ></i>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết đơn hàng */}
                      {selectedOrder === donHang.maDonHang && (
                        <div className={styles["order-details"]}>
                          {isLoadingOrderDetails ? (
                            <div className="text-center p-3">
                              <i className="fas fa-spinner fa-spin me-2"></i>
                              Đang tải chi tiết...
                            </div>
                          ) : chiTietDonHang.length > 0 ? (
                            <>
                              <h5 className="mb-3">Chi tiết sản phẩm:</h5>
                              {chiTietDonHang.map((item, index) => (
                                <div
                                  key={index}
                                  className={styles["order-item"]}
                                >
                                  <div className={styles["item-image"]}>
                                    {item.anhBia ? (
                                      <>
                                        <img
                                          src={`/api/uploads/${item.anhBia}`}
                                          alt={item.tenSach}
                                          loading="lazy"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            console.log(
                                              "❌ Image load error for:",
                                              item.anhBia
                                            );
                                            console.log(
                                              "❌ Full URL:",
                                              target.src
                                            );

                                            if (
                                              target.src.includes(
                                                "/api/uploads/"
                                              )
                                            ) {
                                              console.log(
                                                "❌ Trying direct uploads path..."
                                              );
                                              target.src = `/uploads/${item.anhBia}`;
                                            } else {
                                              target.style.display = "none";
                                              const parent =
                                                target.parentElement;
                                              if (parent) {
                                                const placeholder =
                                                  parent.querySelector(
                                                    ".placeholder"
                                                  ) as HTMLElement;
                                                if (placeholder) {
                                                  placeholder.style.display =
                                                    "flex";
                                                }
                                              }
                                            }
                                          }}
                                          onLoad={() => {
                                            console.log(
                                              "✅ Image loaded successfully:",
                                              item.anhBia
                                            );
                                          }}
                                        />
                                        <div
                                          className="placeholder"
                                          style={{
                                            display: "none",
                                            background: "#f3f4f6",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "100%",
                                            height: "100%",
                                            fontSize: "12px",
                                            color: "#9ca3af",
                                            flexDirection: "column",
                                            gap: "8px",
                                          }}
                                        >
                                          <i
                                            className="fas fa-book"
                                            style={{ fontSize: "24px" }}
                                          ></i>
                                          <span>Không có ảnh</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div
                                        className="placeholder"
                                        style={{
                                          display: "flex",
                                          background: "#f3f4f6",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: "100%",
                                          height: "100%",
                                          fontSize: "12px",
                                          color: "#9ca3af",
                                          flexDirection: "column",
                                          gap: "8px",
                                        }}
                                      >
                                        <i
                                          className="fas fa-book"
                                          style={{ fontSize: "24px" }}
                                        ></i>
                                        <span>Không có ảnh</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className={styles["item-details"]}>
                                    <h6>{item.tenSach}</h6>
                                    {item.tacGia && (
                                      <p className="text-muted mb-1">
                                        <i className="fas fa-user me-1"></i>
                                        Tác giả: {item.tacGia}
                                      </p>
                                    )}
                                    <div className="mt-auto">
                                      <p className="mb-1">
                                        <i className="fas fa-shopping-cart me-1"></i>
                                        <span>
                                          Số lượng:{" "}
                                          <strong>{item.soLuong}</strong>
                                        </span>
                                      </p>
                                      <p className="mb-0">
                                        <i className="fas fa-tag me-1"></i>
                                        <span>
                                          Đơn giá:{" "}
                                          <strong>
                                            {formatCurrency(item.donGia)}
                                          </strong>
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className={styles["item-total"]}>
                                    <div className="text-end">
                                      <div className="text-muted small">
                                        Thành tiền
                                      </div>
                                      <div className="fw-bold">
                                        {formatCurrency(
                                          item.thanhTien ||
                                            item.soLuong * item.donGia
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <div className={styles["order-total-summary"]}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong>Tổng cộng:</strong>
                                  <strong className={styles["total-amount"]}>
                                    {formatCurrency(donHang.tongTien)}
                                  </strong>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-muted">
                              Không có chi tiết sản phẩm
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className={styles["pagination-container"]}>
                    <nav aria-label="Order pagination">
                      <ul className={styles["pagination"]}>
                        {/* Previous Button */}
                        <li
                          className={`${styles["page-item"]} ${
                            pagination.currentPage === 0
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={pagination.currentPage === 0}
                            aria-label="Previous"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>

                        {/* First page if not visible */}
                        {pagination.currentPage > 2 && (
                          <>
                            <li className={styles["page-item"]}>
                              <button
                                className={styles["page-link"]}
                                onClick={() => handlePageChange(0)}
                              >
                                1
                              </button>
                            </li>
                            {pagination.currentPage > 3 && (
                              <li
                                className={`${styles["page-item"]} ${styles["disabled"]}`}
                              >
                                <span className={styles["page-link"]}>...</span>
                              </li>
                            )}
                          </>
                        )}

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNum) => (
                          <li
                            key={pageNum}
                            className={`${styles["page-item"]} ${
                              pageNum === pagination.currentPage
                                ? styles["active"]
                                : ""
                            }`}
                          >
                            <button
                              className={styles["page-link"]}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum + 1}
                            </button>
                          </li>
                        ))}

                        {/* Last page if not visible */}
                        {pagination.currentPage < pagination.totalPages - 3 && (
                          <>
                            {pagination.currentPage <
                              pagination.totalPages - 4 && (
                              <li
                                className={`${styles["page-item"]} ${styles["disabled"]}`}
                              >
                                <span className={styles["page-link"]}>...</span>
                              </li>
                            )}
                            <li className={styles["page-item"]}>
                              <button
                                className={styles["page-link"]}
                                onClick={() =>
                                  handlePageChange(pagination.totalPages - 1)
                                }
                              >
                                {pagination.totalPages}
                              </button>
                            </li>
                          </>
                        )}

                        {/* Next Button */}
                        <li
                          className={`${styles["page-item"]} ${
                            pagination.currentPage >= pagination.totalPages - 1
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={
                              pagination.currentPage >=
                              pagination.totalPages - 1
                            }
                            aria-label="Next"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>

                    {/* Page Info */}
                    <div className={styles["pagination-info"]}>
                      Trang {pagination.currentPage + 1} /{" "}
                      {pagination.totalPages}{" "}
                      <span className="text-muted ms-2">
                        (Hiển thị {donHangList.length} /{" "}
                        {pagination.totalElements} đơn hàng)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "thongBao":
        return (
          <div className={styles["form-section"]}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Thông báo của tôi</h2>
              {notificationPagination.totalElements > 0 && (
                <span className="text-muted">
                  Tổng: {notificationPagination.totalElements} thông báo
                </span>
              )}
            </div>

            {/* Filter và Search */}
            <div className="d-flex justify-content-end mb-4">
              <select
                className={`form-select ${styles["form-select-sm"]}`}
                style={{ width: "150px" }}
                onChange={handleFilterChange}
                value={
                  notificationFilter === false
                    ? "unread"
                    : notificationFilter === true
                    ? "read"
                    : "all"
                }
              >
                <option value="all">Tất cả</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
              </select>
            </div>

            {isLoadingNotifications ? (
              <div className="text-center p-4">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang tải danh sách thông báo...
              </div>
            ) : thongBaoList.length === 0 ? (
              <div className={styles["empty-orders"]}>
                <div className="text-center p-5">
                  <i
                    className="fas fa-bell mb-3"
                    style={{ fontSize: "3rem", color: "#ccc" }}
                  ></i>
                  <h4>Không có thông báo nào</h4>
                  <p className="text-muted">
                    Các thông báo mới sẽ xuất hiện ở đây.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Danh sách Thông báo */}
                <div className={styles["orders-container"]}>
                  {thongBaoList.map((thongBao) => {
                    const typeInfo = getNotificationTypeInfo(
                      thongBao.loaiThongBao
                    );
                    const isExpanded = expandedNotification === thongBao.id;

                    return (
                      <div
                        key={thongBao.id}
                        className={`${styles["order-card"]} ${
                          !thongBao.trangThaiDaDoc
                            ? styles["unread-notification"] // Thêm class highlight
                            : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Header Thông báo */}
                        <div
                          className={styles["order-header"]}
                          onClick={() => handleNotificationClick(thongBao)}
                        >
                          <div className={styles["order-info"]}>
                            {/* Badge loại thông báo */}
                            <div
                              className={`${styles["notification-type-badge"]} ${typeInfo.class}`}
                            >
                              <i className={`${typeInfo.icon} me-1`}></i>
                              {typeInfo.text}
                            </div>
                            {/* Nội dung tóm tắt */}
                            <div
                              className={styles["order-id"]}
                              style={{
                                marginTop: "8px",
                                fontWeight: !thongBao.trangThaiDaDoc
                                  ? "bold"
                                  : "normal",
                                fontSize: "1rem",
                              }}
                            >
                              <div>
                                {/* Hiển thị nội dung tóm tắt */}
                                {thongBao.noiDung.length > 100 && !isExpanded
                                  ? thongBao.noiDung.substring(0, 100) + "..."
                                  : thongBao.noiDung}
                              </div>
                            </div>
                            {/* Thời gian gửi */}
                            <div
                              className={styles["order-date"]}
                              style={{
                                marginTop: "4px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <i className="fas fa-clock me-1"></i>
                              {formatTimeAgo(thongBao.thoiGianGui)}
                            </div>
                          </div>

                          <div className={styles["order-summary"]}>
                            {/* Hiển thị trạng thái đọc (chỉ khi chưa mở) */}
                            {!isExpanded && (
                              <span
                                className={`badge me-3 ${
                                  thongBao.trangThaiDaDoc
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                                style={{ fontSize: "0.75rem" }}
                              >
                                {thongBao.trangThaiDaDoc
                                  ? "Đã Đọc"
                                  : "Chưa Đọc"}
                              </span>
                            )}
                            <div className={`${styles["expand-icon"]} me-3`}>
                              <i
                                className={`fas ${
                                  isExpanded
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              ></i>
                            </div>
                          </div>
                        </div>

                        {/* Chi tiết thông báo */}
                        {isExpanded && (
                          <div className={styles["order-details"]}>
                            <div className={styles["notification-detail-box"]}>
                              <div className="text-center mb-3">
                                {/* Icon nền lớn */}
                                <div
                                  className={`${styles["notification-icon-large"]} ${typeInfo.iconClass}`}
                                >
                                  <i className={typeInfo.icon}></i>
                                </div>
                                <h5 className="mb-1">{typeInfo.text}</h5>
                              </div>

                              <p className={styles["notification-content"]}>
                                <strong>Nội dung:</strong> {thongBao.noiDung}
                              </p>

                              <div className={styles["notification-meta"]}>
                                <i className="fas fa-calendar"></i>
                                Thời gian gửi:{" "}
                                {formatDate(thongBao.thoiGianGui)} (
                                {new Date(
                                  thongBao.thoiGianGui
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                )
                              </div>
                              {thongBao.maSach && (
                                <div className={styles["notification-meta"]}>
                                  <i className="fas fa-book"></i>
                                  Mã sách: {thongBao.maSach}
                                </div>
                              )}
                              {thongBao.ngayMuon && (
                                <div className={styles["notification-meta"]}>
                                  <i className="fas fa-calendar-alt"></i>
                                  Ngày mượn: {formatDate(thongBao.ngayMuon)}
                                </div>
                              )}
                            </div>

                            {/* Trạng thái đọc (ở footer chi tiết) */}
                            <div className="mt-3 text-end">
                              <span
                                className={`badge ${
                                  thongBao.trangThaiDaDoc
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {thongBao.trangThaiDaDoc
                                  ? "Đã Đọc"
                                  : "Chưa Đọc"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {notificationPagination.totalPages > 1 && (
                  <div className={styles["pagination-container"]}>
                    <nav aria-label="Notification pagination">
                      <ul className={styles["pagination"]}>
                        {/* Previous Button */}
                        <li
                          className={`${styles["page-item"]} ${
                            notificationPagination.currentPage === 0
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handleNotificationPageChange(
                                notificationPagination.currentPage - 1
                              )
                            }
                            disabled={notificationPagination.currentPage === 0}
                            aria-label="Previous"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>

                        {/* Page Numbers */}
                        {getNotificationPageNumbers().map((pageNum) => (
                          <li
                            key={pageNum}
                            className={`${styles["page-item"]} ${
                              pageNum === notificationPagination.currentPage
                                ? styles["active"]
                                : ""
                            }`}
                          >
                            <button
                              className={styles["page-link"]}
                              onClick={() =>
                                handleNotificationPageChange(pageNum)
                              }
                            >
                              {pageNum + 1}
                            </button>
                          </li>
                        ))}

                        {/* Next Button */}
                        <li
                          className={`${styles["page-item"]} ${
                            notificationPagination.currentPage >=
                            notificationPagination.totalPages - 1
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handleNotificationPageChange(
                                notificationPagination.currentPage + 1
                              )
                            }
                            disabled={
                              notificationPagination.currentPage >=
                              notificationPagination.totalPages - 1
                            }
                            aria-label="Next"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>

                    {/* Page Info */}
                    <div className={styles["pagination-info"]}>
                      Trang {notificationPagination.currentPage + 1} /{" "}
                      {notificationPagination.totalPages}{" "}
                      <span className="text-muted ms-2">
                        (Hiển thị {thongBaoList.length} /{" "}
                        {notificationPagination.totalElements} thông báo)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case "sachDaMuon":
        return (
          <div className={styles["form-section"]}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Sách đã mượn</h2>
              {borrowedBooksPagination.totalElements > 0 && (
                <span className="text-muted">
                  Tổng: {borrowedBooksPagination.totalElements} phiếu mượn
                </span>
              )}
            </div>

            {isLoadingBorrowedBooks ? (
              <div className="text-center p-4">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang tải danh sách sách đã mượn...
              </div>
            ) : sachDaMuonList.length === 0 ? (
              <div className={styles["empty-orders"]}>
                <div className="text-center p-5">
                  <i
                    className="fas fa-book mb-3"
                    style={{ fontSize: "3rem", color: "#ccc" }}
                  ></i>
                  <h4>Chưa có sách nào được mượn</h4>
                  <p className="text-muted">
                    Bạn chưa mượn sách nào. Hãy tìm kiếm và mượn sách yêu thích!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Danh sách sách đã mượn */}
                <div className={styles["orders-container"]}>
                  {sachDaMuonList.map((phieuMuon) => {
                    const borrowKey = `${phieuMuon.maSach}-${phieuMuon.ngayMuon}`;
                    const overdueDays = calculateOverdueDays(phieuMuon.ngayTra);
                    const isOverdue =
                      overdueDays > 0 &&
                      (phieuMuon.trangThaiMuon === "DANGMUON" ||
                        phieuMuon.trangThaiMuon === "DADUYET");

                    return (
                      <div key={borrowKey} className={styles["order-card"]}>
                        {/* Header sách đã mượn */}
                        <div
                          className={styles["order-header"]}
                          onClick={() => handleBorrowedBookClick(borrowKey)}
                        >
                          <div className={styles["order-info"]}>
                            <div className={styles["order-id"]}>
                              <strong>
                                {phieuMuon.sach?.tenSach ||
                                  "Tên sách không xác định"}
                              </strong>
                            </div>
                            <div className={styles["order-date"]}>
                              Ngày mượn: {formatDate(phieuMuon.ngayMuon)} • Hạn
                              trả: {formatDate(phieuMuon.ngayTra)}
                              {isOverdue && (
                                <span
                                  style={{
                                    color: "#dc3545",
                                    marginLeft: "8px",
                                  }}
                                >
                                  (Quá hạn {overdueDays} ngày)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles["order-summary"]}>
                            <div
                              className={styles["order-total"]}
                              style={{ fontSize: "14px", color: "#6b7280" }}
                            >
                              {phieuMuon.sach?.tacGia ||
                                "Tác giả không xác định"}
                            </div>
                            <div
                              className={`${
                                styles["order-status"]
                              } ${getBorrowStatusClass(
                                phieuMuon.trangThaiMuon
                              )}`}
                            >
                              {getBorrowStatusText(phieuMuon.trangThaiMuon)}
                            </div>
                            <div className={styles["expand-icon"]}>
                              <i
                                className={`fas ${
                                  selectedBorrowedBook === borrowKey
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              ></i>
                            </div>
                          </div>
                        </div>

                        {/* Chi tiết sách đã mượn */}
                        {selectedBorrowedBook === borrowKey && (
                          <div className={styles["order-details"]}>
                            <h5 className="mb-3">Chi tiết sách:</h5>
                            <div className={styles["order-item"]}>
                              {/* Ảnh sách */}
                              <div
                                className={styles["item-image"]}
                                style={{ marginLeft: "12px" }}
                              >
                                {phieuMuon.sach?.anhBia ? (
                                  <>
                                    <img
                                      src={`/api/uploads/${phieuMuon.sach.anhBia}`}
                                      alt={
                                        phieuMuon.sach.tenSach ||
                                        "Sách không xác định"
                                      }
                                      loading="lazy"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        console.log(
                                          "❌ Image load error for borrowed book:",
                                          phieuMuon.sach?.anhBia
                                        );
                                        console.log("❌ Full URL:", target.src);

                                        if (
                                          target.src.includes("/api/uploads/")
                                        ) {
                                          console.log(
                                            "❌ Trying direct uploads path..."
                                          );
                                          target.src = `/uploads/${phieuMuon.sach?.anhBia}`;
                                        } else {
                                          target.style.display = "none";
                                          const parent = target.parentElement;
                                          if (parent) {
                                            const placeholder =
                                              parent.querySelector(
                                                ".placeholder"
                                              ) as HTMLElement;
                                            if (placeholder) {
                                              placeholder.style.display =
                                                "flex";
                                            }
                                          }
                                        }
                                      }}
                                      onLoad={() => {
                                        console.log(
                                          "✅ Borrowed book image loaded successfully:",
                                          phieuMuon.sach?.anhBia
                                        );
                                      }}
                                    />
                                    <div
                                      className="placeholder"
                                      style={{
                                        display: "none",
                                        background: "#f3f4f6",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                        height: "100%",
                                        fontSize: "12px",
                                        color: "#9ca3af",
                                        flexDirection: "column",
                                        gap: "8px",
                                      }}
                                    >
                                      <i
                                        className="fas fa-book"
                                        style={{ fontSize: "24px" }}
                                      ></i>
                                      <span>Không có ảnh</span>
                                    </div>
                                  </>
                                ) : (
                                  <div
                                    className="placeholder"
                                    style={{
                                      display: "flex",
                                      background: "#f3f4f6",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "100%",
                                      height: "100%",
                                      fontSize: "12px",
                                      color: "#9ca3af",
                                      flexDirection: "column",
                                      gap: "8px",
                                    }}
                                  >
                                    <i
                                      className="fas fa-book"
                                      style={{ fontSize: "24px" }}
                                    ></i>
                                    <span>Không có ảnh</span>
                                  </div>
                                )}
                              </div>

                              {/* Thông tin chi tiết */}
                              <div className={styles["item-details"]}>
                                <h6
                                  style={{
                                    color: "#043747",
                                    marginBottom: "8px",
                                  }}
                                >
                                  {phieuMuon.sach?.tenSach ||
                                    "Tên sách không xác định"}
                                </h6>
                                <p className="text-muted mb-1">
                                  <i className="fas fa-user me-1"></i>
                                  <span>
                                    Tác giả:{" "}
                                    <strong>
                                      {phieuMuon.sach?.tacGia ||
                                        "Chưa xác định"}
                                    </strong>
                                  </span>
                                </p>
                                <p className="mb-1">
                                  <i className="fas fa-calendar me-1"></i>
                                  <span>
                                    Ngày mượn:{" "}
                                    <strong>
                                      {formatDate(phieuMuon.ngayMuon)}
                                    </strong>
                                  </span>
                                </p>
                                <p className="mb-1">
                                  <i className="fas fa-calendar-check me-1"></i>
                                  <span>
                                    Hạn trả:{" "}
                                    <strong>
                                      {formatDate(phieuMuon.ngayTra)}
                                    </strong>
                                  </span>
                                </p>
                                {phieuMuon.tenNhanVien && (
                                  <p className="mb-0">
                                    <i className="fas fa-user-tie me-1"></i>
                                    <span>
                                      Nhân viên duyệt:{" "}
                                      <strong>{phieuMuon.tenNhanVien}</strong>
                                    </span>
                                  </p>
                                )}
                              </div>

                              {/* Trạng thái và cảnh báo */}
                              <div
                                className={styles["item-total"]}
                                style={{
                                  marginRight: "12px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "8px",
                                }}
                              >
                                <div className="text-end">
                                  <div className="text-muted small">
                                    Trạng thái
                                  </div>
                                  <div
                                    className={`fw-bold ${
                                      styles["borrow-status"]
                                    } ${getBorrowStatusClass(
                                      phieuMuon.trangThaiMuon
                                    )}`}
                                  >
                                    {getBorrowStatusText(
                                      phieuMuon.trangThaiMuon
                                    )}
                                  </div>
                                </div>

                                {/* Cảnh báo quá hạn */}
                                {isOverdue && (
                                  <div
                                    className={styles["overdue-warning"]}
                                    style={{
                                      background: "#fef2f2",
                                      border: "1px solid #fecaca",
                                      borderRadius: "4px",
                                      padding: "8px 12px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <div className={styles["overdue-text"]}>
                                      <i className="fas fa-exclamation-triangle me-1"></i>
                                      Quá hạn {overdueDays} ngày
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls cho sách đã mượn */}
                {borrowedBooksPagination.totalPages > 1 && (
                  <div className={styles["pagination-container"]}>
                    <nav aria-label="Borrowed books pagination">
                      <ul className={styles["pagination"]}>
                        {/* Previous Button */}
                        <li
                          className={`${styles["page-item"]} ${
                            borrowedBooksPagination.currentPage === 0
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handleBorrowedBooksPageChange(
                                borrowedBooksPagination.currentPage - 1
                              )
                            }
                            disabled={borrowedBooksPagination.currentPage === 0}
                            aria-label="Previous"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>

                        {/* First page if not visible */}
                        {borrowedBooksPagination.currentPage > 2 && (
                          <>
                            <li className={styles["page-item"]}>
                              <button
                                className={styles["page-link"]}
                                onClick={() => handleBorrowedBooksPageChange(0)}
                              >
                                1
                              </button>
                            </li>
                            {borrowedBooksPagination.currentPage > 3 && (
                              <li
                                className={`${styles["page-item"]} ${styles["disabled"]}`}
                              >
                                <span className={styles["page-link"]}>...</span>
                              </li>
                            )}
                          </>
                        )}

                        {/* Page Numbers */}
                        {getBorrowedBooksPageNumbers().map((pageNum) => (
                          <li
                            key={pageNum}
                            className={`${styles["page-item"]} ${
                              pageNum === borrowedBooksPagination.currentPage
                                ? styles["active"]
                                : ""
                            }`}
                          >
                            <button
                              className={styles["page-link"]}
                              onClick={() =>
                                handleBorrowedBooksPageChange(pageNum)
                              }
                            >
                              {pageNum + 1}
                            </button>
                          </li>
                        ))}

                        {/* Last page if not visible */}
                        {borrowedBooksPagination.currentPage <
                          borrowedBooksPagination.totalPages - 3 && (
                          <>
                            {borrowedBooksPagination.currentPage <
                              borrowedBooksPagination.totalPages - 4 && (
                              <li
                                className={`${styles["page-item"]} ${styles["disabled"]}`}
                              >
                                <span className={styles["page-link"]}>...</span>
                              </li>
                            )}
                            <li className={styles["page-item"]}>
                              <button
                                className={styles["page-link"]}
                                onClick={() =>
                                  handleBorrowedBooksPageChange(
                                    borrowedBooksPagination.totalPages - 1
                                  )
                                }
                              >
                                {borrowedBooksPagination.totalPages}
                              </button>
                            </li>
                          </>
                        )}

                        {/* Next Button */}
                        <li
                          className={`${styles["page-item"]} ${
                            borrowedBooksPagination.currentPage >=
                            borrowedBooksPagination.totalPages - 1
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handleBorrowedBooksPageChange(
                                borrowedBooksPagination.currentPage + 1
                              )
                            }
                            disabled={
                              borrowedBooksPagination.currentPage >=
                              borrowedBooksPagination.totalPages - 1
                            }
                            aria-label="Next"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>

                    {/* Page Info */}
                    <div className={styles["pagination-info"]}>
                      Trang {borrowedBooksPagination.currentPage + 1} /{" "}
                      {borrowedBooksPagination.totalPages}{" "}
                      <span className="text-muted ms-2">
                        (Hiển thị {sachDaMuonList.length} /{" "}
                        {borrowedBooksPagination.totalElements} phiếu mượn)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case "thongTinPhat":
        return (
          <div className={styles["form-section"]}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Thông tin phạt</h2>
              {finesPagination.totalElements > 0 && (
                <span className="text-muted">
                  Tổng: {finesPagination.totalElements} lần phạt
                </span>
              )}
            </div>

            {/* Thông tin tổng hợp phạt */}
            {fineStatusInfo && (
              <div
                className={styles["fine-status-summary"]}
                style={{
                  background: fineStatusInfo.hasUnpaidFines
                    ? "#fef2f2"
                    : "#f0fdf4",
                  border: `1px solid ${
                    fineStatusInfo.hasUnpaidFines ? "#fecaca" : "#bbf7d0"
                  }`,
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <div className="row">
                  <div className="col-md-6">
                    <h5
                      style={{
                        color: fineStatusInfo.hasUnpaidFines
                          ? "#dc2626"
                          : "#059669",
                        marginBottom: "8px",
                      }}
                    >
                      <i
                        className={`fas ${
                          fineStatusInfo.hasUnpaidFines
                            ? "fa-exclamation-triangle"
                            : "fa-check-circle"
                        } me-2`}
                      ></i>
                      Tổng tiền phạt chưa thanh toán
                    </h5>
                    <p
                      className="mb-0"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: fineStatusInfo.hasUnpaidFines
                          ? "#dc2626"
                          : "#059669",
                      }}
                    >
                      {fineStatusInfo.formattedAmount}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ marginBottom: "8px" }}>
                      Trạng thái tài khoản:
                    </h6>

                    {/* Hiển thị trạng thái tài khoản */}
                    {fineStatusInfo.isAccountLocked ? (
                      // Tài khoản đã bị khóa
                      <span
                        className="badge bg-danger"
                        style={{ fontSize: "1rem", padding: "8px 12px" }}
                      >
                        Tài khoản bị tạm khóa
                      </span>
                    ) : fineStatusInfo.hasUnpaidFines ? (
                      // Có phạt chưa thanh toán nhưng chưa bị khóa
                      <span
                        className="badge bg-warning"
                        style={{
                          fontSize: "1rem",
                          padding: "8px 12px",
                          color: "#000",
                        }}
                      >
                        Hoạt động bình thường
                      </span>
                    ) : (
                      // Không có phạt
                      <span
                        className="badge bg-success"
                        style={{ fontSize: "1rem", padding: "8px 12px" }}
                      >
                        Hoạt động bình thường
                      </span>
                    )}

                    {/* Thông báo cảnh báo */}
                    {fineStatusInfo.isAccountLocked ? (
                      <p
                        className="text-danger mt-2 mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <i className="fas fa-lock me-1"></i>
                        Vui lòng thanh toán hết phạt để mở khóa tài khoản
                      </p>
                    ) : fineStatusInfo.hasUnpaidFines ? (
                      <p
                        className="text-warning mt-2 mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <i className="fas fa-info-circle me-1"></i>
                        Nếu chưa nộp phạt và trả sách sau 7 ngày sẽ tiến hành
                        khóa tài khoản
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {isLoadingFines ? (
              <div className="text-center p-4">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang tải danh sách phạt...
              </div>
            ) : phatList.length === 0 ? (
              <div className={styles["empty-orders"]}>
                <div className="text-center p-5">
                  <i
                    className="fas fa-hand-holding-usd mb-3"
                    style={{ fontSize: "3rem", color: "#10b981" }}
                  ></i>
                  <h4 style={{ color: "#059669" }}>
                    Chúc mừng! Bạn không có phạt nào
                  </h4>
                  <p className="text-muted">
                    Hãy tiếp tục trả sách đúng hạn để tránh bị phạt nhé!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Danh sách phạt */}
                <div className={styles["orders-container"]}>
                  {phatList.map((phat) => (
                    <div
                      key={phat.maPhat}
                      className={`${styles["order-card"]} ${
                        phat.trangThaiPhat === "CHUATHANHTOAN"
                          ? styles["unpaid-fine"]
                          : ""
                      }`}
                    >
                      {/* Header phạt */}
                      <div
                        className={styles["order-header"]}
                        onClick={() => handleFineClick(phat.maPhat)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles["order-info"]}>
                          <div className={styles["order-id"]}>
                            <strong>Phạt #{phat.maPhat}</strong>
                          </div>
                          <div className={styles["order-date"]}>
                            Ngày phạt: {formatDate(phat.ngayTaoPhat)} • Quá hạn:{" "}
                            {phat.soNgayQuaHan} ngày
                          </div>
                          <div className="mt-1">
                            <span
                              style={{ fontSize: "0.9rem", color: "#6b7280" }}
                            >
                              Sách: {phat.tenSach || "Không xác định"}
                            </span>
                          </div>
                        </div>

                        <div className={styles["order-summary"]}>
                          <div className={styles["order-total"]}>
                            {formatCurrency(phat.soTienPhat)}
                          </div>
                          <div
                            className={`${
                              styles["order-status"]
                            } ${getFineStatusClass(phat.trangThaiPhat)}`}
                          >
                            {getFineStatusText(phat.trangThaiPhat)}
                          </div>
                          <div className={styles["expand-icon"]}>
                            <i
                              className={`fas ${
                                selectedFine === phat.maPhat
                                  ? "fa-chevron-up"
                                  : "fa-chevron-down"
                              }`}
                            ></i>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết phạt */}
                      {selectedFine === phat.maPhat && (
                        <div className={styles["order-details"]}>
                          <h5 className="mb-3">Chi tiết phạt:</h5>

                          <div className={styles["fine-detail-info"]}>
                            <div className="row">
                              <div className="col-md-6">
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-book me-2"></i>
                                  <span>
                                    <strong>Sách:</strong>{" "}
                                    {phat.theoDoiMuonSach?.sach?.tenSach ||
                                      phat.tenSach ||
                                      "Không xác định"}
                                  </span>
                                </div>
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-user me-2"></i>
                                  <span>
                                    <strong>Tác giả:</strong>{" "}
                                    {phat.theoDoiMuonSach?.sach?.tacGia ||
                                      "Không xác định"}
                                  </span>
                                </div>
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-calendar me-2"></i>
                                  <span>
                                    <strong>Ngày mượn:</strong>{" "}
                                    {phat.theoDoiMuonSach?.ngayMuon
                                      ? formatDate(
                                          phat.theoDoiMuonSach.ngayMuon
                                        )
                                      : "Không xác định"}
                                  </span>
                                </div>
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-calendar-times me-2"></i>
                                  <span>
                                    <strong>Hạn trả:</strong>{" "}
                                    {phat.theoDoiMuonSach?.ngayTra
                                      ? formatDate(phat.theoDoiMuonSach.ngayTra)
                                      : "Không xác định"}
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-clock me-2"></i>
                                  <span>
                                    <strong>Số ngày quá hạn:</strong>{" "}
                                    {phat.soNgayQuaHan} ngày
                                  </span>
                                </div>
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-money-bill-wave me-2"></i>
                                  <span>
                                    <strong>Tiền phạt:</strong>{" "}
                                    {formatCurrency(phat.soTienPhat)}
                                  </span>
                                </div>
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-calendar-check me-2"></i>
                                  <span>
                                    <strong>Ngày tạo phạt:</strong>{" "}
                                    {formatDate(phat.ngayTaoPhat)}
                                  </span>
                                </div>
                                {phat.ngayThanhToan && (
                                  <div className={styles["fine-info-item"]}>
                                    <i className="fas fa-calendar-check me-2"></i>
                                    <span>
                                      <strong>Ngày thanh toán:</strong>{" "}
                                      {formatDate(phat.ngayThanhToan)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {phat.ghiChu && (
                              <div className="mt-3">
                                <div className={styles["fine-info-item"]}>
                                  <i className="fas fa-sticky-note me-2"></i>
                                  <span>
                                    <strong>Ghi chú:</strong> {phat.ghiChu}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Nút thanh toán */}
                          {phat.trangThaiPhat === "CHUATHANHTOAN" && (
                            <div className="mt-3 text-end">
                              <button
                                className="btn btn-primary"
                                onClick={() => handlePayFine(phat.maPhat)}
                                disabled={isLoadingFines}
                              >
                                <i className="fas fa-credit-card me-2"></i>
                                {isLoadingFines
                                  ? "Đang xử lý..."
                                  : `Thanh toán ${formatCurrency(
                                      phat.soTienPhat
                                    )}`}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination cho phạt */}
                {finesPagination.totalPages > 1 && (
                  <div className={styles["pagination-container"]}>
                    <nav aria-label="Fines pagination">
                      <ul className={styles["pagination"]}>
                        <li
                          className={`${styles["page-item"]} ${
                            finesPagination.currentPage === 0
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handleFinesPageChange(
                                finesPagination.currentPage - 1
                              )
                            }
                            disabled={finesPagination.currentPage === 0}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>

                        {getFinesPageNumbers().map((pageNum) => (
                          <li
                            key={pageNum}
                            className={`${styles["page-item"]} ${
                              pageNum === finesPagination.currentPage
                                ? styles["active"]
                                : ""
                            }`}
                          >
                            <button
                              className={styles["page-link"]}
                              onClick={() => handleFinesPageChange(pageNum)}
                            >
                              {pageNum + 1}
                            </button>
                          </li>
                        ))}

                        <li
                          className={`${styles["page-item"]} ${
                            finesPagination.currentPage >=
                            finesPagination.totalPages - 1
                              ? styles["disabled"]
                              : ""
                          }`}
                        >
                          <button
                            className={styles["page-link"]}
                            onClick={() =>
                              handleFinesPageChange(
                                finesPagination.currentPage + 1
                              )
                            }
                            disabled={
                              finesPagination.currentPage >=
                              finesPagination.totalPages - 1
                            }
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>

                    <div className={styles["pagination-info"]}>
                      Trang {finesPagination.currentPage + 1} /{" "}
                      {finesPagination.totalPages}{" "}
                      <span className="text-muted ms-2">
                        (Hiển thị {phatList.length} /{" "}
                        {finesPagination.totalElements} phạt)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return <h2>Chọn một mục từ menu bên trái.</h2>;
    }
  };

  // (Phần còn lại của component Profile.tsx không thay đổi)

  if (isLoading) {
    // Chỉ hiển thị loading nếu profileData chưa được load
    // Achievement dùng dữ liệu cứng nên không cần chờ
    return (
      <div className={`container ${styles["profile-container"]}`}>
        <div className="text-center p-5">Đang tải dữ liệu hồ sơ...</div>
      </div>
    );
  }

  // Dữ liệu hiển thị trong header
  const customerName = profileData
    ? `${profileData.hoLot} ${profileData.ten}`
    : "Khách Hàng";

  return (
    <div className={`container ${styles["profile-container"]}`}>
      {/* Profile Header */}
      <div className={styles["profile-header"]}>
        <div className={styles["profile-avatar-placeholder"]}>
          {/* Sử dụng icon giả định */}
          <i className={memberIconClass}></i>
        </div>
        <div className={styles["user-info"]}>
          <h2>{customerName}</h2>
          <span className={styles["member-badge"]}>{currentMemberName}</span>
          <p className="mt-2" style={{ height: "0.9rem" }}></p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles["profile-content"]}>
        {/* --- Sidebar Menu --- */}
        <div className={styles["sidebar"]}>
          <ul className={styles["sidebar-menu"]}>
            <li className={styles["sidebar-item"]}>
              <Link to="#" className={styles["sidebar-menu"]}>
                <i className="fas fa-user me-2"></i> Thông tin tài khoản
              </Link>
            </li>

            {menuItems.slice(1).map((item) => (
              <li key={item.key} className={styles["sidebar-item"]}>
                <Link
                  to="#"
                  onClick={() => handleMenuClick(item.key)}
                  className={`${
                    activeMenu === item.key ? styles["active"] : ""
                  } 
                              ${
                                item.isIndented
                                  ? styles["sidebar-sub-item"]
                                  : ""
                              }`}
                >
                  {/* HIỂN THỊ ICON NẾU CÓ */}
                  {item.icon && <i className={`${item.icon} me-2`}></i>}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Nội dung chính --- */}
        <div className={styles["content-area"]}>
          {/* Section 1: Ưu đãi và Thành tích */}
          <div className="row">
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2
                  style={{
                    color: "#043747",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    margin: 0,
                  }}
                >
                  Thành tích năm {today}
                </h2>
                {/* Thêm indicator loading cho thống kê */}
                {isLoading && (
                  <div className="text-muted">
                    <i className="fas fa-spinner fa-spin me-1"></i>
                    Đang tải thống kê...
                  </div>
                )}
              </div>

              {/* Box chứa thông tin Ưu đãi và Thành tích */}
              <div
                className={styles["achievement-section"]}
                style={{ gap: "20px", flexWrap: "nowrap" }}
              >
                {/* Cột 1: Số đơn hàng - HIỂN THỊ ĐỘNG */}
                <div
                  className={styles["achievement-card"]}
                  style={{ flexBasis: "50%", minWidth: "unset" }}
                >
                  <h3>
                    {isLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      achievement.soDonHang
                    )}{" "}
                    đơn hàng
                  </h3>
                  <p>
                    Tổng số đơn hàng
                    {!isLoading && achievement.soDonHang > 0 && (
                      <span className="text-muted ms-1">
                        (
                        {activeMenu === "donHangCuaToi" &&
                        donHangList.length > 0
                          ? `${getCompletedOrdersCount()} hoàn thành`
                          : ""}
                        )
                      </span>
                    )}
                  </p>
                </div>

                {/* Cột 2: Đã thanh toán - HIỂN THỊ ĐỘNG */}
                <div
                  className={styles["achievement-card"]}
                  style={{ flexBasis: "50%", minWidth: "unset" }}
                >
                  <h3>
                    {isLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      formatCurrency(achievement.daThanhToan)
                    )}
                  </h3>
                  <p>
                    Đã thanh toán
                    {!isLoading && achievement.daThanhToan > 0 && (
                      <span className="text-muted ms-1">
                        (Đơn hàng đã giao)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Thêm thống kê chi tiết nếu có dữ liệu */}
              {!isLoading &&
                achievement.soDonHang > 0 &&
                activeMenu === "donHangCuaToi" &&
                donHangList.length > 0 && (
                  <div className="mt-3">
                    <div
                      className="d-flex gap-3 text-muted"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {(() => {
                        const stats = getOrderStatusStats();
                        return (
                          <>
                            {stats.DANGXULY > 0 && (
                              <span>
                                <i className="fas fa-clock me-1 text-warning"></i>
                                {stats.DANGXULY} đang xử lý
                              </span>
                            )}
                            {stats.DAGIAO > 0 && (
                              <span>
                                <i className="fas fa-check-circle me-1 text-success"></i>
                                {stats.DAGIAO} đã giao
                              </span>
                            )}
                            {stats.DAHUY > 0 && (
                              <span>
                                <i className="fas fa-times-circle me-1 text-danger"></i>
                                {stats.DAHUY} đã hủy
                              </span>
                            )}
                            {stats.GIAOTHATBAI > 0 && (
                              <span>
                                <i className="fas fa-exclamation-triangle me-1 text-warning"></i>
                                {stats.GIAOTHATBAI} giao thất bại
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <p
            className="mt-3 text-end"
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              visibility: "hidden",
              height: "0.9rem",
            }}
          >
            Quản lí
          </p>

          <hr className="my-5" />

          {/* Nội dung hồ sơ cá nhân/địa chỉ/mật khẩu */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Profile;
