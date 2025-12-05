import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/staff/NVManager.module.css";

interface NhanVien {
  maNhanVien: string;
  hoTen: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
  vaiTro?: string; // THÊM
  trangThai?: string; // THÊM
}

type NVSortKey = "maNhanVien" | "hoTen" | "dienThoai" | "email";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const NVManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // sort
  const [sortKey, setSortKey] = useState<NVSortKey>("maNhanVien");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    axios
      .get("/api/nhanvien")
      .then((res) => {
        setList(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    try {
      await axios.delete(`/api/nhanvien/${ma}`);
      setList((prev) => prev.filter((p) => p.maNhanVien !== ma));
      alert("Xóa thành công");
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại");
    }
  };

  const handleSort = (key: NVSortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((nv) =>
    `${nv.hoTen} ${nv.dienThoai} ${nv.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = "";
    let bVal = "";

    switch (sortKey) {
      case "maNhanVien":
        aVal = a.maNhanVien || "";
        bVal = b.maNhanVien || "";
        break;
      case "hoTen":
        aVal = a.hoTen || "";
        bVal = b.hoTen || "";
        break;
      case "dienThoai":
        aVal = a.dienThoai || "";
        bVal = b.dienThoai || "";
        break;
      case "email":
        aVal = a.email || "";
        bVal = b.email || "";
        break;
    }

    const cmp = aVal.localeCompare(bVal, "vi", { sensitivity: "base" });
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const getTrangThaiClass = (trangThai?: string) => {
    switch (trangThai) {
      case "HOATDONG":
        return "bg-success";
      case "NGHI":
        return "bg-warning";
      case "KHOA":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getTrangThaiDisplay = (trangThai?: string) => {
    switch (trangThai) {
      case "HOATDONG":
        return "Hoạt động";
      case "NGHI":
        return "Nghỉ";
      case "KHOA":
        return "Khóa";
      default:
        return "—";
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Hiển thị cứng 9 dòng mỗi trang

  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sorted.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className={styles["nv-manager"]}>
      <h2>Quản lý nhân viên</h2>
      <div className={styles["nv-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/nhanvien/add")}
        >
          + Thêm nhân viên
        </button>

        <div className={styles["search-box"]}>
          <input
            type="text"
            placeholder="Tìm theo tên / điện thoại / email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>⏳ Đang tải...</div>
      ) : (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("maNhanVien")}
                >
                  Mã{" "}
                  {sortKey === "maNhanVien"
                    ? sortIcon(sortOrder)
                    : sortIcon(null)}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("hoTen")}
                >
                  Họ tên{" "}
                  {sortKey === "hoTen" ? sortIcon(sortOrder) : sortIcon(null)}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("dienThoai")}
                >
                  Điện thoại{" "}
                  {sortKey === "dienThoai"
                    ? sortIcon(sortOrder)
                    : sortIcon(null)}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("email")}
                >
                  Email{" "}
                  {sortKey === "email" ? sortIcon(sortOrder) : sortIcon(null)}
                </th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((nv) => (
                <tr key={nv.maNhanVien}>
                  <td>{nv.maNhanVien}</td>
                  <td>{nv.hoTen}</td>
                  <td>{nv.dienThoai}</td>
                  <td>{nv.email}</td>
                  <td>
                    <span
                      className={`badge ${getTrangThaiClass(nv.trangThai)}`}
                      title={nv.trangThai}
                    >
                      {getTrangThaiDisplay(nv.trangThai)}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info" // SỬA: Dùng class Bootstrap
                        onClick={() =>
                          navigate(`/admin/nhanvien/${nv.maNhanVien}`)
                        }
                        title="Xem chi tiết"
                      >
                        <i className="fa fa-eye" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary" // SỬA: Dùng class Bootstrap
                        onClick={() =>
                          navigate(`/admin/nhanvien/edit/${nv.maNhanVien}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <i className="fa fa-edit" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(nv.maNhanVien)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles["text-center"]}>
                    Không tìm thấy kết quả
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Phân trang */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang nhân viên">
              <ul className={styles["pagination"]}>
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo; Trước
                  </button>
                </li>
                {getPageNumbers().map((pageNum, index) => (
                  <li key={index}>
                    {pageNum === "..." ? (
                      <span>...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(pageNum as number)}
                        disabled={pageNum === currentPage}
                      >
                        {pageNum}
                      </button>
                    )}
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default NVManager;
