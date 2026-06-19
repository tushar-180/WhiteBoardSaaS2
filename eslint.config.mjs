import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Relax strict TS rules for test files where mocking requires `any` types
  {
    files: ["src/__tests__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  // User avatar <img> tags: dynamic user-uploaded URLs require native <img> for CORS/flexibility
  {
    files: [
      "src/components/settings/members-tab.tsx",
      "src/components/settings/profile-settings.tsx",
      "src/components/workspace/members/workspace-member-row.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Aceternity UI animation components intentionally use patterns that ESLint flags
  {
    files: ["src/components/ui/wavy-background.tsx", "src/components/ui/glowing-stars.tsx", "src/components/ui/hover-border-gradient.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  // Dialog/state-init components: set-state-in-effect is intentional for client hydration
  {
    files: [
      "src/components/workspace/dialogs/invite-member-dialog.tsx",
      "src/components/workspace/workspaces-client.tsx",
      "src/components/settings/invites-tab.tsx",
      "src/components/ui/glowing-stars.tsx",
      "src/components/ui/wavy-background.tsx",
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
