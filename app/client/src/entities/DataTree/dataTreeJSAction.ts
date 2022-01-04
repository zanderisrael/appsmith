import {
  DataTreeJSAction,
  ENTITY_TYPE,
  MetaArgs,
} from "entities/DataTree/dataTreeFactory";
import { JSCollectionData } from "reducers/entityReducers/jsActionsReducer";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { DependencyMap } from "utils/DynamicBindingUtils";
import { getGlobals } from "workers/ast";

export const generateDataTreeJSAction = (
  js: JSCollectionData,
): DataTreeJSAction => {
  const meta: Record<string, MetaArgs> = {};
  const dynamicBindingPathList = [];
  const bindingPaths: Record<string, EvaluationSubstitutionType> = {};
  const variableList: Record<string, any> = {};
  const variables = js.config.variables;
  const listVariables: Array<string> = [];
  dynamicBindingPathList.push({ key: "body" });
  const reg = /this\./g;
  const removeThisReference = js.config.body.replace(reg, `${js.config.name}.`);
  bindingPaths["body"] = EvaluationSubstitutionType.SMART_SUBSTITUTE;

  const globals = getGlobals(js.config.body);

  const preEvalDependencies = globals.reduce((acc: any, globalNode: any) => {
    globalNode.nodes.forEach((currentNode: any) => {
      const parentNodes = currentNode.parents;
      const len = parentNodes.length;
      let hasFunction = false;
      let topLevelVariable = "";
      for (let i = 0; i < len; i++) {
        const node = parentNodes[i];
        if (
          !topLevelVariable &&
          (node.type === "VariableDeclarator" ||
            node.type === "FunctionDeclaration")
        ) {
          topLevelVariable = node.id.name;
        }
        if (
          node.type === "ArrowFunctionExpression" ||
          node.type === "FunctionDeclaration"
        ) {
          hasFunction = true;
        }
        if (hasFunction) break;
      }
      if (hasFunction) {
        acc[topLevelVariable] = acc[topLevelVariable] || [];
        if (
          !acc[topLevelVariable].find((dep: string) => dep === globalNode.name)
        )
          acc[topLevelVariable].push(globalNode.name);
      } else {
        acc[js.config.name] = acc[js.config.name] || [];
        if (!acc[js.config.name].find((dep: string) => dep === globalNode.name))
          acc[js.config.name].push(globalNode.name);
      }
    });
    return acc;
  }, {});

  // if (variables) {
  //   for (let i = 0; i < variables.length; i++) {
  //     const variable = variables[i];
  //     variableList[variable.name] = variable.value;
  //     listVariables.push(variable.name);
  //   }
  // }
  const dependencyMap: DependencyMap = preEvalDependencies;
  dependencyMap["body"] = dependencyMap[js.config.name];
  delete dependencyMap[js.config.name];
  // const actions = js.config.actions;
  // if (actions) {
  //   for (let i = 0; i < actions.length; i++) {
  //     const action = actions[i];
  //     meta[action.name] = {
  //       arguments: action.actionConfiguration.jsArguments,
  //     };
  //     bindingPaths[action.name] = EvaluationSubstitutionType.SMART_SUBSTITUTE;
  //     dynamicBindingPathList.push({ key: action.name });
  //     dependencyMap["body"].push(action.name);
  //   }
  // }
  return {
    ...variableList,
    name: js.config.name,
    actionId: js.config.id,
    pluginType: js.config.pluginType,
    ENTITY_TYPE: ENTITY_TYPE.JSACTION,
    body: removeThisReference,
    meta: meta,
    bindingPaths: bindingPaths,
    dynamicBindingPathList: dynamicBindingPathList,
    variables: listVariables,
    dependencyMap: dependencyMap,
  };
};
