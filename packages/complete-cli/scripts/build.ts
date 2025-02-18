import {
  $s,
  buildScript,
  fixMonorepoPackageDistDirectory,
} from "complete-node";

await buildScript((packageRoot) => {
  $s`tsc`;
  fixMonorepoPackageDistDirectory(packageRoot);
});
