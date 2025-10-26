// ===== PRODUCT PAGE LOGIC =====
// This part stays at the top, outside the listener.
function loadProductFromURL() {
  const params = new URLSearchParams(window.location.search);

  const img = params.get('img');
  const name = params.get('name');
  const price = params.get('price');      // This is the NEW price
  const oldPrice = params.get('oldPrice');  // Our new parameter
  const rating = params.get('rating');
  const desc = params.get('desc');

  if (img) document.getElementById('product-img').src = img;
  if (name) document.getElementById('product-name').innerText = name;

  // --- Updated Price Logic ---
  if (price) document.getElementById('product-price-new').innerText = price;

  const oldPriceEl = document.getElementById('product-price-old');
  if (oldPrice && oldPriceEl) {
    oldPriceEl.innerText = oldPrice;
    oldPriceEl.style.display = 'inline'; // Show the element
  }
  // --- End Updated Price Logic ---

  if (rating) document.getElementById('product-rating').innerText = rating;
  if (desc) document.getElementById('product-desc').innerText = desc;
}


if (document.getElementById('product-name')) {
  loadProductFromURL();
}

// ===== MAIN SITE LOGIC =====
// ALL your page logic goes inside this ONE listener
document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // ===== NEW: HOMEPAGE HERO SCROLL =====
  // =========================================================

  // Find the hero button specifically on the homepage
  const heroShopNowBtn = document.querySelector('.hero .buttons .btn.primary');
  const shopByLeagueSection = document.querySelector('.shop-by-league');

  if (heroShopNowBtn && shopByLeagueSection) {
    heroShopNowBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Good practice
      // Scroll smoothly to the target section
      shopByLeagueSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Aligns the top of the section to the top of the viewport
      });
    });
  }

  // =========================================================
  // ===== AUTHENTICATION CHECKS (GATEKEEPERS) =====
  // =========================================================

  const loggedInUser = sessionStorage.getItem('loggedInUser');
  const shippingForm = document.getElementById('shipping-form');
  const checkoutAuthBtn = document.getElementById('checkout'); // The button from cart.html
  const accountForm = document.getElementById('account-form');
  const ordersListContainer = document.getElementById('orders-list-container'); // For new My Orders page

  // --- 1. GATEKEEPER FOR CHECKOUT.HTML ---
  if (shippingForm && !loggedInUser) {
    sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
    window.location.href = 'login.html';
    return;
  }

  // --- 2. GATEKEEPER FOR ACCOUNT.HTML ---
  if (accountForm && !loggedInUser) {
    sessionStorage.setItem('redirectAfterLogin', 'account.html');
    window.location.href = 'login.html';
    return;
  }

  // --- 3. NEW: GATEKEEPER FOR MY-ORDERS.HTML ---
  if (ordersListContainer && !loggedInUser) {
    sessionStorage.setItem('redirectAfterLogin', 'my-orders.html');
    window.location.href = 'login.html';
    return;
  }


  // --- 4. LISTENER FOR CART.HTML "PROCEED TO CHECKOUT" BUTTON ---
  if (checkoutAuthBtn) {
    checkoutAuthBtn.addEventListener('click', () => {
      if (loggedInUser) {
        window.location.href = 'checkout.html';
      } else {
        sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
      }
    });
  }

  // =========================================================
  // ===== USER ACCOUNT & DROPDOWN LOGIC =====
  // =========================================================

  const loggedOutIcon = document.getElementById('profile-icon-logged-out');
  const loggedInDiv = document.getElementById('profile-logged-in');
  const userFirstName = document.getElementById('user-firstname');
  const profileGreetingBtn = document.getElementById('profile-greeting');
  const profileDropdown = document.getElementById('profile-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  // --- 1. Check Login Status on Page Load ---
  if (loggedInUser) {
    try {
      const user = JSON.parse(loggedInUser);
      if (user && user.fname) {
        // User is logged in
        if (userFirstName) userFirstName.textContent = user.fname;
        if (loggedOutIcon) loggedOutIcon.style.display = 'none';
        if (loggedInDiv) loggedInDiv.style.display = 'block';
      } else {
        sessionStorage.removeItem('loggedInUser');
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      sessionStorage.removeItem('loggedInUser');
    }
  }

  // --- 2. Handle Dropdown Toggle ---
  if (profileGreetingBtn && profileDropdown) {
    profileGreetingBtn.addEventListener('click', () => {
      profileDropdown.classList.toggle('show');
      profileGreetingBtn.classList.toggle('active');
    });

    window.addEventListener('click', (event) => {
      if (!event.target.closest('.profile-container')) {
        if (profileDropdown.classList.contains('show')) {
          profileDropdown.classList.remove('show');
          profileGreetingBtn.classList.remove('active');
        }
      }
    });
  }

  // --- 3. Handle Logout Button ---
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('isAdmin');
      window.location.href = 'homepage.html';
    });
  }

  // --- 4. MY ACCOUNT PAGE LOGIC ---
  if (accountForm) {
    const user = JSON.parse(loggedInUser);

    // Get form fields
    const fnameInput = document.getElementById('acc-fname');
    const lnameInput = document.getElementById('acc-lname');
    const emailInput = document.getElementById('acc-email');
    const newPassInput = document.getElementById('acc-new-password');
    const confirmPassInput = document.getElementById('acc-confirm-password');
    const successMsg = document.getElementById('account-success-message');
    const errorMsg = document.getElementById('account-error-message');

    // --- Populate form with existing data ---
    fnameInput.value = user.fname;
    lnameInput.value = user.lname;
    emailInput.value = user.email;

    // --- Handle form submission ---
    accountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      successMsg.textContent = '';
      errorMsg.textContent = '';

      // Get all users from storage
      let allUsers = JSON.parse(localStorage.getItem('users')) || [];

      // Get new values from form
      const newFname = fnameInput.value.trim();
      const newLname = lnameInput.value.trim();
      const newEmail = emailInput.value.trim().toLowerCase();
      const newPassword = newPassInput.value;
      const confirmPassword = confirmPassInput.value;

      // --- Validation ---
      // 1. Check if new email is already taken by *another* user
      const emailInUse = allUsers.some(u => u.email === newEmail && u.email !== user.email);
      if (emailInUse) {
        errorMsg.textContent = 'That email address is already in use. Please choose another.';
        return;
      }

      // 2. Check if passwords are being updated and if they match
      if (newPassword || confirmPassword) {
        if (newPassword.length < 6) {
          errorMsg.textContent = 'Password must be at least 6 characters long.';
          return;
        }
        if (newPassword !== confirmPassword) {
          errorMsg.textContent = 'New passwords do not match. Please try again.';
          return;
        }
      }

      // --- All clear, update the user ---

      // Find the user in localStorage (using their *original* email)
      const userIndex = allUsers.findIndex(u => u.email === user.email);

      if (userIndex === -1) {
        // This shouldn't happen, but good to check
        errorMsg.textContent = 'Error finding your account. Please log out and log in again.';
        return;
      }

      // Update the user object
      const updatedUser = {
        ...allUsers[userIndex], // Keep old data
        fname: newFname,
        lname: newLname,
        email: newEmail,
        password: newPassword ? newPassword : allUsers[userIndex].password // Only update password if a new one was provided
      };

      // Save back to localStorage
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(allUsers));

      // Save back to sessionStorage (so they stay logged in with new details)
      sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

      // Update the "Hi, [Name]" in the navbar immediately
      if (userFirstName) userFirstName.textContent = newFname;

      // Update the original 'user' object in case they save again
      user.fname = newFname;
      user.lname = newLname;
      user.email = newEmail;

      // Clear password fields
      newPassInput.value = '';
      confirmPassInput.value = '';

      // Show success
      successMsg.textContent = 'Your account has been updated successfully!';
    });
  }

  // --- 5. NEW: "MY ORDERS" PAGE LOGIC ---
  if (ordersListContainer) {
    loadMyOrders(); // Call the new function
  }

  function loadMyOrders() {
    const user = JSON.parse(loggedInUser);
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];

    // Filter to get only this user's orders
    const myOrders = allOrders.filter(order => order.customer.email === user.email);

    if (myOrders.length === 0) {
      ordersListContainer.innerHTML = '<p>You have not placed any orders yet.</p>';
      return;
    }

    // Clear "Loading..." message
    ordersListContainer.innerHTML = '';

    // Sort to show newest orders first
    myOrders.reverse().forEach(order => {
      // 1. Format Date
      const orderDate = new Date(order.orderDate);
      const formattedDate = orderDate.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // 2. Calculate Estimated Delivery
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 7); // Add 7 days
      const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // 3. Create list of items
      const itemsHTML = order.items.map(item => `
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="order-item-details">
            <h4>${item.name}</h4>
            <p>
              ${item.size ? `Size: ${item.size} |` : ''} 
              Qty: ${item.quantity}
            </p>
          </div>
          <div class="order-item-price">
            ₹${(item.price * item.quantity).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>
      `).join('');

      // 4. Create the full order card
      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
      orderCard.innerHTML = `
        <div class="order-header">
          <div class="order-header-details">
            <strong>Order Placed:</strong>
            <span>${formattedDate}</span>
          </div>
          <div class="order-header-details">
            <strong>Order ID:</strong>
            <span>${order.orderId.substring(0, 15)}...</span>
          </div>
          <div class="order-total">
            Total: ₹${(order.totalAmount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>
        <div class="order-body">
          ${itemsHTML}
        </div>
        <div class="order-footer">
          Estimated Delivery: ${formattedDeliveryDate}
        </div>
      `;

      ordersListContainer.appendChild(orderCard);
    });
  }


  // ===============================================
  // ===== EXISTING LOGIC (Unchanged) =====
  // ===============================================

  // ===== SHOP PAGE LOGIC (Product Card Click) =====
  const cards = document.querySelectorAll('.jersey-grid .card');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'button') return;
      const imgEl = card.querySelector('img');
      const nameEl = card.querySelector('h3');
      const priceEl = card.querySelector('.price');
      const ratingEl = card.querySelector('.rating');
      const descEl = card.querySelector('.desc');

      const oldPriceEl = priceEl ? priceEl.querySelector('.old-price') : null;

      // Gets the new price (the text not in the 'old-price' span)
      const newPrice = priceEl ? priceEl.childNodes[0].textContent.trim() : '';
      // Gets the old price only if it exists
      const oldPrice = oldPriceEl ? oldPriceEl.innerText.trim() : '';

      const product = {
        img: imgEl ? imgEl.getAttribute('src') : '',
        name: nameEl ? nameEl.innerText.trim() : '',
        price: newPrice,     // <-- Sends the new price
        oldPrice: oldPrice,  // <-- Sends the old price as a new parameter
        rating: ratingEl ? ratingEl.innerText.trim() : '',
        desc: descEl ? descEl.innerText.trim() : 'Official football jersey'
      };
      const query = new URLSearchParams(product).toString();
      window.location.href = `product.html?${query}`;
    });
  });

  // ===== Size Guide Modal Logic =====
  const modal = document.getElementById('size-guide-modal');
  const openBtn = document.getElementById('open-size-guide');
  const closeBtn = document.querySelector('.close-modal-btn');

  if (modal && openBtn && closeBtn) {
    openBtn.onclick = function (e) {
      e.preventDefault();
      modal.style.display = "block";
    }
    closeBtn.onclick = function () {
      modal.style.display = "none";
    }
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }


  // --- Cart Functionality ---
  const addToCartButtons = document.querySelectorAll('.card .btn.primary, .jersey-card .btn.primary, .product-box .btn.primary');
  const cartIcon = document.querySelector('.cart');
  let cartCountSpan = document.querySelector('.cart-count');
  const cartContainer = document.getElementById('cart-items-container');
  const totalPriceElement = document.querySelector('.total-price');

  if (cartIcon && !cartCountSpan) {
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
    if (cartCountSpan) {
      if (totalItems > 0) {
        cartCountSpan.textContent = totalItems;
        cartCountSpan.style.display = 'block';
      } else {
        cartCountSpan.style.display = 'none';
      }
    }
  }

  function addToCart(event) {
    const productCard = event.target.closest('.card, .jersey-card, .product-box');
    if (!productCard) return;

    // --- Use the new IDs from product.html ---
    const productNameEl = productCard.querySelector('h3, h2, #product-name');
    const productPriceEl = productCard.querySelector('.price, #product-price-new'); // Find new price span

    if (!productNameEl || !productPriceEl) {
      console.error("Could not find product name or price element.");
      return;
    }

    const productName = productNameEl.textContent;

    // Handle either "₹4,899" or just "₹4,899"
    // Use childNodes[0] to get the first text node, which is the new price
    const priceText = productPriceEl.childNodes[0].textContent.replace('₹', '').replace(',', '').trim();
    const productPrice = parseFloat(priceText);

    const productImageEl = productCard.querySelector('img, #product-img');
    const productImage = productImageEl ? productImageEl.src : '';

    let productSize = null;
    let cartID = productName;

    const sizeSelect = productCard.querySelector('#size-select');
    const sizeError = productCard.querySelector('#size-error');

    if (sizeSelect) {
      productSize = sizeSelect.value;
      if (!productSize) {
        if (sizeError) sizeError.style.display = 'block';
        return;
      }
      if (sizeError) sizeError.style.display = 'none';
      cartID = `${productName} (${productSize})`;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === cartID);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({
        id: cartID,
        name: productName,
        price: productPrice,
        image: productImage,
        size: productSize,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${productName} ${productSize ? `(${productSize})` : ''} added to cart!`);
  }


  function renderCart() {
    if (!cartContainer) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartContainer.innerHTML = '';
    let total = 0;
    const checkoutButton = document.getElementById('checkout');

    if (cart.length === 0) {
      cartContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty. Start shopping now!</p>';
      if (checkoutButton) {
        checkoutButton.style.display = 'none';
      }
    } else {
      cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        const sizeHTML = item.size ? `<p class="item-size">Size: ${item.size}</p>` : '';
        itemElement.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="item-details">
            <h3>${item.name}</h3>
            ${sizeHTML} 
            <p class="item-price">₹${item.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
          </div>
          <div class="item-quantity">
            <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
          </div>
          <p class="item-total">₹${(item.price * item.quantity).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        `;
        cartContainer.appendChild(itemElement);
        total += item.price * item.quantity;
      });
      if (checkoutButton) {
        checkoutButton.style.display = 'block';
      }
    }
    if (totalPriceElement) {
      totalPriceElement.textContent = `₹${total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
  }

  if (cartContainer) {
    cartContainer.addEventListener('click', (event) => {
      const target = event.target;
      const itemID = target.dataset.id;
      if (!itemID) return;
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (target.classList.contains('increase-btn')) {
        const item = cart.find(i => i.id === itemID);
        if (item) item.quantity++;
      } else if (target.classList.contains('decrease-btn')) {
        const item = cart.find(i => i.id === itemID);
        if (item) {
          if (item.quantity > 1) {
            item.quantity--;
          } else {
            cart = cart.filter(i => i.id !== itemID);
            showNotification(`Item removed from cart.`);
          }
        }
      } else if (target.classList.contains('remove-btn')) {
        cart = cart.filter(i => i.id !== itemID);
        showNotification(`Item removed from cart.`);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  }

  addToCartButtons.forEach(button => button.addEventListener('click', addToCart));
  renderCart();
  updateCartCount();

  const searchInput = document.querySelector('.search');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const searchTerm = event.target.value.toLowerCase();
      const grid = document.querySelector('.jersey-grid');
      if (grid) {
        const cardsInGrid = grid.querySelectorAll('.card, .jersey-card');
        cardsInGrid.forEach(card => {
          const cardText = card.textContent.toLowerCase();
          card.style.display = cardText.includes(searchTerm) ? 'block' : 'none';
        });
      }
    });
  }

  let notificationTimeout;
  function showNotification(message) {
    if (notificationTimeout) clearTimeout(notificationTimeout);
    let notification = document.getElementById('cart-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'cart-notification';
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 14px 22px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease, bottom 0.3s ease;
      `;
      document.body.appendChild(notification);
    }
    notification.textContent = message;
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.bottom = '40px';
    }, 10);
    notificationTimeout = setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.bottom = '20px';
    }, 3000);
  }

  // --- LOGIN AND CHECKOUT LOGIC ---
  const loginForm = document.getElementById('login-form');
  const loginErrorMessage = document.getElementById('login-error-message');
  const registerForm = document.getElementById('register-form');
  const registerErrorMessage = document.getElementById('register-error-message');
  const registerSuccessMessage = document.getElementById('register-success-message');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (email === 'admin@js.com' && password === 'admin123') {
        sessionStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin.html';
        return;
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));

        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          window.location.href = 'homepage.html';
        }
      } else {
        if (loginErrorMessage) loginErrorMessage.textContent = 'Invalid email or password.';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fname = document.getElementById('reg-fname').value.trim();
      const lname = document.getElementById('reg-lname').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();

      if (registerErrorMessage) registerErrorMessage.textContent = '';
      if (registerSuccessMessage) registerSuccessMessage.textContent = '';

      let users = JSON.parse(localStorage.getItem('users')) || [];
      const exists = users.some(u => u.email === email);

      if (exists) {
        if (registerErrorMessage) registerErrorMessage.textContent = 'Email already registered.';
        return;
      }

      const newUser = { fname, lname, email, password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      if (registerSuccessMessage) registerSuccessMessage.textContent = 'Registration successful! Please log in.';

      setTimeout(() => {
        document.getElementById('register-container').classList.remove('active');
        document.getElementById('login-container').classList.add('active');
        if (registerSuccessMessage) registerSuccessMessage.textContent = '';
      }, 2000);
    });
  }

  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  if (showRegisterLink && showLoginLink) {
    showRegisterLink.addEventListener('click', () => {
      document.getElementById('login-container').classList.remove('active');
      document.getElementById('register-container').classList.add('active');
    });
    showLoginLink.addEventListener('click', () => {
      document.getElementById('register-container').classList.remove('active');
      document.getElementById('login-container').classList.add('active');
    });
  }

  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      const shippingForm = document.getElementById('shipping-form');
      if (shippingForm.checkValidity()) {
        const customerDetails = {
          fullName: document.getElementById('fullName').value,
          address: document.getElementById('address').value,
          city: document.getElementById('city').value,
          state: document.getElementById('state').value,
          zipCode: document.getElementById('zipCode').value,
          email: document.getElementById('email').value
        };
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (cart.length === 0) {
          showNotification("Your cart is empty!");
          return;
        }
        const newOrder = {
          orderId: `JS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderDate: new Date().toISOString(),
          customer: customerDetails,
          items: cart,
          totalAmount: totalAmount
        };
        const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
        allOrders.push(newOrder);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
        localStorage.removeItem('cart');
        updateCartCount();
        showCheckoutSuccessModal();
      } else {
        shippingForm.reportValidity();
        showNotification("Please fill out all shipping details.");
      }
    });
  }

  function showCheckoutSuccessModal() {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    const modal = document.createElement('div');
    modal.className = 'checkout-success-modal';
    modal.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <h2>Thank You!</h2>
          <p>Your order has been placed successfully.</p>
          <p>You will be redirected to the homepage shortly.</p>
      `;
    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);
    setTimeout(() => {
      window.location.href = 'homepage.html';
    }, 3000);
  }

}); // --- This is the single closing tag for DOMContentLoaded ---
