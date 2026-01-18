import { monorepoPublish } from "complete-node";

// TODO: Get "npm-check-updates" working with catalogs.
await monorepoPublish(import.meta.dirname, false);
