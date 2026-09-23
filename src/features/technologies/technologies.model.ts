import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";

export interface Technologies {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

type TechnologiesCreation = Optional<Technologies, 'id' | 'createdAt' | 'updatedAt'>;

export class TechnologiesModel extends Model<Technologies, TechnologiesCreation> implements Technologies {
    declare id: number;
    declare name: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export function initTechnologiesModel(sequelize: Sequelize): ModelStatic<TechnologiesModel> {
    TechnologiesModel.init({
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

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
        {
            timestamps: true,
            sequelize,
            tableName: 'technologies',
            underscored: true
        }
    );
    
    return TechnologiesModel;
}