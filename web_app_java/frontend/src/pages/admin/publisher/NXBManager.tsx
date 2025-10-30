import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/publisher/NXBManager.module.css";

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

  // Thêm state cho trường tìm kiếm (mã NXB, tên NXB)
  const [query, setQuery] = useState("");

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

  // Lọc theo query (mã NXB hoặc tên NXB) trước khi sắp xếp
  const filteredList = nxbList.filter((nxb) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      nxb.maNhaXuatBan?.toLowerCase().includes(q) ||
      nxb.tenNhaXuatBan?.toLowerCase().includes(q)
    );
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
    <div className={styles["nxb-manager"]}>
      <h2>🏢 Quản Lý Nhà Xuất Bản</h2>

      {/* Header: nút Thêm (trái) và input tìm kiếm (phải) */}
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
            className={styles["add-btn"]}
            onClick={() => navigate("/admin/nxb/add")}
          >
            + Thêm nhà xuất bản
          </button>
        </div>

        <input
          type="text"
          placeholder="Tìm mã / tên NXB"
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

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table className={styles["nxb-table"]}>
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
                <th>Hành động</th>
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
                      className="btn btn-sm btn-outline-info me-2"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/nxb/edit/${nxb.maNhaXuatBan}`}
                      className="btn btn-sm btn-outline-secondary me-2"
                      title="Sửa"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
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
      {showDeleteModal && nxbToDelete && (
        <div className={styles["modal-overlay"]} onClick={handleCancelDelete}>
          <div
            className={styles["delete-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3>⚠️ Xác nhận xóa nhà xuất bản</h3>
            </div>

            <div className={styles["modal-content"]}>
              <p>Bạn có chắc chắn muốn xóa nhà xuất bản này không?</p>

              <div className={styles["nxb-info"]}>
                <div className={styles["nxb-details"]}>
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

export default NXBManager;
