import { useEffect, useState } from "react";
import axios from "../../../../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../../css/admins/category/TheLoaiManager.module.css";

interface TheLoai {
  maTheLoai: string;
  tenTheLoai: string;
}

type SortKey = keyof TheLoai;
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const TheLoaiManager = () => {
  const navigate = useNavigate();
  const [theLoaiList, setTheLoaiList] = useState<TheLoai[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("maTheLoai");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Thêm state cho trường tìm kiếm
  const [query, setQuery] = useState("");
  // Thêm state cho bộ lọc mã thể loại (ALL | FB | TL)
  const [prefixFilter, setPrefixFilter] = useState<"ALL" | "FB" | "TL">("ALL");

  // States cho modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [theLoaiToDelete, setTheLoaiToDelete] = useState<TheLoai | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/theloai")
      .then((res) => setTheLoaiList(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Hàm mở modal xác nhận xóa
  const handleDeleteClick = (theLoai: TheLoai) => {
    setTheLoaiToDelete(theLoai);
    setShowDeleteModal(true);
  };

  // Hàm xóa thể loại
  const handleConfirmDelete = async () => {
    if (!theLoaiToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`/api/theloai/${theLoaiToDelete.maTheLoai}`);

      // Cập nhật danh sách sau khi xóa
      setTheLoaiList((prev) =>
        prev.filter((tl) => tl.maTheLoai !== theLoaiToDelete.maTheLoai)
      );

      // Hiển thị thông báo thành công
      alert(`Thể loại "${theLoaiToDelete.tenTheLoai}" đã được xóa thành công!`);

      // Đóng modal
      setShowDeleteModal(false);
      setTheLoaiToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa thể loại:", error);
      alert("Có lỗi xảy ra khi xóa thể loại!");
    } finally {
      setDeleting(false);
    }
  };

  // Hàm hủy xóa
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTheLoaiToDelete(null);
  };

  // Lọc theo query và bộ lọc prefix trước khi sắp xếp
  const filteredList = theLoaiList.filter((tl) => {
    const q = query.trim().toLowerCase();
    // prefix filter: ALL | FB | TL
    const prefixOk =
      prefixFilter === "ALL" ||
      (tl.maTheLoai || "").toUpperCase().startsWith(prefixFilter);

    if (!q) return prefixOk;

    const matchQuery =
      tl.maTheLoai?.toLowerCase().includes(q) ||
      tl.tenTheLoai?.toLowerCase().includes(q);

    return prefixOk && matchQuery;
  });

  // Hàm sắp xếp (dùng filteredList)
  const sortedList = [...filteredList].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue, "vi", { sensitivity: "base" })
        : bValue.localeCompare(aValue, "vi", { sensitivity: "base" });
    }

    return 0;
  });

  // Phân trang
  const rowsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(sortedList.length / rowsPerPage));
  const paginatedList = sortedList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Xử lý khi click icon sắp xếp
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className={styles["theloai-manager"]}>
      <h2>🏷️ Quản Lý Thể Loại</h2>

      {/* Hàng chứa nút Thêm (trái) và trường tìm kiếm + bộ lọc (phải) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className={styles["add-btn"]}
            onClick={() => navigate("/admin/theloai/add")}
          >
            + Thêm thể loại
          </button>
        </div>

        {/* container cho bộ lọc prefix và input tìm kiếm */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={prefixFilter}
            onChange={(e) =>
              setPrefixFilter(e.target.value as "ALL" | "FB" | "TL")
            }
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
            title="Lọc mã thể loại"
          >
            <option value="ALL">Tất cả</option>
            <option value="FB">FB</option>
            <option value="TL">TL</option>
          </select>

          <input
            type="text"
            placeholder="Tìm mã / tên thể loại"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              minWidth: 260,
            }}
          />
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className={styles["theloai-table"]}>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("maTheLoai")}
                  style={{ cursor: "pointer" }}
                >
                  Mã thể loại{" "}
                  <span>
                    {sortKey === "maTheLoai"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("tenTheLoai")}
                  style={{ cursor: "pointer" }}
                >
                  Tên thể loại{" "}
                  <span>
                    {sortKey === "tenTheLoai"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((theLoai) => (
                <tr key={theLoai.maTheLoai}>
                  <td>{theLoai.maTheLoai}</td>
                  <td>{theLoai.tenTheLoai}</td>
                  <td>
                    <Link
                      to={`/admin/theloai/${theLoai.maTheLoai}`}
                      title="Xem chi tiết"
                      className="btn btn-sm btn-outline-info me-2"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/theloai/edit/${theLoai.maTheLoai}`}
                      className="btn btn-sm btn-outline-secondary me-2"
                      title="Sửa"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Xóa"
                      onClick={() => handleDeleteClick(theLoai)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className={styles["pagination"]}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteModal && theLoaiToDelete && (
        <div className={styles["modal-overlay"]} onClick={handleCancelDelete}>
          <div
            className={styles["delete-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3>⚠️ Xác nhận xóa thể loại</h3>
            </div>

            <div className={styles["modal-content"]}>
              <p>Bạn có chắc chắn muốn xóa thể loại này không?</p>

              <div className={styles["theloai-info"]}>
                <div className={styles["theloai-details"]}>
                  <h4>{theLoaiToDelete.tenTheLoai}</h4>
                  <p>
                    <strong>Mã thể loại:</strong> {theLoaiToDelete.maTheLoai}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles["modal-actions"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Không
              </button>
              <button
                className={styles["confirm-btn"]}
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "Có"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheLoaiManager;
