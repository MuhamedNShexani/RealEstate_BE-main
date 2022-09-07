
export type TypeBranches = { Series: string, BranchName: string, isGroup: boolean, ParentBranch: string };
export class Branches  { Series: string=""; BranchName: string=""; isGroup?: boolean=false; ParentBranch: string="" };
export type TypeContracts = {Series: string,ContractDate: Date,FirstParty: string,SecondParty: string,Property: string,IsSale: Boolean,IsRent: Boolean,ContractStarts: Date,ContractEnds: Date,HandoverDate: Date,RequestedAmt: string,PaidAmt: number,PaidCurrency: number,RentFor: string,RentCurrency: string,AdvanceAmt: string,AdvanceCurrency: string,InsuranceCurrency: string,IsFurnished: boolean,Furnitures: string,Remarks: string,ExtraPayment: string,Lawyer: string}
export type TypeContractTemplates = { Series:string, TemplateName:string, DocType:string,PrintFormat:String,}
export type TypeContractType = { Series:String, ContractType:String}
export type TypeCurrency={ Series:string, CurrencyName:string, Symbol:string, Format:string, Enabled:boolean, Default:boolean}
export type TypeParty={Series:string,FullName:string,Phone:number,Cell:number,Address:string,Gender:boolean,Remarks:string}
export class Partys{Series:string="";FullName:string="";Phone:number=0;Cell:number=0;Address:string="";Gender:boolean=false;Remarks:string=""}
export type TypePayments={Series:string;PostingDate:Date,Reference:string,Purpose:string, Amount:number,Currency:string,For:string,Remarks:string}
export type TypePermission={Series:string,RoleSeries:string,DocTypeID:string,Read:boolean,Write:boolean,Create:boolean,Delete:boolean}
export type TypePropertyAttr={Series:string,Attribute:string}
export type TypeProperty={Series:string,Territory:string,Purpose:string,Location:string,Attributes:string,IsFurnished:boolean,Furnitures:string,Party:string,RequestedAmt:number,Currency:string}
export type TypePropertyType={Series:string,TypeName:string }
export type TypePurpose={Series:string,Purpose:string,IsPayable:boolean,DefaultAmt:number,DefaultCurrency:string,  }
export type TypeRoles={Series:string,RoleName:string  }
export type TypeTerritory={Series:string,Territory:string,Parent:string,IsGroup:boolean}
export type TypeUsers={Series:string,FullName:string,UserName:string,Password:string,Language:string,RoleID:string,FromDate:Date,ToDate:Date,Branch:string,Disabled:Date,   }
