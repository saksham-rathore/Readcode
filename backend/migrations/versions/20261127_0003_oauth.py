"""Add provider identities and passwordless social accounts."""

import sqlalchemy as sa
from alembic import op

revision = "20261127_0003"
down_revision = "20261127_0002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "oauth_identities",
        sa.Column("provider", sa.String(16), primary_key=True),
        sa.Column("subject", sa.String(255), primary_key=True),
        sa.Column("account_id", sa.String(36), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
    )


def downgrade():
    if op.get_bind().execute(sa.text("SELECT 1 FROM accounts WHERE password_hash = '' LIMIT 1")).scalar():
        raise RuntimeError("Downgrading would lock out accounts created with social sign-in.")
    op.drop_table("oauth_identities")