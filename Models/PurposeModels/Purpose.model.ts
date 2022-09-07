import { DataTypes, Model, Sequelize } from "sequelize";

class Purpose extends Model {
public Series!: string; 

public Purpose!: string; 
public IsPayable!:boolean;
public DefaultAmt!:number
public DefaultCurrency!: string; 



  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {

    this.init(
      {
        ID:{
          type: DataTypes.INTEGER,
          unique:true,
          autoIncrement: true,
    
        },
        Series: {
          type: DataTypes.STRING,
          primaryKey: true,
        allowNull: false
        },
        Purpose:{
          type: DataTypes.STRING,
          unique:true,
        allowNull: false
        },
        IsPayable:{
          type: DataTypes.BOOLEAN
        },
        DefaultAmt:{
          type: DataTypes.DOUBLE
        },
        DefaultCurrency:{
          type: DataTypes.STRING,
          
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
          singular: "Purpose",
          plural: "Purpose",
        },
      }
    );
  }
}

export default Purpose;
