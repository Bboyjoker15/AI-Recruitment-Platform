const { execSync } = require("child_process");
execSync("npx lint-staged", { stdio: "inherit", shell: true });
