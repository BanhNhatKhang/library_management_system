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

const NVManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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

  const filtered = list.filter((nv) =>
    `${nv.hoTen} ${nv.dienThoai} ${nv.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

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
              <th>Mã</th>
              <th>Họ tên</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((nv) => (
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
            {filtered.length === 0 && (
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
