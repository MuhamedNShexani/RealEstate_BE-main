import BaseController from "Models/BaseController";
import { DataTypes, Model, Sequelize } from "sequelize";

class Example extends BaseController {
  public Series!: string;
  public Example!: string;

  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {
    this.init(
      {
        Series: DataTypes.STRING,
        Example: DataTypes.STRING,
        createdBy: { type: DataTypes.STRING, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: true },
        updatedAt: { type: DataTypes.DATE, allowNull: true },
        updatedBy: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize: sequelize,
        freezeTableName: true,
        name: {
          singular: "Example",
          plural: "Example",
        },
      }
    );
  }
}

export default Example;
