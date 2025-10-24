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

const UDManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<UuDai[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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

  const filtered = list.filter((d) =>
    `${d.maUuDai} ${d.tenUuDai}`.toLowerCase().includes(q.toLowerCase())
  );

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
              <th>Mã ưu đãi</th>
              <th>Tên ưu đãi</th>
              <th>Giảm (%)</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
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
            {filtered.length === 0 && (
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
