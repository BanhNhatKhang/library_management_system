import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/promotion/UDManager.module.css";

interface UuDai {
  maUuDai: string;
  tenUuDai: string;
  phanTramGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
}

type UDSortKey =
  | "maUuDai"
  | "tenUuDai"
  | "phanTramGiam"
  | "ngayBatDau"
  | "ngayKetThuc";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const UDManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<UuDai[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // sort state
  const [sortKey, setSortKey] = useState<UDSortKey>("maUuDai");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    axios
      .get("/api/uudai")
      .then((res) => setList(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa ưu đãi này?")) return;
    try {
      await axios.delete(`/api/uudai/${ma}`);
      setList((prev) => prev.filter((p) => p.maUuDai !== ma));
      alert("Xóa thành công");
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  const handleSort = (key: UDSortKey) => {
    if (sortKey === key) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((d) =>
    `${d.maUuDai} ${d.tenUuDai}`.toLowerCase().includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "maUuDai":
        cmp = a.maUuDai.localeCompare(b.maUuDai, "vi", { sensitivity: "base" });
        break;
      case "tenUuDai":
        cmp = a.tenUuDai.localeCompare(b.tenUuDai, "vi", {
          sensitivity: "base",
        });
        break;
      case "phanTramGiam":
        cmp = a.phanTramGiam - b.phanTramGiam;
        break;
      case "ngayBatDau":
        cmp =
          (new Date(a.ngayBatDau).getTime() || 0) -
          (new Date(b.ngayBatDau).getTime() || 0);
        break;
      case "ngayKetThuc":
        cmp =
          (new Date(a.ngayKetThuc).getTime() || 0) -
          (new Date(b.ngayKetThuc).getTime() || 0);
        break;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

  return (
    <div className={styles["ud-manager"]}>
      <h2>Quản lý ưu đãi</h2>
      <div className={styles["ud-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/uudai/add")}
        >
          + Thêm ưu đãi
        </button>

        <div className={styles["search-box"]}>
          <input
            type="text"
            placeholder="Tìm theo mã / tên ưu đãi"
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
                onClick={() => handleSort("maUuDai")}
              >
                Mã ưu đãi{" "}
                {sortKey === "maUuDai" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("tenUuDai")}
              >
                Tên ưu đãi{" "}
                {sortKey === "tenUuDai" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("phanTramGiam")}
              >
                Giảm (%){" "}
                {sortKey === "phanTramGiam"
                  ? sortIcon(sortOrder)
                  : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("ngayBatDau")}
              >
                Ngày bắt đầu{" "}
                {sortKey === "ngayBatDau"
                  ? sortIcon(sortOrder)
                  : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("ngayKetThuc")}
              >
                Ngày kết thúc{" "}
                {sortKey === "ngayKetThuc"
                  ? sortIcon(sortOrder)
                  : sortIcon(null)}
              </th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.maUuDai}>
                <td>{d.maUuDai}</td>
                <td>{d.tenUuDai}</td>
                <td>{d.phanTramGiam}%</td>
                <td>{formatDate(d.ngayBatDau)}</td>
                <td>{formatDate(d.ngayKetThuc)}</td>
                <td className="text-end">
                  <Link
                    to={`/admin/uudai/${d.maUuDai}`}
                    className="btn btn-sm btn-outline-info me-2"
                  >
                    <i className="fa fa-eye" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => navigate(`/admin/uudai/edit/${d.maUuDai}`)}
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.maUuDai)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
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

export default UDManager;
