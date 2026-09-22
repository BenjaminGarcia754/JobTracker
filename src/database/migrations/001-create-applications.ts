import { DataTypes, type QueryInterface } from "sequelize";

export async function up({ context }: { context: QueryInterface }) {
    await context.createTable('applications', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },

        company: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        currency: {
            type: DataTypes.STRING(3),
            allowNull: true,
            defaultValue: "MXN"
        },

        position: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "APPLIED"
        },

        modality: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },

        location: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        salary_min: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },

        applied_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        salary_max: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },

        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

    })
}

export async function down({ context }: { context: QueryInterface }) {
    await context.dropTable('applications');
}