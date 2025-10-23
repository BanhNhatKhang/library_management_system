import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/readers/DGManager.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  trangThai?: string;
}

const DGManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DocGia[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
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

  const filtered = list.filter((d) =>
    `${d.hoLot} ${d.ten} ${d.dienThoai} ${d.email}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <div className="dg-manager">
      <h2>Quản lý độc giả</h2>
      <div className="dg-manager-header">
        <button
          className="add-btn"
          onClick={() => navigate("/admin/docgia/add")}
        >
          + Thêm độc giả
        </button>

        <div className="search-box">
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
            {filtered.map((d) => (
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

export default DGManager;
