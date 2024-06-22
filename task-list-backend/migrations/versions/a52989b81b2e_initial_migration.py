"""Initial migration.

Revision ID: a52989b81b2e
Revises: 
Create Date: 2024-06-17 13:56:09.592975

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a52989b81b2e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('task',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date_created', sa.DateTime(), nullable=True),
    sa.Column('entity_name', sa.String(length=80), nullable=False),
    sa.Column('task_type', sa.String(length=50), nullable=False),
    sa.Column('task_time', sa.DateTime(), nullable=False),
    sa.Column('contact_person', sa.String(length=80), nullable=False),
    sa.Column('note', sa.Text(), nullable=True),
    sa.Column('status', sa.String(length=10), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('task')
    # ### end Alembic commands ###
