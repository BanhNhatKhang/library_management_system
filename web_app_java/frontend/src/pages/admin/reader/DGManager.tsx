import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/readers/DGManager.module.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  trangThai?: string;
}

type DGSortKey = "maDocGia" | "hoTen" | "dienThoai" | "email";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const DGManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DocGia[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // sort states
  const [sortKey, setSortKey] = useState<DGSortKey>("maDocGia");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Hiển thị cứng 9 dòng mỗi trang

  useEffect(() => {
    axios
      .get("/api/docgia")
      .then((res) => {
        setList(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa độc giả này?")) return;
    try {
      await axios.delete(`/api/docgia/${ma}`);
      setList((prev) => prev.filter((p) => p.maDocGia !== ma));
      alert("Xóa thành công");
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại");
    }
  };

  const handleSort = (key: DGSortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((d) =>
    `${d.hoLot} ${d.ten} ${d.dienThoai} ${d.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string = "";
    let bVal: string = "";

    switch (sortKey) {
      case "maDocGia":
        aVal = a.maDocGia || "";
        bVal = b.maDocGia || "";
        break;
      case "hoTen":
        aVal = `${a.hoLot} ${a.ten}`.trim();
        bVal = `${b.hoLot} ${b.ten}`.trim();
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
    <div className={styles["dg-manager"]}>
      <h2>Quản lý độc giả</h2>
      <div className={styles["dg-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/docgia/add")}
        >
          + Thêm độc giả
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
                  onClick={() => handleSort("maDocGia")}
                >
                  Mã{" "}
                  {sortKey === "maDocGia"
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
              {currentItems.map((d) => (
                <tr key={d.maDocGia}>
                  <td>{d.maDocGia}</td>
                  <td>
                    {d.hoLot} {d.ten}
                  </td>
                  <td>{d.dienThoai}</td>
                  <td>{d.email}</td>
                  <td>{d.trangThai || "—"}</td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info" // SỬA: Dùng class Bootstrap
                        onClick={() => navigate(`/admin/docgia/${d.maDocGia}`)}
                        title="Xem chi tiết"
                      >
                        <i className="fa fa-eye" />
                      </button>
                      {/* Thay đổi nút 'Chỉnh sửa' */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary" // SỬA: Dùng class Bootstrap
                        onClick={() =>
                          navigate(`/admin/docgia/edit/${d.maDocGia}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <i className="fa fa-edit" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(d.maDocGia)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center">
                    Không tìm thấy kết quả
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <nav aria-label="Phân trang độc giả">
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

export default DGManager;
