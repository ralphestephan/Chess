"""Fix model relationships

Revision ID: 799b001b92df
Revises: d26d5fba3c05
Create Date: 2024-11-30 15:13:43.432318

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '799b001b92df'
down_revision = 'd26d5fba3c05'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('game',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('board_state', sa.JSON(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('game')
    # ### end Alembic commands ###
