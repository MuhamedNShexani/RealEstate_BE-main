import { DataTypes, Model, Sequelize } from "sequelize";

class Roles extends Model {
public Series!: string; 
public RoleName!: string; 

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
    
        },
        Series: {
          type: DataTypes.STRING,
          primaryKey: true,
        allowNull: false
        },
        RoleName:{
          type: DataTypes.STRING,
          unique:true,
        allowNull: false
        },
        createdBy:{
          type: DataTypes.STRING
        },
        updatedBy:{
          type: DataTypes.STRING
        }}
      ,
      {
        sequelize: sequelize,
        freezeTableName: true,
        name: {
          singular: "Roles",
          plural: "Roles",
        },
      }
    );
  }
}

export default Roles;
