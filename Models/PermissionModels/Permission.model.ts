import { DataTypes, Model, Sequelize } from "sequelize";

class Permission extends Model {
public Series!: string; 
public RoleSeries!: string;
public DocTypeID!: boolean; 
public  Read!: boolean; 
public  Write!: boolean;
public Create!: boolean;
public Delete!: boolean;

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
        RoleSeries:{
          type: DataTypes.STRING,
         },
        DocTypeID:{
         type: DataTypes.STRING,
        //  require:true
       },
        Read: {
          type: DataTypes.BOOLEAN
        },
        Write: {
          type: DataTypes.BOOLEAN
        },
        Create: {
          type: DataTypes.BOOLEAN
        },
        Delete: {
          type: DataTypes.BOOLEAN
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
          singular: "Permission",
          plural: "Permission",
        },
      }
    );
  }
}

export default Permission;
