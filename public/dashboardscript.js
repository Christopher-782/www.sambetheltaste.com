// Store Application
let cart = [];
let currentUser = null;
let products = [];

// Initialize the store
document.addEventListener("DOMContentLoaded", function () {
  // Load or create current user
  loadCurrentUser();

  // Load products
  loadProducts();

  // Load cart from localStorage
  loadCart();

  // Setup event listeners
  setupEventListeners();
});

// Load or create current user
function loadCurrentUser() {
  // Check if user exists in localStorage
  const storedUser = localStorage.getItem("sambethel_user");

  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  } else {
    // Create a new user for demo
    currentUser = {
      id: "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      name: "Demo Customer",
      email: "demo@sambetheltaste.com",
      phone: "+2348012345678",
      joinDate: new Date().toISOString(),
      location: "Lagos, Nigeria",
    };

    // Save user to localStorage
    localStorage.setItem("sambethel_user", JSON.stringify(currentUser));
  }

  // Update UI with user info
  document.getElementById("user-id-display").textContent =
    currentUser.id.substring(0, 12) + "...";
  document.getElementById("user-id-modal").textContent = currentUser.id;
}

// Load products (mock data for demo with Naira prices)
async function loadProducts() {
  try {
    const response = await axios.get("/products");
    products = response.data.products;
    displayProducts(products);
  } catch (error) {
    console.error("Failed to load products", error);
  }
}

// Display all products initially
// displayProducts(products);

// Display products in the grid
function displayProducts(productsToShow) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  if (productsToShow.length === 0) {
    productList.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">
                            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                            <h3>No products found</h3>
                            <p>Try selecting a different category.</p>
                        </div>
                    `;
    return;
  }

  productsToShow.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <div class="product-details">
                            <h3 class="product-name">${product.name}</h3>
                            <span class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                            <p class="product-price">${product.price.toLocaleString()}</p>
                            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 15px;">${product.description}</p>
                            <div class="product-controls">
                                <input type="number" min="1" max="20" value="1" id="qty-${product.id}" class="quantity-input">
                                <button onclick="addToCart('${product.id}')" class="add-to-cart-btn">
                                    <i class="fas fa-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    `;

    productList.appendChild(productCard);
  });
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem("sambethel_cart");

  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("sambethel_cart", JSON.stringify(cart));
}

// Add product to cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);

  if (!product) {
    showNotification("Product not found", "error");
    return;
  }

  const quantityInput = document.getElementById(`qty-${productId}`);
  const quantity = parseInt(quantityInput.value) || 1;

  // Check if product is already in cart
  const existingItemIndex = cart.findIndex((item) => item.id === productId);

  if (existingItemIndex > -1) {
    // Update quantity
    cart[existingItemIndex].quantity += quantity;
    showNotification(
      `${product.name} quantity updated to ${cart[existingItemIndex].quantity}`,
      "success",
    );
  } else {
    // Add new item
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      quantity: quantity,
    });
    showNotification(`${product.name} added to cart`, "success");
  }

  // Reset quantity input
  quantityInput.value = 1;

  // Update cart display and save
  updateCartDisplay();
  saveCart();
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartDisplay();
  saveCart();
  showNotification("Item removed from cart", "info");
}

// Update cart item quantity
function updateCartQuantity(productId, change) {
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex > -1) {
    const newQuantity = cart[itemIndex].quantity + change;

    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    cart[itemIndex].quantity = newQuantity;
    updateCartDisplay();
    saveCart();
  }
}

// Update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const cartSummary = document.getElementById("cart-summary");
  const checkoutBtn = document.getElementById("checkout");
  const cartCount = document.getElementById("cart-count");

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? "flex" : "none";

  // Handle empty cart
  if (cart.length === 0) {
    cartItems.innerHTML = `
                        <div class="empty-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <h3>Your cart is empty</h3>
                            <p>Add some delicious bakery items to get started!</p>
                        </div>
                    `;

    cartSummary.innerHTML = "";
    checkoutBtn.disabled = true;
    return;
  }

  // Render cart items
  cartItems.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-details">
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                                </div>
                                <div class="cart-item-price">${itemTotal.toLocaleString()}</div>
                                <button class="remove-item" onclick="removeFromCart('${item.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;

    cartItems.appendChild(cartItem);
  });

  // Calculate totals in Naira
  const deliveryFee = subtotal > 100000 ? 0 : 1500; // Free delivery over ₦10,000
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + deliveryFee + tax;

  // Render summary
  cartSummary.innerHTML = `
                    <div class="cart-totals">
                        <div class="cart-total-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div class="cart-total-row">
                            <span>Delivery Fee</span>
                            <span>${deliveryFee === 0 ? "FREE" : deliveryFee.toLocaleString()}</span>
                        </div>
                        <div class="cart-total-row">
                            <span>VAT (7.5%)</span>
                            <span>${tax.toLocaleString()}</span>
                        </div>
                        <div class="cart-total-row total">
                            <span>Total</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                    </div>
                `;

  checkoutBtn.disabled = false;

  // Update total amount in checkout modal
  document.getElementById("total-amount").textContent = total.toLocaleString();
}

// Helper: generate valid MongoDB ObjectId for testing
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx".replace(/[x]/g, () =>
      Math.floor(Math.random() * 16).toString(16),
    )
  ).toLowerCase();
}

async function checkout() {
  try {
    const deliveryAddress = prompt("Enter Delivery Address:");

    if (!currentUser) {
      showNotification("Please login first", "error");
      return;
    }

    if (!cart || cart.length === 0) {
      showNotification("Your cart is empty!", "error");
      return;
    }

    const productsPayload = cart.map((item) => ({
      product: item._id || item.id || generateObjectId(),
      quantity: item.quantity || 1,
    }));

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

    const deliveryFee = subtotal > 10000 ? 0 : 1500;
    const tax = subtotal * 0.075;
    const totalAmount = subtotal + deliveryFee + tax;

    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Please login first", "error");
      return;
    }

    const res = await axios.post(
      "/orders",
      {
        products: productsPayload,
        subtotal,
        deliveryFee,
        tax,
        totalAmount,
        deliveryAddress,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { orderId, order } = res.data;

    saveOrderToHistory({
      orderId,
      products: productsPayload,
      totalAmount,
      date: order.date,
    });

    showNotification("Order placed successfully!", "success");

    cart = [];
    saveCart();
    updateCartDisplay();
    showCheckoutModal(
      {
        orderId: orderId,
        accountNumber: order.accountNumber || "500001535",
        bankName: order.bankName || "Asset Matrix MFB",
      },
      totalAmount,
    );
  } catch (err) {
    console.error("Checkout failed:", err.response?.data || err.message);

    let message = "Checkout failed. Please try again.";

    if (err.response?.data?.message) {
      message = err.response.data.message;
    }

    showNotification(message, "error");
  }
}

// Simulate order API call
async function simulateOrderAPI(orderData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock response
  return {
    success: true,
    orderId: orderData.orderId,
    accountNumber: orderData.paymentAccount,
    message: "Order placed successfully!",
  };
}

// Save order to user's history
function saveOrderToHistory(orderData) {
  const userOrders =
    JSON.parse(localStorage.getItem(`sambethel_orders_${currentUser.id}`)) ||
    [];
  userOrders.push(orderData);
  localStorage.setItem(
    `sambethel_orders_${currentUser.id}`,
    JSON.stringify(userOrders),
  );
}

// Show checkout modal
function showCheckoutModal(orderResponse, totalAmount) {
  const modal = document.getElementById("checkout-modal");
  const accountNumber = document.getElementById("account-number");
  const bankName = document.getElementById("bank-name");
  const orderNumber = document.getElementById("order-number");
  const totalAmountElement = document.getElementById("total-amount");

  if (modal) {
    accountNumber.textContent = orderResponse.accountNumber;
    bankName.textContent = orderResponse.bankName || "Asset Matrix MFB";
    orderNumber.textContent = orderResponse.orderId;
    totalAmountElement.textContent = totalAmount.toLocaleString();
    modal.classList.add("active");
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById("checkout-modal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
                    <span>${message}</span>
                    <button onclick="this.parentElement.remove()">&times;</button>
                `;

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Category filter buttons
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Update active button
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Filter products
      const category = this.dataset.category;
      if (category === "all") {
        displayProducts(products);
      } else {
        const filteredProducts = products.filter(
          (p) => p.category === category,
        );
        displayProducts(filteredProducts);
      }
    });
  });

  // Checkout button
  document.getElementById("checkout").addEventListener("click", checkout);

  // Cart icon click
  document.getElementById("cart-icon").addEventListener("click", function () {
    // Scroll to cart section
    document
      .querySelector(".cart-section")
      .scrollIntoView({ behavior: "smooth" });
  });

  // Modal close buttons
  document
    .querySelectorAll(".close-modal, .modal-btn.cancel")
    .forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

  // Close modal when clicking outside
  const modalOverlay = document.getElementById("checkout-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }
}

// Format number with Nigerian formatting (thousands separators)
Number.prototype.toNairaString = function () {
  return "₦" + this.toLocaleString("en-NG");
};
