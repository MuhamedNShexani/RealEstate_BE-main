import { DataTypes, Model, Sequelize } from "sequelize";

class DocTypes extends Model {
    public Series!: string;
    public DocType!: string;
    public updatedBy!: string;
    public createdBy!: string;


    // Auto-generated
    public ID!: number;
    public createdAt!: Date;
    public updatedAt!: Date;


    public static initialize(sequelize: Sequelize) {

        this.init(
            {

                Series:{
                    type: DataTypes.STRING,
                    unique: true,
                },
               DocType:{
                type: DataTypes.STRING,
                unique: true,

               },
                createdAt: { type: DataTypes.DATE },
                updatedAt: { type: DataTypes.DATE },
                updatedBy: { type: DataTypes.STRING },
                createdBy: { type: DataTypes.STRING },

            },
            {
                sequelize: sequelize,
                freezeTableName: true,
                name: {
                    singular: "DocType",
                    plural: "DocType",
                },
            }
        );
    }

};

export default DocTypes;
