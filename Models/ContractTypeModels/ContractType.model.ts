import { DataTypes, Model, Sequelize } from "sequelize";

class ContractType extends Model {
  public Series!: string;
  public ContractType!: string;

  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {

    this.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          unique: true,
          autoIncrement: true,
        },
        Series: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false
        },
        ContractType: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        }, createdBy: {
          type: DataTypes.STRING
        },
        updatedBy: {
          type: DataTypes.STRING
        }
      },
      {
        sequelize: sequelize,
        hasTrigger: true,
        freezeTableName: true,
        name: {
          singular: "ContractType",
          plural: "ContractType",

        },
      }
    );
  }
}

export default ContractType;
