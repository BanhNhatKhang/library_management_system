import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/staff/NVManager.module.css";

interface NhanVien {
  maNhanVien: string;
  hoTen: string;
  dienThoai: string;
  email: string;
  trangThai?: string;
}

type NVSortKey = "maNhanVien" | "hoTen" | "dienThoai" | "email";
type SortOrder = "asc" | "desc";

const sortIcon = (order: SortOrder | null) =>
  order === "asc" ? "▲" : order === "desc" ? "▼" : "⇅";

const NVManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // sort
  const [sortKey, setSortKey] = useState<NVSortKey>("maNhanVien");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    axios
      .get("/api/nhanvien")
      .then((res) => {
        setList(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    try {
      await axios.delete(`/api/nhanvien/${ma}`);
      setList((prev) => prev.filter((p) => p.maNhanVien !== ma));
      alert("Xóa thành công");
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại");
    }
  };

  const handleSort = (key: NVSortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filtered = list.filter((nv) =>
    `${nv.hoTen} ${nv.dienThoai} ${nv.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = "";
    let bVal = "";

    switch (sortKey) {
      case "maNhanVien":
        aVal = a.maNhanVien || "";
        bVal = b.maNhanVien || "";
        break;
      case "hoTen":
        aVal = a.hoTen || "";
        bVal = b.hoTen || "";
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
    <div className={styles["nv-manager"]}>
      <h2>Quản lý nhân viên</h2>
      <div className={styles["nv-manager-header"]}>
        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/admin/nhanvien/add")}
        >
          + Thêm nhân viên
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
                onClick={() => handleSort("maNhanVien")}
              >
                Mã{" "}
                {sortKey === "maNhanVien"
                  ? sortIcon(sortOrder)
                  : sortIcon(null)}
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
            {sorted.map((nv) => (
              <tr key={nv.maNhanVien}>
                <td>{nv.maNhanVien}</td>
                <td>{nv.hoTen}</td>
                <td>{nv.dienThoai}</td>
                <td>{nv.email}</td>
                <td>{nv.trangThai || "—"}</td>
                <td className="text-end">
                  <Link
                    to={`/admin/nhanvien/${nv.maNhanVien}`}
                    className="btn btn-sm btn-outline-info me-2"
                  >
                    <i className="fa fa-eye" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() =>
                      navigate(`/admin/nhanvien/edit/${nv.maNhanVien}`)
                    }
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(nv.maNhanVien)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className={styles["text-center"]}>
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

export default NVManager;
