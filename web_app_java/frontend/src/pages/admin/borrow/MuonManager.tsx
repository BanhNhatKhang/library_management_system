import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/borrow/MuonManager.css";

interface MuonRequest {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  trangThaiMuon: string;
}

const MuonManager: React.FC = () => {
  const navigate = useNavigate();
  const [MuonRequests, setMuonRequests] = useState<MuonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredRequests = MuonRequests.filter((r) =>
    `${r.maDocGia} ${r.maSach} ${r.trangThaiMuon}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="muon-manager">
      <h2>Quản lý mượn sách</h2>
      <div className="muon-manager-header">
        <button className="add-btn" onClick={() => navigate("/admin/muon/add")}>
          + Thêm yêu cầu mượn
        </button>

        <div className="search-box">
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
              <th>Mã độc giả</th>
              <th>Mã sách</th>
              <th>Ngày mượn</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r, i) => (
              <tr key={i}>
                <td>{r.maDocGia}</td>
                <td>{r.maSach}</td>
                <td>{new Date(r.ngayMuon).toLocaleDateString("vi-VN")}</td>
                <td>{r.trangThaiMuon || "—"}</td>
                <td className="text-end">
                  {r.trangThaiMuon === "CHODUYET" ? (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() =>
                          handleApprove(r.maDocGia, r.maSach, r.ngayMuon)
                        }
                        title="Duyệt"
                      >
                        <i className="fa fa-check-circle" />
                      </button>
                      <button
                        className="action-btn reject-btn"
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
            {filteredRequests.length === 0 && (
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
