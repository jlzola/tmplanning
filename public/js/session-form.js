const rowsContainer = document.getElementById('operator-rows');
const addBtn = document.getElementById('add-operator');
const csvInput = document.getElementById('csv-import');
const jsonInput = document.getElementById('json-import');

function buildOperatorRow({ call = '', locator = '', department = '' } = {}) {
  const row = document.createElement('div');
  row.className = 'operator-row';
  row.innerHTML = `
    <input type="text" name="operatorCall" aria-label="Indicatif" placeholder="Indicatif (ex. F4IXH)" required>
    <input type="text" name="operatorLocator" aria-label="Locator" placeholder="Locator (ex. JN23rl)" required>
    <input type="text" name="operatorDepartment" aria-label="Département" placeholder="Département (ex. 13)" required>
    <button type="button" class="btn-danger btn-small remove-operator">Retirer</button>
  `;
  row.querySelector('[name="operatorCall"]').value = call;
  row.querySelector('[name="operatorLocator"]').value = locator;
  row.querySelector('[name="operatorDepartment"]').value = department;
  row.querySelector('.remove-operator').addEventListener('click', () => {
    if (rowsContainer.children.length > 1) row.remove();
  });
  return row;
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

if (rowsContainer && addBtn) {
  [...rowsContainer.querySelectorAll('.operator-row')].forEach((row) => {
    row.querySelector('.remove-operator').addEventListener('click', () => {
      if (rowsContainer.children.length > 1) row.remove();
    });
  });

  addBtn.addEventListener('click', () => {
    rowsContainer.appendChild(buildOperatorRow());
  });
}

if (csvInput) {
  csvInput.addEventListener('change', () => {
    const file = csvInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.split(/\r?\n/).filter((line) => line.trim() !== '');
      lines.forEach((line, i) => {
        const [call, locator, department] = parseCsvLine(line);
        if (i === 0 && call?.trim().toLowerCase() === 'call') return;
        if (!call?.trim()) return;
        rowsContainer.appendChild(buildOperatorRow({ call, locator, department }));
      });
      csvInput.value = '';
    };
    reader.readAsText(file);
  });
}

if (jsonInput) {
  jsonInput.addEventListener('change', () => {
    const file = jsonInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        document.querySelector('[name="name"]').value = data.name ?? '';
        document.querySelector('[name="startDate"]').value = data.startDate ?? '';
        document.querySelector('[name="endDate"]').value = data.endDate ?? '';
        document.querySelector('[name="creatorCall"]').value = data.creator?.call ?? '';
        document.querySelector('[name="creatorFirstName"]').value = data.creator?.firstName ?? '';

        rowsContainer.innerHTML = '';
        const operators = Array.isArray(data.operators) ? data.operators : [];
        operators.forEach((op) => rowsContainer.appendChild(buildOperatorRow(op)));
        if (!rowsContainer.children.length) rowsContainer.appendChild(buildOperatorRow());
      } catch (err) {
        window.alert('Fichier JSON invalide.');
      }
      jsonInput.value = '';
    };
    reader.readAsText(file);
  });
}
