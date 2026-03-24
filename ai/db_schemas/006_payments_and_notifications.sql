-- ============================================================
-- migrations/006_payments_and_notifications.sql
-- ============================================================

-- ── Credit packs (what users can buy) ────────────────────────────────────────
CREATE TABLE credit_packs (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT    NOT NULL,                      -- "Starter Pack"
    credits         INTEGER NOT NULL,                      -- credits awarded
    bonus_credits   INTEGER NOT NULL DEFAULT 0,            -- bonus on top
    price           NUMERIC(10,2) NOT NULL,
    currency        TEXT    NOT NULL DEFAULT 'INR',
    is_popular      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default packs
INSERT INTO credit_packs (name, credits, bonus_credits, price, currency, is_popular, sort_order) VALUES
('Starter',    100,   0,   99.00,  'INR', FALSE, 1),
('Basic',      300,  30,  249.00,  'INR', FALSE, 2),
('Pro',        700,  100, 499.00,  'INR', TRUE,  3),
('Business',  1500,  300, 999.00,  'INR', FALSE, 4),
('Enterprise',5000, 1000,2999.00,  'INR', FALSE, 5);


-- ── Payment orders ────────────────────────────────────────────────────────────
CREATE TABLE payment_orders (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id             UUID            REFERENCES credit_packs(id) ON DELETE SET NULL,

    -- Order details
    credits_purchased   INTEGER         NOT NULL,
    bonus_credits       INTEGER         NOT NULL DEFAULT 0,
    amount              NUMERIC(10,2)   NOT NULL,
    currency            TEXT            NOT NULL DEFAULT 'INR',
    status              payment_status  NOT NULL DEFAULT 'pending',
    gateway             payment_gateway NOT NULL,

    -- Gateway-specific fields
    gateway_order_id    TEXT,                              -- Razorpay order_id / Stripe payment_intent_id
    gateway_payment_id  TEXT,                              -- confirmed payment ID from gateway
    gateway_signature   TEXT,                              -- Razorpay signature for verification
    gateway_response    JSONB,                             -- full webhook/callback payload

    -- Timestamps
    initiated_at        TIMESTAMPTZ     DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ,
    refund_amount       NUMERIC(10,2),

    created_at          TIMESTAMPTZ     DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_po_user    ON payment_orders (user_id);
CREATE INDEX idx_po_status  ON payment_orders (status);
CREATE INDEX idx_po_gateway ON payment_orders (gateway_order_id);
CREATE INDEX idx_po_created ON payment_orders (created_at DESC);


-- ── Subscription plans (for recruiters, optional future) ─────────────────────
CREATE TABLE subscription_plans (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT    NOT NULL,                  -- "Free", "Recruiter Pro", "Enterprise"
    slug                TEXT    NOT NULL UNIQUE,
    target_role         user_role NOT NULL DEFAULT 'recruiter',
    price_monthly       NUMERIC(10,2),
    price_yearly        NUMERIC(10,2),
    currency            TEXT    DEFAULT 'INR',
    monthly_job_posts   INTEGER DEFAULT 0,                 -- 0 = unlimited
    monthly_ai_credits  INTEGER DEFAULT 0,                 -- free credits per month
    candidate_search    BOOLEAN DEFAULT FALSE,
    analytics_access    BOOLEAN DEFAULT FALSE,
    priority_support    BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO subscription_plans
    (name, slug, target_role, price_monthly, monthly_job_posts, monthly_ai_credits, candidate_search, analytics_access) VALUES
('Free Recruiter', 'recruiter_free', 'recruiter', 0,     3,   50,  FALSE, FALSE),
('Recruiter Pro',  'recruiter_pro',  'recruiter', 999,   20,  500, TRUE,  TRUE),
('Enterprise',     'enterprise',     'recruiter', 4999,  0,   2000,TRUE,  TRUE);


-- ── User subscriptions ────────────────────────────────────────────────────────
CREATE TABLE user_subscriptions (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id         UUID    NOT NULL REFERENCES subscription_plans(id),
    status          TEXT    NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at         TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    payment_order_id UUID   REFERENCES payment_orders(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sub_user   ON user_subscriptions (user_id);
CREATE INDEX idx_sub_status ON user_subscriptions (status);
CREATE INDEX idx_sub_ends   ON user_subscriptions (ends_at);


-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notif_type  NOT NULL,
    title       TEXT        NOT NULL,
    body        TEXT,
    action_url  TEXT,
    is_read     BOOLEAN     DEFAULT FALSE,
    ref_id      UUID,                                      -- e.g. application_id, job_id
    ref_type    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user    ON notifications (user_id);
CREATE INDEX idx_notif_unread  ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notif_created ON notifications (created_at DESC);


-- ── Messaging (recruiter ↔ candidate) ────────────────────────────────────────
CREATE TABLE message_threads (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID    REFERENCES jobs(id) ON DELETE SET NULL,
    application_id  UUID    REFERENCES applications(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (recruiter_id, candidate_id, job_id)
);

CREATE INDEX idx_mt_recruiter  ON message_threads (recruiter_id);
CREATE INDEX idx_mt_candidate  ON message_threads (candidate_id);

CREATE TABLE messages (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID    NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id   UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT    NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    sent_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_msg_thread ON messages (thread_id);
CREATE INDEX idx_msg_sender ON messages (sender_id);
CREATE INDEX idx_msg_sent   ON messages (sent_at DESC);


-- ── Admin audit log ───────────────────────────────────────────────────────────
CREATE TABLE admin_audit_logs (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action      TEXT    NOT NULL,                          -- e.g. "suspend_user", "grant_credits"
    target_type TEXT,                                      -- "user", "job", "company"
    target_id   UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aal_admin  ON admin_audit_logs (admin_id);
CREATE INDEX idx_aal_target ON admin_audit_logs (target_type, target_id);
CREATE INDEX idx_aal_date   ON admin_audit_logs (created_at DESC);
