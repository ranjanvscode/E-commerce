 let customers = [];
    let filteredCustomers = [];
    let currentPage = 1;

    // Helper: safe element getter and safe event binding
    function getEl(id) {
        return document.getElementById(id) || null;
    }

    function safeAddListener(id, eventName, handler, options) {
        const el = getEl(id);
        if (el) el.addEventListener(eventName, handler, options);
    }

    // Return element value safely (empty string if element missing)
    function safeVal(id) {
        const el = getEl(id);
        return el && ('value' in el) ? el.value : '';
    }
    let itemsPerPage = 10;
    let sortField = '';
    let sortDirection = 'asc';
    let selectedCustomers = new Set();
    let editingCustomer = null;
    let activityLog = [];

    function getCsrfData() {
        const tokenEl = document.querySelector('meta[name="_csrf"]');
        const headerEl = document.querySelector('meta[name="_csrf_header"]');
        return {
            token: tokenEl ? tokenEl.getAttribute('content') : null,
            header: headerEl ? headerEl.getAttribute('content') : null
        };
    }

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
        loadData(); // Fetch real data from Backend
        setupEventListeners();
        // initial render/update for local cache or initial state
        renderTable();
        updateStats();
        
        // Dark mode functionality
        const darkModeToggle = getEl('darkModeToggle');
        const html = document.documentElement;

        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            html.classList.add('dark');
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                html.classList.toggle('dark');
                const theme = html.classList.contains('dark') ? 'dark' : 'light';
                localStorage.setItem('theme', theme);
            });
        }

    });

    // Load data from backend
    async function loadData() {
        try {
            const response = await fetch('/account/getAllUsers');
            if (!response.ok) throw new Error("Failed to fetch users");
            
            const rawData = await response.json();
            
            // Map Backend User Object to Frontend Customer Object
            customers = rawData.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phoneNo && user.phoneNo.trim() !== "" ? user.phoneNo : "N/A",
                status: user.enabled ? "active" : "inactive",
                // role: user.roleList ? user.roleList[0].replace('ROLE_', '').toLowerCase() : 'user',
                role: user.roleList?.includes('ROLE_ADMIN') ? 'admin' : 'user',
                registrationDate: user.createdAt || new Date().toISOString(),
                // registrationDate: user.createdAt || 'N/A',
                avatar: (user.profilePic && user.profilePic.trim() !== "") ? user.profilePic : "https://res.cloudinary.com/dh2syh2li/image/upload/v1728264074/rmbfiihvtjpp7zjt6rpc.png",
                address: "No address provided", // Backend User entity doesn't have address yet
                orders: 0,
                tickets: 0
            }));

            filteredCustomers = [...customers];
            renderTable();
            updateStats();
        } catch (error) {
            console.error("Error loading customers:", error);
            alert("Could not connect to backend. Showing local cache if available.");
        }
    }

        function setupEventListeners() {
            // Search functionality
            safeAddListener('searchInput', 'input', handleSearch);
            
            // Filter functionality
            safeAddListener('statusFilter', 'change', handleFilter);
            safeAddListener('roleFilter', 'change', handleFilter);
            
            // Modal controls
            safeAddListener('addCustomerBtn', 'click', () => openCustomerModal());
            safeAddListener('cancelBtn', 'click', closeCustomerModal);
            safeAddListener('customerForm', 'submit', handleCustomerSubmit);
            
            // Bulk actions
            safeAddListener('bulkActionsBtn', 'click', openBulkActionsModal);
            safeAddListener('cancelBulkActions', 'click', closeBulkActionsModal);
            
            // Export functionality
            safeAddListener('exportBtn', 'click', openExportModal);
            safeAddListener('cancelExport', 'click', closeExportModal);
            safeAddListener('exportCSV', 'click', () => exportData('csv'));
            safeAddListener('exportExcel', 'click', () => exportData('excel'));
            safeAddListener('exportPDF', 'click', () => exportData('pdf'));
            
            // Select all functionality
            safeAddListener('selectAll', 'change', handleSelectAll);
            
            // Sorting
            document.querySelectorAll('[data-sort]').forEach(header => {
                header.addEventListener('click', () => handleSort(header.dataset.sort));
            });
            
            // Bulk action buttons
            safeAddListener('bulkActivate', 'click', () => handleBulkAction('activate'));
            safeAddListener('bulkDeactivate', 'click', () => handleBulkAction('deactivate'));
            safeAddListener('bulkDelete', 'click', () => handleBulkAction('delete'));
            
            // Confirmation modal
            safeAddListener('confirmCancel', 'click', closeConfirmModal);
            
            // Delegate checkbox change events to the table body (fewer bindings)
            const tbody = getEl('customerTableBody');
            if (tbody) {
                tbody.addEventListener('change', (e) => {
                    if (e.target?.matches('.customer-checkbox')) {
                        handleCustomerSelect(e);
                    }
                });
            }

            // Close modals when clicking outside
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    closeAllModals();
                }
            });
        }


        // 2. RENDER TABLE (Updated with proper field names)
    function renderTable() {
        const tbody = getEl('customerTableBody');
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageCustomers = filteredCustomers.slice(startIndex, endIndex);
        
        if (!tbody) return; // nothing to render if table body is absent
        
        tbody.innerHTML = pageCustomers.map(customer => `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <input type="checkbox" class="customer-checkbox rounded border-gray-300 text-primary" 
                           value="${customer.id}" ${selectedCustomers.has(customer.id) ? 'checked' : ''}>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full object-cover border border-gray-200" src="${customer.avatar}" onerror="this.src='https://res.cloudinary.com/dh2syh2li/image/upload/v1728264074/rmbfiihvtjpp7zjt6rpc.png'">
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">${customer.name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${customer.email}</td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${customer.phone}</td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">${customer.status}</span>
                </td>
                <td class="px-6 py-4 capitalize text-sm text-gray-900 dark:text-white">${customer.role}</td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    ${new Date(customer.registrationDate).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                    <div class="flex space-x-3">
                        <button onclick="viewCustomer('${customer.id}')" class="text-primary"><i class="fas fa-eye"></i></button>
                        <button onclick="editCustomer('${customer.id}')" class="text-blue-600"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCustomer('${customer.id}')" class="text-red-600"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Checkboxes are handled via delegation on the table body (see setupEventListeners)
        renderPagination();
    }

    // 3. HANDLE FORM SUBMIT (Connects to /account/register)
    async function handleCustomerSubmit(e) {
        e.preventDefault();

            const csrf = getCsrfData();

            if (!csrf.token || !csrf.header) {
                console.error("CSRF token or header not found.");
                alert("Security error: CSRF token missing. Please refresh the page.");
                return;
            }

            // Collect values from edit fields (safely)
            const name = safeVal('customerName').trim();
            const email = safeVal('customerEmail').trim();
            const phone = safeVal('customerPhone').trim();
            const userRole = safeVal('customerRole').trim();
            const status = safeVal('customerStatus').trim();

            const payload = {
                userRole: userRole,
                enabled: status.toLowerCase() === 'active'
            };

            // If adding a new customer, include personal details
            if (!editingCustomer) {
                payload.name = name;
                payload.email = email;
                payload.phoneNo = phone;
                payload.password = "12345678";
            }

        try {
            const url = editingCustomer ? `/account/updateStatus/${editingCustomer.id}` : `/account/register`;
            const method = editingCustomer ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { [csrf.header]: csrf.token, 'Content-Type': 'application/json'},
                body:JSON.stringify(payload)
            });

            if (response.ok) {
                logActivity(`${editingCustomer ? 'Updated' : 'Registered'} user: ${email || name}`);
                closeCustomerModal();
                loadData(); // Refresh list
            } else {
                alert("Error saving user to backend.");
            }
        } catch (error) {
            alert("Error saving user to backend.");
            console.error("Request failed", error);
        }

        editingCustomer = null
        console.log("Bhai code chal rha hai")
    }

    // UPDATED STATS LOGIC
    function updateStats() {
        const totalEl = getEl('totalCustomers');
        const activeEl = getEl('activeCustomers');
        const inactiveEl = getEl('inactiveCustomers');
        const newEl = getEl('newCustomers');

        if (totalEl) totalEl.textContent = customers.length;
        if (activeEl) activeEl.textContent = customers.filter(c => c.status === 'active').length;
        if (inactiveEl) inactiveEl.textContent = customers.filter(c => c.status === 'inactive').length;
        
        const thisMonth = customers.filter(c => {
            const d = new Date(c.registrationDate);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        if (newEl) newEl.textContent = thisMonth;
    }

        function renderPagination() {
            const rawTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
            const totalPages = Math.max(1, rawTotalPages);
            const pagination = getEl('pagination');
            
            // Update showing text
            const startIndex = filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
            const endIndex = filteredCustomers.length === 0 ? 0 : Math.min(currentPage * itemsPerPage, filteredCustomers.length);
            const showingStartEl = getEl('showingStart');
            const showingEndEl = getEl('showingEnd');
            const totalRecordsEl = getEl('totalRecords');

            if (showingStartEl) showingStartEl.textContent = startIndex;
            if (showingEndEl) showingEndEl.textContent = endIndex;
            if (totalRecordsEl) totalRecordsEl.textContent = filteredCustomers.length;

            if (!pagination) return;

            // If there are no records, show a simple disabled pagination
            if (filteredCustomers.length === 0) {
                pagination.innerHTML = `
                    <button disabled class="px-2 py-2 rounded-l-md border bg-gray-100 text-sm"> <i class="fas fa-chevron-left"></i></button>
                    <span class="inline-flex items-center px-4 py-2 border bg-gray-100 text-sm">No records</span>
                    <button disabled class="px-2 py-2 rounded-r-md border bg-gray-100 text-sm"> <i class="fas fa-chevron-right"></i></button>
                `;
                return;
            }
            
            // Generate pagination buttons using a compact page list
            let paginationHTML = '';

            // Previous button
            paginationHTML += `
                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;

            // Build compact set of pages to show
            const pages = new Set();
            pages.add(1);
            pages.add(totalPages);
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                if (i > 1 && i < totalPages) pages.add(i);
            }
            const pageArray = Array.from(pages).sort((a, b) => a - b);

            // Render pages with ellipses when gaps exist
            let prev = null;
            pageArray.forEach(p => {
                if (prev !== null && p - prev > 1) {
                    paginationHTML += `
                        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">...</span>
                    `;
                }

                paginationHTML += `
                    <button onclick="changePage(${p})" 
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${
                                p === currentPage
                                    ? 'text-primary bg-primary/10 border-primary'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }">
                        ${p}
                    </button>
                `;

                prev = p;
            });

            // Next button
            paginationHTML += `
                <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;

            pagination.innerHTML = paginationHTML;
        }

        function changePage(page) {
            const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderTable();
            }
        }

        function handleSearch() {
            // input listener delegates to applyFilters which reads values safely
            applyFilters();
        }

        function handleFilter() {
            applyFilters();
        }

        function applyFilters() {
            const searchTerm = safeVal('searchInput').toLowerCase();
            const statusFilter = safeVal('statusFilter');
            const roleFilter = safeVal('roleFilter');
            
            filteredCustomers = customers.filter(customer => {
                const matchesSearch = !searchTerm || 
                    customer.name.toLowerCase().includes(searchTerm) ||
                    customer.email.toLowerCase().includes(searchTerm) ||
                    customer.phone.toLowerCase().includes(searchTerm);
                
                const matchesStatus = !statusFilter || customer.status === statusFilter;
                const matchesRole = !roleFilter || customer.role === roleFilter;
                
                return matchesSearch && matchesStatus && matchesRole;
            });
            
            currentPage = 1;
            renderTable();
        }

        function handleSort(field) {
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            
            filteredCustomers.sort((a, b) => {
                let aValue = a[field];
                let bValue = b[field];
                
                if (field === 'registrationDate') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }
                
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
            
            renderTable();
        }

        function handleSelectAll() {
            const selectAll = getEl('selectAll');
            if (!selectAll) return;
            const checkboxes = document.querySelectorAll('.customer-checkbox');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAll.checked;
                const customerId = parseInt(checkbox.value);
                if (selectAll.checked) {
                    selectedCustomers.add(customerId);
                } else {
                    selectedCustomers.delete(customerId);
                }
            });
            
            updateBulkActionsButton();
        }

        function handleCustomerSelect(e) {
            const checkbox = e.target;
            const customerId = parseInt(checkbox.value);
            
            if (checkbox.checked) {
                selectedCustomers.add(customerId);
            } else {
                selectedCustomers.delete(customerId);
            }
            
            // Update select all checkbox
            const allCheckboxes = document.querySelectorAll('.customer-checkbox');
            const checkedCheckboxes = document.querySelectorAll('.customer-checkbox:checked');
            const selectAll = getEl('selectAll');
            
            if (selectAll) {
                selectAll.checked = allCheckboxes.length === checkedCheckboxes.length;
                selectAll.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
            }
            
            updateBulkActionsButton();
        }

        function updateBulkActionsButton() {
            const bulkActionsBtn = getEl('bulkActionsBtn');
            if (bulkActionsBtn) bulkActionsBtn.disabled = selectedCustomers.size === 0;
        }


    function openCustomerModal(customer = null) {
        editingCustomer = customer;
        const modal = getEl('customerModal');
        const title = getEl('modalTitle');
        const form = getEl('customerForm');
        
        // Select all inputs that should be locked during editing
        const nameInput = getEl('customerName');
        const emailInput = getEl('customerEmail');
        const phoneInput = getEl('customerPhone');
        const addressInput = getEl('customerAddress');

        if (!modal || !form || !title || !nameInput) {
            console.warn('Customer modal elements missing, cannot open modal');
            return;
        }

    if (customer) {
                title.textContent = 'Edit Customer';
                
                // Fill data
                nameInput.value = customer.name;
                emailInput.value = customer.email;
                phoneInput.value = customer.phone || '';
                const roleEl = getEl('customerRole'); if (roleEl) roleEl.value = customer.role;
                addressInput.value = customer.address || '';
                const statusEl = getEl('customerStatus'); if (statusEl) statusEl.value = customer.status;

                // LOCK fields: Disable name, email, phone, and address for Edit mode
                nameInput.readOnly = true;
                emailInput.readOnly = true;
                phoneInput.readOnly = true;
                addressInput.readOnly = true;
                
                // Add a visual cue (gray background)
                [nameInput, emailInput, phoneInput, addressInput].forEach(el => el.classList.add('bg-gray-100', 'cursor-not-allowed'));
            } else {
                title.textContent = 'Add New Customer';
                form.reset();

                // UNLOCK fields for Add mode
                nameInput.readOnly = false;
                emailInput.readOnly = false;
                phoneInput.readOnly = false;
                addressInput.readOnly = false;

                // Remove visual cue
                [nameInput, emailInput, phoneInput, addressInput].forEach(el => el.classList.remove('bg-gray-100', 'cursor-not-allowed'));
            }
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeCustomerModal() {
            const modal = getEl('customerModal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            editingCustomer = null;
        }

        function viewCustomer(id) {
            const customer = customers.find(c => c.id === id);
            if (!customer) return;
            
            const modal = getEl('customerDetailsModal');
            const content = getEl('customerDetailsContent');
            if (!modal || !content) return; // UI not present on this page

            
            content.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-1">
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                            <img src="${customer.avatar}" alt="${customer.name}" class="w-24 h-24 rounded-full mx-auto mb-4">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${customer.name}</h3>
                            <p class="text-gray-600 dark:text-gray-400">${customer.email}</p>
                            <div class="mt-4">
                                <span class="px-3 py-1 text-sm font-medium rounded-full ${
                                    customer.status === 'active' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                }">
                                    ${customer.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="lg:col-span-2">
                        <div class="space-y-6">
                            <div>
                                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                        <p class="text-sm text-gray-900 dark:text-white">${customer.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                        <p class="text-sm text-gray-900 dark:text-white capitalize">${customer.role}</p>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <p class="text-sm text-gray-900 dark:text-white">${customer.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Date</label>
                                        <p class="text-sm text-gray-900 dark:text-white">${new Date(customer.registrationDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</label>
                                        <p class="text-sm text-gray-900 dark:text-white">${customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Activity Summary</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="bg-primary/10 rounded-lg p-4">
                                        <div class="flex items-center">
                                            <i class="fas fa-shopping-cart text-primary text-xl"></i>
                                            <div class="ml-3">
                                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                                <p class="text-xl font-semibold text-gray-900 dark:text-white">${customer.orders}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-4">
                                        <div class="flex items-center">
                                            <i class="fas fa-ticket-alt text-blue-500 text-xl"></i>
                                            <div class="ml-3">
                                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Support Tickets</p>
                                                <p class="text-xl font-semibold text-gray-900 dark:text-white">${customer.tickets}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="editCustomer('${customer.id}'); closeCustomerDetailsModal();" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg transition-colors">
                        <i class="fas fa-edit mr-2"></i>Edit Customer
                    </button>
                    <button onclick="closeCustomerDetailsModal()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Close
                    </button>
                </div>
            `;
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeCustomerDetailsModal() {
            const modal = getEl('customerDetailsModal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function editCustomer(id) {
            const customer = customers.find(c => c.id === id);
            if (customer) {
                openCustomerModal(customer);
            }
        }

        function toggleCustomerStatus(id) {
            const customer = customers.find(c => c.id === id);
            if (customer) {
                const newStatus = customer.status === 'active' ? 'inactive' : 'active';
                const action = newStatus === 'active' ? 'activated' : 'deactivated';
                
                showConfirmModal(
                    `Are you sure you want to ${action === 'activated' ? 'activate' : 'deactivate'} ${customer.name}?`,
                    () => {
                        customer.status = newStatus;
                        logActivity(`${action.charAt(0).toUpperCase() + action.slice(1)} customer: ${customer.name}`);
                        applyFilters();
                        updateStats();
                    }
                );
            }
        }

        async function deleteCustomer(id) {
    const csrf = getCsrfData();

    if (!csrf.token || !csrf.header) {
        console.error("CSRF token or header not found.");
        alert("Security error: CSRF token missing. Please refresh the page.");
        return;
    }

    const customer = customers.find(c => c.id === id);
    if (customer) {
        // Mark this callback as 'async' so you can use 'await' inside
        showConfirmModal(
            `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
            async () => { 
                try {
                    const response = await fetch(`/account/deleteUser/${id}`, {
                        method: 'DELETE',
                        headers: {
                            [csrf.header]: csrf.token,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        // 1. Update local state ONLY after successful API call
                        customers = customers.filter(c => c.id !== id);
                        
                        // 2. Refresh the UI
                        applyFilters();
                        updateStats();
                        
                        console.log("Customer deleted successfully");
                    } else {
                        alert("Failed to delete customer. Please try again.");
                        console.error("Server returned an error:", response.status);
                    }
                } catch (error) {
                    console.error("Network error during deletion:", error);
                    alert("A network error occurred.");
                }
            }
        );
    }
}

        function openBulkActionsModal() {
            const modal = getEl('bulkActionsModal');
            const selectedCountEl = getEl('selectedCount');
            if (selectedCountEl) selectedCountEl.textContent = selectedCustomers.size;
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeBulkActionsModal() {
            const modal = getEl('bulkActionsModal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function handleBulkAction(action) {
            const selectedIds = Array.from(selectedCustomers);
            
            let message = '';
            let actionFn = null;
            
            switch (action) {
                case 'activate':
                    message = `Are you sure you want to activate ${selectedIds.length} selected customers?`;
                    actionFn = () => {
                        selectedIds.forEach(id => {
                            const customer = customers.find(c => c.id === id);
                            if (customer) customer.status = 'active';
                        });
                        logActivity(`Bulk activated ${selectedIds.length} customers`);
                    };
                    break;
                case 'deactivate':
                    message = `Are you sure you want to deactivate ${selectedIds.length} selected customers?`;
                    actionFn = () => {
                        selectedIds.forEach(id => {
                            const customer = customers.find(c => c.id === id);
                            if (customer) customer.status = 'inactive';
                        });
                        logActivity(`Bulk deactivated ${selectedIds.length} customers`);
                    };
                    break;
                case 'delete':
                    message = `Are you sure you want to delete ${selectedIds.length} selected customers? This action cannot be undone.`;
                    actionFn = () => {
                        customers = customers.filter(c => !selectedIds.includes(c.id));
                        selectedCustomers.clear();
                        logActivity(`Bulk deleted ${selectedIds.length} customers`);
                    };
                    break;
            }
            
            closeBulkActionsModal();
            showConfirmModal(message, () => {
                actionFn();
                applyFilters();
                updateStats();
                const selectAllEl = getEl('selectAll');
                if (selectAllEl) selectAllEl.checked = false;
            });
        }

        function openExportModal() {
            const modal = getEl('exportModal');
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeExportModal() {
            const modal = getEl('exportModal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function exportData(format) {
            const data = filteredCustomers.map(customer => ({
                Name: customer.name,
                Email: customer.email,
                Phone: customer.phone || '',
                Status: customer.status,
                Role: customer.role,
                'Registration Date': customer.registrationDate,
                Address: customer.address || ''
            }));
            
            switch (format) {
                case 'csv':
                    exportToCSV(data);
                    break;
                case 'excel':
                    exportToExcel(data);
                    break;
                case 'pdf':
                    exportToPDF(data);
                    break;
            }
            
            logActivity(`Exported customer data as ${format.toUpperCase()}`);
            closeExportModal();
        }

        function exportToCSV(data) {
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');
            
            downloadFile(csvContent, 'customers.csv', 'text/csv');
        }

        function exportToExcel(data) {
            const filename = 'customers.xlsx'; // Using .xls for better compatibility with XML format
            const headers = Object.keys(data[0]);
            
            // Create the XML structure Excel expects
            let xml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
            xml += `<head></head><body><table>`;
            
            // Add Headers
            const headerRow = headers.map(h => '<th style="background-color: #f97316; color: white;">' + h + '</th>').join('');
            xml += '<tr>' + headerRow + '</tr>';
            
            // Add Rows
            data.forEach(row => {
                const rowCells = headers.map(h => '<td>' + (row[h] ?? '') + '</td>').join('');
                xml += '<tr>' + rowCells + '</tr>';
            });
            
            xml += `</table></body></html>`;

            const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
    }

        function exportToPDF(data) {
            // Simplified PDF export (would need a library like jsPDF for full functionality)
            const content = data.map(customer => 
                Object.entries(customer).map(([key, value]) => `${key}: ${value}`).join('\n')
            ).join('\n\n');
            
            downloadFile(content, 'customers.pdf', 'application/pdf');
        }

        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function showConfirmModal(message, onConfirm) {
            const modal = getEl('confirmModal');
            const messageEl = getEl('confirmMessage');
            if (messageEl) messageEl.textContent = message;
            
            const confirmBtn = getEl('confirmAction');
            if (confirmBtn?.parentNode) {
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                newConfirmBtn.addEventListener('click', () => {
                    onConfirm();
                    closeConfirmModal();
                });
            } else {
                console.warn('Confirm button element (#confirmAction) not found. Skipping replace-and-bind step.');
            }
            
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeConfirmModal() {
            const modal = getEl('confirmModal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function closeAllModals() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            });
        }

        function logActivity(action) {
            const timestamp = new Date().toISOString();
            activityLog.unshift({
                timestamp,
                action,
                user: 'Admin User'
            });
            
            // Keep only last 100 activities
            if (activityLog.length > 100) {
                activityLog = activityLog.slice(0, 100);
            }
        }

        // Generate some sample activity log entries
        function initializeActivityLog() {
            const sampleActivities = [
                'Logged into admin dashboard',
                'Viewed customer list',
                'Updated customer: John Doe',
                'Exported customer data as CSV',
                'Added new customer: Alice Johnson'
            ];
            
            sampleActivities.forEach((activity, index) => {
                const date = new Date();
                date.setHours(date.getHours() - index);
                activityLog.push({
                    timestamp: date.toISOString(),
                    action: activity,
                    user: 'Admin User'
                });
            });
        }


        // Initialize activity log on page load
        initializeActivityLog();