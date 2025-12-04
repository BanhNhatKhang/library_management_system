import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "../../css/users/cart/Cart.module.css";
import axios from "../../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const getSubjectFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    // Kiểm tra vai trò có phải DOCGIA không (Optional nhưng tốt)
    if (payload.role === "DOCGIA" || payload.role === "ROLE_DOCGIA") {
      return payload.sub || null; // 'sub' là trường Subject (MaDocGia)
    }
    return null;
  } catch {
    return null;
  }
};

interface CartItem {
  id: string; // maSach
  name: string; // tenSach
  image: string; // anhBia
  originalPrice: number; // donGia
  discountedPrice: number; // Tạm tính: donGia * (1 - giamGia)
  quantity: number; // soLuong
  giamGia: number; // giamGia từ Sach (để tính discountedPrice)
}

// Interface cho dữ liệu nhận được từ API (Kết hợp GioHangDTO và thông tin sách)
interface GioHangResponseDTO {
  maSach: string;
  tenSach: string;
  anhBia: string;
  donGia: number;
  giamGia: number;
  soLuong: number; // Thuộc tính từ GioHangDTO
  maDocGia: string;
}

const ITEMS_PER_PAGE = 4;

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const Cart: React.FC = () => {
  const { role } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Thêm state cho ưu đãi
  const [availableUuDai, setAvailableUuDai] = useState<UuDai[]>([]);
  const [selectedUuDai, setSelectedUuDai] = useState<string | null>(null);

  // Interface cho UuDai
  interface UuDai {
    maUuDai: string;
    tenUuDai: string;
    moTa: string;
    phanTramGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
  }

  // LẤY maDocGia ĐỘNG TỪ TOKEN
  const maDocGia = getSubjectFromToken();

  // --- LOGIC GỌI API ---
  const mapApiDataToCartItem = (data: GioHangResponseDTO): CartItem => {
    const discountedPrice = data.donGia * (1 - data.giamGia);
    return {
      id: data.maSach,
      name: data.tenSach,
      image: data.anhBia,
      originalPrice: data.donGia,
      discountedPrice: discountedPrice,
      quantity: data.soLuong,
      giamGia: data.giamGia,
    };
  };

  const fetchCartItems = useCallback(async () => {
    // <-- Bọc hàm ở đây
    // Kiểm tra xem có maDocGia và là Độc Giả không
    if (!maDocGia || role !== "DOCGIA") {
      setIsLoading(false);
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get<GioHangResponseDTO[]>(
        `/api/giohang/${maDocGia}`
      );
      const mappedItems = res.data.map(mapApiDataToCartItem);

      setCartItems(mappedItems);
      setSelectedItems(mappedItems.map((item) => item.id));
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [maDocGia, role]); // <-- Dependencies của fetchCartItems

  // Fetch danh sách ưu đãi có sẵn
  const fetchAvailableUuDai = useCallback(async () => {
    try {
      const response = await axios.get<UuDai[]>(`/api/uudai/saved`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      // Lọc ưu đãi còn hiệu lực
      const now = new Date();
      const validUuDai = response.data.filter((uudai) => {
        const ngayKetThuc = new Date(uudai.ngayKetThuc);
        const ngayBatDau = new Date(uudai.ngayBatDau);
        return now >= ngayBatDau && now <= ngayKetThuc;
      });

      setAvailableUuDai(validUuDai);
    } catch (error) {
      console.error("Error fetching uu dai:", error);
      setAvailableUuDai([]);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
    fetchAvailableUuDai();
  }, [fetchCartItems, fetchAvailableUuDai]);

  //   useEffect(() => {
  //     fetchCartItems();
  //   }, [maDocGia, role]);

  // --- LOGIC XỬ LÝ SỰ KIỆN API ---
  const updateQuantityOnServer = async (
    maSach: string,
    newQuantity: number
  ) => {
    if (!maDocGia) return;

    const dto = { maDocGia: maDocGia, maSach: maSach, soLuong: newQuantity };

    try {
      console.log("Updating quantity:", dto); // Debug log

      const response = await axios.put("/api/giohang", dto);

      // Cập nhật state chỉ khi server trả về thành công
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === maSach ? { ...item, quantity: newQuantity } : item
        )
      );

      // Thông báo header cập nhật
      window.dispatchEvent(new Event("cartUpdated"));

      console.log("Quantity updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating quantity:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data || "Cập nhật số lượng thất bại";
        console.log("Server error:", errorMessage);
        alert(`Lỗi: ${errorMessage}`);
      } else {
        alert("Cập nhật số lượng thất bại. Vui lòng thử lại.");
      }

      // Refresh lại giỏ hàng để đồng bộ với server
      fetchCartItems();
    }
  };

  const deleteItemOnServer = async (maSach: string) => {
    if (!maDocGia) return;
    const dto = { maDocGia: maDocGia, maSach: maSach };
    try {
      const response = await axios.delete("/api/giohang", { data: dto });

      // Kiểm tra phản hồi từ server
      if (response.data && response.data.includes("thành công")) {
        // Xóa thành công - cập nhật state
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== maSach)
        );
        setSelectedItems((prevSelected) =>
          prevSelected.filter((itemId) => itemId !== maSach)
        );

        // Thông báo header cập nhật
        window.dispatchEvent(new Event("cartUpdated"));

        // Hiển thị thông báo thành công
        alert("Xóa sản phẩm thành công!");

        // Điều chỉnh trang hiện tại nếu cần
        const newTotalItems = cartItems.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        throw new Error("Phản hồi không mong đợi từ server");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || "Xóa sản phẩm thất bại";
        alert(`Lỗi: ${errorMessage}`);
      } else {
        alert("Xóa sản phẩm thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;

    // Kiểm tra số lượng hợp lệ
    if (newQuantity < 1) {
      // Nếu số lượng < 1, hỏi có muốn xóa sản phẩm không
      if (
        window.confirm(`Bạn có muốn xóa "${item.name}" khỏi giỏ hàng không?`)
      ) {
        handleDeleteItem(id);
      }
      return;
    }

    // Giới hạn số lượng tối đa
    if (newQuantity > 99) {
      alert("Số lượng tối đa là 99");
      return;
    }

    // Cập nhật số lượng trên server
    updateQuantityOnServer(id, newQuantity);
  };

  // Hàm xử lý nhập số lượng trực tiếp
  const handleQuantityInput = (id: string, value: string) => {
    const newQuantity = parseInt(value, 10);

    // Kiểm tra số hợp lệ
    if (isNaN(newQuantity) || newQuantity < 1) {
      return;
    }

    // Giới hạn số lượng tối đa
    if (newQuantity > 99) {
      alert("Số lượng tối đa là 99");
      return;
    }

    // Cập nhật số lượng trên server
    updateQuantityOnServer(id, newQuantity);
  };

  // Xử lý xóa sản phẩm với thông báo xác nhận rõ ràng hơn
  const handleDeleteItem = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    const itemName = item ? item.name : "sản phẩm này";

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa "${itemName}" khỏi giỏ hàng không?\n\nHành động này không thể hoàn tác.`
      )
    ) {
      deleteItemOnServer(id);
    }
  };

  // Cập nhật hàm handleCheckout
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    const selectedItemDetails = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    const itemNames = selectedItemDetails.map((item) => item.name).join(", ");

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn thanh toán ${
          selectedItems.length
        } sản phẩm?\n\nSản phẩm: ${itemNames}\n\nTổng tiền: ${formatCurrency(
          finalTotal
        )}`
      )
    ) {
      return;
    }

    setIsProcessingPayment(true);

    try {
      const requestData = {
        maDocGia: maDocGia,
        maSachList: selectedItems,
        tongTien: finalTotal,
        maUuDai: selectedUuDai, // Thêm ưu đãi được chọn
      };

      console.log("Processing payment:", requestData);

      const response = await axios.post("/api/donhang/thanhtoan", requestData);

      console.log("Payment successful:", response.data);

      // Hiển thị thông báo thành công
      alert(
        `Thanh toán thành công!\n\n` +
          `Mã đơn hàng: ${response.data.maDonHang}\n` +
          `Tổng tiền: ${formatCurrency(finalTotal)}\n` +
          `${
            selectedUuDai
              ? "Ưu đãi đã áp dụng: " +
                availableUuDai.find((u) => u.maUuDai === selectedUuDai)
                  ?.tenUuDai +
                "\n"
              : ""
          }` +
          `Ngày đặt: ${response.data.ngayDat}\n\n` +
          `Cảm ơn bạn đã mua hàng!`
      );

      // Reset tất cả
      await fetchCartItems();
      setSelectedItems([]);
      setSelectedUuDai(null);

      // Thông báo header cập nhật
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Payment error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || "Thanh toán thất bại";
        alert(`Lỗi thanh toán: ${errorMessage}`);
      } else {
        alert("Thanh toán thất bại. Vui lòng thử lại!");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- LOGIC PHÂN TRANG VÀ TÍNH TOÁN VẪN GIỮ NGUYÊN ---
  const totalPages = Math.ceil(cartItems.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return cartItems.slice(startIndex, endIndex);
  }, [cartItems, currentPage]);

  const handleSelectItem = (id: string) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((itemId) => itemId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  // Xử lý chọn ưu đãi
  const handleSelectUuDai = (maUuDai: string) => {
    setSelectedUuDai(maUuDai === selectedUuDai ? null : maUuDai);
  };

  // Tính toán tổng tiền với ưu đãi
  const { totalDiscounted, totalPrice, additionalDiscount } = useMemo(() => {
    const selected = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    const totalDiscounted = selected.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );
    const totalPrice = selected.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );

    // Tính giảm giá từ ưu đãi được chọn
    let additionalDiscount = 0;
    if (selectedUuDai) {
      const selectedUuDaiInfo = availableUuDai.find(
        (u) => u.maUuDai === selectedUuDai
      );
      if (selectedUuDaiInfo) {
        additionalDiscount =
          totalDiscounted * (selectedUuDaiInfo.phanTramGiam / 100);
      }
    }

    return {
      totalDiscounted,
      totalPrice,
      additionalDiscount,
    };
  }, [cartItems, selectedItems, selectedUuDai, availableUuDai]);

  const finalTotal = totalDiscounted - additionalDiscount;
  // const totalDiscount = totalPrice - finalTotal;

  // --- RENDERING ---
  return (
    <div className="container mt-4">
      <div className={styles["cart-header"]}>
        <h2 className={styles["cart-title"]}>
          GIỎ HÀNG ({cartItems.length} sản phẩm)
        </h2>
      </div>

      <div className={styles["cart-container"]}>
        <div className={styles["item-list-wrapper"]}>
          {/* Header Bảng */}
          <div className={styles["cart-table-header"]}>
            <div className={styles["select-all"]}>
              <input
                type="checkbox"
                checked={
                  selectedItems.length === cartItems.length &&
                  cartItems.length > 0
                }
                onChange={handleSelectAll}
              />
              <span className={styles["header-label"]}>
                Chọn tất cả ({cartItems.length} sản phẩm)
              </span>
            </div>
            <span className={styles["header-quantity"]}>Số lượng</span>
            <span className={styles["header-total"]}>Thành tiền</span>
            {/* Thêm cột để chứa nút xóa */}
            <span style={{ width: "5%", textAlign: "center" }}></span>
          </div>

          {/* Hiển thị Loading / Lỗi / Trống */}
          {role !== "DOCGIA" ? (
            <div className="text-center py-5 text-secondary">
              Vui lòng đăng nhập để xem giỏ hàng.
            </div>
          ) : isLoading ? (
            <div className="text-center py-5 text-secondary">
              Đang tải giỏ hàng...
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              Giỏ hàng của bạn đang trống!
            </div>
          ) : (
            /* Danh sách sản phẩm */
            <div className={styles["cart-items"]}>
              {currentItems.map((item) => (
                <div key={item.id} className={styles["cart-item"]}>
                  <div className={styles["item-info"]}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <img
                      src={`/api/sach/image/${item.image}`}
                      alt={item.name}
                      className={styles["item-image"]}
                    />
                    <div className={styles["item-details"]}>
                      <p className={styles["item-name"]}>{item.name}</p>
                      <p className={styles["item-price"]}>
                        {formatCurrency(item.discountedPrice)}
                        <span className={styles["original-price"]}>
                          {formatCurrency(item.originalPrice)}
                        </span>
                      </p>
                      {item.giamGia > 0 && (
                        <span className="badge bg-danger mt-1">
                          Giảm {Math.round(item.giamGia * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles["item-actions"]}>
                    <div className={styles["quantity-control"]}>
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={item.quantity <= 1}
                        title={
                          item.quantity <= 1
                            ? "Nhấn để xóa sản phẩm"
                            : "Giảm số lượng"
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityInput(item.id, e.target.value)
                        }
                        onBlur={(e) => {
                          // Đảm bảo giá trị hợp lệ khi mất focus
                          const value = parseInt(e.target.value, 10);
                          if (isNaN(value) || value < 1) {
                            handleQuantityInput(item.id, "1");
                          }
                        }}
                        style={{
                          width: "60px",
                          textAlign: "center",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          padding: "4px",
                        }}
                      />
                      <button onClick={() => handleQuantityChange(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <span className={styles["item-total-price"]}>
                      {formatCurrency(item.discountedPrice * item.quantity)}
                    </span>

                    {/* Nút Xóa */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteItem(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9ca3af",
                        width: "5%",
                        cursor: "pointer",
                      }}
                      title="Xóa sản phẩm"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {!isLoading && cartItems.length > 0 && totalPages > 1 && (
            <div className={styles["pagination"]}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={index + 1 === currentPage ? styles.active : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>

        {/* Cột thông tin thanh toán (CẬP NHẬT) */}
        <div className={styles["cart-summary"]}>
          {/* Phần Ưu đãi */}
          <div className={styles["promotion-box"]}>
            <div className={styles["promotion-header"]}>
              <i className="fas fa-tags me-2"></i>
              <span className={styles["box-title"]}>ƯU ĐÃI</span>
            </div>

            {availableUuDai.length === 0 ? (
              <div className={styles["no-promotion"]}>
                <p className="text-muted text-center py-3">
                  Hiện tại không có ưu đãi nào khả dụng
                </p>
              </div>
            ) : (
              <div className={styles["promotion-list"]}>
                {availableUuDai.map((uudai) => (
                  <div
                    key={uudai.maUuDai}
                    className={styles["promotion-item"]}
                    onClick={() => handleSelectUuDai(uudai.maUuDai)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles["promo-title-row"]}>
                      <input
                        type="radio"
                        name="uudai"
                        checked={selectedUuDai === uudai.maUuDai}
                        onChange={() => handleSelectUuDai(uudai.maUuDai)}
                        style={{ marginRight: "8px" }}
                      />
                      <span className={styles["promo-title"]}>
                        {uudai.tenUuDai} - Giảm {uudai.phanTramGiam}%
                      </span>
                    </div>
                    <p className={styles["promo-desc"]}>{uudai.moTa}</p>
                    <div className={styles["promo-action"]}>
                      <span className={styles["promo-hsd"]}></span>
                      {selectedUuDai === uudai.maUuDai && (
                        <span className={styles["promo-applied"]}>
                          Đã áp dụng - Giảm {formatCurrency(additionalDiscount)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần Tổng kết - Cập nhật với ưu đãi */}
          <div className={styles["summary-details"]}>
            <div className={styles["summary-row"]}>
              <span>Thành tiền</span>
              <span className={styles["summary-value"]}>
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <div className={styles["summary-row"]}>
              <span>Giảm giá sách</span>
              <span className={styles["summary-value"]}>
                -{formatCurrency(totalPrice - totalDiscounted)}
              </span>
            </div>
            {selectedUuDai && additionalDiscount > 0 && (
              <div className={styles["summary-row"]}>
                <span>Giảm giá ưu đãi</span>
                <span className={styles["summary-value"]}>
                  -{formatCurrency(additionalDiscount)}
                </span>
              </div>
            )}
            <div className={styles["summary-row"]}>
              <span>Tổng cộng</span>
              <span className={styles["summary-total"]}>
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>

          <button
            className={styles["checkout-btn"]}
            disabled={selectedItems.length === 0 || isProcessingPayment}
            onClick={handleCheckout}
          >
            {isProcessingPayment ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                ĐANG XỬ LÝ...
              </>
            ) : (
              "THANH TOÁN"
            )}
          </button>

          <p className={styles["checkout-note"]}>
            {isProcessingPayment
              ? "Vui lòng không tắt trang trong quá trình xử lý..."
              : "Cảm ơn bạn đã mua hàng!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
