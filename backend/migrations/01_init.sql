-- ====================================================================
-- 1. SYSTEM INITIALIZATION & EXTENSIONS
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- Create explicit Enums for transactional integrity
CREATE TYPE bond_asset_type AS ENUM ('CORPORATE', 'FINANCIAL', 'SOVEREIGN');
CREATE TYPE option_exercise_style AS ENUM ('AMERICAN', 'EUROPEAN');

-- ====================================================================
-- 2. CORE FINANCIAL INSTRUMENTS & CLIMATE METADATA
-- ====================================================================
-- Master Table: Institutional asset profiles and core financial structures
CREATE TABLE IF NOT EXISTS bonds (
    id SERIAL PRIMARY KEY,
    isin VARCHAR(12) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    bond_type bond_asset_type NOT NULL,
    credit_rating VARCHAR(10) NOT NULL, -- Enforced via Pydantic/Check bounds (AAA to D)
    face_value NUMERIC(16, 4) NOT NULL,
    coupon_rate NUMERIC(6, 4) NOT NULL,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    full_climate_history TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_isin_format CHECK (isin ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$')
);

-- ====================================================================
-- 3. QUANTATIVE RISK & HEDGING MATRICES
-- ====================================================================
-- Actuarial Risk Exposures: Calculated credit vulnerabilities per asset
CREATE TABLE IF NOT EXISTS risk_profiles (
    id SERIAL PRIMARY KEY,
    bond_id INT UNIQUE REFERENCES bonds(id) ON DELETE CASCADE,
    probability_of_default NUMERIC(6, 4) NOT NULL,
    loss_given_default NUMERIC(6, 4) NOT NULL,
    is_investment_grade BOOLEAN NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hedge Positions: Derivatives contracts bound to specific capital liabilities
CREATE TABLE IF NOT EXISTS hedge_options (
    id SERIAL PRIMARY KEY,
    bond_id INT REFERENCES bonds(id) ON DELETE CASCADE,
    option_style option_exercise_style NOT NULL,
    strike_price NUMERIC(16, 4) NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- High-precision Greek sensitivities for risk-desk portfolio rebalancing
    delta NUMERIC(9, 6) DEFAULT 0.000000,
    gamma NUMERIC(9, 6) DEFAULT 0.000000,
    vega NUMERIC(9, 6) DEFAULT 0.000000,
    theta NUMERIC(9, 6) DEFAULT 0.000000,
    rho NUMERIC(9, 6) DEFAULT 0.000000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 4. KNOWLEDGE MANAGEMENT & RESOURCE TRACKING
-- ====================================================================
-- Chunks Table: Atomic sentence boundaries linked directly to Parent Bonds
CREATE TABLE IF NOT EXISTS asset_chunks (
    id SERIAL PRIMARY KEY,
    bond_id INT REFERENCES bonds(id) ON DELETE CASCADE,
    chunk_content TEXT NOT NULL,
    embedding vector(768) NOT NULL -- Custom tailored to Gemini text-embedding-004
);

-- Quota Tracker Table: Daily spending hard-stops
CREATE TABLE IF NOT EXISTS gemini_quota_logs (
    tracking_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    request_count INT DEFAULT 0,
    token_count INT DEFAULT 0,
    estimated_cost NUMERIC(8, 4) DEFAULT 0.0000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 5. PERFORMANCE INDEXING LAYER
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_bonds_metadata_gin ON bonds USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_chunks_vector_hnsw ON asset_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS idx_hedge_bond_lookup ON hedge_options (bond_id);

-- cat init.sql | docker exec -i risk_analytics_db_instance psql -U postgres -d risk_db ( run this inside migrations folder to create tables inside docker conatiner)
-- check tables inside docker (docker exec -it risk_analytics_db_instance psql -U postgres -d risk_db) and then (\dt)