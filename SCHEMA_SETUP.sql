CREATE TABLE daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    cash_amount DECIMAL(10, 2) NOT NULL,
    upi_amount DECIMAL(10, 2) NOT NULL,
    card_amount DECIMAL(10, 2) NOT NULL,
    saving_cash DECIMAL(10, 2) NOT NULL,
    cash_total DECIMAL(10, 2) NOT NULL,
    petty_cash DECIMAL(10, 2) NOT NULL,
    total_income DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_daily_entries_date ON daily_entries(date DESC);
ALTER TABLE daily_entries DISABLE ROW LEVEL SECURITY;

CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_date DATE NOT NULL,
    expense_by VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_from VARCHAR(20) NOT NULL,
    description TEXT,
    reimbursed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_by ON expenses(expense_by);
CREATE INDEX idx_expenses_reimbursed ON expenses(reimbursed);
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
