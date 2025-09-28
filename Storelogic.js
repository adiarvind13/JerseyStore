// This script provides core functionality for the JerseyStore website,
// including cart management and search filtering.

document.addEventListener('DOMContentLoaded', () => {

  // --- Cart Functionality ---
  
  // Get all "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll('.btn.primary');
  // Get the cart icon element
  const cartIcon = document.querySelector('.cart');
  // Get the cart count element, if it exists
  let cartCountSpan = document.querySelector('.cart-count');
  const cartContainer = document.getElementById('cart-items-container');
  const totalPriceElement = document.querySelector('.total-price');
  
  // Create a cart count element if it doesn't exist
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

  // Function to update the cart count display
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

  // Function to add a product to the cart
  function addToCart(event) {
    const productCard = event.target.closest('.card, .jersey-card, .product-box');
    if (!productCard) return;

    const productName = productCard.querySelector('h3, h2').textContent;
    const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
    const productImage = productCard.querySelector('img').src;

    // Get cart from local storage or initialize as an empty array
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product is already in the cart
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

    // Save cart back to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart count display
    updateCartCount();

    // Show a success message
    showNotification(`${productName} added to cart!`);
  }
  
  // Function to render cart items on the cart page
  function renderCart() {
    if (!cartContainer) return; // Exit if not on the cart page

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartContainer.innerHTML = ''; // Clear existing items
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
    
    // Update the total price
    if (totalPriceElement) {
      totalPriceElement.textContent = `$${total.toFixed(2)}`;
    }
  }

  // Handle quantity changes and removal from cart
  if (cartContainer) {
    cartContainer.addEventListener('click', (event) => {
      const target = event.target;
      const itemName = target.dataset.name;
      let cart = JSON.parse(localStorage.getItem('cart')) || [];

      if (target.classList.contains('increase-btn')) {
        const item = cart.find(i => i.name === itemName);
        if (item) {
          item.quantity++;
        }
      } else if (target.classList.contains('decrease-btn')) {
        const item = cart.find(i => i.name === itemName);
        if (item && item.quantity > 1) {
          item.quantity--;
        }
      } else if (target.classList.contains('remove-btn')) {
        cart = cart.filter(i => i.name !== itemName);
        showNotification(`${itemName} removed from cart.`);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  }

  // Initial cart rendering on cart page load
  renderCart();

  // Add click event listener to all "Add to Cart" buttons
  addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });

  // Initial cart count update on page load
  updateCartCount();

  // --- Search Functionality ---

  const searchInput = document.querySelector('.search');
  const allCards = document.querySelectorAll('.card, .jersey-card, .product-box');

  searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Check if on a product page
    if (allCards.length > 0) {
      allCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        if (cardText.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  });

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

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000); // Remove the notification after 3 seconds
  }
});
