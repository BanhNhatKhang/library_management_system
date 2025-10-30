import { useEffect, useState } from "react";
import axios from "../../../../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../../css/admins/books/SachManager.module.css";

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  anhBia: string;
  soLuong: number;
  theLoais: string[];
  nhaXuatBan?: string;
}

type SortKey = keyof Sach | "theLoais";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const SachManager = () => {
  const navigate = useNavigate();
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("maSach");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Trường tìm kiếm
  const [query, setQuery] = useState("");

  // States cho modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sachToDelete, setSachToDelete] = useState<Sach | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/sach")
      .then((res) => setSachList(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Hàm mở modal xác nhận xóa
  const handleDeleteClick = (sach: Sach) => {
    setSachToDelete(sach);
    setShowDeleteModal(true);
  };

  // Hàm xóa sách
  const handleConfirmDelete = async () => {
    if (!sachToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`/api/sach/${sachToDelete.maSach}`);

      // Cập nhật danh sách sau khi xóa
      setSachList((prev) =>
        prev.filter((sach) => sach.maSach !== sachToDelete.maSach)
      );

      // Hiển thị thông báo thành công
      alert(`Sách "${sachToDelete.tenSach}" đã được xóa thành công!`);

      // Đóng modal
      setShowDeleteModal(false);
      setSachToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa sách:", error);
      alert("Có lỗi xảy ra khi xóa sách!");
    } finally {
      setDeleting(false);
    }
  };

  // Hàm hủy xóa
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSachToDelete(null);
  };

  // Lọc theo query trước khi sắp xếp
  const filteredList = sachList.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.maSach?.toLowerCase().includes(q) ||
      s.tenSach?.toLowerCase().includes(q) ||
      s.tacGia?.toLowerCase().includes(q) ||
      (s.nhaXuatBan || "").toLowerCase().includes(q)
    );
  });

  // Hàm sắp xếp
  const sortedList = [...filteredList].sort((a, b) => {
    let aValue: string | number = a[sortKey as keyof Sach] as string | number;
    let bValue: string | number = b[sortKey as keyof Sach] as string | number;

    // Đặc biệt cho trường theLoais (mảng)
    if (sortKey === "theLoais") {
      aValue = a.theLoais?.join(", ") || "";
      bValue = b.theLoais?.join(", ") || "";
    }

    // So sánh số
    if (["soLuong"].includes(sortKey)) {
      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }

    // So sánh chuỗi (không phân biệt hoa thường)
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue, "vi", { sensitivity: "base" })
        : bValue.localeCompare(aValue, "vi", { sensitivity: "base" });
    }

    return 0;
  });

  // Phân trang
  const rowsPerPage = 4;
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
    <div className={styles["sach-manager"]}>
      {/* Header với button và search trên cùng 1 hàng */}
      <h2>📚 Quản Lý Sách</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            title="Thêm sách"
            className={styles["add-btn"]}
            onClick={() => navigate("/admin/sach/add")}
          >
            <i className="fa-solid fa-file-circle-plus"></i>
          </button>
        </div>

        <input
          type="text"
          placeholder="Tìm mã / tên / tác giả / NXB"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1); // về trang 1 khi tìm
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
            minWidth: 260,
          }}
        />
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className={styles["sach-table"]}>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("maSach")}
                  style={{ cursor: "pointer" }}
                >
                  Mã sách{" "}
                  <span>
                    {sortKey === "maSach"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("tenSach")}
                  style={{ cursor: "pointer" }}
                >
                  Tên sách{" "}
                  <span>
                    {sortKey === "tenSach"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th>Bìa</th>
                <th
                  onClick={() => handleSort("tacGia")}
                  style={{ cursor: "pointer" }}
                >
                  Tác giả{" "}
                  <span>
                    {sortKey === "tacGia"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("theLoais")}
                  style={{ cursor: "pointer" }}
                >
                  Thể loại{" "}
                  <span>
                    {sortKey === "theLoais"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("soLuong")}
                  style={{ cursor: "pointer" }}
                >
                  Số lượng{" "}
                  <span>
                    {sortKey === "soLuong"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((sach) => (
                <tr key={sach.maSach}>
                  <td>{sach.maSach}</td>
                  <td>{sach.tenSach}</td>
                  <td>
                    <img
                      src={
                        sach.anhBia
                          ? (() => {
                              const pathParts = sach.anhBia.split("/");
                              const folder = pathParts[0];
                              const filename = pathParts[1];
                              return `http://localhost:8080/api/sach/image/${folder}/${filename}`;
                            })()
                          : "/images/no-image.png"
                      }
                      alt={sach.tenSach}
                    />
                  </td>
                  <td>{sach.tacGia}</td>
                  <td>{sach.theLoais?.join(", ")}</td>
                  <td>{sach.soLuong}</td>
                  <td>
                    <Link
                      to={`/admin/sach/${sach.maSach}`}
                      title="Xem chi tiết"
                      className="btn btn-sm btn-outline-info me-2"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/sach/edit/${sach.maSach}`}
                      className="btn btn-sm btn-outline-secondary me-2"
                      title="Sửa"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Xóa"
                      onClick={() => handleDeleteClick(sach)}
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
      {showDeleteModal && sachToDelete && (
        <div className={styles["modal-overlay"]} onClick={handleCancelDelete}>
          <div
            className={styles["delete-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3>⚠️ Xác nhận xóa sách</h3>
            </div>

            <div className={styles["modal-content"]}>
              <p>Bạn có chắc chắn muốn xóa sách này không?</p>

              <div className={styles["book-info"]}>
                <div className={styles["book-image"]}>
                  <img
                    src={
                      sachToDelete.anhBia
                        ? (() => {
                            const pathParts = sachToDelete.anhBia.split("/");
                            const folder = pathParts[0];
                            const filename = pathParts[1];
                            return `http://localhost:8080/api/sach/image/${folder}/${filename}`;
                          })()
                        : "/images/no-image.png"
                    }
                    alt={sachToDelete.tenSach}
                  />
                </div>
                <div className={styles["book-details"]}>
                  <h4>{sachToDelete.tenSach}</h4>
                  <p>
                    <strong>Mã sách:</strong> {sachToDelete.maSach}
                  </p>
                  <p>
                    <strong>Tác giả:</strong> {sachToDelete.tacGia}
                  </p>
                  <p>
                    <strong>Thể loại:</strong>{" "}
                    {sachToDelete.theLoais?.join(", ")}
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

export default SachManager;
