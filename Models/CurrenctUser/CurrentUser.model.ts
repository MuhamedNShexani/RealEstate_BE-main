import { DataTypes, Model, Sequelize } from "sequelize";
//hello workd
class CurrentUser extends Model {
  
  public CurrentUser!: string; 

  // Auto-generated
  public id!: number;


  public static initialize(sequelize: Sequelize) {
    
    this.init(
      { ID:{
        type: DataTypes.INTEGER,

      },
        CurrentUser:{
          type: DataTypes.STRING,
          unique:true,
        allowNull: false
        }
      },
      {
        sequelize: sequelize,
        freezeTableName: true,
        name: {
          singular: "CurrentUser",
          plural: "CurrentUser",
        },
      }
    );
  }

};

export default CurrentUser;
