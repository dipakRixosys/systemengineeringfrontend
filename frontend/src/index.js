import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// Global stylesheet
import "./index.css";

// Entry point component
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// import versionSwitcher from './versionSwitcher';
import userActivityMonitor from "./userActivityMonitor";
import cacheResource from "./cacheResource";

// Get set local data
import { getLocalData, setLocalData } from "helpers/common";

// Auth
import Login from "screens/Auth/Login";
import NotFound from "screens/Other/NotFound";
import BlankPage from "screens/Dashboard/BlankPage";

// Register
import Register from "screens/Organization/Register";
import VerifyLink from "screens/Organization/VerifyLink";

// Dashboard
import Dashboard from "screens/Dashboard/Dashboard";
import NewProject from "screens/Dashboard/Project/NewProject";
import ListPrograms from "screens/Dashboard/Program/ListPrograms";
import UnderReviewPrograms from "screens/Dashboard/Program/UnderReviewPrograms";
import ApprovedPrograms from "screens/Dashboard/Program/ApprovedPrograms";
import RejectedPrograms from "screens/Dashboard/Program/RejectedPrograms";
import CreatedPrograms from "screens/Dashboard/Program/CreatedPrograms";
import AllPrograms from "screens/Dashboard/Program/AllPrograms";
import NewProgram from "screens/Dashboard/Program/NewProgram";
import Program from "screens/Dashboard/Program/Program";
import ProgramSysConf from "screens/Dashboard/Program/ProgramSysConf";
import ListEcu from "screens/Dashboard/Ecu/ListEcu";
import NewEcu from "screens/Dashboard/Ecu/NewEcu";
import ListSystem from "screens/Dashboard/System/ListSystem";
import NewSystem from "screens/Dashboard/System/NewSystem";
import EETopology from "screens/Dashboard/Program-Details/EETopology";
import ItemDefinition from "screens/Dashboard/Concept-Phase/ItemDefinition";
import AssetIdentification from "screens/Dashboard/Threat-Risk-Assesment/AssetIdentification";
import TARAScreen from "screens/Dashboard/Threat-Risk-Assesment/TARAScreen";
import ResidualRisk from "screens/Dashboard/Threat-Risk-Assesment/ResidualRisk";
import SecurityConcept from "screens/Dashboard/Threat-Risk-Assesment/SecurityConcept";
import StatisticalAnalysis from "screens/Dashboard/Threat-Risk-Assesment/StatisticalAnalysis";
import StatisticalAnalysisGlobal from "screens/Dashboard/Analysis/Statistical-Analysis";
import RiskMapping from "screens/Dashboard/Organization/RiskMapping";
import AttackTree from "screens/Dashboard/Threat-Risk-Assesment/AttackTree";
import AttackTreeSimulation from "screens/Dashboard/Threat-Risk-Assesment/AttackTreeSimulation";
import DesignSpecification from "screens/Dashboard/Product-Development-Phase/DesignSpecification";
import IntegrationVerification from "screens/Dashboard/Product-Development-Phase/IntegrationVerification";
import RequirementSummary from "screens/Dashboard/Product-Development-Phase/RequirementSummary";
import TestVerification from "screens/Dashboard/Product-Development-Phase/TestVerification";
import TestValidation from "screens/Dashboard/Product-Development-Phase/TestValidation";
import Production from "screens/Dashboard/Post-Development/Production";
import Operations from "screens/Dashboard/Post-Development/Operations";
import Decomission from "screens/Dashboard/Post-Development/Decomission";
import AdvanceSearch from "screens/Dashboard/Product-Development-Phase/AdvanceSearch";
import Monitoring from "screens/Dashboard/Cyber-Security/VulnerabilityMonitoringAndTriage";
import CybersecurityEventEvaluation from "screens/Dashboard/Cyber-Security/CybersecurityEventEvaluation";
import VulnerabilityAnalysis from "screens/Dashboard/Cyber-Security/VulnerabilityAnalysis";
import ArchitecturalDesign from "screens/Dashboard/Cyber-Security/ArchitecturalDesign";
import VulnerabilityManagement from "screens/Dashboard/Cyber-Security/VulnerabilityManagement";
import AllVulnerabilityManagement from "screens/Dashboard/Cyber-Security/AllVulnerabilityManagement";
import MonitoringTaraScreens from "screens/Dashboard/Cyber-Security/MonitoringTaraScreens";
import VulnerabilityManagementTaraScreens from "screens/Dashboard/Cyber-Security/VulnerabilityManagementTaraScreens";
import VulnerabilityRiskRating from "screens/Dashboard/Cyber-Security/VulnerabilityRiskRating";

// JIRA Integration (Setup Keys)
import JiraIntegration from "screens/Dashboard/Organization/JiraIntegration";

// Document reader
import DocReader from "screens/Dashboard/Docs/DocReader";

// S-BOM
import SBoMManagementList from "screens/Dashboard/Management/SBoM-Management-List";
import SBoMManagement from "screens/Dashboard/Management/SBoM-Management";

// Digital Twin
import DigitalTwinChooseProgran from "screens/Dashboard/Management/Digital-Twin-Choose-Program";
import DigitalTwin from "screens/Dashboard/Management/Digital-Twin";

// Model Viewer
import ModelViewer from "screens/Model-Viewer/Sample";

// Attack Tree Viewer
import AttackTreeViewer from "screens/Attack-Tree-Viewer/AttackTreeViewer";
import AttackTreeViewerV2 from "screens/Attack-Tree-Viewer/AttackTreeViewerV2";

// Audit Tool
import AuditTool from "screens/Internal-Apps/Audit-Tool/AuditTool";
import AuditToolProgram from "screens/Internal-Apps/Audit-Tool/AuditToolProgram";
// Audit Tool ENDS

// Functional Safety
import FunctionalSafety from "screens/Internal-Apps/Functional-Safety/FunctionalSafety";
import FunctionalSafetyProgram from "screens/Internal-Apps/Functional-Safety/FunctionalSafetyProgram";
import FunctionalSafetyHazop from "screens/Internal-Apps/Functional-Safety/Hazop/FunctionalSafetyHazop";
import FunctionalSafetyHazopHazards from "screens/Internal-Apps/Functional-Safety/Hazop/FunctionalSafetyHazopHazards";
import FunctionalSafetyHazopConfigureFunction from "screens/Internal-Apps/Functional-Safety/Hazop/FunctionalSafetyHazopConfigureFunction";
import FunctionalSafetyHazardDescription from "screens/Internal-Apps/Functional-Safety/Hazard-Description/FunctionalSafetyHazardDescription";
import FunctionalSafetyHARA from "screens/Internal-Apps/Functional-Safety/HARA/FunctionalSafetyHARA";
import FunctionalSafetyHARACreateEvent from "screens/Internal-Apps/Functional-Safety/HARA/FunctionalSafetyHARACreateEvent";
import FunctionalSafetyGoals from "screens/Internal-Apps/Functional-Safety/Safety-Goals/FunctionalSafetyGoals";
import FunctionalSafetyGoalsGraph from "screens/Internal-Apps/Functional-Safety/Safety-Goals/FunctionalSafetyGoalsGraph";
import FunctionalSafetyConcept from "screens/Internal-Apps/Functional-Safety/Concept/FunctionalSafetyConcept";
// Functional Safety ENDS

// Interface Agreement
import InterfaceAgreement from "screens/Internal-Apps/Interface-Agreement/InterfaceAgreement";
import InterfaceAgreementProgram from "screens/Internal-Apps/Interface-Agreement/InterfaceAgreementProgram";
// Interface Agreement ENDS

// [V2 Routes]
import V2Dashboard from "screens/V2/V2Dashboard";
// [V2 Routes ENDS]

// Auth Guard
const AuthGuard = ({ component: Component, ...rest }) => {
  // Only allowed if Auth-Token is found
  let auth = getLocalData("authToken") !== null && getLocalData("user") !== null;
  if (!auth) {
    setLocalData("show-login-alert", true);
  }
  // Else ask for Login-Prompt
  return (
    <Route {...rest} render={(props) =>
        auth === true ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

ReactDOM.render(
  <Router>
    <Switch>
      {/* App mounted */}
      <Route exact path="/" component={App} />

      {/* Auth routes */}
      <Route exact path="/login" component={Login} />

      <Route exact path="/register" component={Register} />
      <Route exact path="/verify-organization/:organizationUuid" component={VerifyLink} />

      {/* Dashboard routes */}
      <AuthGuard exact path="/dashboard" component={Dashboard} />
      <AuthGuard exact path="/dashboard/new-project" component={NewProject} />

      <AuthGuard exact path="/dashboard/programs" component={ListPrograms} />
      <AuthGuard exact path="/dashboard/under-review-programs" component={UnderReviewPrograms} />
      <AuthGuard exact path="/dashboard/approved-programs" component={ApprovedPrograms} />
      <AuthGuard exact path="/dashboard/rejected-programs" component={RejectedPrograms} />
      <AuthGuard exact path="/dashboard/created-programs" component={CreatedPrograms} />
      <AuthGuard exact path="/dashboard/all-programs" component={AllPrograms} />
      <AuthGuard exact path="/dashboard/new-program" component={NewProgram} />
      <AuthGuard exact path="/dashboard/program/:programUuid" component={Program} />
      <AuthGuard exact path="/dashboard/system-configuration/:programUuid" component={ProgramSysConf} />

      <AuthGuard exact path="/dashboard/ecu" component={ListEcu} />
      <AuthGuard exact path="/dashboard/new-ecu" component={NewEcu} />
      <AuthGuard exact path="/dashboard/jira-integration" component={JiraIntegration} />

      <AuthGuard exact path="/dashboard/system" component={ListSystem} />
      <AuthGuard exact path="/dashboard/new-system" component={NewSystem} />

      <AuthGuard exact path="/dashboard/program-details/ee-topology" component={EETopology} />

      <AuthGuard exact path="/dashboard/concept-phase/item-definition/:programUuid" component={ItemDefinition} />

      <AuthGuard exact path="/dashboard/threat-risk-assesment/asset-identification/:programUuid" component={AssetIdentification} />
      <AuthGuard exact path="/dashboard/threat-risk-assesment/tara/:programUuid" component={TARAScreen} />
      <AuthGuard exact path="/dashboard/threat-risk-assesment/residual-risk/:programUuid" component={ResidualRisk} />
      <AuthGuard exact path="/dashboard/threat-risk-assesment/security-concept/:programUuid" component={SecurityConcept} />
      <AuthGuard exact path="/dashboard/threat-risk-assesment/statistical-analysis/:programUuid" component={StatisticalAnalysis} />
      <AuthGuard exact path="/dashboard/threat-risk-assesment/attack-tree/:programUuid" component={AttackTree} />
      <AuthGuard exact path="/dashboard/threat-risk-assesment/attack-tree-simulation/:programUuid" component={AttackTreeSimulation} />
      
      <AuthGuard exact path="/dashboard/organization/risk-mapping" component={RiskMapping} />
      
      <AuthGuard exact path="/dashboard/analysis/statistical-analysis" component={StatisticalAnalysisGlobal} />
      
      <AuthGuard exact path="/dashboard/product-development-phase/design-specification/:programUuid" component={DesignSpecification} />
      <AuthGuard exact path="/dashboard/product-development-phase/integration-verification/:programUuid" component={IntegrationVerification} />
      <AuthGuard exact path="/dashboard/product-development-phase/requirement-summary/:programUuid" component={RequirementSummary} />
      <AuthGuard exact path="/dashboard/product-development-phase/test-verification/:programUuid" component={TestVerification} />
      <AuthGuard exact path="/dashboard/product-development-phase/test-validation/:programUuid" component={TestValidation} />
      <AuthGuard exact path="/dashboard/product-development-phase/advance-search" component={AdvanceSearch} />
      
      <AuthGuard exact path="/dashboard/post-development/production/:programUuid" component={Production} />
      <AuthGuard exact path="/dashboard/post-development/operations/:programUuid" component={Operations} />
      <AuthGuard exact path="/dashboard/post-development/decomission/:programUuid" component={Decomission} />
      
      
      <AuthGuard exact path="/dashboard/cybersecurity/vulnerability-monitoring-and-triage/:programUuid" component={Monitoring} />
      <AuthGuard exact path="/dashboard/cybersecurity/cybersecurity-event-evaluation/:programUuid" component={CybersecurityEventEvaluation} />
      <AuthGuard exact path="/dashboard/cybersecurity/vulnerability-analysis/:programUuid" component={VulnerabilityAnalysis} />
      <AuthGuard exact path="/dashboard/cybersecurity/architectural-design/:programUuid" component={ArchitecturalDesign} />
      <AuthGuard exact path="/dashboard/cybersecurity/vulnerability-management/:programUuid" component={VulnerabilityManagement} />
      <AuthGuard exact path="/dashboard/cybersecurity/vulnerability-management" component={AllVulnerabilityManagement} />
      <AuthGuard exact path="/dashboard/cybersecurity/monitoring-tara-screens/:programUuid" component={MonitoringTaraScreens} />
      <AuthGuard exact path="/dashboard/cybersecurity/vulnerability-management-tara-screens/:programUuid" component={VulnerabilityManagementTaraScreens} />
      <AuthGuard exact path="/dashboard/cybersecurity/vulnerability-risk-rating/:programUuid/:vulnerabilityUuid" component={VulnerabilityRiskRating} />
      
      <AuthGuard exact path="/dashboard/sbom-management" component={SBoMManagementList} />
      <AuthGuard exact path="/dashboard/sbom-management/:programUuid" component={SBoMManagement} />
      
      <AuthGuard exact path="/dashboard/digital-twin" component={DigitalTwinChooseProgran} />
      <AuthGuard exact path="/dashboard/digital-twin/:programUuid" component={DigitalTwin} />

      <AuthGuard exact path="/docs/:slug" component={DocReader} />


      {/* Model Viewer routes */}
      <Route exact path="/model-viewer" component={ModelViewer} />

      {/* Attack Tree Viewer routes */}
      <Route exact path="/dashboard/attack-tree-viewer/:programUuid" component={AttackTreeViewer} />
      <Route exact path="/dashboard/attack-tree-viewer-v2/:programUuid" component={AttackTreeViewerV2} />

      {/* Blank page */}
      <Route exact path="/blank" component={BlankPage} />

      {/* V2 Application Routes */}
      <Route exact path="/v2/dashboard" component={V2Dashboard} />
      {/* V2 Application Routes ENDS */}

      {/* Functional Safety Routes */}
      <Route exact path="/app/functional-safety" render={(props) => <FunctionalSafety {...props} programType="ALL" />} />
      <Route exact path="/app/functional-safety/programs" render={(props) => <FunctionalSafety {...props} programType="MY" />} />
      <Route exact path="/app/functional-safety/under-reviewed-programs" render={(props) => <FunctionalSafety {...props} programType="UNDER_REVIEWED" />} />
      <Route exact path="/app/functional-safety/approved-programs" render={(props) => <FunctionalSafety {...props} programType="APPROVED" />} />

      <Route exact path="/app/functional-safety/program/:programUuid" component={FunctionalSafetyProgram} />
      
      <Route exact path="/app/functional-safety/hazop/:programUuid" component={FunctionalSafetyHazop} />
      <Route exact path="/app/functional-safety/hazop-hazards/:programUuid/:functionUuid" component={FunctionalSafetyHazopHazards} />

      <Route exact path="/app/functional-safety/hazop-function-configure/:programUuid/:functionUuid" component={FunctionalSafetyHazopConfigureFunction} />
      <Route exact path="/app/functional-safety/hazop-function-configure-edit/:programUuid/:functionUuid/:hazardUuid" component={FunctionalSafetyHazopConfigureFunction} />
      
      <Route exact path="/app/functional-safety/hazard-description/:programUuid" component={FunctionalSafetyHazardDescription} />
      
      <Route exact path="/app/functional-safety/hara/:programUuid" component={FunctionalSafetyHARA} />
      <Route exact path="/app/functional-safety/hara/create-event/:programUuid" component={FunctionalSafetyHARACreateEvent} />

      <Route exact path="/app/functional-safety/hara/edit-event/:programUuid/:hazardEventId" component={FunctionalSafetyHARACreateEvent} />
      
      <Route exact path="/app/functional-safety/goals/:programUuid" component={FunctionalSafetyGoals} />
      <Route exact path="/app/functional-safety/goals-graph/:programUuid" component={FunctionalSafetyGoalsGraph} />

      <Route exact path="/app/functional-safety/concept/:programUuid" component={FunctionalSafetyConcept} />
      {/* Functional Safety Routes ENDS */}

      {/* Interface Agreement Routes */}
      <Route exact path="/app/interface-agreement" component={InterfaceAgreement} />
      <Route exact path="/app/interface-agreement/program/:programUuid" component={InterfaceAgreementProgram} />
      {/* Interface Agreement Routes ENDS */}

      {/* Audit Tool Routes */}
      <Route exact path="/app/audit-tool" component={AuditTool} />
      <Route exact path="/app/audit-tool/program/:programUuid" component={AuditToolProgram} />
      {/* Audit Tool Routes ENDS */}

      {/* Not-found page */}
      <AuthGuard path="*" component={NotFound} />
    </Switch>
  </Router>,
  document.getElementById("root")
);

reportWebVitals();
cacheResource();
userActivityMonitor.init();
