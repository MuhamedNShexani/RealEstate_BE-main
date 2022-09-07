import { DataTypes, Model, Sequelize } from "sequelize";
import * as bcrypt from "bcrypt"
class Users extends Model {
  public Series!: string;
public  FullName!: string;
public  UserName!: string;
public  Password!: string;
public  Language!: string;
public  RoleID!: string;
public FromDate!: Date;
public ToDate!: Date;
public  Branch!: string;
public  Disabled!: boolean;
public  Account!: string;
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
    
        }, Series: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false
        },
        FullName: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        UserName: {
          type: DataTypes.STRING,
          allowNull: false
          , unique: true
        },
        Password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: { 
               args: [7, 42],
               msg: "The password length should be between 7 and 42 characters."
            }
         },
        },
        Language: {
          type: DataTypes.STRING
        },
        RoleID: {
          type: DataTypes.STRING,
        },
        FromDate: {
          type: DataTypes.DATEONLY
        },
        ToDate: {
          type: DataTypes.DATEONLY
        },
        Branch: {
          type: DataTypes.STRING,
    
        },
        Disabled: {
          type: DataTypes.BOOLEAN
        },
        createdBy: { type: DataTypes.STRING, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: true },
        updatedAt: { type: DataTypes.DATE, allowNull: true },
        updatedBy: { type: DataTypes.STRING, allowNull: true },
       },
        {
        hooks: {
          beforeCreate: async (user) => {
            if (user.Password) {
              const salt = await bcrypt.genSaltSync(10, 'a');
              user.Password = bcrypt.hashSync(user.Password, salt);
              console.log(user.Password)
            }
          },
          beforeUpdate: async (user) => {
            if (user.Password) {
              const salt = bcrypt.genSaltSync(10,'a');
              user.Password = bcrypt.hashSync(user.Password, salt);

            }
          }
        }, sequelize: sequelize,
              freezeTableName: true,
              name: {
                singular: "Users",
                plural: "Users",
              }
        
        // instanceMethods: {
        //   validPassword: (Password) => {
        //     return bcrypt.compareSync(Password, this.Password);
        //   }
        // }
      });
      // Users.prototype.validPassword = async (Password, hash) => {
      //   return await bcrypt.compareSync(Password, hash);
      // }
      // {
      //   
      // }
    
  }

}

export default Users;
