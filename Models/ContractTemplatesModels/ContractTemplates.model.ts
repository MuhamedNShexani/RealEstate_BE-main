import { DataTypes, Model, Sequelize } from "sequelize";

class ContractTemplates extends Model {
  public Series!: string;
  public Name!: string;
  public HTML!: string;
  public Doctype!: string;
  public IsRtl!: boolean;
  public IsReceipt!: boolean;
  public IsDefault!: boolean;
  public CopyCount!: number;
  public PrintOnSubmit!: boolean;
  public PrintOnSave!: boolean;
  public IsLandScape!: boolean;
  public FontSize!: string;
  public FontFamily!: string;
  public TableHeadersColor!: string;

  // Auto-generated
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: String;
  public updatedBy!: String;

  public static initialize(sequelize: Sequelize) {
    this.init(
      {
        Series: DataTypes.STRING,
        Name: DataTypes.STRING,
        HTML: DataTypes.STRING,
        Doctype: DataTypes.STRING,
        IsRtl: DataTypes.BOOLEAN,
        IsReceipt: DataTypes.BOOLEAN,
        IsDefault: DataTypes.BOOLEAN,
        CopyCount: DataTypes.DOUBLE,
        PrintOnSubmit: DataTypes.BOOLEAN,
        PrintOnSave: DataTypes.BOOLEAN,
        IsLandscape: DataTypes.BOOLEAN,
        FontSize: DataTypes.STRING,
        FontFamily: DataTypes.STRING,
        TableHeadersColor: DataTypes.STRING,
      },
      {
        sequelize: sequelize,
        name: {
          singular: "ContractTemplates",
          plural: "ContractTemplates",
        },
      }
    );
  }
}

export default ContractTemplates;