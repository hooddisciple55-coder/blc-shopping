const demoProducts = [
  {id:"1",name:"Wireless Headphones",category:"Electronics",price:12500,emoji:"🎧",seller:"BLC Finds"},
  {id:"2",name:"Smart Watch",category:"Electronics",price:18500,emoji:"⌚",seller:"Tech Store"},
  {id:"3",name:"Casual Sneakers",category:"Fashion",price:22000,emoji:"👟",seller:"Street Style"},
  {id:"4",name:"Everyday Backpack",category:"Fashion",price:14500,emoji:"🎒",seller:"Bag World"},
  {id:"5",name:"Skin Care Set",category:"Beauty",price:9800,emoji:"🧴",seller:"Glow Store"},
  {id:"6",name:"Bluetooth Speaker",category:"Electronics",price:16500,emoji:"🔊",seller:"Sound Spot"},
  {id:"7",name:"Table Lamp",category:"Home & Living",price:11500,emoji:"💡",seller:"Home Store"},
  {id:"8",name:"Fresh Grocery Bundle",category:"Food & Grocery",price:8900,emoji:"🥑",seller:"Fresh Market"},
  {id:"9",name:"Football",category:"Sports",price:12000,emoji:"⚽",seller:"Sport Shop"},
  {id:"10",name:"Classic T-shirt",category:"Fashion",price:7500,emoji:"👕",seller:"Basics Store"},
  {id:"11",name:"Gaming Controller",category:"Electronics",price:32000,emoji:"🎮",seller:"Game Plug"},
  {id:"12",name:"Kitchen Essentials",category:"Home & Living",price:18000,emoji:"🍳",seller:"Kitchen Hub"}
];

let products = [...demoProducts];
let cart = [];
let currentCategory = "All";

const $ = id => document.getElementById(id);
const naira = n => "₦" + Number(n).toLocaleString("en-NG");
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[c]));

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.style.display = "none", 2500);
}

async function loadProducts() {
  try {
    const response = await fetch("/api/listings");
    if (response.ok) {
      const data = await response.json();
      products = [...(data.listings || []), ...demoProducts];
    }
  } catch (error) {
    // Demo products still display if the API is unavailable.
  }
  renderProducts();
}

function renderProducts() {
  const query = $("search").value.trim().toLowerCase();
  let list = products.filter(p =>
    (currentCategory === "All" || p.category === currentCategory) &&
    `${p.name} ${p.category} ${p.seller || ""}`.toLowerCase().includes(query)
  );

  if ($("sort").value === "low") list.sort((a,b) => a.price - b.price);
  if ($("sort").value === "high") list.sort((a,b) => b.price - a.price);

  $("heading").textContent = currentCategory === "All"
    ? "Popular Products" : currentCategory;

  $("products").innerHTML = list.map(p => `
    <article class="product">
      <div class="product-image">
        ${p.image
          ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.remove()">`
          : `<span>${escapeHTML(p.emoji || "🛍️")}</span>`}
      </div>
      <div class="product-info">
        <h3>${escapeHTML(p.name)}</h3>
        <div class="seller">Sold by ${escapeHTML(p.seller || "BLC Seller")}</div>
        <div class="price">${naira(p.price)}</div>
        <div class="rating">★ ${Number(p.rating || 4.5).toFixed(1)}</div>
        <button class="add" data-add="${escapeHTML(p.id)}">Add to Cart</button>
      </div>
    </article>
  `).join("");

  $("empty").hidden = list.length > 0;
}

function openModal(title, html) {
  $("modalTitle").textContent = title;
  $("modalContent").innerHTML = html;
  $("modal").hidden = false;
}

function closeModal() {
  $("modal").hidden = true;
}

function updateCartCount() {
  $("cartCount").textContent = cart.reduce((sum, p) => sum + p.qty, 0);
}

function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;

  const existing = cart.find(p => String(p.id) === String(id));
  if (existing) existing.qty++;
  else cart.push({...product, qty:1});

  updateCartCount();
  showToast("Product added to cart!");
}

function showCart() {
  if (!cart.length) {
    openModal("Your Cart", "<p>Your cart is empty. Browse products and add something you like!</p>");
    return;
  }

  const total = cart.reduce((sum,p) => sum + p.price * p.qty, 0);

  openModal("Your Cart", `
    ${cart.map(p => `
      <div class="cart-row">
        <div>
          <strong>${escapeHTML(p.emoji || "🛍️")} ${escapeHTML(p.name)}</strong><br>
          ${naira(p.price)} × ${p.qty}
          <div>
            <button data-qty="${escapeHTML(p.id)}" data-delta="-1">−</button>
            <button data-qty="${escapeHTML(p.id)}" data-delta="1">+</button>
            <button data-remove="${escapeHTML(p.id)}">Remove</button>
          </div>
        </div>
        <strong>${naira(p.price * p.qty)}</strong>
      </div>
    `).join("")}
    <h3>Total: ${naira(total)}</h3>
    <p>Demo products are for preview. Online checkout is available for published seller listings after payment setup.</p>
    <button class="primary full-button" id="checkout">Continue to Checkout</button>
  `);
}

function showSellerForm() {
  openModal("Sell on BLC Shopping", `
    <p>List a product for a fee of <strong>₦3,000 per product.</strong></p>
    <form id="sellerForm">
      <div class="field">
        <label>Store name</label>
        <input name="seller" required maxlength="70" placeholder="Your store name">
      </div>
      <div class="field">
        <label>Email address</label>
        <input name="email" type="email" required placeholder="you@example.com">
      </div>
      <div class="field">
        <label>Product name</label>
        <input name="name" required maxlength="100" placeholder="Product name">
      </div>
      <div class="field">
        <label>Category</label>
        <select name="category" required>
          <option value="">Choose category</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Home & Living</option>
          <option>Beauty</option>
          <option>Food & Grocery</option>
          <option>Sports</option>
          <option>Other</option>
        </select>
      </div>
      <div class="field">
        <label>Price in naira</label>
        <input name="price" type="number" min="100" required placeholder="15000">
      </div>
      <div class="field">
        <label>Stock quantity</label>
        <input name="stock" type="number" min="1" required value="1">
      </div>
      <div class="field">
        <label>Product image URL (optional)</label>
        <input name="image" type="url" placeholder="https://example.com/photo.jpg">
      </div>
      <div class="field">
        <label>Product description</label>
        <textarea name="description" required placeholder="Describe your product"></textarea>
      </div>
      <button class="primary full-button" type="submit">Pay ₦3,000 Listing Fee</button>
    </form>
  `);
}

document.addEventListener("click", async event => {
  const add = event.target.closest("[data-add]");
  if (add) {
    addToCart(add.dataset.add);
    return;
  }

  const quantity = event.target.closest("[data-qty]");
  if (quantity) {
    const item = cart.find(p => String(p.id) === quantity.dataset.qty);
    if (item) {
      item.qty += Number(quantity.dataset.delta);
      if (item.qty <= 0) cart = cart.filter(p => p !== item);
    }
    updateCartCount();
    showCart();
    return;
  }

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    cart = cart.filter(p => String(p.id) !== remove.dataset.remove);
    updateCartCount();
    showCart();
    return;
  }

  const category = event.target.closest("[data-category]");
  if (category) {
    currentCategory = category.dataset.category;
    renderProducts();
    return;
  }

  if (event.target.closest("#sellButton, #sellBanner")) showSellerForm();
  if (event.target.closest("#cartButton")) showCart();
  if (event.target.closest("#closeModal")) closeModal();

  if (event.target.closest("#shopNow")) {
    document.querySelector(".section").scrollIntoView({behavior:"smooth"});
  }

  if (event.target.closest("#checkout")) {
    const liveItems = cart.filter(p => !String(p.id).match(/^\d+$/));
    if (!liveItems.length) {
      showToast("Demo products cannot be checked out. Try a published seller product.");
      return;
    }
    showCheckoutForm(liveItems);
  }
});

function showCheckoutForm(items) {
  const total = items.reduce((sum,p) => sum + p.price*p.qty, 0);

  openModal("Checkout", `
    <form id="checkoutForm">
      <div class="field"><label>Full name</label><input name="name" required></div>
      <div class="field"><label>Email</label><input name="email" type="email" required></div>
      <div class="field"><label>Phone number</label><input name="phone" required></div>
      <div class="field"><label>Delivery address</label><textarea name="address" required></textarea></div>
      <h3>Total: ${naira(total)}</h3>
      <button class="primary full-button" type="submit">Pay Securely</button>
    </form>
  `);
}

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  renderProducts();
});
$("search").addEventListener("input", renderProducts);
$("sort").addEventListener("change", renderProducts);
$("closeModal").addEventListener("click", closeModal);

$("modal").addEventListener("click", event => {
  if (event.target === $("modal")) closeModal();
});

document.addEventListener("submit", async event => {
  if (event.target.id === "sellerForm") {
    event.preventDefault();
    const form = new FormData(event.target);
    const product = Object.fromEntries(form.entries());
    product.price = Number(product.price);
    product.stock = Number(product.stock);

    try {
      const response = await fetch("/api/seller-fee", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(product)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start payment.");
      location.href = data.authorization_url;
    } catch (error) {
      showToast(error.message || "Start the server and configure Paystack first.");
    }
  }

  if (event.target.id === "checkoutForm") {
    event.preventDefault();
    const form = new FormData(event.target);
    const customer = Object.fromEntries(form.entries());
    const items = cart
      .filter(p => !String(p.id).match(/^\d+$/))
      .map(p => ({id:p.id, quantity:p.qty}));

    try {
      const response = await fetch("/api/order-payment", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...customer, items})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start payment.");
      location.href = data.authorization_url;
    } catch (error) {
      showToast(error.message || "Configure Paystack to enable checkout.");
    }
  }
});

loadProducts();