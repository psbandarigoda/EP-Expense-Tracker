"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { entryTypes, getEntryTypeChoices, searchCategories } from "../../lib/entry-categories.mjs";

export default function CategoryPicker({ accounts, value, entryType, onSelect }) {
  const id = useId(), inputRef = useRef(null), listRef = useRef(null);
  const [query, setQuery] = useState("");
  const [regex, setRegex] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingCode, setPendingCode] = useState("");
  const selected = accounts.find(account => account.code === value);
  const pending = accounts.find(account => account.code === pendingCode);
  const { results, error } = useMemo(() => searchCategories(accounts, query, { regex }), [accounts, query, regex]);
  const pendingChoices = getEntryTypeChoices(pending);
  const label = account => `${account.code} · ${account.name}`;

  useEffect(() => {
    if (value) { setQuery(""); setPendingCode(""); setOpen(false); }
  }, [value]);
  useEffect(() => {
    inputRef.current?.setCustomValidity(selected ? "" : pending ? "Choose an entry type for this category." : "Choose a category from the search results.");
  }, [selected, pending]);
  useEffect(() => {
    if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, results.length]);

  function commit(account, type) {
    onSelect(account.code, type);
    setQuery("");
    setPendingCode("");
    inputRef.current?.focus();
    setOpen(false);
  }
  function choose({ account, choices }) {
    if (choices.length === 1) commit(account, choices[0]);
    else {
      onSelect("", entryType);
      setPendingCode(account.code);
      setOpen(false);
    }
  }
  function search(text) {
    setQuery(text);
    setPendingCode("");
    setActiveIndex(0);
    setOpen(true);
    if (value) onSelect("", entryType);
  }
  function onKeyDown(event) {
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const last = Math.max(0, results.length - 1);
      setActiveIndex(index => !open ? (event.key === "ArrowDown" ? 0 : last) : event.key === "ArrowDown" ? Math.min(index + 1, last) : Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (results[activeIndex]) choose(results[activeIndex]);
    }
  }

  return <div className="category-picker wide" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>Category / subcategory</label>
    <div className="category-search-controls">
      <input ref={inputRef} id={id} role="combobox" type="text" autoComplete="off" required
        placeholder={regex ? "Regex, e.g. domain|cloud" : "Search names, codes or words, e.g. hosting"}
        value={selected ? label(selected) : pending ? label(pending) : query}
        aria-expanded={open} aria-controls={`${id}-results`} aria-autocomplete="list"
        aria-activedescendant={open && results[activeIndex] ? `${id}-${results[activeIndex].account.code}` : undefined}
        aria-describedby={`${id}-hint`} aria-invalid={error ? true : undefined}
        onFocus={event => { event.currentTarget.select(); if (!pending) setOpen(true); }}
        onChange={event => search(event.target.value)} onKeyDown={onKeyDown}/>
      <button type="button" className="category-regex" aria-pressed={regex} onClick={() => { setRegex(!regex); setActiveIndex(0); if (!pending) setOpen(true); }} title="Match a regular expression">Regex</button>
    </div>
    <p className="category-hint" id={`${id}-hint`}>{selected ? `Selected entry type: ${entryType}` : "Search all categories, then choose the matching entry type."}</p>
    {error && <p className="category-error" role="alert">{error}</p>}
    {open && <div className="category-dropdown">
      <div className="category-result-count" role="status">{results.length} matching {results.length === 1 ? "category" : "categories"}</div>
      <div ref={listRef} id={`${id}-results`} role="listbox" aria-label="Matching categories" className="category-results">
        {results.map(({ account, choices }, index) => <button key={account.code} id={`${id}-${account.code}`} type="button" role="option" tabIndex={-1}
          aria-selected={index === activeIndex} className={index === activeIndex ? "category-result active" : "category-result"}
          onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose({ account, choices })}>
          <span className="category-result-heading"><strong>{account.name}</strong><code>{account.code}</code></span>
          {account.description && <span className="category-description">{account.description}</span>}
          <span className="category-result-meta">{account.account_type} · {choices.length === 1 ? choices[0] : `${choices.length} entry types — choose next`}</span>
        </button>)}
      </div>
      {!results.length && <p className="category-no-results">{error ? "Check the regex above, or turn Regex off to search by words." : accounts.length ? "No matching categories. Try another name, account code or word." : "No categories loaded. Check the database connection."}</p>}
    </div>}
    {pending && <section className="category-entry-choices" aria-label="Choose entry type">
      <h3>Choose entry type</h3>
      <p><b>{pending.name}</b> ({pending.code}) supports multiple entry types. Select the one that matches this record.</p>
      <div className="category-type-options">{pendingChoices.map(type => <button type="button" key={type} onClick={() => commit(pending, type)}>
        <strong>{type}</strong><span>{entryTypes[type].kind}</span>
      </button>)}</div>
      <button type="button" className="category-change" onClick={() => { setPendingCode(""); setQuery(""); inputRef.current?.focus(); setOpen(true); }}>Choose another category</button>
    </section>}
  </div>;
}
