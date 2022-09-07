import { DataTypes, Model, Sequelize } from "sequelize";

class PropertyAttr extends Model {
public Series!: string; 
public Attribute!: string;

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
        Attribute:{
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
          singular: "PropertyAttr",
          plural: "PropertyAttr",
        },
      }
    );
  }
}

export default PropertyAttr;
