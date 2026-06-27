"""initial schema

Revision ID: 001
Revises: 
Create Date: 2026-06-27

"""
from alembic import op  # type: ignore
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Activate the pgvector extension inside PostgreSQL
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Create custom PostgreSQL Enums to match our Python model mapping
    op.execute("CREATE TYPE bond_asset_type_enum AS ENUM ('CORPORATE', 'FINANCIAL', 'SOVEREIGN');")
    op.execute("CREATE TYPE option_exercise_style_enum AS ENUM ('AMERICAN', 'EUROPEAN');")
    op.execute(
        "CREATE TYPE credit_rating_enum AS ENUM ("
        "'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', "
        "'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC', 'CC', 'C', 'D'"
        ");"
    )

    # 3. Construct the 'bond_assets' core tracking table
    op.create_table(
        'bond_assets',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('isin', sa.String(length=12), nullable=False, unique=True),
        sa.Column('asset_name', sa.String(length=255), nullable=False),
        sa.Column('bond_type', sa.Enum('CORPORATE', 'FINANCIAL', 'SOVEREIGN', name='bond_asset_type_enum'), nullable=False),
        sa.Column('credit_rating', sa.Enum(
            'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-',
            'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC', 'CC', 'C', 'D',
            name='credit_rating_enum'
        ), nullable=False),
        sa.Column('coupon_rate', sa.Float(), nullable=False)
    )
    op.create_index('ix_bond_assets_isin', 'bond_assets', ['isin'], unique=True)

    # 4. Construct the 'derivative_hedges' table linked to options calculations
    op.create_table(
        'derivative_hedges',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('bond_id', sa.Integer(), sa.ForeignKey('bond_assets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('strike_price', sa.Float(), nullable=False),
        sa.Column('implied_volatility', sa.Float(), nullable=False),
        sa.Column('time_to_maturity', sa.Float(), nullable=False),
        sa.Column('exercise_style', sa.Enum('AMERICAN', 'EUROPEAN', name='option_exercise_style_enum'), nullable=False, server_default='EUROPEAN')
    )

    # 5. Construct the 'asset_chunks' RAG storage layout using native vector column sizing
    op.create_table(
        'asset_chunks',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('bond_id', sa.Integer(), sa.ForeignKey('bond_assets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chunk_content', sa.Text(), nullable=False)
    )
    op.execute("ALTER TABLE asset_chunks ADD COLUMN embedding vector(768);")

    # 6. Establish high-velocity HNSW vector lookup indexing using Cosine Distance operators
    op.execute("CREATE INDEX ix_asset_chunks_hnsw_embedding ON asset_chunks USING hnsw (embedding vector_cosine_ops);")


def downgrade() -> None:
    op.drop_table('asset_chunks')
    op.drop_table('derivative_hedges')
    op.drop_table('bond_assets')
    
    op.execute("DROP TYPE credit_rating_enum;")
    op.execute("DROP TYPE option_exercise_style_enum;")
    op.execute("DROP TYPE bond_asset_type_enum;")
    op.execute("DROP EXTENSION IF EXISTS vector;")