// ====== ELEMENTS ======
const loadOrdersBtn = document.getElementById("loadOrdersBtn");
const ordersTableBody = document.getElementById("ordersTableBody");
const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const processingOrdersEl = document.getElementById("processingOrders");
const completedOrdersEl = document.getElementById("completedOrders");
const logoutBtn = document.getElementById("logoutBtn");
const orderModal = document.getElementById("orderModal");
const modalBody = document.getElementById("modalBody");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let allOrders = []; // store all fetched orders globally

// ====== LOAD ORDERS ======
loadOrdersBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/orders", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    allOrders = response.data?.orders || [];
    applyFilters();
  } catch (error) {
    console.error("Error loading orders:", error);
    alert("Failed to load orders. Make sure your backend is running.");
  }
});

// ====== SEARCH & FILTER ======
function applyFilters() {
  let filteredOrders = [...allOrders];

  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filteredOrders = filteredOrders.filter((order) => {
      const userName = order.user?.name?.toLowerCase() || "";
      const orderId = order._id.toLowerCase();
      const productNames = order.products
        .map((p) => p.product.toLowerCase())
        .join(" ");
      return (
        userName.includes(searchTerm) ||
        orderId.includes(searchTerm) ||
        productNames.includes(searchTerm)
      );
    });
  }

  const statusValue = statusFilter.value;
  if (statusValue && statusValue !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === statusValue,
    );
  }

  displayOrders(filteredOrders);
  updateStats(filteredOrders);
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// ====== DISPLAY ORDERS ======
function displayOrders(orders) {
  ordersTableBody.innerHTML = "";

  if (!orders.length) {
    ordersTableBody.innerHTML =
      '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
    return;
  }

  orders.forEach((order) => {
    const row = document.createElement("tr");

    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const productsList = order.products
      .map((p) => `${p.product} (x${p.quantity})`)
      .join(", ");

    const statusClass = getStatusClass(order.status);
    const statusText = order.status.replace("_", " ").toUpperCase();

    row.innerHTML = `
      <td>${order._id}</td>
      <td>
  <strong>${order.user?.username || "N/A"}</strong><br>
  <small>${order.user?.phoneNumber || "N/A"}</small><br>
  <small>Shipping: ${order.deliveryAddress || "N/A"}</small>
</td>

      <td>${productsList}</td>
      <td>₦${order.totalAmount.toLocaleString()}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>${formattedDate}</td>
      <td>
        <button class="btn btn-sm btn-view" data-id="${order._id}"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-edit" data-id="${order._id}"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-print" data-id="${order._id}"><i class="fas fa-print"></i></button>
      </td>
    `;

    row
      .querySelector(".btn-view")
      .addEventListener("click", () => viewOrder(order));
    row
      .querySelector(".btn-edit")
      .addEventListener("click", () => editOrder(order));
    row
      .querySelector(".btn-print")
      .addEventListener("click", () => printOrder(order));

    ordersTableBody.appendChild(row);
  });
}

// ====== STATUS CLASS ======
function getStatusClass(status) {
  const classes = {
    pending_payment: "status-pending",
    processing: "status-processing",
    shipped: "status-processing",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return classes[status] || "status-pending";
}

// ====== UPDATE STATS ======
function updateStats(orders) {
  totalOrdersEl.textContent = orders.length;
  pendingOrdersEl.textContent = orders.filter(
    (o) => o.status === "pending_payment",
  ).length;
  processingOrdersEl.textContent = orders.filter(
    (o) => o.status === "processing" || o.status === "shipped",
  ).length;
  completedOrdersEl.textContent = orders.filter(
    (o) => o.status === "delivered",
  ).length;
}

// ====== VIEW ORDER MODAL ======
function viewOrder(order) {
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const subtotal = order.products.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );

  modalBody.innerHTML = `
    <div class="order-details-grid">
      <div class="detail-item"><div class="detail-label">Order ID</div><div class="detail-value">${order._id}</div></div>
      <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${formattedDate}</div></div>
      <div class="detail-item"><div class="detail-label">Customer</div><div class="detail-value">${order.user?.username || "N/A"} (${order.user?.email || "N/A"})</div></div>
      <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${order.user?.phoneNumber || "N/A"}</div></div>
      <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="status-badge ${getStatusClass(order.status)}">${order.status.replace("_", " ").toUpperCase()}</span></div></div>
      <div class="detail-item"><div class="detail-label">Shipping Address</div><div class="detail-value">${order.deliveryAddress || "N/A"}</div></div>
      
    </div>

    <div class="products-list">
      <h4>Products</h4>
      ${order.products
        .map(
          (item) => `
        <div class="product-item">
          <div>${item.product} x ${item.quantity}</div>
          <div>₦${((item.price || 0) * item.quantity).toFixed(2)}</div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div style="text-align:right; margin-top:20px; font-size:18px; font-weight:600;">
      <div>Subtotal: ₦${subtotal.toFixed(2)}</div>
      <div style="color:var(--primary); font-size:20px;">Total: ₦${order.totalAmount.toFixed(2)}</div>
    </div>

    <div style="margin-top:20px; display:flex; gap:10px;">
      <select id="statusUpdate" class="form-control" style="flex:1;">
        <option value="pending_payment">Pending Payment</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button class="btn btn-primary" id="updateStatusBtn">Update Status</button>
    </div>
  `;

  document.getElementById("statusUpdate").value = order.status;

  document
    .getElementById("updateStatusBtn")
    .addEventListener("click", () => updateOrderStatus(order._id));

  orderModal.style.display = "flex";
}

// ====== UPDATE STATUS ======
async function updateOrderStatus(orderId) {
  const newStatus = document.getElementById("statusUpdate").value;
  const token = localStorage.getItem("token");

  try {
    await axios.put(
      `/orders/${orderId}`,
      { status: newStatus },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );

    alert("Order status updated successfully!");
    closeModal();
    loadOrdersBtn.click();
  } catch (error) {
    console.error("Error updating order:", error.response?.data || error);
    alert("Failed to update order status");
  }
}

function editOrder(order) {
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-US");

  modalBody.innerHTML = `
    <h3>Edit Order</h3>

    <div style="margin-bottom:10px;">
      <strong>Order ID:</strong> ${order._id}
    </div>

    <div style="margin-bottom:10px;">
      <strong>Date:</strong> ${formattedDate}
    </div>

    <div style="margin-bottom:10px;">
      <label>Status</label>
      <select id="editStatus" class="form-control">
        <option value="pending_payment">Pending Payment</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div style="margin-bottom:10px;">
      <label>Shipping Address</label>
      <input 
        type="text" 
        id="editAddress" 
        class="form-control"
        value="${order.deliveryAddress || ""}"
      />
    </div>

    <div style="margin-top:20px; display:flex; gap:10px;">
      <button class="btn btn-primary" id="saveEditBtn">Save Changes</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;

  // Preselect current status
  document.getElementById("editStatus").value = order.status;

  // Save button event
  document
    .getElementById("saveEditBtn")
    .addEventListener("click", () => saveEditedOrder(order._id));

  orderModal.style.display = "flex";
}
async function saveEditedOrder(orderId) {
  const token = localStorage.getItem("token");

  const updatedData = {
    status: document.getElementById("editStatus").value,
    deliveryAddress: document.getElementById("editAddress").value,
  };

  try {
    await axios.put(`/orders/${orderId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Order updated successfully!");
    closeModal();
    loadOrdersBtn.click();
  } catch (error) {
    console.error("Error updating order:", error.response?.data || error);
    alert("Failed to update order");
  }
}

function printOrder(order) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Popup blocked! Please allow popups for this site.");
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${order._id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
        }
        h2 {
          margin-bottom: 5px;
        }
        h3 {
          margin-top: 0;
          color: gray;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        table, th, td {
          border: 1px solid #ddd;
        }
        th, td {
          padding: 10px;
          text-align: left;
        }
        .total {
          text-align: right;
          margin-top: 20px;
          font-size: 18px;
          font-weight: bold;
        }
          .logo {
          height: 72px;
        }
      </style>
    </head>
    <body>
    
      <div class="header">
        <img src="https://res.cloudinary.com/deoqw88yb/image/upload/v1770563166/Copilot_20260208_160543_ksmmbp.png" class="logo" />

        <div class="company-info">
          <h2>Sambethel Taste Bakery</h2>
          <div>Freshly Baked Happiness</div>
        </div>
      </div>
      <h3>Order Invoice</h3>

      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Customer:</strong> ${order.user?.username || "N/A"}</p>
      <small>${order.user?.phoneNumber || "N/A"}</small><br>
  <small>Shipping: ${order.deliveryAddress || "N/A"}</small>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.products
            .map(
              (item) => `
            <tr>
              <td>${item.product}</td>
              <td>${item.quantity}</td>
              <td>₦${(item.price || 0).toFixed(2)}</td>
              <td>₦${((item.price || 0) * item.quantity).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="total">
  Grand Total: ₦${order.totalAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</div>


    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();

  // ✅ Wait for content to load before printing
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

// ====== MODAL & LOGOUT ======
function closeModal() {
  orderModal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target === orderModal) closeModal();
};

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});
