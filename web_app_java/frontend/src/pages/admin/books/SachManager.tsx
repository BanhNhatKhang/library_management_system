import { useEffect, useState } from "react";
import axios from "../../../../axiosConfig";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/admins/books/SachManager.module.css";

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  anhBia: string;
  soLuong: number;
  donGia: number;
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
  // Pagination states (thay thế phần phân trang cũ bằng logic của TBManager)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Hiển thị 9 dòng mỗi trang

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

      setSachList((prev) =>
        prev.filter((sach) => sach.maSach !== sachToDelete.maSach)
      );
      alert(`Sách "${sachToDelete.tenSach}" đã được xóa thành công!`);
      setShowDeleteModal(false);
      setSachToDelete(null);
    } catch (error: unknown) {
      let msg = "Có lỗi xảy ra khi xóa sách!";
      if (axios.isAxiosError(error) && error.response) {
        msg = error.response.data as string;
      } else if (error instanceof Error) {
        msg = error.message;
      } else {
        msg = String(error);
      }
      alert(msg);
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

  const totalItems = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = sortedList.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
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

      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

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
                <th
                  onClick={() => handleSort("donGia")}
                  style={{ cursor: "pointer" }}
                >
                  Đơn giá{" "}
                  <span>
                    {sortKey === "donGia"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
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
                    {/* Hiển thị đơn giá, ví dụ: */}
                    {sach.donGia?.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }) || "Chưa có"}
                  </td>
                  <td>{sach.tacGia}</td>
                  <td>{sach.theLoais?.join(", ")}</td>
                  <td>{sach.soLuong}</td>
                  <td>
                    <div className="btn-group">
                      {/* Thay đổi nút 'Xem chi tiết' */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info" // SỬA: Dùng class Bootstrap
                        onClick={() => navigate(`/admin/sach/${sach.maSach}`)}
                        title="Xem chi tiết"
                      >
                        <i className="fa fa-eye" />
                      </button>

                      {/* Thay đổi nút 'Chỉnh sửa' */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary" // SỬA: Dùng class Bootstrap
                        onClick={() =>
                          navigate(`/admin/sach/edit/${sach.maSach}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <i className="fa fa-edit" />
                      </button>

                      {/* Thay đổi nút 'Xóa' */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger" // SỬA: Dùng class Bootstrap
                        title="Xóa"
                        onClick={() => handleDeleteClick(sach)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination (thay thế bằng pagination của TBManager) */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang sách">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo; Trước
                  </button>
                </li>

                {getPageNumbers().map((pageNum, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      pageNum === currentPage ? "active" : ""
                    } ${pageNum === "..." ? "disabled" : ""}`}
                  >
                    {pageNum === "..." ? (
                      <span className="page-link">...</span>
                    ) : (
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pageNum as number)}
                      >
                        {pageNum}
                      </button>
                    )}
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
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

            {/* -> moved confirmation line here (full width, centered) */}
            <div className={styles["modal-confirm"]}>
              <p>Bạn có chắc chắn muốn xóa sách này không?</p>
            </div>

            <div className={styles["modal-content"]}>
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
