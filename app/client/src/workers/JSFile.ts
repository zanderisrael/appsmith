import { Obj } from "tern";

const { getGlobals } = require("./ast");

if (process.env.NODE_ENV != "production") {
  (self as any).$RefreshReg$ = () => ({});
  (self as any).$RefreshSig$ = () => () => ({});
}

/**
 * Enabling ts-rule --noImplicitThis will restrict this usage to only classes.
 * We need a function contructor to
 * */

function JSFileCore(fnBody: string) {
  // babel-transpiler
  try {
    eval(fnBody);
  } catch (e) {
    return {};
  }
  return {
    __getValue__: function(property: string): any {
      return eval(property);
    },
    __setValue__: function(exp: string): any {
      return eval(exp);
    },
    __typeof__: function(prop: string) {
      return typeof eval(prop);
    },
  };
}

function JSFileProxyfier(jsFile: any) {
  return new Proxy(jsFile, {
    get(target: any, property: string) {
      return target.__getValue__(property);
    },
    set(target: any, property: string, value: any) {
      try {
        let exp = `${property} = ${value}`;
        if (Array.isArray(value)) {
          exp = `${property} = [${value}]`;
        } else if (value && typeof value === "object") {
          exp = `${property} = ${JSON.stringify(value)}`;
        } else if (typeof value === "string") {
          exp = `${property} = "${value}"`;
        }
        target.__setValue__(exp);
        return true;
      } catch (e) {
        //Log error
        return false;
      }
    },
  });
}

function JSFileFactory(JSEntity: any) {
  const { body } = JSEntity;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: No types available
  const jsFileCore = JSFileCore(body);
  return JSFileProxyfier(jsFileCore);
}

exports.JSFileFactory = JSFileFactory;
