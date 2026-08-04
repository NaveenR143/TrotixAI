-- ============================================================================
-- Premium Reports System (Migration 007)
-- ============================================================================

CREATE TYPE premium_report_status AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE premium_report_type AS ENUM ('ATS_RESUME', 'ENHANCED_RESUME', 'SKILL_ANALYSIS', 'CAREER_ENHANCEMENT');

CREATE TABLE premium_orders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
    gateway VARCHAR(50), -- razorpay, payu
    gateway_order_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE report_generations (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES premium_orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type premium_report_type NOT NULL,
    status premium_report_status NOT NULL DEFAULT 'QUEUED',
    progress INTEGER NOT NULL DEFAULT 0,
    download_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_order_report_type UNIQUE (order_id, report_type)
);

CREATE INDEX idx_premium_orders_user ON premium_orders(user_id);
CREATE INDEX idx_report_generations_order ON report_generations(order_id);
CREATE INDEX idx_report_generations_status ON report_generations(status);
