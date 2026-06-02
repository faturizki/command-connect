"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var vite_2 = require("@tailwindcss/vite");
var vite_tsconfig_paths_1 = require("vite-tsconfig-paths");
var vite_3 = require("@tanstack/router-plugin/vite");
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, vite_3.TanStackRouterVite)({ autoCodeSplitting: true }),
        (0, plugin_react_1.default)(),
        (0, vite_2.default)(),
        (0, vite_tsconfig_paths_1.default)(),
    ],
    resolve: {
        alias: { "@shared": "../packages/shared" },
    },
    build: { outDir: "dist" },
});
