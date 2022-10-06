import { DataTypes, Model, Sequelize } from "sequelize";

class Party extends Model {
  public Series!: string;
  public FullName!: string;
  public Phone!: string;
  public Cell!: string;
  public Address!: string;
  public Gender!: string;
  public Remarks!: string;

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
        FullName: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        Phone: {
          type: DataTypes.STRING
        },
        Cell: {
          type: DataTypes.STRING
        },
        Address: {
          type: DataTypes.STRING
        },
        Gender: {
          type: DataTypes.BOOLEAN
        },
        Remarks: {
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
        hasTrigger: true,
        freezeTableName: true,
        name: {
          singular: "Party",
          plural: "Party",
        },
      }
    );
  }
}

export default Party;
