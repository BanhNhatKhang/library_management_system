import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/notification/TBManager.module.css";

interface ThongBao {
  id: number;
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  noiDung: string;
  thoiGianGui: string;
  loaiThongBao: string;
  trangThaiDaDoc: boolean;
}

// sort types
type TBSortKey = "id" | "maDocGia" | "maSach" | "thoiGianGui";
type SortOrder = "asc" | "desc";
const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const TBManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<ThongBao[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // default sort theo thời gian gửi giảm dần
  const [sortKey, setSortKey] = useState<TBSortKey>("thoiGianGui");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    axios
      .get("/api/thongbao")
      .then((res) => {
        const sortedList = (res.data || []).sort(
          (a: ThongBao, b: ThongBao) =>
            new Date(b.thoiGianGui).getTime() -
            new Date(a.thoiGianGui).getTime()
        );
        setList(sortedList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await axios.delete(`/api/thongbao/${id}`);
      setList((prev) => prev.filter((p) => p.id !== id));
      alert("Xóa thành công");
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSort = (key: TBSortKey) => {
    if (sortKey === key) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((d) =>
    `${d.maDocGia} ${d.maSach} ${d.noiDung} ${d.loaiThongBao}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "id":
        cmp = (a.id || 0) - (b.id || 0);
        break;
      case "maDocGia":
        cmp = (a.maDocGia || "").localeCompare(b.maDocGia || "", "vi", {
          sensitivity: "base",
        });
        break;
      case "maSach":
        cmp = (a.maSach || "").localeCompare(b.maSach || "", "vi", {
          sensitivity: "base",
        });
        break;
      case "thoiGianGui":
        cmp =
          new Date(a.thoiGianGui).getTime() - new Date(b.thoiGianGui).getTime();
        break;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  return (
    <div className={styles["tb-manager"]}>
      <h2>🔔 Quản lý Thông báo</h2>
      <div className={styles["tb-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/thongbao/add")}
        >
          + Tạo Thông báo mới
        </button>

        <div className={styles["search-box"]}>
          <input
            type="text"
            placeholder="Tìm theo Mã độc giả/Sách/Nội dung"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
                onClick={() => handleSort("id")}
              >
                ID {sortKey === "id" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("maDocGia")}
              >
                Độc giả{" "}
                {sortKey === "maDocGia" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("maSach")}
              >
                Mã sách{" "}
                {sortKey === "maSach" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th>Loại TB</th>
              <th>Nội dung (tóm tắt)</th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("thoiGianGui")}
              >
                Thời gian gửi{" "}
                {sortKey === "thoiGianGui"
                  ? sortIcon(sortOrder)
                  : sortIcon(null)}
              </th>
              <th>Đã đọc</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.maDocGia}</td>
                <td>{d.maSach || "—"}</td>
                <td>{d.loaiThongBao}</td>
                <td>{d.noiDung.substring(0, 50)}...</td>
                <td>{formatDate(d.thoiGianGui)}</td>
                <td>
                  <span
                    className={`${styles["status-badge"]} ${
                      d.trangThaiDaDoc
                        ? styles["status-read"]
                        : styles["status-unread"]
                    }`}
                  >
                    {d.trangThaiDaDoc ? "✅ Đã đọc" : "❌ Chưa đọc"}
                  </span>
                </td>
                <td className="text-end">
                  <Link
                    to={`/admin/thongbao/${d.id}`}
                    className="btn btn-sm btn-outline-info me-2"
                  >
                    <i className="fa fa-eye" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => navigate(`/admin/thongbao/edit/${d.id}`)}
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.id)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center">
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

export default TBManager;
