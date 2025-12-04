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
import styles from "../../css/admins/Dashboard.module.css";

interface Stats {
  sach: number;
  theloai: number;
  nxb: number;
  docgia: number;
  nhanvien: number;
  uudai: number;
  donhang: number;
  thongbao: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface BorrowData {
  month: string;
  muon: number;
}

interface Activity {
  type: string;
  message: string;
  time: string;
}

// THÊM: Type cho tab
type TabType = "stats" | "activities";

const Dashboard = () => {
  // THÊM: State cho tab hiện tại
  const [activeTab, setActiveTab] = useState<TabType>("stats");

  const [stats, setStats] = useState<Stats>({
    sach: 0,
    theloai: 0,
    nxb: 0,
    docgia: 0,
    nhanvien: 0,
    uudai: 0,
    donhang: 0,
    thongbao: 0,
  });

  const [bookByCategory, setBookByCategory] = useState<ChartData[]>([]);
  const [borrowByMonth, setBorrowByMonth] = useState<BorrowData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<ChartData[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, categoryRes, borrowRes, statusRes, activitiesRes] =
          await Promise.all([
            axios.get("/api/dashboard/stats"),
            axios.get("/api/dashboard/books-by-category"),
            axios.get("/api/dashboard/borrow-by-month"),
            axios.get("/api/dashboard/orders-by-status"),
            axios.get("/api/dashboard/recent-activities"),
          ]);

        setStats(statsRes.data);
        setBookByCategory(categoryRes.data);
        setBorrowByMonth(borrowRes.data);
        setOrdersByStatus(statusRes.data);
        setRecentActivities(activitiesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback data nếu có lỗi
        setStats({
          sach: 0,
          theloai: 0,
          nxb: 0,
          docgia: 0,
          nhanvien: 0,
          uudai: 0,
          donhang: 0,
          thongbao: 0,
        });
        setBookByCategory([]);
        setBorrowByMonth([]);
        setOrdersByStatus([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // THÊM: Format date cho activities
  const formatActivityTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return (
      date.toLocaleDateString("vi-VN") +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  if (loading) {
    return (
      <div className={styles["dashboard"]}>
        <h2>📊 Dashboard</h2>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div>⏳ Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // THÊM: Render tab navigation
  const renderTabNavigation = () => (
    <div className={styles["tab-navigation"]}>
      <button
        className={`${styles["tab-button"]} ${
          activeTab === "stats" ? styles["tab-active"] : ""
        }`}
        onClick={() => setActiveTab("stats")}
      >
        📊 Thống kê & Biểu đồ
      </button>
      <button
        className={`${styles["tab-button"]} ${
          activeTab === "activities" ? styles["tab-active"] : ""
        }`}
        onClick={() => setActiveTab("activities")}
      >
        🕒 Hoạt động gần đây
      </button>
    </div>
  );

  // THÊM: Render stats tab content
  const renderStatsTab = () => (
    <div className={styles["tab-content"]}>
      {/* Thống kê nhanh */}
      <div className={styles["stats-grid"]}>
        {/* Dòng 1 */}
        <div className={styles["stats-row"]}>
          <div className={styles["stat-card"]}>
            <i className="fas fa-book"></i>
            <h3>{stats.sach}</h3>
            <p>Sách</p>
          </div>
          <div className={styles["stat-card"]}>
            <i className="fas fa-tags"></i>
            <h3>{stats.theloai}</h3>
            <p>Thể loại</p>
          </div>
          <div className={styles["stat-card"]}>
            <i className="fas fa-building"></i>
            <h3>{stats.nxb}</h3>
            <p>NXB</p>
          </div>
          <div className={styles["stat-card"]}>
            <i className="fas fa-users"></i>
            <h3>{stats.docgia}</h3>
            <p>Độc giả</p>
          </div>
        </div>
        {/* Dòng 2 */}
        <div className={styles["stats-row"]}>
          <div className={styles["stat-card"]}>
            <i className="fas fa-user-tie"></i>
            <h3>{stats.nhanvien}</h3>
            <p>Nhân viên</p>
          </div>
          <div className={styles["stat-card"]}>
            <i className="fas fa-gift"></i>
            <h3>{stats.uudai}</h3>
            <p>Ưu đãi</p>
          </div>
          <div className={styles["stat-card"]}>
            <i className="fas fa-shopping-cart"></i>
            <h3>{stats.donhang}</h3>
            <p>Đơn hàng</p>
          </div>
          <div className={styles["stat-card"]}>
            <i className="fas fa-bell"></i>
            <h3>{stats.thongbao}</h3>
            <p>Thông báo</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className={styles["charts-grid"]}>
        {/* Phân bố sách theo thể loại */}
        <div className={styles["chart-card"]}>
          <h3>📚 Phân bố sách theo thể loại</h3>
          {bookByCategory.length > 0 ? (
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              Không có dữ liệu thể loại
            </div>
          )}
        </div>

        {/* Thống kê mượn sách theo tháng */}
        <div className={styles["chart-card"]}>
          <h3>📅 Số lượt mượn theo tháng</h3>
          {borrowByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={borrowByMonth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="muon" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              Không có dữ liệu mượn sách
            </div>
          )}
        </div>
      </div>

      {/* Biểu đồ đơn hàng theo trạng thái */}
      {ordersByStatus.length > 0 && (
        <div className={styles["orders-chart"]}>
          {" "}
          {/* SỬA: Bỏ inline style, dùng class riêng */}
          <h3>📦 Đơn hàng theo trạng thái</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ordersByStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {ordersByStatus.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // THÊM: Render activities tab content
  const renderActivitiesTab = () => (
    <div className={styles["tab-content"]}>
      <div className={styles["activities-container"]}>
        <div className={styles["activities-header"]}>
          <h3>🕒 Hoạt động gần đây trong hệ thống</h3>
          <p className={styles["activities-description"]}>
            Theo dõi các hoạt động mới nhất của người dùng và hệ thống
          </p>
        </div>

        {recentActivities.length > 0 ? (
          <div className={styles["activities-list"]}>
            {recentActivities.map((activity, index) => (
              <div key={index} className={styles["activity-item"]}>
                <div className={styles["activity-icon"]}>
                  <span
                    className={
                      activity.type === "ORDER"
                        ? styles["activity-order"]
                        : styles["activity-register"]
                    }
                  >
                    {activity.type === "ORDER" ? "📦" : "👤"}
                  </span>
                </div>
                <div className={styles["activity-content"]}>
                  <div className={styles["activity-message"]}>
                    {activity.message}
                  </div>
                  <div className={styles["activity-time"]}>
                    {formatActivityTime(activity.time)}
                  </div>
                </div>
                <div className={styles["activity-badge"]}>
                  <span
                    className={`${styles["badge"]} ${
                      activity.type === "ORDER"
                        ? styles["badge-order"]
                        : styles["badge-register"]
                    }`}
                  >
                    {activity.type === "ORDER" ? "Đơn hàng" : "Đăng ký"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles["no-activities"]}>
            <div className={styles["no-activities-icon"]}>😴</div>
            <h4>Chưa có hoạt động gần đây</h4>
            <p>
              Các hoạt động mới sẽ được hiển thị ở đây khi có người dùng tương
              tác với hệ thống.
            </p>
          </div>
        )}

        {/* THÊM: Thống kê nhanh về activities */}
        {recentActivities.length > 0 && (
          <div className={styles["activities-summary"]}>
            <h4>📈 Tóm tắt hoạt động</h4>
            <div className={styles["summary-grid"]}>
              <div className={styles["summary-item"]}>
                <span className={styles["summary-number"]}>
                  {recentActivities.filter((a) => a.type === "ORDER").length}
                </span>
                <span className={styles["summary-label"]}>Đơn hàng mới</span>
              </div>
              <div className={styles["summary-item"]}>
                <span className={styles["summary-number"]}>
                  {recentActivities.filter((a) => a.type === "REGISTER").length}
                </span>
                <span className={styles["summary-label"]}>Đăng ký mới</span>
              </div>
              <div className={styles["summary-item"]}>
                <span className={styles["summary-number"]}>
                  {recentActivities.length}
                </span>
                <span className={styles["summary-label"]}>Tổng hoạt động</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles["dashboard"]}>
      <div className={styles["dashboard-header"]}>
        <h2>📊 Dashboard</h2>
        <p className={styles["dashboard-subtitle"]}>
          Tổng quan hoạt động và thống kê hệ thống thư viện
        </p>
      </div>

      {/* THÊM: Tab Navigation */}
      {renderTabNavigation()}

      {/* THÊM: Tab Content */}
      <div className={styles["dashboard-content"]}>
        {activeTab === "stats" && renderStatsTab()}
        {activeTab === "activities" && renderActivitiesTab()}
      </div>
    </div>
  );
};

export default Dashboard;
