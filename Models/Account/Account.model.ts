import { DataTypes, Model, Sequelize } from "sequelize";

class Account extends Model {
  
  public Series!: string;
  public AccountName!: string;

  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {
    
    this.init(
      { ID:{
        type: DataTypes.INTEGER,
        unique:true,
        autoIncrement: true,
      },
        Series: {
          type: DataTypes.STRING,
          primaryKey: true,
        allowNull: false
        },
        AccountName:{
          type: DataTypes.STRING,
          unique:true,
        allowNull: false
        },
        createdBy:{
          type: DataTypes.STRING
        },
        updatedBy:{
          type: DataTypes.STRING
        }
        
      },
      {
        sequelize: sequelize,
        freezeTableName: true,
        name: {
          singular: "Account",
          plural: "Account",
        },
      }
    );
  }

};

export default Account;
