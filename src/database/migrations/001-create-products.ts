import { DataTypes, type QueryInterface } from 'sequelize';

export async function up({ context }: { context: QueryInterface }) {
  await context.createTable('products', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    price_cents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE(3), allowNull: false },
    updated_at: { type: DataTypes.DATE(3), allowNull: false },
  }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });
}

export async function down({ context }: { context: QueryInterface }) {
  await context.dropTable('products');
}
