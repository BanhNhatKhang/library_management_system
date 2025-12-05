import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/publisher/NXBManager.module.css";

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
  diaChi: string;
  trangThai?: "MOKHOA" | "DAKHOA";
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

  // States cho modal xác nhận khóa/mở khóa
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [nxbToToggle, setNxbToToggle] = useState<NhaXuatBan | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    axios
      .get("/api/nhaxuatban")
      .then((res) => setNxbList(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Mở modal xác nhận khóa/mở khóa
  const handleToggleClick = (nxb: NhaXuatBan) => {
    setNxbToToggle(nxb);
    setShowToggleModal(true);
  };

  // Thực hiện khóa hoặc mở khóa
  const handleConfirmToggle = async () => {
    if (!nxbToToggle) return;

    setToggling(true);
    try {
      const isCurrentlyOpen = nxbToToggle.trangThai === "MOKHOA";

      if (isCurrentlyOpen) {
        // gọi PATCH lock
        await axios.patch(`/api/nhaxuatban/${nxbToToggle.maNhaXuatBan}/lock`);

        setNxbList((prev) =>
          prev.map((n) =>
            n.maNhaXuatBan === nxbToToggle.maNhaXuatBan
              ? { ...n, trangThai: "DAKHOA" }
              : n
          )
        );

        alert(`Nhà xuất bản "${nxbToToggle.tenNhaXuatBan}" đã được khóa.`);
      } else {
        // gọi PATCH unlock
        await axios.patch(`/api/nhaxuatban/${nxbToToggle.maNhaXuatBan}/unlock`);

        setNxbList((prev) =>
          prev.map((n) =>
            n.maNhaXuatBan === nxbToToggle.maNhaXuatBan
              ? { ...n, trangThai: "MOKHOA" }
              : n
          )
        );

        alert(`Nhà xuất bản "${nxbToToggle.tenNhaXuatBan}" đã được mở khóa.`);
      }

      setShowToggleModal(false);
      setNxbToToggle(null);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái nhà xuất bản:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái nhà xuất bản!");
    } finally {
      setToggling(false);
    }
  };

  // Hủy modal
  const handleCancelToggle = () => {
    setShowToggleModal(false);
    setNxbToToggle(null);
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
  const getFieldString = (obj: NhaXuatBan, key: SortKey): string => {
    const val = obj[key];
    if (typeof val === "string") return val;
    return val == null ? "" : String(val);
  };

  // Hàm sắp xếp (dùng filteredList)
  const sortedList = [...filteredList].sort((a, b) => {
    const aValue = getFieldString(a, sortKey);
    const bValue = getFieldString(b, sortKey);

    return sortOrder === "asc"
      ? aValue.localeCompare(bValue, "vi", { sensitivity: "base" })
      : bValue.localeCompare(aValue, "vi", { sensitivity: "base" });
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
            <i className="fa-solid fa-file-circle-plus"></i>
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
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info" // SỬA: Dùng class Bootstrap
                        onClick={() =>
                          navigate(`/admin/nxb/${nxb.maNhaXuatBan}`)
                        }
                        title="Xem chi tiết"
                      >
                        <i className="fa fa-eye" />
                      </button>
                      {/* Thay đổi nút 'Chỉnh sửa' */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary" // SỬA: Dùng class Bootstrap
                        onClick={() =>
                          navigate(`/admin/nxb/edit/${nxb.maNhaXuatBan}`)
                        }
                        title="Chỉnh sửa"
                      >
                        <i className="fa fa-edit" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title={
                          nxb.trangThai === "DAKHOA"
                            ? "Mở khóa"
                            : "Khóa nhà xuất bản"
                        }
                        onClick={() => handleToggleClick(nxb)}
                      >
                        <i
                          className={
                            nxb.trangThai === "MOKHOA"
                              ? "fas fa-unlock" // theo yêu cầu: unlock nếu MOKHOA
                              : "fas fa-lock" // lock nếu DAKHOA
                          }
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <nav aria-label="Phân trang nhà xuất bản">
              <ul className={styles["pagination"]}>
                <li>
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo; Trước
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <li key={pageNum}>
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={pageNum === currentPage}
                      >
                        {pageNum}
                      </button>
                    </li>
                  )
                )}
                <li>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
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

      {/* Modal xác nhận khóa/mở khóa */}
      {showToggleModal && nxbToToggle && (
        <div className={styles["modal-overlay"]} onClick={handleCancelToggle}>
          <div
            className={styles["delete-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3>
                {nxbToToggle.trangThai === "MOKHOA"
                  ? "⚠️ Xác nhận khóa nhà xuất bản"
                  : "🔓 Xác nhận mở khóa nhà xuất bản"}
              </h3>
            </div>

            <div className={styles["modal-content"]}>
              <p>
                {nxbToToggle.trangThai === "MOKHOA"
                  ? "Bạn có chắc chắn muốn khóa nhà xuất bản này không?"
                  : "Bạn có chắc chắn muốn mở khóa nhà xuất bản này không?"}
              </p>

              <div className={styles["nxb-info"]}>
                <div className={styles["nxb-details"]}>
                  <h4>{nxbToToggle.tenNhaXuatBan}</h4>
                  <p>
                    <strong>Mã NXB:</strong> {nxbToToggle.maNhaXuatBan}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {nxbToToggle.diaChi}
                  </p>
                  <p>
                    <strong>Trạng thái hiện tại:</strong>{" "}
                    {nxbToToggle.trangThai === "MOKHOA" ? "Mở" : "Đã khóa"}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles["modal-actions"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={handleCancelToggle}
                disabled={toggling}
              >
                Hủy
              </button>
              <button
                className={styles["confirm-btn"]}
                onClick={handleConfirmToggle}
                disabled={toggling}
              >
                {toggling
                  ? nxbToToggle.trangThai === "MOKHOA"
                    ? "Đang khóa..."
                    : "Đang mở khóa..."
                  : nxbToToggle.trangThai === "MOKHOA"
                  ? "Khóa"
                  : "Mở khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NXBManager;
