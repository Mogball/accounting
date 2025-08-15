(function() {
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const previewEl = document.getElementById('preview');
  const statusEl = document.getElementById('status');
  const clearBtn = document.getElementById('clearBtn');
  const convertBtn = document.getElementById('convertBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const csvOptions = document.getElementById('csvOptions');
  const csvDelimiterEl = document.getElementById('csvDelimiter');
  const csvHeadersEl = document.getElementById('csvHeaders');

  function $(selector) {
    return document.querySelector(selector);
  }

  function getSelectedFormat() {
    const el = document.querySelector('input[name="format"]:checked');
    return el ? el.value : 'json-array';
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // Robust CSV/TSV parser supporting quotes and newlines in fields
  function parseDelimited(text, delimiter) {
    const rows = [];
    let current = [];
    let value = '';
    let inQuotes = false;

    const d = delimiter;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (next === '"') { // Escaped quote
            value += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          value += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === d) {
          current.push(value);
          value = '';
        } else if (char === '\n') {
          current.push(value);
          rows.push(current);
          current = [];
          value = '';
        } else if (char === '\r') {
          // normalize CRLF: skip, handle on \n
        } else {
          value += char;
        }
      }
    }
    // flush last value
    current.push(value);
    rows.push(current);
    // remove trailing empty row from ending newline
    if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
      rows.pop();
    }
    return rows;
  }

  function toCsv(rows, delimiter, includeHeader) {
    if (!rows || rows.length === 0) return '';
    const dataRows = includeHeader ? rows : rows.slice(1);
    return dataRows.map(r => r.map(escapeCsv).join(delimiter)).join('\n');
  }

  function escapeCsv(value) {
    const s = value == null ? '' : String(value);
    if (/["\n\r,\t]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function toJsonArray(rows) {
    return JSON.stringify(rows, null, 2);
  }

  function toJsonObjects(rows) {
    if (!rows.length) return '[]';
    const [headers, ...data] = rows;
    const normalized = headers.map(h => String(h || '').trim());
    const objects = data.map(r => {
      const obj = {};
      for (let i = 0; i < normalized.length; i++) {
        const key = normalized[i] || `col_${i+1}`;
        obj[key] = r[i] ?? '';
      }
      return obj;
    });
    return JSON.stringify(objects, null, 2);
  }

  function renderPreview(rows) {
    if (!rows.length) { previewEl.innerHTML = ''; return; }
    const maxRows = Math.min(rows.length, 20);
    const maxCols = Math.min(Math.max(...rows.map(r => r.length)), 12);
    let html = '<table><tbody>';
    for (let r = 0; r < maxRows; r++) {
      html += '<tr>';
      for (let c = 0; c < maxCols; c++) {
        const v = (rows[r] && rows[r][c] != null) ? rows[r][c] : '';
        html += `<td>${escapeHtml(v)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    if (rows.length > maxRows) {
      html += `<div class="hint">Showing first ${maxRows} of ${rows.length} rows.</div>`;
    }
    previewEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function convert() {
    const raw = inputEl.value.trimEnd();
    if (!raw) { outputEl.value = ''; renderPreview([]); setStatus(''); return; }
    // Excel/Sheets paste is tab-delimited
    const rows = parseDelimited(raw, '\t');
    renderPreview(rows);

    const format = getSelectedFormat();
    let out = '';
    if (format === 'json-array') out = toJsonArray(rows);
    else if (format === 'json-objects') out = toJsonObjects(rows);
    else if (format === 'csv') out = toCsv(rows, csvDelimiterEl.value || ',', csvHeadersEl.checked);
    outputEl.value = out;
    setStatus(`Converted ${rows.length} rows.`);
  }

  function copyOutput() {
    const v = outputEl.value;
    if (!v) return;
    navigator.clipboard.writeText(v).then(() => setStatus('Output copied to clipboard.'));
  }

  function downloadOutput() {
    const format = getSelectedFormat();
    let ext = 'txt';
    if (format === 'csv') ext = 'csv';
    if (format === 'json-array' || format === 'json-objects') ext = 'json';
    const blob = new Blob([outputEl.value || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onFormatChange() {
    const fmt = getSelectedFormat();
    csvOptions.hidden = fmt !== 'csv';
  }

  // Wire events
  clearBtn.addEventListener('click', () => { inputEl.value = ''; outputEl.value=''; previewEl.innerHTML=''; setStatus(''); });
  convertBtn.addEventListener('click', convert);
  copyBtn.addEventListener('click', copyOutput);
  downloadBtn.addEventListener('click', downloadOutput);
  document.querySelectorAll('input[name="format"]').forEach(el => el.addEventListener('change', onFormatChange));

  // Auto-convert on paste
  inputEl.addEventListener('paste', () => {
    setTimeout(convert, 0);
  });

  // Initial
  onFormatChange();
})();


