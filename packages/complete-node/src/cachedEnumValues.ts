// These cached enum value arrays are only meant to be used internally within
// `complete-node`.

import { getEnumValues } from "complete-common";
import { PackageManager } from "./enums/PackageManager.js";

export const PACKAGE_MANAGER_VALUES = getEnumValues(PackageManager);
