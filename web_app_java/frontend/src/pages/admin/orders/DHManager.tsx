import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/orders/DHManager.module.css";

interface DonHang {
  maDonHang: string;
  maDocGia: string;
  ngayDat: string;
  tongTien: number;
  trangThai: "DANGXULY" | "DAGIAO" | "DAHUY" | "GIAOTHATBAI"; // SỬA: match với enum backend
}

type DHSortKey = "maDonHang" | "maDocGia" | "ngayDat";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

// Thêm helper functions để hiển thị trạng thái
const getStatusText = (status: string) => {
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
      return status || "—";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "DANGXULY":
      return "badge bg-warning text-dark";
    case "DAGIAO":
      return "badge bg-success";
    case "DAHUY":
      return "badge bg-danger";
    case "GIAOTHATBAI":
      return "badge bg-warning";
    default:
      return "badge bg-secondary";
  }
};

const DHManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // sort
  const [sortKey, setSortKey] = useState<DHSortKey>("maDonHang");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    axios
      .get("/api/donhang")
      .then((res) => {
        console.log("Donhang response:", res.data); // Debug log
        setList(res.data || []);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 403) {
          alert(
            "Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin."
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    try {
      await axios.delete(`/api/donhang/${ma}`);
      setList((prev) => prev.filter((p) => p.maDonHang !== ma));
      alert("Xóa thành công");
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  const handleSort = (key: DHSortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((d) =>
    `${d.maDonHang} ${d.maDocGia} ${getStatusText(d.trangThai)}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "ngayDat") {
      const da = a.ngayDat ? new Date(a.ngayDat).getTime() : 0;
      const db = b.ngayDat ? new Date(b.ngayDat).getTime() : 0;
      cmp = da - db;
    } else if (sortKey === "maDonHang") {
      cmp = a.maDonHang.localeCompare(b.maDonHang, "vi", {
        sensitivity: "base",
      });
    } else if (sortKey === "maDocGia") {
      cmp = a.maDocGia.localeCompare(b.maDocGia, "vi", { sensitivity: "base" });
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  return (
    <div className={styles["dh-manager"]}>
      <h2>Quản lý đơn hàng</h2>
      <div className={styles["dh-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/donhang/add")}
        >
          + Thêm đơn hàng
        </button>

        <div className={styles["search-box"]}>
          <input
            type="text"
            placeholder="Tìm theo mã / độc giả / trạng thái"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>⏳ Đang tải...</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("maDonHang")}
              >
                Mã đơn{" "}
                {sortKey === "maDonHang" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("maDocGia")}
              >
                Mã độc giả{" "}
                {sortKey === "maDocGia" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("ngayDat")}
              >
                Ngày đặt{" "}
                {sortKey === "ngayDat" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.maDonHang}>
                <td>{d.maDonHang}</td>
                <td>{d.maDocGia}</td>
                <td>{new Date(d.ngayDat).toLocaleDateString("vi-VN")}</td>
                <td>{d.tongTien.toLocaleString("vi-VN")}₫</td>
                <td>
                  <span className={getStatusClass(d.trangThai)}>
                    {getStatusText(d.trangThai)}
                  </span>
                </td>
                <td className="text-end">
                  <Link
                    to={`/admin/donhang/${d.maDonHang}`}
                    className="btn btn-sm btn-outline-info me-2"
                  >
                    <i className="fa fa-eye" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() =>
                      navigate(`/admin/donhang/edit/${d.maDonHang}`)
                    }
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.maDonHang)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  Không tìm thấy kết quả
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DHManager;
