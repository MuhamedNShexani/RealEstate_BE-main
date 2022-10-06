import { DataTypes, Model, Sequelize } from "sequelize";

class PrintKeys extends Model {
    public PrintKey!: string;
    public Arabic!: string;
    public Kurdish!: string;
    public Turkish !: string;
    public Doctype!: string;
    public ReplacementObject!: string;
    public updatedBy!: string;
    public createdBy!: string;
    public ReplacementColumnHeader_ar!: string;
    public ReplacementColumnHeader_en!: string;
    public ReplacementColumnHeader_kr!: string;
    public ReplacementColumnHeader_tr!: string;
    // Auto-generated
    public id!: number;
    public createdAt!: Date;
    public updatedAt!: Date;


    public static initialize(sequelize: Sequelize) {

        this.init(
            {
                ID: {
                    type: DataTypes.INTEGER,
                    unique: true,
                    autoIncrement: true,
                },
                PrintKey: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false
                },
                Arabic: {
                    type: DataTypes.STRING
                },
                Kurdish: { type: DataTypes.STRING },
                Turkish: { type: DataTypes.STRING },
                Doctype: { type: DataTypes.STRING },
                ReplacementObject: { type: DataTypes.STRING },
                createdAt: { type: DataTypes.DATE },
                updatedAt: { type: DataTypes.DATE },
                updatedBy: { type: DataTypes.STRING },
                createdBy: { type: DataTypes.STRING },
                ReplacementColumnHeader_ar: { type: DataTypes.STRING },
                ReplacementColumnHeader_en: { type: DataTypes.STRING },
                ReplacementColumnHeader_kr: { type: DataTypes.STRING },
                ReplacementColumnHeader_tr: { type: DataTypes.STRING }


            },
            {
                sequelize: sequelize,
                freezeTableName: true,
                name: {
                    singular: "PrintKeys",
                    plural: "PrintKeys",
                },
            }
        );
    }

};

export default PrintKeys;
