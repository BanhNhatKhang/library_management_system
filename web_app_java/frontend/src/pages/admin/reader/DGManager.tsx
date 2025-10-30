import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/readers/DGManager.module.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  trangThai?: string;
}

type DGSortKey = "maDocGia" | "hoTen" | "dienThoai" | "email";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const DGManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DocGia[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // sort states
  const [sortKey, setSortKey] = useState<DGSortKey>("maDocGia");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    axios
      .get("/api/docgia")
      .then((res) => {
        setList(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa độc giả này?")) return;
    try {
      await axios.delete(`/api/docgia/${ma}`);
      setList((prev) => prev.filter((p) => p.maDocGia !== ma));
      alert("Xóa thành công");
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại");
    }
  };

  const handleSort = (key: DGSortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((d) =>
    `${d.hoLot} ${d.ten} ${d.dienThoai} ${d.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string = "";
    let bVal: string = "";

    switch (sortKey) {
      case "maDocGia":
        aVal = a.maDocGia || "";
        bVal = b.maDocGia || "";
        break;
      case "hoTen":
        aVal = `${a.hoLot} ${a.ten}`.trim();
        bVal = `${b.hoLot} ${b.ten}`.trim();
        break;
      case "dienThoai":
        aVal = a.dienThoai || "";
        bVal = b.dienThoai || "";
        break;
      case "email":
        aVal = a.email || "";
        bVal = b.email || "";
        break;
    }

    const cmp = aVal.localeCompare(bVal, "vi", { sensitivity: "base" });

    return sortOrder === "asc" ? cmp : -cmp;
  });

  return (
    <div className={styles["dg-manager"]}>
      <h2>Quản lý độc giả</h2>
      <div className={styles["dg-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/docgia/add")}
        >
          + Thêm độc giả
        </button>

        <div className={styles["search-box"]}>
          <input
            type="text"
            placeholder="Tìm theo tên / điện thoại / email"
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
                onClick={() => handleSort("maDocGia")}
              >
                Mã{" "}
                {sortKey === "maDocGia" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("hoTen")}
              >
                Họ tên{" "}
                {sortKey === "hoTen" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("dienThoai")}
              >
                Điện thoại{" "}
                {sortKey === "dienThoai" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortKey === "email" ? sortIcon(sortOrder) : sortIcon(null)}
              </th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.maDocGia}>
                <td>{d.maDocGia}</td>
                <td>
                  {d.hoLot} {d.ten}
                </td>
                <td>{d.dienThoai}</td>
                <td>{d.email}</td>
                <td>{d.trangThai || "—"}</td>
                <td className="text-end">
                  <Link
                    to={`/admin/docgia/${d.maDocGia}`}
                    className="btn btn-sm btn-outline-info me-2"
                  >
                    <i className="fa fa-eye" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => navigate(`/admin/docgia/edit/${d.maDocGia}`)}
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.maDocGia)}
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

export default DGManager;
