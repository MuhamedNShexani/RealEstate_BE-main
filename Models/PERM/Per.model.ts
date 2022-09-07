import { DataTypes, Model, Sequelize } from "sequelize";

class Perms extends Model {
  
  public Series!: string;
  public RoleSeries!: string;
  public JsonData!: string;

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
      RoleSeries: {
        type: DataTypes.STRING,
        primaryKey: true,
      allowNull: false
      },
      JsonData:{
        type: DataTypes.STRING,
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
          singular: "Perms",
          plural: "Perms",
        },
      }
    );
  }

};

export default Perms;
