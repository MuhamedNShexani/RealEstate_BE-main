import { DataTypes, Model, Sequelize } from "sequelize";

class CurrencyExchange extends Model {
  public Series!: string;
  public Date!: Date;
  public FromCurrency!: string;
  public ToCurrency!: string;
  public RateExchange!: number;


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
        Date: DataTypes.DATE,
        FromCurrency: DataTypes.STRING,
        ToCurrency: DataTypes.STRING,
        RateExchange: DataTypes.FLOAT,
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
          singular: "CurrencyExchange",
          plural: "CurrencyExchange",
        },
      }
    );
  }
}

export default CurrencyExchange;
