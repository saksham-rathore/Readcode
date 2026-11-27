"""Add accounts and revocable sessions."""

import sqlalchemy as sa
from alembic import op

revision = "20261127_0002"
down_revision = "20261121_0001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "accounts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
    )
    op.create_table(
        "account_sessions",
        sa.Column("token_digest", sa.String(64), primary_key=True),
        sa.Column("account_id", sa.String(36), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_account_sessions_expires_at", "account_sessions", ["expires_at"])


def downgrade():
    op.drop_index("ix_account_sessions_expires_at", table_name="account_sessions")
    op.drop_table("account_sessions")
    op.drop_table("accounts")
