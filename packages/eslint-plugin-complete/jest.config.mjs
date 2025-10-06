// @ts-check

/** @type {import("jest").Config} */
const config = {
  // See: https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring
  // Even though we are not using `ts-jest`, we must apply the same ESM fix as documented here:
  // https://github.com/swc-project/jest/issues/64#issuecomment-1029753225
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // See: https://jestjs.io/docs/configuration#testpathignorepatterns-arraystring
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
};

export default config;
