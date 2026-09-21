import { DataTypes, Model, type Sequelize, type Optional, type ModelStatic } from 'sequelize';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  stock: number;
  created_at: Date;
  updated_at: Date;
}
type ProductCreation = Optional<Product, 'id' | 'created_at' | 'updated_at' | 'description' | 'stock'>;
export class ProductModel extends Model<Product, ProductCreation> implements Product {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare price_cents: number;
  declare stock: number;
  declare created_at: Date;
  declare updated_at: Date;
}

export function initProductModel(database: Sequelize): ModelStatic<ProductModel> {
  const existing = database.models.Product;
  if (existing) return existing as ModelStatic<ProductModel>;
  // A class per connection avoids rebinding a model used by another app instance.
  class BoundProduct extends ProductModel {}
  BoundProduct.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    price_cents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE(3), allowNull: false },
    updated_at: { type: DataTypes.DATE(3), allowNull: false },
  }, { sequelize: database, modelName: 'Product', tableName: 'products',
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  return BoundProduct;
}
