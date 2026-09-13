"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-09-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "weather_observations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("observed_at", sa.DateTime(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("rainfall_mm", sa.Float(), nullable=False, server_default="0"),
        sa.Column("rainfall_rate_mm_hr", sa.Float(), nullable=False, server_default="0"),
        sa.Column("source", sa.String(length=80), nullable=False),
    )

    op.create_table(
        "drainage_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("condition", sa.String(length=40), nullable=False, server_default="normal"),
        sa.Column("swmm_node_id", sa.String(length=60), nullable=True),
    )

    op.create_table(
        "simulation_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="queued"),
        sa.Column("message", sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("simulation_runs")
    op.drop_table("drainage_assets")
    op.drop_table("weather_observations")
