import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/orders/DHManager.css";

interface DonHang {
  maDonHang: string;
  maDocGia: string;
  ngayDat: string;
  tongTien: number;
  trangThai: string;
}

const DHManager: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    axios
      .get("/api/donhang")
      .then((res) => setList(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    try {
      await axios.delete(`/api/donhang/${ma}`);
      setList((prev) => prev.filter((p) => p.maDonHang !== ma));
      alert("Xóa thành công");
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  const filtered = list.filter((d) =>
    `${d.maDonHang} ${d.maDocGia} ${d.trangThai}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <div className="dh-manager">
      <h2>Quản lý đơn hàng</h2>
      <div className="dh-manager-header">
        <button
          className="add-btn"
          onClick={() => navigate("/admin/donhang/add")}
        >
          + Thêm đơn hàng
        </button>

        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã / độc giả / trạng thái"
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
              <th>Mã đơn</th>
              <th>Mã độc giả</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.maDonHang}>
                <td>{d.maDonHang}</td>
                <td>{d.maDocGia}</td>
                <td>{new Date(d.ngayDat).toLocaleDateString("vi-VN")}</td>
                <td>{d.tongTien.toLocaleString("vi-VN")}₫</td>
                <td>{d.trangThai || "—"}</td>
                <td className="text-end">
                  <Link
                    to={`/admin/donhang/${d.maDonHang}`}
                    className="btn btn-sm btn-outline-info me-2"
                  >
                    <i className="fa fa-eye" />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() =>
                      navigate(`/admin/donhang/edit/${d.maDonHang}`)
                    }
                  >
                    <i className="fa fa-edit" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.maDonHang)}
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

export default DHManager;
