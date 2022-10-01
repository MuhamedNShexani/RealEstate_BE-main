import { DataTypes, Model, Sequelize } from "sequelize";

class Currency extends Model {
public Series!: string;
public CurrencyName!: string;
public Symbol!: string;
public Format!: string;
public Enabled!: boolean;
public Default!: boolean;

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
        CurrencyName: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        Symbol: {
          type: DataTypes.STRING
        },
        Format: {
          type: DataTypes.STRING
        },
        Enabled: {
          type: DataTypes.BOOLEAN
        },
        Default: {
          type: DataTypes.BOOLEAN
        },   createdBy:{
          type: DataTypes.STRING
        },
        updatedBy:{
          type: DataTypes.STRING
        }
      },
      {
        sequelize: sequelize,
        freezeTableName: true,     
          hasTrigger: true,

        name: {
          singular: "Currency",
          plural: "Currency",
        },
      }
    );
  }
}

export default Currency;
