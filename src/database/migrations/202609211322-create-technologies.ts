import { DataTypes, QueryInterface } from "sequelize";

export async function up({ context }: { context: QueryInterface }) {
    await context.createTable('technologies', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    })
}

export async function down({context}: {context: QueryInterface}){
    await context.dropTable('technologies');
}