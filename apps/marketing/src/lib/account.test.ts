import assert from "node:assert/strict";
import test from "node:test";

import {
  accountContinueUrl,
  prefillEmail,
  signInUrl,
  validateAccount,
  validateEmail,
} from "./account";

test("rejects a half-written email and accepts a normal one", () => {
  assert.equal(validateEmail("  "), "Add your email to continue.");
  assert.equal(validateEmail("ada@studio"), "That email doesn’t look quite right.");
  assert.equal(validateEmail("ada@studio.co"), null);
});

test("asks for a name and a usable password", () => {
  assert.match(validateAccount({ name: " ", password: "longenough" }) ?? "", /call you/);
  assert.match(validateAccount({ name: "Ada", password: "short" }) ?? "", /8 characters/);
  assert.equal(validateAccount({ name: "Ada", password: "longenough" }), null);
});

test("prefills the existing sign-up page without putting the password in the URL", () => {
  const href = accountContinueUrl("http://127.0.0.1:43123", null, {
    email: "ada@studio.co",
    name: "Ada Lovelace",
    plan: "pro",
  });
  const url = new URL(href);
  assert.equal(url.origin, "http://127.0.0.1:43123");
  assert.equal(url.pathname, "/auth/sign-up");
  assert.equal(url.searchParams.get("email"), "ada@studio.co");
  assert.equal(url.searchParams.get("name"), "Ada Lovelace");
  assert.equal(url.searchParams.get("plan"), "pro");
  assert.equal(url.searchParams.get("password"), null);
});

test("uses the web app sign-up when that URL is configured", () => {
  const href = accountContinueUrl("http://127.0.0.1:43123", "http://127.0.0.1:43124", {
    email: "not-an-email",
    name: "Ada",
    plan: "free",
  });
  const url = new URL(href);
  assert.equal(url.origin, "http://127.0.0.1:43124");
  assert.equal(url.searchParams.get("email"), null);
  assert.equal(url.searchParams.get("plan"), null);
  assert.equal(prefillEmail("not-an-email"), "");
});

test("sends sign-in to the web app, or the Mac flow when the app URL is absent", () => {
  assert.equal(
    signInUrl("http://127.0.0.1:43123", "https://app.typefolio.app"),
    "https://app.typefolio.app/auth/sign-in",
  );
  assert.equal(signInUrl("https://api.typefolio.app", null), "https://api.typefolio.app/auth/desktop");
});
