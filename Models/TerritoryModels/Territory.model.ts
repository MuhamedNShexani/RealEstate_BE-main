import { DataTypes, Model, Sequelize } from "sequelize";

class Territory extends Model {
  public Series!: string;
  public Example!: string;
  public Territory!: string;
  public  Parent!: string;
  public  isGroup!:boolean
  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {
    
    this.init(
      {ID:{
        type: DataTypes.INTEGER,
        unique:true,
  
      },
        Series: {
          type: DataTypes.STRING,
          primaryKey: true,
        allowNull: false
        },
        Territory:{
          type: DataTypes.STRING,
          unique:true,
        allowNull: false
        },
        Parent:{
          type: DataTypes.STRING
          }
        ,
        isGroup: {
          type: DataTypes.BOOLEAN
        }
,
        createdBy: { type: DataTypes.STRING, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: true },
        updatedAt: { type: DataTypes.DATE, allowNull: true },
        updatedBy: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize: sequelize,
        freezeTableName: true,
        name: {
          singular: "Territory",
          plural: "Territory",
        },
      }
    );
  }
}

export default Territory;
