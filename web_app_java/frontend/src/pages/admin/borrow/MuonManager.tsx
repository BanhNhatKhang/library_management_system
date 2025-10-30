import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/borrow/MuonManager.module.css";

interface MuonRequest {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  trangThaiMuon: string;
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

  // sort states
  const [sortKey, setSortKey] = useState<MuonSortKey>("ngayMuon");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const fetchMuonRequests = async () => {
      try {
        const response = await axios.get("/api/theodoimuonsach");
        setMuonRequests(response.data || []);
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
      await axios.put(`/api/theodoimuonsach`, {
        maDocGia,
        maSach,
        ngayMuon,
        ngayTra: null,
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
      alert("Không thể duyệt yêu cầu mượn.");
    }
  };

  const handleReject = async (
    maDocGia: string,
    maSach: string,
    ngayMuon: string
  ) => {
    try {
      await axios.put(`/api/theodoimuonsach`, {
        maDocGia,
        maSach,
        ngayMuon,
        ngayTra: null,
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
      alert("Không thể từ chối yêu cầu mượn.");
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

  const filteredRequests = MuonRequests.filter((r) =>
    `${r.maDocGia} ${r.maSach} ${r.trangThaiMuon}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // sắp xếp dựa trên sortKey và sortOrder
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "ngayMuon") {
      const da = a.ngayMuon ? new Date(a.ngayMuon).getTime() : 0;
      const db = b.ngayMuon ? new Date(b.ngayMuon).getTime() : 0;
      cmp = da - db;
    } else if (sortKey === "maDocGia") {
      cmp = a.maDocGia.localeCompare(b.maDocGia, "vi", { sensitivity: "base" });
    } else if (sortKey === "maSach") {
      cmp = a.maSach.localeCompare(b.maSach, "vi", { sensitivity: "base" });
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

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

        <div className={styles["search-box"]}>
          <input
            type="text"
            placeholder="Tìm theo mã độc giả / sách / trạng thái"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>⏳ Đang tải...</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("maDocGia")}
              >
                Mã độc giả{" "}
                {sortKey === "maDocGia" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("maSach")}
              >
                Mã sách{" "}
                {sortKey === "maSach" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("ngayMuon")}
              >
                Ngày mượn{" "}
                {sortKey === "ngayMuon" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((r, i) => (
              <tr key={i}>
                <td>{r.maDocGia}</td>
                <td>{r.maSach}</td>
                <td>{new Date(r.ngayMuon).toLocaleDateString("vi-VN")}</td>
                <td>{r.trangThaiMuon || "—"}</td>
                <td className="text-end">
                  {r.trangThaiMuon === "CHODUYET" ? (
                    <>
                      <button
                        className={`${styles["action-btn"]} ${styles["approve-btn"]}`}
                        onClick={() =>
                          handleApprove(r.maDocGia, r.maSach, r.ngayMuon)
                        }
                        title="Duyệt"
                      >
                        <i className="fa fa-check-circle" />
                      </button>
                      <button
                        className={`${styles["action-btn"]} ${styles["reject-btn"]}`}
                        onClick={() =>
                          handleReject(r.maDocGia, r.maSach, r.ngayMuon)
                        }
                        title="Từ chối"
                      >
                        <i className="fa fa-times-circle" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() =>
                          navigate(
                            `/admin/muon/${r.maDocGia}/${r.maSach}/${
                              new Date(r.ngayMuon).toISOString().split("T")[0]
                            }`
                          )
                        }
                        title="Xem chi tiết"
                      >
                        <i className="fa fa-eye" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() =>
                          navigate(
                            `/admin/muon/edit/${r.maDocGia}/${r.maSach}/${r.ngayMuon}`
                          )
                        }
                        title="Chỉnh sửa"
                      >
                        <i className="fa fa-edit" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          console.log(`Xóa phiếu mượn: ${r.maDocGia}`)
                        }
                        title="Xóa"
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {sortedRequests.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">
                  Không tìm thấy kết quả
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MuonManager;
