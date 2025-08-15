// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1) Global ignores (faster + fewer false positives)
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "coverage/**",
    ],
  },

  // 2) Next.js base configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 3) Project rules (no `any`, clean unused vars, etc.)
  {
    rules: {
      // Use the TS-aware rule; allow "_" prefix to intentionally ignore
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Keep you honest, but allow *documented* ts-expect-error when truly needed
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
          minimumDescriptionLength: 3,
        },
      ],

      // Reasonable strictness; OK to leave console in API routes
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // 4) (Optional) Be a bit looser in UI files where <img> can appear before refactor
  //    Remove this block once you've migrated to next/image everywhere.
  // {
  //   files: ["**/*.{tsx,jsx}"],
  //   rules: {
  //     "@next/next/no-img-element": "off",
  //   },
  // },
];

export default eslintConfig;
