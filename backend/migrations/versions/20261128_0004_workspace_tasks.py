"""Persist a thread's task status and assistant assignment."""

import sqlalchemy as sa
from alembic import op

revision = "20261128_0004"
down_revision = "20261127_0003"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "conversation_tasks",
        sa.Column("conversation_id", sa.String(36), sa.ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("agent_id", sa.String(64), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
    )


def downgrade():
    op.drop_table("conversation_tasks")