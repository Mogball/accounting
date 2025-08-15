(function() {
  const pasteEl = document.getElementById('paste');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const entriesEl = document.getElementById('entries');
  const targetEl = document.getElementById('target');
  const maxCombosEl = document.getElementById('maxCombos');
  const computeBtn = document.getElementById('computeBtn');
  const combosEl = document.getElementById('combos');
  const statusEl = document.getElementById('status');
  const comboOutputEl = document.getElementById('comboOutput');
  const copyComboOutputBtn = document.getElementById('copyComboOutputBtn');

  /** @type {{ index: number, cents: number, text: string }[]} */
  let entries = [];

  parseBtn.addEventListener('click', () => {
    entries = parseLinesToEntries(pasteEl.value);
    renderEntries(entries);
    statusEl.textContent = entries.length ? `Parsed ${entries.length} entries.` : '';
    combosEl.innerHTML = '';
  });

  clearBtn.addEventListener('click', () => {
    pasteEl.value = '';
    entries = [];
    renderEntries(entries);
    combosEl.innerHTML = '';
    statusEl.textContent = '';
  });

  computeBtn.addEventListener('click', () => {
    const targetCents = parseMoneyToCents(targetEl.value);
    if (!Number.isFinite(targetCents) || targetCents === 0) {
      statusEl.textContent = 'Enter a valid non-zero target amount.';
      return;
    }
    if (!entries.length) {
      statusEl.textContent = 'Paste and parse some entries first.';
      return;
    }
    const maxCombos = Math.max(1, Math.floor(Number(maxCombosEl.value) || 500));
    const { combos, truncated } = findCombinations(entries, targetCents, maxCombos);
    renderCombos(combos);
    statusEl.textContent = combos.length
      ? `Found ${combos.length} combination(s)${truncated ? ' (truncated)' : ''}. Hover a combo to highlight.`
      : 'No combinations found.';
  });

  copyComboOutputBtn.addEventListener('click', () => {
    const v = comboOutputEl.value;
    if (!v) { statusEl.textContent = 'Select a combination first.'; return; }
    navigator.clipboard.writeText(v).then(() => { statusEl.textContent = 'Copied selected combination.'; });
  });

  function parseLinesToEntries(text) {
    const lines = text.split(/\r?\n/);
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].trim();
      if (!raw) continue;
      const cents = parseMoneyToCents(raw);
      if (!Number.isFinite(cents)) continue;
      out.push({ index: out.length, cents, text: raw });
    }
    return out;
  }

  function parseMoneyToCents(raw) {
    if (raw == null) return NaN;
    const s = String(raw).trim();
    if (!s) return NaN;
    // Handle (123.45) as negative and remove currency symbols/commas/spaces
    const negative = /^\(.*\)$/.test(s) || /^-/.test(s);
    const cleaned = s
      .replace(/[()]/g, '')
      .replace(/[^0-9.]/g, '')
      .trim();
    if (!cleaned) return NaN;
    const num = Number(cleaned);
    if (!Number.isFinite(num)) return NaN;
    const cents = Math.round(num * 100);
    return negative ? -cents : cents;
  }

  function formatCents(cents) {
    const sign = cents < 0 ? '-' : '';
    const abs = Math.abs(cents);
    const dollars = Math.floor(abs / 100);
    const remainder = abs % 100;
    const remStr = remainder.toString().padStart(2, '0');
    return `${sign}$${dollars.toLocaleString()}${remainder !== 0 ? '.' + remStr : '.00'}`;
  }

  function formatPlainDollars(cents) {
    const neg = cents < 0 ? '-' : '';
    const abs = Math.abs(cents);
    const dollars = Math.floor(abs / 100);
    const rem = (abs % 100).toString().padStart(2, '0');
    return `${neg}${dollars}.${rem}`;
  }

  function renderEntries(items) {
    entriesEl.innerHTML = '';
    for (let i = 0; i < items.length; i++) {
      const row = document.createElement('div');
      row.className = 'entry-row';
      row.dataset.idx = String(i);
      const idx = document.createElement('div');
      idx.className = 'entry-idx';
      idx.textContent = String(i);
      const val = document.createElement('div');
      val.className = 'entry-val';
      val.textContent = `${items[i].text}  (${formatCents(items[i].cents)})`;
      row.appendChild(idx);
      row.appendChild(val);
      entriesEl.appendChild(row);
    }
  }

  function colorFor(i) {
    const hue = (i * 47) % 360;
    return `hsl(${hue} 70% 45% / 0.25)`;
  }

  function outlineFor(i) {
    const hue = (i * 47) % 360;
    return `1px solid hsl(${hue} 70% 45% / 0.9)`;
  }

  function renderCombos(combos) {
    combosEl.innerHTML = '';
    // unhighlight
    Array.from(entriesEl.children).forEach(ch => { ch.style.background = ''; ch.style.border = ''; });
    combos.forEach((combo, i) => {
      const color = colorFor(i);
      const item = document.createElement('div');
      item.className = 'combo-item';
      const header = document.createElement('div');
      header.className = 'combo-header';
      const dot = document.createElement('div');
      dot.className = 'combo-color';
      dot.style.background = color;
      dot.style.border = outlineFor(i);
      const title = document.createElement('div');
      title.innerHTML = `<strong>Combo ${i + 1}</strong> · sum = ${formatCents(combo.sum)}`;
      header.appendChild(dot);
      header.appendChild(title);

      const chips = document.createElement('div');
      combo.items.forEach(e => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = `#${e.index} ${formatCents(e.cents)}`;
        chips.appendChild(chip);
      });

      item.appendChild(header);
      item.appendChild(chips);
      item.addEventListener('mouseenter', () => highlightCombo(combo, i, true));
      item.addEventListener('mouseleave', () => highlightCombo(combo, i, false));
      item.addEventListener('click', () => displayComboOutput(combo));
      combosEl.appendChild(item);
    });
  }

  function highlightCombo(combo, comboIndex, on) {
    const bg = on ? colorFor(comboIndex) : '';
    const border = on ? outlineFor(comboIndex) : '';
    const indices = new Set(combo.items.map(e => e.index));
    Array.from(entriesEl.children).forEach((row, i) => {
      if (indices.has(i)) {
        row.style.background = bg;
        row.style.border = border;
      } else if (on) {
        row.style.background = '';
        row.style.border = '';
      }
    });
  }

  function displayComboOutput(combo) {
    const items = combo.items.slice().sort((a, b) => a.index - b.index);
    const lines = ['index\tamount'];
    for (const e of items) {
      lines.push(`${e.index}\t${formatPlainDollars(e.cents)}`);
    }
    lines.push(`sum\t${formatPlainDollars(combo.sum)}`);
    comboOutputEl.value = lines.join('\n');
    comboOutputEl.scrollTop = 0;
  }

  function findCombinations(sourceEntries, targetCents, maxCount) {
    // Use backtracking on sorted values to prune, but carry original index
    let items = sourceEntries.map((e, i) => ({ index: i, cents: e.cents })).sort((a, b) => a.cents - b.cents);
    const results = [];
    const current = [];

    function dfs(start, sum) {
      if (results.length >= maxCount) return;
      if (sum === targetCents) {
        results.push({ items: current.slice().map(i => items[i]).sort((a, b) => a.index - b.index), sum });
        return;
      }
      if (sum > targetCents) return;
      for (let i = start; i < items.length; i++) {
        current.push(i);
        dfs(i + 1, sum + items[i].cents);
        current.pop();
        if (results.length >= maxCount) return;
      }
    }

    // If target negative, convert both to positive with sign
    const sign = targetCents < 0 ? -1 : 1;
    if (sign === -1) {
      items.forEach(it => it.cents = -it.cents);
      targetCents = -targetCents;
    }
    // Remove non-positive numbers (can't help reach positive target) and numbers > target
    items = items.filter(it => it.cents > 0 && it.cents <= targetCents).sort((a, b) => a.cents - b.cents);

    dfs(0, 0);
    return { combos: results, truncated: results.length >= maxCount };
  }
})();


