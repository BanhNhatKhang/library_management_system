import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/publisher/NXBManager.css";

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
  diaChi: string;
}

type SortKey = keyof NhaXuatBan;
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const NXBManager = () => {
  const navigate = useNavigate();
  const [nxbList, setNxbList] = useState<NhaXuatBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("maNhaXuatBan");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // States cho modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nxbToDelete, setNxbToDelete] = useState<NhaXuatBan | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/nhaxuatban")
      .then((res) => setNxbList(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Hàm mở modal xác nhận xóa
  const handleDeleteClick = (nxb: NhaXuatBan) => {
    setNxbToDelete(nxb);
    setShowDeleteModal(true);
  };

  // Hàm xóa nhà xuất bản
  const handleConfirmDelete = async () => {
    if (!nxbToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`/api/nhaxuatban/${nxbToDelete.maNhaXuatBan}`);

      // Cập nhật danh sách sau khi xóa
      setNxbList((prev) =>
        prev.filter((nxb) => nxb.maNhaXuatBan !== nxbToDelete.maNhaXuatBan)
      );

      // Hiển thị thông báo thành công
      alert(
        `Nhà xuất bản "${nxbToDelete.tenNhaXuatBan}" đã được xóa thành công!`
      );

      // Đóng modal
      setShowDeleteModal(false);
      setNxbToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa nhà xuất bản:", error);
      alert("Có lỗi xảy ra khi xóa nhà xuất bản!");
    } finally {
      setDeleting(false);
    }
  };

  // Hàm hủy xóa
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNxbToDelete(null);
  };

  // Hàm sắp xếp
  const sortedList = [...nxbList].sort((a, b) => {
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
    <div className="nxb-manager">
      <h2>🏢 Quản Lý Nhà Xuất Bản</h2>
      <button className="add-btn" onClick={() => navigate("/admin/nxb/add")}>
        + Thêm nhà xuất bản
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className="nxb-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("maNhaXuatBan")}
                  style={{ cursor: "pointer" }}
                >
                  Mã NXB{" "}
                  <span>
                    {sortKey === "maNhaXuatBan"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("tenNhaXuatBan")}
                  style={{ cursor: "pointer" }}
                >
                  Tên NXB{" "}
                  <span>
                    {sortKey === "tenNhaXuatBan"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th
                  onClick={() => handleSort("diaChi")}
                  style={{ cursor: "pointer" }}
                >
                  Địa chỉ{" "}
                  <span>
                    {sortKey === "diaChi"
                      ? sortIcon(sortOrder)
                      : sortIcon(null)}
                  </span>
                </th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((nxb) => (
                <tr key={nxb.maNhaXuatBan}>
                  <td>{nxb.maNhaXuatBan}</td>
                  <td>{nxb.tenNhaXuatBan}</td>
                  <td>{nxb.diaChi}</td>
                  <td>
                    <Link
                      to={`/admin/nxb/${nxb.maNhaXuatBan}`}
                      title="Xem chi tiết"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/nxb/edit/${nxb.maNhaXuatBan}`}
                      className="edit-btn"
                      title="Sửa"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="delete-btn"
                      title="Xóa"
                      onClick={() => handleDeleteClick(nxb)}
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
      {showDeleteModal && nxbToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Xác nhận xóa nhà xuất bản</h3>
            </div>

            <div className="modal-content">
              <p>Bạn có chắc chắn muốn xóa nhà xuất bản này không?</p>

              <div className="nxb-info">
                <div className="nxb-details">
                  <h4>{nxbToDelete.tenNhaXuatBan}</h4>
                  <p>
                    <strong>Mã NXB:</strong> {nxbToDelete.maNhaXuatBan}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {nxbToDelete.diaChi}
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

export default NXBManager;
