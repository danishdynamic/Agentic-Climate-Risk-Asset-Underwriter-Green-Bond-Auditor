-- ====================================================================
-- 1. SYSTEM INITIALIZATION
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE bond_asset_type AS ENUM ('CORPORATE', 'FINANCIAL', 'SOVEREIGN');
CREATE TYPE option_exercise_style AS ENUM ('AMERICAN', 'EUROPEAN');

-- ====================================================================
-- 2. CORE FINANCIAL INSTRUMENTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS bonds (
    id SERIAL PRIMARY KEY,
    isin VARCHAR(12) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    bond_type bond_asset_type NOT NULL,
    credit_rating VARCHAR(10) NOT NULL,
    face_value NUMERIC(16, 4) NOT NULL,
    coupon_rate NUMERIC(6, 4) NOT NULL,
    maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_isin_format CHECK (isin ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$')
);

ALTER TABLE bonds 
ADD CONSTRAINT chk_valid_rating 
CHECK (credit_rating IN ('AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC', 'CC', 'C', 'D'));

-- ====================================================================
-- 3. RISK ANALYTICS SUITE (NORMALIZED WITH SURROGATE KEYS)
-- ====================================================================

CREATE TABLE IF NOT EXISTS climate_risk_profiles (
    id SERIAL PRIMARY KEY,
    bond_id INT UNIQUE REFERENCES bonds(id) ON DELETE CASCADE,
    flood_score NUMERIC(5,2) DEFAULT 0,
    wildfire_score NUMERIC(5,2) DEFAULT 0,
    heat_score NUMERIC(5,2) DEFAULT 0,
    drought_score NUMERIC(5,2) DEFAULT 0,
    overall_physical_risk NUMERIC(5,2) DEFAULT 0,
    physical_risk_level VARCHAR(20),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transition_risk_profiles (
    id SERIAL PRIMARY KEY,
    bond_id INT UNIQUE REFERENCES bonds(id) ON DELETE CASCADE,
    carbon_intensity NUMERIC(10,2) DEFAULT 0,
    industry VARCHAR(100),
    sector VARCHAR(100),
    country VARCHAR(100),
    eu_taxonomy_eligible BOOLEAN DEFAULT FALSE,
    transition_risk_score NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_risk_profiles (
    id SERIAL PRIMARY KEY,
    bond_id INT UNIQUE REFERENCES bonds(id) ON DELETE CASCADE,
    duration NUMERIC(8,4) DEFAULT 0,
    yield_rate NUMERIC(8,4) DEFAULT 0,
    spread NUMERIC(8,4) DEFAULT 0,
    volatility NUMERIC(8,4) DEFAULT 0,
    liquidity_score NUMERIC(5,2) DEFAULT 0,
    latest_price NUMERIC(16,4) DEFAULT 0,
    recommended_strike NUMERIC(16,4) DEFAULT 0,
    time_to_maturity NUMERIC(8,4) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_profiles (
    id SERIAL PRIMARY KEY,
    bond_id INT UNIQUE REFERENCES bonds(id) ON DELETE CASCADE,
    probability_of_default NUMERIC(6,4) NOT NULL,
    loss_given_default NUMERIC(6,4) NOT NULL,
    climate_var NUMERIC(16,4) DEFAULT 0,
    expected_annual_loss NUMERIC(16,4) DEFAULT 0,
    overall_risk_score NUMERIC(5,2) DEFAULT 0,
    investment_grade BOOLEAN NOT NULL,
    green_bond_compliant BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 4. HEDGING & VALUATION
-- ====================================================================
CREATE TABLE IF NOT EXISTS hedge_options (
    id SERIAL PRIMARY KEY,
    bond_id INT REFERENCES bonds(id) ON DELETE CASCADE,
    recommended BOOLEAN DEFAULT FALSE,
    option_style option_exercise_style NOT NULL,
    strike_price NUMERIC(16, 4) NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    implied_volatility NUMERIC(9, 6) DEFAULT 0.000000,
    risk_free_rate NUMERIC(9, 6) DEFAULT 0.000000,
    time_to_maturity NUMERIC(9, 6) DEFAULT 0.000000,
    delta NUMERIC(9, 6) DEFAULT 0.000000,
    gamma NUMERIC(9, 6) DEFAULT 0.000000,
    vega NUMERIC(9, 6) DEFAULT 0.000000,
    theta NUMERIC(9, 6) DEFAULT 0.000000,
    rho NUMERIC(9, 6) DEFAULT 0.000000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_valuations (
    id SERIAL PRIMARY KEY,
    bond_id INT REFERENCES bonds(id) ON DELETE CASCADE,
    valuation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valuation NUMERIC(16, 4) NOT NULL
);

-- ====================================================================
-- 5. KNOWLEDGE & QUOTA TRACKING
-- ====================================================================
CREATE TABLE IF NOT EXISTS asset_chunks (
    id SERIAL PRIMARY KEY,
    bond_id INT REFERENCES bonds(id) ON DELETE CASCADE,
    chunk_content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS gemini_quota_logs (
    tracking_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    request_count INT DEFAULT 0,
    token_count INT DEFAULT 0,
    estimated_cost NUMERIC(8, 4) DEFAULT 0.0000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 6. PERFORMANCE INDEXING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_bonds_metadata_gin ON bonds USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_chunks_vector_hnsw ON asset_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS idx_valuations_bond_id ON asset_valuations(bond_id, valuation_date);