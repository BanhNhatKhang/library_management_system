import { useEffect, useState } from "react";
import axios from "../../../axiosConfig";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "../../css/admins/Dashboard.css";

const Dashboard = () => {
  // Mock data
  const [stats, setStats] = useState({
    sach: 0,
    theloai: 0,
    nxb: 0,
    docgia: 0,
    nhanvien: 0,
    uudai: 0,
    donhang: 0,
    thongbao: 0,
  });

  const bookByCategory = [
    { name: "Văn học", value: 40 },
    { name: "Kinh tế", value: 25 },
    { name: "Thiếu nhi", value: 20 },
    { name: "Khác", value: 35 },
  ];

  const borrowByMonth = [
    { month: "Jan", muon: 30 },
    { month: "Feb", muon: 45 },
    { month: "Mar", muon: 60 },
    { month: "Apr", muon: 50 },
    { month: "May", muon: 70 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    Promise.all([
      axios.get("/api/sach"),
      axios.get("/api/docgia"),
      axios.get("/api/nhanvien"),
      axios.get("/api/nhaxuatban"),
      axios.get("/api/theloai"),
      axios.get("/api/uudai"),
      axios.get("/api/donhang"),
      axios.get("/api/thongbao"),
    ])
      .then(
        ([
          sachRes,
          docGiaRes,
          nhanVienRes,
          nxbRes,
          theLoaiRes,
          uuDaiRes,
          donHangRes,
          thongBaoRes,
        ]) => {
          setStats((prev) => ({
            ...prev,
            sach: Array.isArray(sachRes.data) ? sachRes.data.length : 0,
            docgia: Array.isArray(docGiaRes.data) ? docGiaRes.data.length : 0,
            nhanvien: Array.isArray(nhanVienRes.data)
              ? nhanVienRes.data.length
              : 0,
            nxb: Array.isArray(nxbRes.data) ? nxbRes.data.length : 0,
            theloai: Array.isArray(theLoaiRes.data)
              ? theLoaiRes.data.length
              : 0,
            uudai: Array.isArray(uuDaiRes.data) ? uuDaiRes.data.length : 0,
            donhang: Array.isArray(donHangRes.data)
              ? donHangRes.data.length
              : 0,
            thongbao: Array.isArray(thongBaoRes.data)
              ? thongBaoRes.data.length
              : 0,
          }));
        }
      )
      .catch(() => {
        setStats((prev) => ({
          ...prev,
          sach: 0,
          docgia: 0,
          nhanvien: 0,
          nxb: 0,
          theloai: 0,
          uudai: 0,
          donhang: 0,
          thongbao: 0,
        }));
      });
  }, []);

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>

      {/* Thống kê nhanh */}
      <div className="stats-grid">
        {/* Dòng 1 */}
        <div className="stats-row">
          <div className="stat-card">
            <i className="fas fa-book"></i>
            <h3>{stats.sach}</h3>
            <p>Sách</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-tags"></i>
            <h3>{stats.theloai}</h3>
            <p>Thể loại</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-building"></i>
            <h3>{stats.nxb}</h3>
            <p>NXB</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <h3>{stats.docgia}</h3>
            <p>Độc giả</p>
          </div>
        </div>
        {/* Dòng 2 */}
        <div className="stats-row">
          <div className="stat-card">
            <i className="fas fa-user-tie"></i>
            <h3>{stats.nhanvien}</h3>
            <p>Nhân viên</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-gift"></i>
            <h3>{stats.uudai}</h3>
            <p>Ưu đãi</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-shopping-cart"></i>
            <h3>{stats.donhang}</h3>
            <p>Đơn hàng</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-bell"></i>
            <h3>{stats.thongbao}</h3>
            <p>Thông báo</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📚 Phân bố sách theo thể loại</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bookByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {bookByCategory.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>📅 Số lượt mượn theo tháng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={borrowByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="muon" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hoạt động gần đây */}
      <div className="recent-activity">
        <h3>🕒 Hoạt động gần đây</h3>
        <ul>
          <li>
            Độc giả <b>Nguyễn Văn A</b> vừa đăng ký tài khoản.
          </li>
          <li>
            Đơn hàng <b>#DH0123</b> vừa được tạo.
          </li>
          <li>
            Sách <b>"Lập trình Java"</b> vừa được thêm mới.
          </li>
          <li>
            Ưu đãi <b>"Giảm 20%"</b> vừa được áp dụng.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
