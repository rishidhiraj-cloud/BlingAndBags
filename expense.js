// Supabase Configuration
const SUPABASE_URL = 'https://khcwfivaxwgetwcrbefd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY3dmaXZheHdnZXR3Y3JiZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzIwNTcsImV4cCI6MjEwNTU0ODA1N30.TOY6mgJjiu21NlMCJ6f5fVbrwqj_d4P0B5cGjEJqOak';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Expense.js loaded');

// Format number in Indian style
function formatIndianNumber(num) {
    const n = parseFloat(num).toFixed(2);
    const parts = n.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }

    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return formatted + '.' + decimalPart;
}

// DOM Elements
const form = document.getElementById('expenseForm');
const expenseDateInput = document.getElementById('expenseDate');
const expenseByInput = document.getElementById('expenseBy');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const expenseHistoryEl = document.getElementById('expenseHistory');
const currentMonthLabelEl = document.getElementById('currentMonthLabel');
const pageLoader = document.getElementById('pageLoader');
const darkModeToggle = document.getElementById('darkModeToggle');
const filterExpenseByInput = document.getElementById('filterExpenseBy');
const totalExpenseEl = document.getElementById('totalExpense');

// Get selected month from localStorage or use current month
function getSelectedMonth() {
    const savedMonth = localStorage.getItem('selectedMonth');
    if (savedMonth) {
        return new Date(savedMonth);
    }
    return new Date();
}

// Initialize App
function init() {
    console.log('🚀 Initializing expense tracker...');

    // Dark mode
    initDarkMode();
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    expenseDateInput.value = today;

    // Get and display selected month
    const selectedMonth = getSelectedMonth();
    const monthName = selectedMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    currentMonthLabelEl.textContent = monthName;

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Filter change
    filterExpenseByInput.addEventListener('change', loadExpenseHistory);

    // Enforce single-select behaviour on Paid From checkboxes
    document.querySelectorAll('input[name="paidFrom"]').forEach(cb => {
        cb.addEventListener('change', function () {
            if (this.checked) {
                document.querySelectorAll('input[name="paidFrom"]').forEach(other => {
                    if (other !== this) other.checked = false;
                });
            }
        });
    });

    // Load expense history
    loadExpenseHistory();

    console.log('✅ Expense tracker initialized');
}

// Handle Form Submission
async function handleSubmit(e) {
    e.preventDefault();

    console.log('📝 Form submitted!');

    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    hideStatusMessage();

    try {
        const expenseDate = expenseDateInput.value;
        const expenseBy = expenseByInput.value;
        const amount = parseFloat(amountInput.value.replace(/,/g, '')) || 0;
        const paidFrom = document.querySelector('input[name="paidFrom"][type="checkbox"]:checked')?.value;
        const description = descriptionInput.value.trim();

        console.log('📊 Data to save:', {
            expenseDate,
            expenseBy,
            amount,
            paidFrom,
            description
        });

        // Validate data
        if (!expenseDate) {
            showStatusMessage('Please select expense date.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Expense';
            return;
        }

        if (!expenseBy) {
            showStatusMessage('Please select who made the expense.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Expense';
            return;
        }

        if (amount <= 0) {
            showStatusMessage('Please enter a valid amount greater than 0.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Expense';
            return;
        }

        if (!paidFrom) {
            showStatusMessage('Please select payment method.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Expense';
            return;
        }

        // Prepare data object
        const expenseData = {
            expense_date: expenseDate,
            expense_by: expenseBy,
            amount: amount,
            paid_from: paidFrom,
            description: description || null
        };

        console.log('Inserting expense:', expenseData);
        submitBtn.textContent = 'Saving…';

        // Insert expense
        const { data, error } = await supabaseClient
            .from('expenses')
            .insert([expenseData])
            .select();

        if (error) {
            console.error('❌ Insert error:', error);
            throw error;
        }

        console.log('✅ INSERT SUCCESS!');
        showStatusMessage('Expense saved successfully!', 'success');

        // Clear form
        form.reset();
        expenseDateInput.value = new Date().toISOString().split('T')[0];

        // Reload history
        await loadExpenseHistory();

    } catch (err) {
        console.error('❌ ERROR:', err);
        showStatusMessage('Error: ' + err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Expense';
    }
}

// Load Expense History
async function loadExpenseHistory() {
    try {
        pageLoader.classList.remove('hidden');
        expenseHistoryEl.innerHTML = '<div class="loading-spinner">Loading expenses...</div>';

        console.log('📊 Loading expense history...');

        // Get selected month
        const selectedMonth = getSelectedMonth();
        const year = selectedMonth.getFullYear();
        const monthNum = String(selectedMonth.getMonth() + 1).padStart(2, '0');
        const startDate = `${year}-${monthNum}-01`;

        // Get last day of month
        const lastDay = new Date(year, selectedMonth.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${monthNum}-${lastDay}`;

        console.log('Fetching expenses from', startDate, 'to', endDate);

        // Get filter value
        const filterBy = filterExpenseByInput.value;

        // Build query
        let query = supabaseClient
            .from('expenses')
            .select('*')
            .gte('expense_date', startDate)
            .lte('expense_date', endDate);

        // Apply filter if selected
        if (filterBy) {
            query = query.eq('expense_by', filterBy);
        }

        // Fetch expenses for selected month ordered by date (newest first)
        const { data, error } = await query
            .order('expense_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error loading expenses:', error);
            throw error;
        }

        console.log(`✅ Found ${data.length} expenses`);

        if (data && data.length > 0) {
            displayExpenses(data);
        } else {
            displayNoExpenses();
        }
    } catch (err) {
        console.error('❌ Exception loading expenses:', err);
        totalExpenseEl.textContent = '₹0.00';
        expenseHistoryEl.innerHTML = `
            <div class="empty-state">
                <p style="color: #721c24;">Error loading expenses: ${err.message}</p>
                <p>Please check the browser console for details.</p>
            </div>
        `;
    } finally {
        pageLoader.classList.add('hidden');
    }
}

// Display Expenses
function displayExpenses(expenses) {
    console.log('📝 Displaying', expenses.length, 'expenses');

    // Calculate total excluding reimbursed expenses
    const totalExpense = expenses.reduce((total, expense) => {
        if (!expense.reimbursed) {
            return total + parseFloat(expense.amount);
        }
        return total;
    }, 0);

    // Update total expense display
    totalExpenseEl.textContent = `₹${formatIndianNumber(totalExpense)}`;

    const canDelete = window.washiAuth && window.washiAuth.getUsername() === 'Dhiraj';

    const expensesHTML = expenses.map(expense => {
        const date = new Date(expense.expense_date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const reimbursedBadge = expense.reimbursed
            ? `<span class="reimbursed-badge">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5"/><polyline points="20 6 9 17 4 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
                Reimbursed
               </span>`
            : '';

        const showReimburseBtn = expense.paid_from === 'Self' && !expense.reimbursed;
        const actionsHtml = (showReimburseBtn || canDelete) ? `
                <div class="expense-actions">
                    ${showReimburseBtn ? `<button class="reimburse-btn" onclick="markAsReimbursed('${expense.id}')">Mark as Reimbursed</button>` : ''}
                    ${canDelete ? `<button class="delete-btn" onclick="deleteExpense('${expense.id}')">Delete</button>` : ''}
                </div>` : '';

        return `
            <div class="expense-item${expense.reimbursed ? ' expense-item--reimbursed' : ''}">
                <div class="expense-header">
                    <div class="expense-date">${date}</div>
                    ${reimbursedBadge}
                    <div class="expense-amount">₹${formatIndianNumber(expense.amount)}</div>
                </div>
                <div class="expense-details">
                    <div class="expense-detail-row">
                        <span class="expense-label">By:</span>
                        <span class="expense-value">${expense.expense_by}</span>
                    </div>
                    <div class="expense-detail-row">
                        <span class="expense-label">Paid From:</span>
                        <span class="expense-value expense-paid-${expense.paid_from.toLowerCase().replace(' ', '-')}">${expense.paid_from}</span>
                    </div>
                    ${expense.description ? `
                    <div class="expense-detail-row">
                        <span class="expense-label">Description:</span>
                        <span class="expense-value">${expense.description}</span>
                    </div>
                    ` : ''}
                </div>
                ${actionsHtml}
            </div>
        `;
    }).join('');

    expenseHistoryEl.innerHTML = expensesHTML;
}

// Display No Expenses Message
function displayNoExpenses() {
    totalExpenseEl.textContent = '₹0.00';
    expenseHistoryEl.innerHTML = `
        <div class="empty-state">
            <p>No expenses recorded yet.</p>
            <p style="color: #666; font-size: 14px;">Add your first expense using the form above.</p>
        </div>
    `;
}


// Show Status Message
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideStatusMessage();
        }, 3000);
    }
}

// Hide Status Message
function hideStatusMessage() {
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
}

// Mark as Reimbursed
window.markAsReimbursed = async function(expenseId) {
    console.log('markAsReimbursed called with ID:', expenseId);

    if (!confirm('Mark this expense as reimbursed?')) return;

    console.log('User confirmed, updating expense...');

    try {
        // First, fetch the original expense to get its details
        const { data: originalExpense, error: fetchError } = await supabaseClient
            .from('expenses')
            .select('*')
            .eq('id', expenseId)
            .single();

        if (fetchError) {
            console.error('Error fetching original expense:', fetchError);
            throw fetchError;
        }

        console.log('Original expense:', originalExpense);

        // Mark the original expense as reimbursed
        const { data, error } = await supabaseClient
            .from('expenses')
            .update({ reimbursed: true })
            .eq('id', expenseId)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Update successful:', data);

        // Create a new expense entry for the reimbursement
        const today = new Date().toISOString().split('T')[0];
        const reimbursementData = {
            expense_date: today,
            expense_by: originalExpense.expense_by,
            amount: originalExpense.amount,
            paid_from: 'Bank',
            description: originalExpense.description || `Reimbursement for expense by ${originalExpense.expense_by}`,
            reimbursed: false
        };

        console.log('Creating reimbursement entry:', reimbursementData);

        const { data: reimbursementResult, error: reimbursementError } = await supabaseClient
            .from('expenses')
            .insert([reimbursementData])
            .select();

        if (reimbursementError) {
            console.error('Error creating reimbursement entry:', reimbursementError);
            throw reimbursementError;
        }

        console.log('Reimbursement entry created:', reimbursementResult);
        showStatusMessage('Expense marked as reimbursed & reimbursement entry created!', 'success');
        loadExpenseHistory();
    } catch (err) {
        console.error('Error marking as reimbursed:', err);
        alert('Failed to mark as reimbursed. Error: ' + err.message + '. Please run the migration SQL in Supabase first.');
    }
}

// Delete Expense (Dhiraj-only; the Delete button is only rendered for
// Dhiraj, but this check is defense-in-depth against someone calling the
// function directly from the console).
window.deleteExpense = async function(expenseId) {
    if (!window.washiAuth || window.washiAuth.getUsername() !== 'Dhiraj') return;
    if (!confirm('Delete this expense? This cannot be undone.')) return;

    console.log('deleteExpense called with ID:', expenseId);

    try {
        const { error } = await supabaseClient
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (error) throw error;

        showStatusMessage('Expense deleted.', 'success');
        loadExpenseHistory();
    } catch (err) {
        console.error('Error deleting expense:', err);
        alert('Failed to delete expense: ' + err.message);
    }
};

// Dark Mode
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ Light Mode';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Burger Menu
function initBurgerMenu() {
    const burgerIcon = document.getElementById('burgerIcon');
    const burgerMenu = document.getElementById('burgerMenu');
    const burgerOverlay = document.getElementById('burgerOverlay');

    if (burgerIcon && burgerMenu && burgerOverlay) {
        burgerIcon.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            burgerOverlay.classList.toggle('active');
        });

        burgerOverlay.addEventListener('click', () => {
            burgerMenu.classList.remove('active');
            burgerOverlay.classList.remove('active');
        });
    }
}

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    init();

    /* Auto-fill Expense By from saved login */
    try {
        const savedUser = JSON.parse(localStorage.getItem('washi_auth'))?.username;
        if (savedUser && expenseByInput) expenseByInput.value = savedUser;
    } catch (e) {}
});
