import { DataTypes, Model, Sequelize } from "sequelize";

class Contracts extends Model {
public ContractDate!: Date;
public FirstParty!: Date;

public SecondParty!: string;
public Series!: string;
public ContractType!: string;
public Property!: string;
public Attributes!: string;
public IsSale!: boolean;
public IsRent!: boolean
public ContractStarts!: Date;
public ContractEnds!: Date;
public HandoverDate!: Date;
public RequestedAmt!: number;
public PaidAmt!: number;
public PaidCurrency!: string
public RentFor!: string
public RentCurrency!: string
public AdvanceAmt!: string
public AdvanceCurrency!: string;
public InsuranceAmt!:number;
public InsuranceCurrency!: string
public IsFurnished!: boolean
public Furnitures!: string
public Remarks!: string
public ExtraPayment!: string
public PropertyType!: string
public Lawyer!: string



  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {
    
    this.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          unique: true,
          autoIncrement: true,
    
        },
        Series: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false
        },
        ContractDate: {
          type: DataTypes.DATE
        },
        FirstParty: {
          type: DataTypes.STRING
        },
        Attributes: {
          type: DataTypes.STRING
        },
         ContractType: {
          type: DataTypes.STRING
        },
        SecondParty: {
          type: DataTypes.STRING,
        
        },
        Property: {
          type: DataTypes.STRING,
        
        },  
         PropertyType: {
          type: DataTypes.STRING,
        
        },
        IsSale: {
          type: DataTypes.BOOLEAN
        },
        IsRent: {
          type: DataTypes.BOOLEAN
        },
        ContractStarts: {
          type: DataTypes.DATEONLY
        },
        ContractEnds: {
          type: DataTypes.DATEONLY
        },
        HandoverDate: {
          type: DataTypes.DATEONLY
        },
        RequestedAmt: {
          type: DataTypes.DOUBLE
        },
        PaidAmt: {
          type: DataTypes.DOUBLE
        },
        PaidCurrency: {
          type: DataTypes.STRING,
       
        },
        RentFor: {
          type: DataTypes.STRING
        },
        RentCurrency: {
          type: DataTypes.STRING,
        
        },
        AdvanceAmt: {
          type: DataTypes.DOUBLE
        },
        AdvanceCurrency: {
          type: DataTypes.STRING,
         
        },
        InsuranceAmt: {
          type: DataTypes.DOUBLE
        },
        InsuranceCurrency: {
          type: DataTypes.STRING,
        
        },
        IsFurnished: {
          type: DataTypes.BOOLEAN
        },
        Furnitures: {
          type: DataTypes.STRING
        },
        Remarks: {
          type: DataTypes.STRING
        },
        ExtraPayment: {
          type: DataTypes.STRING
        },
        Lawyer: {
          type: DataTypes.STRING
        }  ,
         createdBy:{
          type: DataTypes.STRING
        },
        updatedBy:{
          type: DataTypes.STRING
        
        }},
      {
        sequelize: sequelize,
        freezeTableName: true,
        hasTrigger:true,
        name: {
          singular: "Contracts",
          plural: "Contracts",
        },
      }
    );
  }
}

export default Contracts;
