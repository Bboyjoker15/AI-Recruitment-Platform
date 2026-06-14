const { execSync } = require("child_process");
execSync("npx tsc --noEmit", { stdio: "inherit", shell: true });
