document.addEventListener("DOMContentLoaded", () => {
  const ordersTableBody = document.querySelector("#orderTable tbody");
  const totalCountEl = document.getElementById("totalCount");
  const totalValueEl = document.getElementById("totalValue");
  const avgValueEl = document.getElementById("avgValue");
  const refreshBtn = document.getElementById("refreshBtn");
  const reportDateEl = document.getElementById("reportDate");
  const lastRefreshEl = document.getElementById("lastRefresh");
  const summaryCardsContainer = document.querySelector(".summary-cards");

  let orders = [];
  let chart1, chart2;

  const statusConfig = {
    pending_payment: { name: "Pending", color: "#ffc107" },
    processing: { name: "Processing", color: "#17a2b8" },
    shipped: { name: "Shipped", color: "#28a745" },
    delivered: { name: "Delivered", color: "#20c997" },
    cancelled: { name: "Cancelled", color: "#dc3545" },
    refunded: { name: "Refunded", color: "#6c757d" },
  };

  // Fetch orders from backend
  async function fetchOrders() {
    try {
      // Get the token from localStorage (already set on admin login)
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first!");
        return;
      }

      const res = await axios.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      orders = res.data?.orders || [];
      displayOrders();
      updateSummary();
      updateCharts();
      updateReportDate();
      updateLastRefresh();
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized! Please login again.");
      } else {
        alert("Could not load orders");
      }
    }
  }

  // Display orders in table
  function displayOrders() {
    ordersTableBody.innerHTML = "";
    if (!orders.length) {
      ordersTableBody.innerHTML =
        '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
      return;
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const products = order.products
        .map((p) => `${p.product} (x${p.quantity})`)
        .join(", ");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order._id}</td>
        <td>${order.user?.username || "N/A"}</td>
        <td>${products}</td>
        <td>₦${order.totalAmount.toLocaleString()}</td>
        <td>${order.status.replace("_", " ").toUpperCase()}</td>
        <td>${orderDate}</td>
      `;
      ordersTableBody.appendChild(row);
    });
  }

  // Update summary cards and totals
  function updateSummary() {
    // Reset summary container
    summaryCardsContainer.innerHTML = "";

    const summary = {};
    Object.keys(statusConfig).forEach(
      (s) => (summary[s] = { count: 0, total: 0 }),
    );

    let totalOrders = 0;
    let totalValue = 0;

    orders.forEach((order) => {
      if (summary[order.status]) {
        summary[order.status].count++;
        summary[order.status].total += order.totalAmount;
        totalOrders++;
        totalValue += order.totalAmount;
      }
    });

    // Update summary cards
    Object.keys(summary).forEach((status) => {
      const data = summary[status];
      const config = statusConfig[status];
      const card = document.createElement("div");
      card.className = "card";
      card.style.borderLeft = `4px solid ${config.color}`;
      card.innerHTML = `
        <div class="card-title">${config.name}</div>
        <div class="card-value">${data.count}</div>
        <div class="card-subtitle">Orders</div>
        <div class="card-total">₦${data.total.toLocaleString()}</div>
      `;
      summaryCardsContainer.appendChild(card);
    });

    // Update totals in table footer
    totalCountEl.textContent = totalOrders;
    totalValueEl.textContent = `₦${totalValue.toLocaleString()}`;
    avgValueEl.textContent =
      totalOrders > 0
        ? `₦${(totalValue / totalOrders).toLocaleString()}`
        : "₦0";
  }

  // Update charts using Chart.js
  function updateCharts() {
    const labels = Object.keys(statusConfig).map((s) => statusConfig[s].name);
    const counts = Object.keys(statusConfig).map(
      (s) => orders.filter((o) => o.status === s).length,
    );
    const colors = Object.keys(statusConfig).map((s) => statusConfig[s].color);

    const ctx1 = document.getElementById("orderChart").getContext("2d");
    const ctx2 = document.getElementById("valueChart").getContext("2d");

    if (chart1) chart1.destroy();
    if (chart2) chart2.destroy();

    chart1 = new Chart(ctx1, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: counts, backgroundColor: colors }],
      },
    });

    const values = Object.keys(statusConfig).map((s) =>
      orders
        .filter((o) => o.status === s)
        .reduce((sum, o) => sum + o.totalAmount, 0),
    );

    chart2 = new Chart(ctx2, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Value (₦)",
            data: values,
            backgroundColor: colors.map((c) => c + "80"),
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });
  }

  // Update report generation date
  function updateReportDate() {
    reportDateEl.textContent = new Date().toLocaleString();
  }

  function updateLastRefresh() {
    lastRefreshEl.textContent = new Date().toLocaleTimeString();
  }

  // Refresh button click
  refreshBtn.addEventListener("click", fetchOrders);

  // Initial load
  fetchOrders();
});
