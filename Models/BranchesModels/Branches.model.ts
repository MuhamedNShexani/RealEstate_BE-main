import { DataTypes, Model, Sequelize } from "sequelize";

class Branches extends Model {

  public Series!: string;
  public BranchName!: string;
  public ParentBranch!: string;
  public isGroup!: boolean
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
        BranchName: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        isGroup: {
          type: DataTypes.BOOLEAN
        },
        ParentBranch: {
          type: DataTypes.STRING
        },
        createdBy: {
          type: DataTypes.STRING
        },
        updatedBy: {
          type: DataTypes.STRING
        }

      },
      {
        sequelize: sequelize,
        freezeTableName: true,
        hasTrigger: true,
        name: {
          singular: "Branches",
          plural: "Branches",
        },
      }
    );
  }

};

export default Branches;
