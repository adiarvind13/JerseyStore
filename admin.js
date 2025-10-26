document.addEventListener('DOMContentLoaded', () => {

    /**
     * 1. CHECK AUTHENTICATION
     * Checks if the user is logged in as an admin.
     * If not, redirects to the login page.
     */
    function checkAuth() {
        if (sessionStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'login.html';
        }
    }

    /**
     * 2. LOAD DASHBOARD STATS
     * Fetches orders and users from localStorage to populate the top cards.
     */
    function loadDashboardStats() {
        const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || []; // Assuming 'users' is the key from login.js

        // Calculate stats
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;
        const totalUsers = users.length; // This depends on your login logic storing 'users'

        // Populate dashboard cards
        document.getElementById('total-revenue').innerText = `₹${totalRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById('total-orders').innerText = totalOrders;
        document.getElementById('total-users').innerText = totalUsers;
    }

    /**
     * 3. LOAD ORDERS TABLE
     * Fetches all orders from localStorage and builds the HTML table.
     */
    function loadOrdersTable() {
        const orders = JSON.parse(localStorage.getItem('allOrders')) || [];
        const tableBody = document.getElementById('orders-list-body');

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
            return;
        }

        tableBody.innerHTML = ''; // Clear the "loading" or "no orders" message

        // Loop through orders and create table rows
        orders.reverse().forEach(order => { // .reverse() to show newest first
            const row = document.createElement('tr');

            // Format items into a readable list
            const itemsList = order.items.map(item => 
                `<li>${item.name} (${item.size || 'N/A'}) - Qty: ${item.quantity}</li>`
            ).join('');

            // Format date to be readable
            const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            row.innerHTML = `
                <td>${order.orderId.substring(0, 8)}...</td>
                <td>${orderDate}</td>
                <td>${order.customer.fullName}</td>
                <td>${order.customer.email}</td>
                <td>₹${order.totalAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                <td><ul class="order-items-list">${itemsList}</ul></td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * 4. LOGOUT FUNCTIONALITY
     */
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdmin');
            window.location.href = 'login.html';
        });
    }

    /**
     * 5. INITIALIZE THE PAGE
     */
    checkAuth();
    loadDashboardStats();
    loadOrdersTable();
});
