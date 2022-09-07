import { DataTypes, Model, Sequelize } from "sequelize";

class Payments extends Model {
public Series!: string; 
public PostingDate!:Date;
public Reference!: string; 
public Purpose!: string; 
public PayParty!: string;
public ReceiveParty!: string;
public Amount!:number;
public Currency!: string; 
public For!: string; 
public Remarks!: string; 

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
        PostingDate:{
          type: DataTypes.DATEONLY,
        allowNull: false
        },
        Reference:{
          type: DataTypes.STRING
        },
        Purpose:{
          type: DataTypes.STRING,
             },
        Amount:{
          type: DataTypes.DOUBLE
        },
        Currency:{
          type: DataTypes.STRING,
      
        },
        PayParty:{
          type: DataTypes.STRING,
      
        },
          ReceiveParty:{
          type: DataTypes.STRING,
      
        },
        For:{
          type: DataTypes.STRING
        },
        Remarks:{
          type: DataTypes.STRING
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
          singular: "Payments",
          plural: "Payments",
        },
      }
    );
  }
}

export default Payments;
