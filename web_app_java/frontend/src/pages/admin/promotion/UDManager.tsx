import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../axiosConfig"; // SỬA: Import api thay vì axios
import styles from "../../../css/admins/promotion/UDManager.module.css";

interface UuDai {
  maUuDai: string;
  tenUuDai: string;
  phanTramGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
}

// SỬA: Interface cho AxiosError response
interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?:
      | {
          error?: string;
        }
      | string;
  };
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
    api // SỬA: Đổi từ axios thành api
      .get("/api/uudai")
      .then((res) => setList(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ma: string, tenUuDai: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ưu đãi "${tenUuDai}"?`)) return;

    try {
      // Kiểm tra có thể xóa không trước
      const checkResponse = await api.get(`/api/uudai/${ma}/can-delete`);

      if (!checkResponse.data.canDelete) {
        // Nếu không thể xóa, đưa ra lựa chọn
        const choice = window.confirm(
          `Không thể xóa ưu đãi "${tenUuDai}" vì đang được sử dụng trong đơn hàng.\n\n` +
            `Bạn có muốn VÔ HIỆU HÓA ưu đãi này thay thế?\n` +
            `(Ưu đãi sẽ hết hạn từ hôm qua và không còn hiệu lực)`
        );

        if (choice) {
          await handleDeactivate(ma, tenUuDai);
        }
        return;
      }

      // Nếu có thể xóa, thực hiện xóa
      await api.delete(`/api/uudai/${ma}`);
      setList((prev) => prev.filter((p) => p.maUuDai !== ma));
      alert(`Xóa ưu đãi "${tenUuDai}" thành công!`);
    } catch (error: unknown) {
      console.error(error);

      // SỬA: Xử lý error response với type-safe checking
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosErrorResponse;

        // SỬA: Xử lý data có thể là object hoặc string một cách type-safe
        let errorMessage = "Có lỗi xảy ra khi xóa ưu đãi";

        if (axiosError.response?.data) {
          if (typeof axiosError.response.data === "string") {
            errorMessage = axiosError.response.data;
          } else if (
            typeof axiosError.response.data === "object" &&
            axiosError.response.data.error
          ) {
            errorMessage = axiosError.response.data.error;
          }
        }

        if (
          axiosError.response?.status === 409 ||
          errorMessage.includes("đang được sử dụng")
        ) {
          // Đưa ra lựa chọn vô hiệu hóa
          const choice = window.confirm(
            `${errorMessage}\n\n` +
              `Bạn có muốn VÔ HIỆU HÓA ưu đãi "${tenUuDai}" thay thế?\n` +
              `(Ưu đãi sẽ hết hạn và không còn hiệu lực)`
          );

          if (choice) {
            await handleDeactivate(ma, tenUuDai);
          }
        } else {
          alert(`Lỗi: ${errorMessage}`);
        }
      } else {
        alert("Có lỗi xảy ra khi xóa ưu đãi!");
      }
    }
  };

  // Hàm vô hiệu hóa ưu đãi
  const handleDeactivate = async (ma: string, tenUuDai: string) => {
    try {
      await api.put(`/api/uudai/${ma}/deactivate`);

      // Reload lại danh sách để cập nhật ngày kết thúc
      const response = await api.get("/api/uudai");
      setList(response.data || []);

      alert(
        `Vô hiệu hóa ưu đãi "${tenUuDai}" thành công!\nƯu đãi đã hết hạn và không còn hiệu lực.`
      );
    } catch (error: unknown) {
      console.error(error);

      // SỬA: Xử lý error response với type-safe checking
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosErrorResponse;

        // SỬA: Xử lý data có thể là object hoặc string một cách type-safe
        let errorMessage = "Có lỗi xảy ra khi vô hiệu hóa ưu đãi";

        if (axiosError.response?.data) {
          if (typeof axiosError.response.data === "string") {
            errorMessage = axiosError.response.data;
          } else if (
            typeof axiosError.response.data === "object" &&
            axiosError.response.data.error
          ) {
            errorMessage = axiosError.response.data.error;
          }
        }

        alert(`Lỗi: ${errorMessage}`);
      } else {
        alert("Có lỗi xảy ra khi vô hiệu hóa ưu đãi!");
      }
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
        cmp = a.maUuDai.localeCompare(b.maUuDai, "vi", {
          sensitivity: "base",
        });
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

  // THÊM: Function để kiểm tra ưu đãi đã hết hạn
  const isExpired = (ngayKetThuc: string) => {
    return new Date(ngayKetThuc) < new Date();
  };

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
              <th>Trạng thái</th>
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
                <td>
                  {/* THÊM: Hiển thị trạng thái */}
                  <span
                    className={`badge ${
                      isExpired(d.ngayKetThuc) ? "bg-secondary" : "bg-success"
                    }`}
                  >
                    {isExpired(d.ngayKetThuc) ? "Hết hạn" : "Hoạt động"}
                  </span>
                </td>
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
                    onClick={() => handleDelete(d.maUuDai, d.tenUuDai)}
                    title={
                      isExpired(d.ngayKetThuc)
                        ? "Xóa ưu đãi"
                        : "Xóa/Vô hiệu hóa ưu đãi"
                    }
                  >
                    <i
                      className={
                        isExpired(d.ngayKetThuc) ? "fa fa-trash" : "fa fa-times"
                      }
                    />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">
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
