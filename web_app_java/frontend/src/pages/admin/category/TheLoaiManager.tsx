import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/admins/category/TheLoaiManager.css";

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

  // Hàm sắp xếp
  const sortedList = [...theLoaiList].sort((a, b) => {
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
  const rowsPerPage = 10;
  const totalPages = Math.ceil(sortedList.length / rowsPerPage);
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
    <div className="theloai-manager">
      <h2>🏷️ Quản Lý Thể Loại</h2>
      <button
        className="add-btn"
        onClick={() => navigate("/admin/theloai/add")}
      >
        + Thêm thể loại
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className="theloai-table">
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
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/theloai/edit/${theLoai.maTheLoai}`}
                      className="edit-btn"
                      title="Sửa"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="delete-btn"
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
            <div className="pagination">
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
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Xác nhận xóa thể loại</h3>
            </div>

            <div className="modal-content">
              <p>Bạn có chắc chắn muốn xóa thể loại này không?</p>

              <div className="theloai-info">
                <div className="theloai-details">
                  <h4>{theLoaiToDelete.tenTheLoai}</h4>
                  <p>
                    <strong>Mã thể loại:</strong> {theLoaiToDelete.maTheLoai}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Không
              </button>
              <button
                className="confirm-btn"
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
