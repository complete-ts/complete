// Packages held back:
// - "react" - Docusaurus requires v18.
// - "react-dom" - Docusaurus requires v18.

import { $ } from "execa";

const $$ = $({ stdin: "inherit" });
$.sync`npm-check-updates --help`;

// await updatePackageJSONDependenciesMonorepo();
