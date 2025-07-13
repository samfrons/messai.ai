"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Button: () => Button,
  Card: () => Card,
  CardContent: () => CardContent,
  CardHeader: () => CardHeader,
  CardTitle: () => CardTitle,
  Input: () => Input,
  cn: () => cn,
  theme: () => theme,
  useDebounce: () => useDebounce,
  useLoading: () => useLoading
});
module.exports = __toCommonJS(index_exports);

// src/components/index.tsx
var import_react = __toESM(require("react"));

// src/theme/index.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}
var theme = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#3b82f6",
      900: "#1e3a8a"
    },
    scientific: {
      positive: "#10b981",
      negative: "#ef4444",
      neutral: "#6b7280",
      confidence: "#8b5cf6"
    }
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem"
  }
};

// src/components/index.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var Button = import_react.default.forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        className: cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
            "border border-gray-300 bg-transparent hover:bg-gray-50": variant === "outline"
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 py-2": size === "md",
            "h-11 px-8": size === "lg"
          },
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
var Input = import_react.default.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
var Card = import_react.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      className: cn(
        "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm",
        className
      ),
      ...props
    }
  )
);
Card.displayName = "Card";
var CardHeader = import_react.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      className: cn("flex flex-col space-y-1.5 p-6", className),
      ...props
    }
  )
);
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "h3",
    {
      ref,
      className: cn("text-2xl font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
var CardContent = import_react.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";

// src/hooks/index.ts
var import_react2 = require("react");
function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = (0, import_react2.useState)(initialState);
  return {
    isLoading,
    setLoading: setIsLoading,
    withLoading: async (asyncFn) => {
      setIsLoading(true);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        setIsLoading(false);
      }
    }
  };
}
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = (0, import_react2.useState)(value);
  (0, import_react2.useEffect)(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  cn,
  theme,
  useDebounce,
  useLoading
});
//# sourceMappingURL=index.js.map