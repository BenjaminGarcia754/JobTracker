import { DataTypes, Model, type Sequelize, type Optional, type ModelStatic } from 'sequelize';

export interface Applications {
  id: number;
  company: string;
  currency: string | null;
  position: string;
  url: string | null;
  status: string;
  modality: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  appliedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type ApplicationsCreation = Optional<Applications, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'notes' | 'url' |
  'modality' | 'location' | 'salaryMin' | 'salaryMax' | 'appliedAt' | 'currency'>;

export class ApplicationsModel extends Model<Applications, ApplicationsCreation> implements Applications {
  declare id: number;
  declare company: string;
  declare currency: string | null;
  declare position: string;
  declare url: string | null;
  declare status: string;
  declare modality: string | null;
  declare location: string | null;
  declare salaryMin: number | null;
  declare salaryMax: number | null;
  declare appliedAt: Date | null;
  declare notes: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initApplicationsModel(sequelize: Sequelize): ModelStatic<ApplicationsModel> {
  ApplicationsModel.init({
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

    salaryMin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    appliedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    salaryMax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

  },
    {
      sequelize,
      tableName: 'applications',
      timestamps: true,
      underscored: true,
    }
  );

  return ApplicationsModel;
}