import assert from "node:assert/strict";
import test from "node:test";
import { getEntryTypeChoices, searchCategories } from "../lib/entry-categories.mjs";

const accounts = [
  { code: "5000", name: "Domain, DNS and brand web", account_type: "Expense", description: "Domain renewals and corporate web costs" },
  { code: "5010", name: "Cloud and SaaS", account_type: "Expense", description: "Vercel, Supabase, CDN, storage and infrastructure" },
  { code: "4050", name: "NFC Passport card sales", account_type: "Income", description: "Physical Entertain Passport card sales" },
  { code: "1500", name: "NFC hardware and equipment", account_type: "Asset" },
  { code: "5990", name: "Retired expense", account_type: "Expense", is_active: false }
];
const codes = (query, options) => searchCategories(accounts, query, options).results.map(result => result.account.code);

test("matches partial words and case-insensitive account names", () => {
  assert.deepEqual(codes("DOM"), ["5000"]);
  assert.deepEqual(codes("nFc"), ["4050", "1500"]);
});
test("finds codes, descriptions, and multiple words in any order", () => {
  assert.deepEqual(codes("501"), ["5010"]);
  assert.deepEqual(codes("supabase"), ["5010"]);
  assert.deepEqual(codes("sales passport"), ["4050"]);
  assert.deepEqual(codes("  WEB    domain  "), ["5000"]);
});
test("searches every account type and related entry type", () => {
  assert.deepEqual(codes("operating income"), ["4050"]);
  assert.deepEqual(codes("cash bank transfer"), ["1500"]);
  assert.deepEqual(getEntryTypeChoices(accounts[2]), ["Operating Income", "Accounting Adjustment"]);
  assert.deepEqual(getEntryTypeChoices(accounts[3]), ["Founder-Funded Expense", "Cash / Bank Transfer", "Accounting Adjustment"]);
});
test("supports explicit case-insensitive regex and literal text by default", () => {
  assert.deepEqual(codes("DOMAIN|CLOUD", { regex: true }), ["5000", "5010"]);
  assert.deepEqual(codes("^4050\\b", { regex: true }), ["4050"]);
  assert.deepEqual(codes("domain|cloud"), []);
});
test("invalid regex reports an error and can recover on the next query", () => {
  const invalid = searchCategories(accounts, "[", { regex: true });
  assert.ok(invalid.error);
  assert.deepEqual(invalid.results, []);
  assert.deepEqual(codes("cloud", { regex: true }), ["5010"]);
});
test("empty search shows active supported categories, with no matches handled safely", () => {
  assert.deepEqual(codes(""), ["5000", "5010", "4050", "1500"]);
  assert.deepEqual(codes("nonexistent"), []);
  assert.deepEqual(getEntryTypeChoices(undefined), []);
  assert.deepEqual(getEntryTypeChoices(accounts[4]), []);
  assert.deepEqual(getEntryTypeChoices({ account_type: "Unknown" }), []);
});
