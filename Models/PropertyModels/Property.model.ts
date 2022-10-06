import { DataTypes, Model, Sequelize } from "sequelize";

class Property extends Model {
  public Series!: string;
  public Territory!: string;
  public Purpose!: string;
  public Location!: string;
  public PropertyType!: string;
  public Attributes!: string;
  public IsFurnished!: boolean;
  public Available!: boolean;
  public Furnitures!: string;
  public Party!: string;
  public RequestedAmt!: number;
  public Currency!: string;


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
        Territory: {
          type: DataTypes.STRING,
        },
        Purpose: {
          type: DataTypes.STRING,
        },
        Location: {
          type: DataTypes.STRING
        },
        PropertyType: {
          type: DataTypes.STRING
        },
        Attributes: {
          type: DataTypes.STRING
        },
        IsFurnished: {
          type: DataTypes.BOOLEAN
        },
        Available: {
          type: DataTypes.BOOLEAN
        },
        Furnitures: {
          type: DataTypes.STRING
        },
        Party: {
          type: DataTypes.STRING,

        },
        RequestedAmt: {
          type: DataTypes.DOUBLE
        },
        Currency: {
          type: DataTypes.STRING,

        },
        createdBy: {
          type: DataTypes.STRING
        },
        updatedBy: {
          type: DataTypes.STRING
        },
        Longitude: {
          type: DataTypes.INTEGER
        }
        ,
        Latitude: {
          type: DataTypes.INTEGER
        }
      },
      {
        sequelize: sequelize,
        freezeTableName: true,
        name: {
          singular: "Property",
          plural: "Property",
        },
        hasTrigger: true,

      }
    );
  }
}

export default Property;
