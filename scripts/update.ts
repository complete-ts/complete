// TODO: https://github.com/un-ts/eslint-plugin-import-x/issues/397
// eslint-disable-next-line import-x/no-cycle
import { updatePackageJSONDependenciesMonorepo } from "complete-node";

await updatePackageJSONDependenciesMonorepo();
