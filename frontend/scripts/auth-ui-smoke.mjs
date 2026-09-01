// Uses an isolated Chrome profile and the DevTools protocol to smoke-test the
// running authentication UI without adding a browser-testing dependency.
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);
const chromePath = chromeCandidates.find(existsSync);
const appUrl = process.env.AUTH_UI_TEST_URL || "http://localhost:5173";
const profilePath = mkdtempSync(join(tmpdir(), "learnquick-auth-ui-"));
const activePortFile = join(profilePath, "DevToolsActivePort");
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

if (!chromePath) {
  throw new Error(
    "Chrome was not found. Set CHROME_PATH to run the auth UI smoke test.",
  );
}

const browser = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profilePath}`,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);

const waitForActivePort = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(activePortFile)) {
      return readFileSync(activePortFile, "utf8").split(/\r?\n/)[0];
    }
    if (browser.exitCode !== null) {
      throw new Error("Chrome exited before its test session was ready.");
    }
    await delay(100);
  }
  throw new Error("Chrome did not expose a DevTools port in time.");
};

const connect = async (webSocketUrl) => {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let nextId = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    socket,
    send(method, params = {}) {
      nextId += 1;
      const id = nextId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

let devtools;

try {
  const port = await waitForActivePort();
  const targetResponse = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  );
  const target = await targetResponse.json();
  devtools = await connect(target.webSocketDebuggerUrl);
  await devtools.send("Page.enable");
  await devtools.send("Runtime.enable");

  const evaluate = async (expression) => {
    const result = await devtools.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error("The browser page raised a JavaScript exception.");
    }
    return result.result.value;
  };

  const openPage = async (path, width, height, expectedText) => {
    await devtools.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await devtools.send("Page.navigate", { url: `${appUrl}${path}` });

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const text = await evaluate("document.body?.innerText || ''");
      if (text.includes(expectedText)) break;
      await delay(100);
    }

    await delay(500);
    return evaluate(`(() => {
      const buttons = [...document.querySelectorAll("button")];
      const namedButton = (name) =>
        buttons.find((button) => button.textContent.includes(name));
      return {
        text: document.body.innerText,
        googleDisabled: Boolean(namedButton("Continue with Google")?.disabled),
        microsoftPresent: Boolean(namedButton("Continue with Microsoft")),
        applePresent: Boolean(namedButton("Continue with Apple")),
        emailInputPresent: Boolean(document.querySelector('input[type="email"]')),
        passwordInputPresent: Boolean(document.querySelector('input[type="password"]')),
        runtimeError: document.body.innerText.includes("Something went wrong"),
      };
    })()`);
  };

  const login = await openPage("/login", 1440, 900, "Welcome back");
  assert(login.text.includes("Continue with Google"), "Google login button is missing.");
  assert(!login.microsoftPresent, "Microsoft sign-in is still visible.");
  assert(!login.applePresent, "Apple sign-in is still visible.");
  assert(login.emailInputPresent, "Manual email login is missing.");
  assert(login.passwordInputPresent, "The login password field is missing.");
  assert(login.text.includes("Forgot password?"), "Password recovery is missing.");
  assert(!login.runtimeError, "The login page hit the error boundary.");

  const register = await openPage(
    "/register",
    390,
    844,
    "Create an account",
  );
  assert(
    register.text.includes("Continue with Google"),
    "Google is missing from mobile registration.",
  );
  assert(!register.microsoftPresent, "Microsoft sign-up is still visible.");
  assert(!register.applePresent, "Apple sign-up is still visible.");
  assert(register.emailInputPresent, "Manual email sign-up is missing.");
  assert(register.passwordInputPresent, "The sign-up password field is missing.");
  assert(!register.runtimeError, "The registration page hit the error boundary.");

  const forgot = await openPage(
    "/forgot-password",
    390,
    844,
    "Reset password",
  );
  assert(
    forgot.text.includes("Send reset link"),
    "The password-reset request form did not render.",
  );

  const reset = await openPage(
    "/reset-password/synthetic-token",
    390,
    844,
    "Choose a new password",
  );
  assert(
    reset.text.includes("Update password"),
    "The new-password form did not render.",
  );

  const callback = await openPage(
    "/auth/callback?error=provider_not_configured",
    1440,
    900,
    "Sign-in needs attention",
  );
  assert(
    callback.text.includes("has not been configured yet"),
    "The OAuth configuration error was not explained to the user.",
  );

  console.log(
    JSON.stringify(
      {
        desktopLogin: "pass",
        mobileRegistration: "pass",
        emailPasswordForms: "pass",
        forgotAndResetPassword: "pass",
        googleAdditionalOption: "pass",
        microsoftAndAppleAbsent: "pass",
        oauthErrorCallback: "pass",
      },
      null,
      2,
    ),
  );

} finally {
  if (devtools) {
    try {
      await devtools.send("Browser.close");
    } catch {
      // The browser may already have closed after a failed assertion.
    }
    devtools.socket.close();
  }

  // Chrome's helper processes can briefly retain Windows file handles after
  // Browser.close resolves, so retry cleanup instead of reporting a false
  // application test failure.
  await delay(1500);
  if (browser.exitCode === null) browser.kill();
  await delay(500);

  let cleanupError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      rmSync(profilePath, { recursive: true, force: true });
      cleanupError = undefined;
      break;
    } catch (error) {
      cleanupError = error;
      await delay(250);
    }
  }

  if (cleanupError) throw cleanupError;
}
