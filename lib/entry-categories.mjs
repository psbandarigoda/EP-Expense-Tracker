export const entryTypes = {
  "Operating Expense": { kind:"Expense", accounts:["Expense"] },
  "Operating Income": { kind:"Income", accounts:["Income"] },
  "Company Registration Expense": { kind:"Expense", accounts:["Expense"], defaultAccount:"5095" },
  "Founder-Funded Expense": { kind:"Expense", accounts:["Expense","Asset"] },
  "Founder Capital Contribution": { kind:"Income", accounts:["Equity"] },
  "Founder Reimbursement": { kind:"Expense", accounts:["Liability"] },
  "Director Drawing / Distribution": { kind:"Expense", accounts:["Equity"] },
  "Refund / Chargeback": { kind:"Expense", accounts:["Expense","Liability"] },
  "Organizer Payable": { kind:"Income", accounts:["Liability"] },
  "Cash / Bank Transfer": { kind:"Expense", accounts:["Asset"] },
  "Accounting Adjustment": { kind:"Expense", accounts:["Asset","Liability","Equity","Income","Expense"] }
};

export function getEntryTypeChoices(account) {
  if (!account || account.is_active === false) return [];
  return Object.keys(entryTypes).filter(type => entryTypes[type].accounts.includes(account.account_type));
}

export function searchCategories(accounts, query, { regex = false, entryType = "" } = {}) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let pattern;
  if (regex && query.trim()) {
    try { pattern = new RegExp(query.trim(), "i"); }
    catch { return { results: [], error: "Enter a valid regular expression, for example domain|cloud." }; }
  }
  const results = accounts.flatMap(account => {
    const compatible = getEntryTypeChoices(account);
    const choices = entryType ? compatible.filter(type => type === entryType) : compatible;
    if (!choices.length) return [];
    const text = [account.code, account.name, account.account_type, account.description, ...choices].join(" ");
    const matches = pattern ? pattern.test(text) : terms.every(term => text.toLowerCase().includes(term));
    return matches ? [{ account, choices }] : [];
  });
  return { results, error: "" };
}
