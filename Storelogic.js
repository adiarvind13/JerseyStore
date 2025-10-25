// ===== SHOP PAGE LOGIC =====
const cards = document.querySelectorAll('.jersey-grid .card');

cards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'button') e.stopPropagation();

    const product = {
      img: card.querySelector('img').src,
      name: card.querySelector('h3').innerText,
      price: card.querySelector('.price').innerText,
      rating: card.querySelector('.rating').innerText,
      desc: "Official football jersey"
    };

    const query = new URLSearchParams(product).toString();
    window.location.href = `product.html?${query}`;
  });
});

// ===== PRODUCT PAGE LOGIC =====
function loadProductFromURL() {
  const params = new URLSearchParams(window.location.search);

  const img = params.get('img');
  const name = params.get('name');
  const price = params.get('price');
  const rating = params.get('rating');
  const desc = params.get('desc');

  if (img) document.getElementById('product-img').src = img;
  if (name) document.getElementById('product-name').innerText = name;
  if (price) document.getElementById('product-price').innerText = price;
  if (rating) document.getElementById('product-rating').innerText = rating;
  if (desc) document.getElementById('product-desc').innerText = desc;
}

if (document.getElementById('product-name')) {
  loadProductFromURL();
}

// ===== MAIN SITE LOGIC =====
document.addEventListener('DOMContentLoaded', () => {

  // --- Cart Functionality ---
  const addToCartButtons = document.querySelectorAll('.btn.primary');
  const cartIcon = document.querySelector('.cart');
  let cartCountSpan = document.querySelector('.cart-count');
  const cartContainer = document.getElementById('cart-items-container');
  const totalPriceElement = document.querySelector('.total-price');

  // Create cart count if missing
  if (!cartCountSpan) {
    cartCountSpan = document.createElement('span');
    cartCountSpan.classList.add('cart-count');
    cartCountSpan.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #f00;
      color: #fff;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: bold;
      display: none;
    `;
    cartIcon.style.position = 'relative';
    cartIcon.appendChild(cartCountSpan);
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
      cartCountSpan.textContent = totalItems;
      cartCountSpan.style.display = 'block';
    } else {
      cartCountSpan.style.display = 'none';
    }
  }

  function addToCart(event) {
    const productCard = event.target.closest('.card, .jersey-card, .product-box');
    if (!productCard) return;

    const productName = productCard.querySelector('h3, h2').textContent;
    const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
    const productImage = productCard.querySelector('img').src;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateMiniCartPreview(); // <-- NEW
    showNotification(`${productName} added to cart!`);
  }

  function renderCart() {
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      cartContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty. Start shopping now!</p>';
    } else {
      cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-price">$${item.price.toFixed(2)}</p>
          </div>
          <div class="item-quantity">
            <button class="quantity-btn decrease-btn" data-name="${item.name}">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn increase-btn" data-name="${item.name}">+</button>
          </div>
          <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
          <button class="remove-btn" data-name="${item.name}">Remove</button>
        `;
        cartContainer.appendChild(itemElement);
        total += item.price * item.quantity;
      });
    }

    if (totalPriceElement) {
      totalPriceElement.textContent = `$${total.toFixed(2)}`;
    }
  }

  if (cartContainer) {
    cartContainer.addEventListener('click', (event) => {
      const target = event.target;
      const itemName = target.dataset.name;
      let cart = JSON.parse(localStorage.getItem('cart')) || [];

      if (target.classList.contains('increase-btn')) {
        const item = cart.find(i => i.name === itemName);
        if (item) item.quantity++;
      } else if (target.classList.contains('decrease-btn')) {
        const item = cart.find(i => i.name === itemName);
        if (item && item.quantity > 1) item.quantity--;
      } else if (target.classList.contains('remove-btn')) {
        cart = cart.filter(i => i.name !== itemName);
        showNotification(`${itemName} removed from cart.`);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      updateMiniCartPreview(); // <-- NEW
      renderCart();
    });
  }

  renderCart();
  addToCartButtons.forEach(button => button.addEventListener('click', addToCart));
  updateCartCount();

  // --- MINI CART PREVIEW ---
  const cartPreview = document.querySelector('.cart-preview');
  const previewList = document.getElementById('cart-items');
  const previewTotal = document.querySelector('.cart-total');

  function updateMiniCartPreview() {
    if (!cartPreview) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
      previewList.innerHTML = '<li>No items added yet</li>';
      previewTotal.textContent = 'Total: $0';
      return;
    }

    previewList.innerHTML = cart
  .map(item => `
    <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
      <img src="${item.image}" alt="${item.name}" 
           style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">
      <div style="flex: 1;">
        <p style="margin: 0; font-size: 13px;">x${item.quantity}</p>
        <p style="margin: 0; font-size: 12px; color: gray;">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </li>
  `)
  .join('');

  // Handle "View Cart" button click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('view-cart-btn')) {
    window.location.href = 'cart.html';
  }
});

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    previewTotal.textContent = `Total: $${total.toFixed(2)}`;
  }

  updateMiniCartPreview();

  // --- Search Functionality ---
  const searchInput = document.querySelector('.search');
  const allCards = document.querySelectorAll('.card, .jersey-card, .product-box');

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const searchTerm = event.target.value.toLowerCase();
      if (allCards.length > 0) {
        allCards.forEach(card => {
          const cardText = card.textContent.toLowerCase();
          card.style.display = cardText.includes(searchTerm) ? 'block' : 'none';
        });
      }
    });
  }

  // --- Notification Message ---
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      animation: fadein 0.5s, fadeout 0.5s 2.5s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
});
