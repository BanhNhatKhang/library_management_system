import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/borrow/MuonManager.module.css";

// Tạo interface cho error thay vì dùng any
interface ApiError {
  response?: {
    data?: string;
    status?: number;
  };
  message?: string;
}

// Helper function to handle errors safely
const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as ApiError;
    if (err.response && err.response.data) {
      return String(err.response.data);
    }
    if (err.message) {
      return err.message;
    }
  }
  return "Đã xảy ra lỗi không xác định";
};

interface MuonRequest {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra?: string; // SỬA: Thêm ngayTra vào interface
  trangThaiMuon: string;
  docGia?: {
    maDocGia: string;
    ten: string;
    email: string;
    dienthoai: string;
  };
  sach?: {
    maSach: string;
    tenSach: string;
    tacGia: string;
    anhBia?: string;
  };
}

// thêm type cho sort key và hàm hiển thị icon
type MuonSortKey = "maDocGia" | "maSach" | "ngayMuon";
type SortOrder = "asc" | "desc";
const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const MuonManager: React.FC = () => {
  const navigate = useNavigate();
  const [MuonRequests, setMuonRequests] = useState<MuonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // sort states
  const [sortKey, setSortKey] = useState<MuonSortKey>("ngayMuon");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Bulk actions states
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // SỬA: Thêm state để track các phiếu đã xóa mềm
  const [softDeletedRequests, setSoftDeletedRequests] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchMuonRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/theodoimuonsach/admin/all");
        setMuonRequests(response.data);
      } catch (error) {
        console.error("Error fetching loan requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMuonRequests();
  }, []);

  const handleApprove = async (
    maDocGia: string,
    maSach: string,
    ngayMuon: string
  ) => {
    try {
      await axios.put(`/api/theodoimuonsach/admin/update-status`, {
        maDocGia,
        maSach,
        ngayMuon,
        trangThaiMuon: "DADUYET",
        maNhanVien: "NV001",
      });

      alert("Duyệt yêu cầu mượn thành công.");
      setMuonRequests(
        MuonRequests.map((r) =>
          r.maDocGia === maDocGia &&
          r.maSach === maSach &&
          r.ngayMuon === ngayMuon
            ? { ...r, trangThaiMuon: "DADUYET" }
            : r
        )
      );
    } catch (error) {
      console.error("Error approving loan request:", error);
      alert(`Không thể duyệt yêu cầu mượn: ${getErrorMessage(error)}`);
    }
  };

  const handleReject = async (
    maDocGia: string,
    maSach: string,
    ngayMuon: string
  ) => {
    try {
      await axios.put(`/api/theodoimuonsach/admin/update-status`, {
        maDocGia,
        maSach,
        ngayMuon,
        trangThaiMuon: "TUCHOI",
        maNhanVien: "NV001",
      });

      alert("Từ chối yêu cầu mượn thành công.");
      setMuonRequests(
        MuonRequests.map((r) =>
          r.maDocGia === maDocGia &&
          r.maSach === maSach &&
          r.ngayMuon === ngayMuon
            ? { ...r, trangThaiMuon: "TUCHOI" }
            : r
        )
      );
    } catch (error) {
      console.error("Error rejecting loan request:", error);
      alert(`Không thể từ chối yêu cầu mượn: ${getErrorMessage(error)}`);
    }
  };

  // Bulk Actions Functions
  // SỬA: Thêm debug để kiểm tra getRequestKey function
  const getRequestKey = (request: MuonRequest) => {
    // SỬA: Thay đổi format key để dễ split
    const key = `${request.maDocGia}|${request.maSach}|${request.ngayMuon}`;
    console.log(
      "Generated key for:",
      request.maDocGia,
      request.maSach,
      request.ngayMuon,
      "=> Key:",
      key
    );
    return key;
  };

  const handleSelectRequest = (requestKey: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(requestKey);
    } else {
      newSelected.delete(requestKey);
    }
    setSelectedRequests(newSelected);

    // Update selectAll state for current page
    const pendingRequestsCurrentPage = paginatedRequests.filter(
      (r) => r.trangThaiMuon === "CHODUYET"
    );
    setSelectAll(
      pendingRequestsCurrentPage.length > 0 &&
        pendingRequestsCurrentPage.every((r) =>
          newSelected.has(getRequestKey(r))
        )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    const pendingRequestsCurrentPage = paginatedRequests.filter(
      (r) => r.trangThaiMuon === "CHODUYET"
    );

    if (checked) {
      const newSelected = new Set(selectedRequests);
      pendingRequestsCurrentPage.forEach((r) =>
        newSelected.add(getRequestKey(r))
      );
      setSelectedRequests(newSelected);
    } else {
      const newSelected = new Set(selectedRequests);
      pendingRequestsCurrentPage.forEach((r) =>
        newSelected.delete(getRequestKey(r))
      );
      setSelectedRequests(newSelected);
    }
    setSelectAll(checked);
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.size === 0) {
      alert("Vui lòng chọn ít nhất một phiếu mượn để duyệt.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn duyệt ${selectedRequests.size} phiếu mượn đã chọn?`
    );

    if (!confirmed) return;

    setBulkActionLoading(true);
    const selectedList = Array.from(selectedRequests);
    const successList: string[] = [];
    const errorList: string[] = [];

    try {
      const batchSize = 5;
      for (let i = 0; i < selectedList.length; i += batchSize) {
        const batch = selectedList.slice(i, i + batchSize);
        const promises = batch.map(async (requestKey) => {
          // SỬA: Sử dụng separator |
          const [maDocGia, maSach, ngayMuon] = requestKey.split("|");

          console.log(`Processing: ${maDocGia}, ${maSach}, ${ngayMuon}`); // Debug log

          try {
            await axios.put(`/api/theodoimuonsach/admin/update-status`, {
              maDocGia,
              maSach,
              ngayMuon,
              trangThaiMuon: "DADUYET",
              maNhanVien: "NV001",
            });
            successList.push(requestKey);
          } catch (error) {
            console.error(`Error approving ${requestKey}:`, error);
            errorList.push(requestKey);
          }
        });

        await Promise.all(promises);
      }

      // Update state...
      setMuonRequests((prevRequests) =>
        prevRequests.map((request) => {
          const key = getRequestKey(request);
          if (successList.includes(key)) {
            console.log(`Updating ${key} to DADUYET`);
            return { ...request, trangThaiMuon: "DADUYET" };
          }
          return request;
        })
      );

      // Clear selections
      setSelectedRequests(new Set());
      setSelectAll(false);

      if (successList.length > 0) {
        alert(
          `Đã duyệt thành công ${successList.length} phiếu mượn.${
            errorList.length > 0
              ? ` ${errorList.length} phiếu mượn bị lỗi.`
              : ""
          }`
        );
      }

      if (errorList.length > 0) {
        console.error("Failed requests:", errorList);
        alert(`${errorList.length} phiếu mượn bị lỗi. Vui lòng kiểm tra lại.`);
      }
    } catch (error) {
      console.error("Error in bulk approve:", error);
      alert(`Có lỗi xảy ra: ${getErrorMessage(error)}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.size === 0) {
      alert("Vui lòng chọn ít nhất một phiếu mượn để từ chối.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn từ chối ${selectedRequests.size} phiếu mượn đã chọn?`
    );

    if (!confirmed) return;

    setBulkActionLoading(true);
    const selectedList = Array.from(selectedRequests);
    const successList: string[] = [];
    const errorList: string[] = [];

    try {
      const batchSize = 5;
      for (let i = 0; i < selectedList.length; i += batchSize) {
        const batch = selectedList.slice(i, i + batchSize);
        const promises = batch.map(async (requestKey) => {
          // SỬA: Sử dụng separator |
          const [maDocGia, maSach, ngayMuon] = requestKey.split("|");

          console.log(`Processing: ${maDocGia}, ${maSach}, ${ngayMuon}`); // Debug log

          try {
            await axios.put(`/api/theodoimuonsach/admin/update-status`, {
              maDocGia,
              maSach,
              ngayMuon,
              trangThaiMuon: "TUCHOI",
              maNhanVien: "NV001",
            });
            successList.push(requestKey);
          } catch (error) {
            console.error(`Error rejecting ${requestKey}:`, error);
            errorList.push(requestKey);
          }
        });

        await Promise.all(promises);
      }

      // Update state...
      setMuonRequests((prevRequests) =>
        prevRequests.map((request) => {
          const key = getRequestKey(request);
          if (successList.includes(key)) {
            console.log(`Updating ${key} to TUCHOI`);
            return { ...request, trangThaiMuon: "TUCHOI" };
          }
          return request;
        })
      );

      // Clear selections
      setSelectedRequests(new Set());
      setSelectAll(false);

      if (successList.length > 0) {
        alert(
          `Đã từ chối thành công ${successList.length} phiếu mượn.${
            errorList.length > 0
              ? ` ${errorList.length} phiếu mượn bị lỗi.`
              : ""
          }`
        );
      }

      if (errorList.length > 0) {
        console.error("Failed requests:", errorList);
        alert(`${errorList.length} phiếu mượn bị lỗi. Vui lòng kiểm tra lại.`);
      }
    } catch (error) {
      console.error("Error in bulk reject:", error);
      alert(`Có lỗi xảy ra: ${getErrorMessage(error)}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // xử lý đổi chiều / key sắp xếp
  const handleSort = (key: MuonSortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // SỬA: Filter ra các phiếu đã xóa mềm khi hiển thị
  const visibleRequests = MuonRequests.filter((request) => {
    const requestKey = getRequestKey(request);
    return !softDeletedRequests.has(requestKey);
  });

  const filteredRequests = visibleRequests.filter((r) => {
    // Filter by status
    if (filterStatus !== "ALL" && r.trangThaiMuon !== filterStatus) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchText = `${r.maDocGia} ${r.maSach} ${r.trangThaiMuon} ${
        r.docGia?.ten || ""
      } ${r.sach?.tenSach || ""} ${r.sach?.tacGia || ""}`.toLowerCase();
      return searchText.includes(query);
    }

    return true;
  });

  // sắp xếp dựa trên sortKey và sortOrder
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortKey || !sortOrder) return 0;

    // SỬA: Thay đổi từ any sang unknown và type assertion
    let aValue: unknown = a[sortKey];
    let bValue: unknown = b[sortKey];

    if (sortKey === "ngayMuon") {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    // SỬA: Type assertion để so sánh
    const aComp = aValue as string | number;
    const bComp = bValue as string | number;

    if (aComp < bComp) return sortOrder === "asc" ? -1 : 1;
    if (aComp > bComp) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalItems = sortedRequests.length;
  const totalPages = Math.ceil(totalItems / 9);
  const startIndex = (currentPage - 1) * 9;
  const endIndex = startIndex + 9;
  const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRequests(new Set());
    setSelectAll(false);
  }, [searchQuery, filterStatus]);

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRequests(new Set());
    setSelectAll(false);
  };

  // Count statistics
  const pendingCount = paginatedRequests.filter(
    (r) => r.trangThaiMuon === "CHODUYET"
  ).length;

  const totalPendingCount = sortedRequests.filter(
    (r) => r.trangThaiMuon === "CHODUYET"
  ).length;

  const selectedPendingCount = Array.from(selectedRequests).filter((key) => {
    return paginatedRequests.some((r) => {
      const requestKey = getRequestKey(r);
      return requestKey === key && r.trangThaiMuon === "CHODUYET";
    });
  }).length;

  const handleSoftDelete = async (
    maDocGia: string,
    maSach: string,
    ngayMuon: string,
    trangThaiMuon: string
  ) => {
    console.log("handleSoftDelete called with:", {
      maDocGia,
      maSach,
      ngayMuon,
      trangThaiMuon,
    });

    // Kiểm tra trạng thái trước khi xóa
    if (trangThaiMuon !== "DATRA") {
      alert("Chỉ được xóa khi sách thuộc phiếu mượn đã trả!");
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn xóa phiếu mượn này?\n\nMã độc giả: ${maDocGia}\nMã sách: ${maSach}\nNgày mượn: ${new Date(
      ngayMuon
    ).toLocaleDateString("vi-VN")}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log("Proceeding with soft delete...");

      const requestForKey: MuonRequest = {
        maDocGia,
        maSach,
        ngayMuon,
        trangThaiMuon,
        ngayTra: "",
      };

      const requestKey = getRequestKey(requestForKey);
      console.log("Generated request key:", requestKey);

      setSoftDeletedRequests((prev) => new Set(prev).add(requestKey));

      alert("Đã xóa phiếu mượn thành công!");
    } catch (error) {
      console.error("Error soft deleting loan request:", error);
      alert(`Không thể xóa phiếu mượn: ${getErrorMessage(error)}`);
    }
  };

  return (
    <div className={styles["muon-manager"]}>
      <h2>Quản lý mượn sách</h2>

      <div className={styles["muon-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/muon/add")}
        >
          + Thêm yêu cầu mượn
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CHODUYET">Chờ duyệt</option>
            <option value="DADUYET">Đã duyệt</option>
            <option value="TUCHOI">Từ chối</option>
            <option value="DANGMUON">Đang mượn</option>
            <option value="DATRA">Đã trả</option>
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên độc giả, tên sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              minWidth: 260,
            }}
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {pendingCount > 0 && (
        <div className={styles["bulk-actions"]}>
          <div className={styles["bulk-info"]}>
            <label className={styles["select-all-container"]}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span>
                Chọn tất cả trang này ({pendingCount} phiếu chờ duyệt)
              </span>
            </label>

            {selectedPendingCount > 0 && (
              <span className={styles["selection-count"]}>
                Đã chọn: {selectedPendingCount} phiếu
              </span>
            )}
          </div>

          {selectedRequests.size > 0 && (
            <div className={styles["bulk-buttons"]}>
              <button
                onClick={handleBulkApprove}
                disabled={bulkActionLoading}
                className={styles["bulk-approve-btn"]}
              >
                {bulkActionLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i>
                    Đang duyệt...
                  </>
                ) : (
                  <>
                    <i className="fa fa-check"></i>
                    Duyệt hàng loạt ({selectedRequests.size})
                  </>
                )}
              </button>

              <button
                onClick={handleBulkReject}
                disabled={bulkActionLoading}
                className={styles["bulk-reject-btn"]}
              >
                {bulkActionLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i>
                    Đang từ chối...
                  </>
                ) : (
                  <>
                    <i className="fa fa-times"></i>
                    Từ chối hàng loạt ({selectedRequests.size})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Statistics with pagination info */}
      <div className={styles["stats-summary"]}>
        <div className={styles["pending-info"]}>
          Tổng phiếu chờ duyệt: {totalPendingCount}
        </div>
      </div>

      {loading ? (
        <div className={styles["loading"]}>⏳ Đang tải...</div>
      ) : (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                {pendingCount > 0 && <th style={{ width: "40px" }}>Chọn</th>}
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("maDocGia")}
                >
                  Mã độc giả{" "}
                  {sortKey === "maDocGia"
                    ? sortIcon(sortOrder)
                    : sortIcon(null)}
                </th>
                <th>Tên độc giả</th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("maSach")}
                >
                  Mã sách{" "}
                  {sortKey === "maSach" ? sortIcon(sortOrder) : sortIcon(null)}
                </th>
                <th>Tên sách</th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("ngayMuon")}
                >
                  Ngày mượn{" "}
                  {sortKey === "ngayMuon"
                    ? sortIcon(sortOrder)
                    : sortIcon(null)}
                </th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((r, i) => {
                const requestKey = getRequestKey(r);
                const isSelected = selectedRequests.has(requestKey);
                const isPending = r.trangThaiMuon === "CHODUYET";
                const canDelete = r.trangThaiMuon === "DATRA"; // Chỉ cho phép xóa phiếu đã trả

                return (
                  <tr
                    key={i}
                    className={isPending ? styles["pending-row"] : ""}
                  >
                    {pendingCount > 0 && (
                      <td>
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectRequest(requestKey, e.target.checked)
                            }
                          />
                        )}
                      </td>
                    )}
                    <td>{r.maDocGia}</td>
                    <td>{r.docGia?.ten || "N/A"}</td>
                    <td>{r.maSach}</td>
                    <td>{r.sach?.tenSach || "N/A"}</td>
                    <td>{new Date(r.ngayMuon).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <span
                        className={`${styles["status"]} ${
                          styles[r.trangThaiMuon.toLowerCase()]
                        }`}
                      >
                        {r.trangThaiMuon}
                      </span>
                    </td>
                    <td className="text-end">
                      {r.trangThaiMuon === "CHODUYET" ? (
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className={`${styles["action-btn"]} ${styles["approve-btn"]}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleApprove(r.maDocGia, r.maSach, r.ngayMuon);
                            }}
                            title="Duyệt"
                          >
                            <i className="fa fa-check-circle" />
                          </button>
                          <button
                            type="button"
                            className={`${styles["action-btn"]} ${styles["reject-btn"]}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleReject(r.maDocGia, r.maSach, r.ngayMuon);
                            }}
                            title="Từ chối"
                          >
                            <i className="fa fa-times-circle" />
                          </button>
                        </div>
                      ) : (
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            onClick={() =>
                              navigate(
                                `/admin/muon/${r.maDocGia}/${r.maSach}/${
                                  new Date(r.ngayMuon)
                                    .toISOString()
                                    .split("T")[0]
                                }`
                              )
                            }
                            title="Xem chi tiết"
                          >
                            <i className="fa fa-eye" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(
                                `/admin/muon/edit/${r.maDocGia}/${r.maSach}/${r.ngayMuon}`
                              )
                            }
                            title="Chỉnh sửa"
                          >
                            <i className="fa fa-edit" />
                          </button>

                          {/* SỬA: Nút xóa với debug */}
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              canDelete
                                ? "btn-outline-danger"
                                : "btn-outline-secondary"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(
                                "Delete button clicked for:",
                                r.maDocGia,
                                r.maSach,
                                "Status:",
                                r.trangThaiMuon,
                                "Can delete:",
                                canDelete
                              );

                              if (canDelete) {
                                handleSoftDelete(
                                  r.maDocGia,
                                  r.maSach,
                                  r.ngayMuon,
                                  r.trangThaiMuon
                                );
                              } else {
                                alert(
                                  "Chỉ được xóa khi sách thuộc phiếu mượn đã trả!"
                                );
                              }
                            }}
                            disabled={!canDelete}
                            title={
                              canDelete
                                ? "Xóa phiếu mượn"
                                : "Chỉ được xóa khi sách thuộc phiếu mượn đã trả"
                            }
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={pendingCount > 0 ? 8 : 7}
                    className="text-center"
                  >
                    Không tìm thấy kết quả
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang mượn sách">
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <li
                      key={pageNum}
                      className={`page-item ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  )
                )}
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

      {/* SỬA: Thêm nút khôi phục các phiếu đã ẩn (tùy chọn) */}
      {softDeletedRequests.size > 0 && (
        <div className="mt-3">
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => {
              if (
                window.confirm(
                  `Khôi phục hiển thị ${softDeletedRequests.size} phiếu mượn đã ẩn?`
                )
              ) {
                setSoftDeletedRequests(new Set());
                alert("Đã khôi phục hiển thị các phiếu mượn!");
              }
            }}
            title="Khôi phục hiển thị các phiếu đã ẩn"
          >
            <i className="fa fa-undo me-1" />
            Khôi phục {softDeletedRequests.size} phiếu đã ẩn
          </button>
        </div>
      )}
    </div>
  );
};

export default MuonManager;
