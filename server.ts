
import TerritoryController from "./Models/TerritoryModels/TerritoryController";
import BranchesController from "./Models/BranchesModels/BranchesController";
import ContractsController from "./Models/ContractsModels/ContractsController";
import ContractTemplatesController from "./Models/ContractTemplatesModels/ContractTemplatesController";
import ContractTypeController from "./Models/ContractTypeModels/ContractTypeController";
import CurrencyController from "./Models/CurrencyModels/CurrencyController";
import PartyController from "./Models/PartyModels/PartyController";
import PaymentsController from "./Models/PaymentsModels/PaymentsController";
import PropertyAttrController from "./Models/PropertyAttrModels/PropertyAttrController";
import PropertyController from "./Models/PropertyModels/PropertyController";
import PropertyTypeController from "./Models/PropertyTypeModels/PropertyTypeController";
import PurposeController from "./Models/PurposeModels/PurposeController";
import RolesController from "./Models/RolesModels/RolesController";
import UsersController from "./Models/UsersModels/UsersController";
import App from "./app";
import PrintKeys from "./Models/PrintKey/PrintKey.controllers";
import DocTypes from "./Models/DocTypes/DocTypes.controllers";
import PermsController from "./Models/Permission/Permission.controller";
import AttachmentController from "./Models/attachment/AttachmentAPI";
import CurrencyExchangeController from "./Models/CurrencyExchangeModels/CurrencyExchangeController";
import ReportsController from "./Models/ReportsModels/ReportsController";
import LawyerController from "./Models/LawyerModels/LawyerController";

const app = new App(
    [new TerritoryController(),
    new BranchesController(),
    new ContractsController(),
    new ContractTemplatesController(),
    new ContractTypeController(),
    new CurrencyController(),
    new PartyController(),
    new PaymentsController(),
    new PropertyAttrController(),
    new PropertyController(),
    new CurrencyExchangeController(),
    new PropertyTypeController(),
    new PurposeController(),
    new RolesController(),
    new PrintKeys(),
    new DocTypes(),
    new LawyerController(),
    new PermsController(),
    new UsersController(),
    new AttachmentController(),
    new ReportsController()
    ], 8080);

app.listen();
