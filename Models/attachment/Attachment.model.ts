import { DataTypes, Model, Sequelize } from "sequelize";

class Attachment extends Model {
  
  public name!: string;
  public Link!: string;
  public Size!: number;
  public MimeType!: string;

  // Auto-generated
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {
    
    this.init(
      { id:{
        primaryKey: true,
        type: DataTypes.STRING,
        unique: true,

      },
      name: {
          type: DataTypes.STRING,
        },
        Link:{
          type: DataTypes.STRING,
        },
        Size:DataTypes.STRING,

        MimeType:DataTypes.STRING,
        
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
          singular: "Attachment",
          plural: "Attachment",
        },
      }
    );
  }

};

export default Attachment;
