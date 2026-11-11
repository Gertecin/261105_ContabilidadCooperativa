const { useState, useEffect, useMemo } = React;
const ADMIN_PASSWORD = "molino2026";

// --- HOOK PERSISTENCIA ---
const useLocalState = (key, init) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : init();
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
};

// --- UTILIDADES ---
const formatDate = (d) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};
const getMonthKey = (d) => d.substring(0, 7);
const getPeriods = (entries) => [...new Set(entries.map(e => getMonthKey(e.date)))].sort();

// --- NAVEGACIÓN ---
const Tabs = ({ current, set, isAuthenticated }) => {
  const tabs = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'Asientos', label: 'Asientos' },
    { id: 'Moliendas', label: 'Moliendas' },
    { id: 'LibroMayor', label: 'Libro Mayor' },
    { id: 'Balance', label: 'Balance' },
    { id: 'Socios', label: 'Socios' },
    { id: 'Empleados', label: 'Empleados' },
    { id: 'Distribucion', label: 'Distribución' },
    { id: 'Admin', label: '🔒 Admin', requiresAuth: true }
  ];
  return (
    <div className="flex overflow-x-auto bg-white border-b border-beige sticky top-0 z-10">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => {
            if (t.requiresAuth && !isAuthenticated) {
              set('Login');
            } else {
              set(t.id);
            }
          }}
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
            current === t.id ? 'text-gold border-b-2 border-gold' : 'text-darkGold'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

// --- LOGIN ---
const Login = ({ onLogin }) => {
  const [pass, setPass] = useState('');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-flour p-4 space-y-4">
      <h1 className="text-2xl font-bold font-slab">Panel Administrativo</h1>
      <p className="text-sm text-darkGold">Esta sección requiere autenticación</p>
      <input
        type="password"
        placeholder="Clave de acceso"
        value={pass}
        onChange={e => setPass(e.target.value)}
        className="p-2 border rounded w-full max-w-xs"
      />
      <button
        onClick={() => pass === ADMIN_PASSWORD ? onLogin() : alert('Clave incorrecta')}
        className="px-4 py-2 bg-gold text-white rounded font-semibold w-full max-w-xs"
      >
        Ingresar
      </button>
      <p className="text-xs text-darkGold">Clave demo: molino2026</p>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ data }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-2xl font-bold text-dark">Molino Florida</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige">
        <p className="text-xs text-darkGold">Cuentas</p>
        <p className="text-2xl font-bold">{data.accounts.length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige">
        <p className="text-xs text-darkGold">Asientos</p>
        <p className="text-2xl font-bold">{data.entries.length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige">
        <p className="text-xs text-darkGold">Moliendas</p>
        <p className="text-2xl font-bold">{data.millings.length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige">
        <p className="text-xs text-darkGold">Socios</p>
        <p className="text-2xl font-bold">{data.partners.length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige">
        <p className="text-xs text-darkGold">Empleados</p>
        <p className="text-2xl font-bold">{data.employees ? data.employees.length : 0}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige">
        <p className="text-xs text-darkGold">Meses cerrados</p>
        <p className="text-2xl font-bold">{data.closedMonths ? data.closedMonths.length : 0}</p>
      </div>
    </div>
    <div className="bg-green/10 p-4 rounded-lg border border-green/30">
      <h3 className="font-bold text-green">Calendario operativo</h3>
      <p className="text-sm mt-1">Turnos: L-V (6-14, 14-22, 22-6) | Embolsado: 7-15 | Reparto: Martes y Jueves | Anticipos: día 8 del mes siguiente</p>
    </div>
  </div>
);

// --- ASIENTOS (con reversión) ---
const Asientos = ({ data, setData }) => {
  const [lines, setLines] = useState([{ account: '', debit: 0, credit: 0, memo: '' }]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addLine = () => setLines([...lines, { account: '', debit: 0, credit: 0, memo: '' }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const saveEntry = () => {
    const totalD = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalC = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    if (totalD !== totalC || totalD === 0) {
      return alert(`Asiento desbalanceado. Debe: ${totalD}, Haber: ${totalC}`);
    }
    const monthKey = getMonthKey(date);
    if (data.closedMonths && data.closedMonths.includes(monthKey)) {
      return alert(`El mes ${monthKey} está cerrado. No se pueden registrar asientos.`);
    }
    const newEntry = {
      id: `E${String(data.entries.length + 1).padStart(3, '0')}`,
      date,
      description,
      lines: lines.map(l => ({ ...l, debit: Number(l.debit || 0), credit: Number(l.credit || 0) })),
      confirmed: true
    };
    setData({ ...data, entries: [...data.entries, newEntry] });
    setLines([{ account: '', debit: 0, credit: 0, memo: '' }]);
    setDescription('');
  };

  const revertEntry = (entryId) => {
    const entry = data.entries.find(e => e.id === entryId);
    if (!entry) return;
    const monthKey = getMonthKey(entry.date);
    if (data.closedMonths && data.closedMonths.includes(monthKey)) {
      return alert(`No se puede revertir: el mes ${monthKey} está cerrado.`);
    }
    if (!confirm(`¿Revertir asiento ${entry.id}? Se generará un contraasiento vinculado.`)) return;
    const contraLines = entry.lines.map(l => ({
      account: l.account,
      debit: l.credit,
      credit: l.debit,
      memo: `Reversión de ${entry.id}`
    }));
    const contraEntry = {
      id: `E${String(data.entries.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      description: `Reversión de asiento ${entry.id}`,
      lines: contraLines,
      confirmed: true,
      revertedFrom: entryId
    };
    setData({ ...data, entries: [...data.entries, contraEntry] });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Nuevo Asiento (Partida Doble)</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
        <input
          type="text"
          placeholder="Descripción del asiento"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
      </div>
      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 items-center bg-white p-2 rounded border border-beige">
            <select
              className="flex-1 p-2 text-sm border rounded"
              value={l.account}
              onChange={e => {
                const nl = [...lines];
                nl[i].account = e.target.value;
                setLines(nl);
              }}
            >
              <option value="">Cuenta...</option>
              {data.accounts.map(a => (
                <option key={a.id} value={a.id}>{a.id} - {a.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Debe"
              className="w-20 p-2 text-sm border rounded"
              value={l.debit || ''}
              onChange={e => {
                const nl = [...lines];
                nl[i].debit = Number(e.target.value);
                setLines(nl);
              }}
            />
            <input
              type="number"
              placeholder="Haber"
              className="w-20 p-2 text-sm border rounded"
              value={l.credit || ''}
              onChange={e => {
                const nl = [...lines];
                nl[i].credit = Number(e.target.value);
                setLines(nl);
              }}
            />
            <input
              type="text"
              placeholder="Memo"
              className="w-24 p-2 text-sm border rounded"
              value={l.memo || ''}
              onChange={e => {
                const nl = [...lines];
                nl[i].memo = e.target.value;
                setLines(nl);
              }}
            />
            {lines.length > 1 && (
              <button onClick={() => removeLine(i)} className="text-red text-sm px-2">✕</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={addLine} className="px-4 py-2 bg-beige text-dark text-sm rounded font-semibold">+ Línea</button>
        <button onClick={saveEntry} className="px-4 py-2 bg-gold text-white text-sm rounded font-semibold">Confirmar Asiento</button>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-bold">Historial (inmutable)</h3>
        {data.entries.slice().reverse().map(e => (
          <div key={e.id} className="bg-white p-3 rounded border border-beige text-sm">
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                {e.id} - {formatDate(e.date)}
                {e.revertedFrom && <span className="text-red text-xs"> (Reversión de {e.revertedFrom})</span>}
              </p>
              {!e.revertedFrom && (
                <button onClick={() => revertEntry(e.id)} className="text-xs text-red underline">Revertir</button>
              )}
            </div>
            {e.description && <p className="text-xs text-dark">{e.description}</p>}
            {e.lines.map((l, i) => (
              <p key={i} className="text-xs text-darkGold">
                {l.account} | D: {formatMoney(l.debit)} | H: {formatMoney(l.credit)}
                {l.memo && ` - ${l.memo}`}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MOLIENDAS (formulario completo) ---
const Moliendas = ({ data, setData }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Mañana');
  const [kg, setKg] = useState(12000);
  const [wheatPrice, setWheatPrice] = useState(data.settings.wheatPrice);
  const [productKgs, setProductKgs] = useState(
    data.products.map(p => ({ id: p.id, kgs: Math.round(12000 * p.yield) }))
  );

  useEffect(() => {
    setProductKgs(data.products.map(p => ({ id: p.id, kgs: Math.round(kg * p.yield) })));
  }, [kg]);

  const updateKg = (id, value) => {
    setProductKgs(productKgs.map(p => p.id === id ? { ...p, kgs: Number(value) || 0 } : p));
  };

  const sumKgOut = productKgs.reduce((s, p) => s + p.kgs, 0);
  const totalCost = (kg * wheatPrice) + (kg * data.settings.energyCost);

  const processMilling = () => {
    // Validación de cupo por turno
    const usedQuota = data.millings
      .filter(m => m.date === date && m.shift === shift)
      .reduce((sum, m) => sum + m.kgIn, 0);
    if (usedQuota + kg > data.settings.shiftQuota) {
      return alert(`Cupo excedido. Turno ${shift} del ${formatDate(date)} tiene ${usedQuota} kg usados. Cupo máximo: ${data.settings.shiftQuota} kg.`);
    }
    // Validación de mes cerrado
    const monthKey = getMonthKey(date);
    if (data.closedMonths && data.closedMonths.includes(monthKey)) {
      return alert(`El mes ${monthKey} está cerrado.`);
    }
    // Validación de kilos
    if (sumKgOut !== kg) {
      return alert(`Los kilos de salida (${sumKgOut}) deben igualar los kilos ingresados (${kg}).`);
    }

    const productsOut = data.products.map((p, idx) => {
      const kgs = productKgs.find(pk => pk.id === p.id).kgs;
      const val = kgs * p.price;
      return { ...p, kgs, val };
    });

    const sumValue = productsOut.reduce((s, p) => s + p.val, 0);
    let assignedCost = 0;
    const maxValProd = productsOut.reduce((max, p) => p.val > max.val ? p : max, productsOut[0]);

    productsOut.forEach(p => {
      if (p.id === 'PMER') { p.cost = 0; p.costPerKg = 0; return; }
      if (p === maxValProd) {
        p.cost = totalCost - assignedCost;
      } else {
        p.cost = Math.floor((totalCost * p.val) / sumValue);
        assignedCost += p.cost;
      }
      p.costPerKg = p.kgs > 0 ? Math.floor((p.cost / p.kgs) * 100) / 100 : 0;
    });

    const milling = {
      id: `M${String(data.millings.length + 1).padStart(3, '0')}`,
      date,
      shift,
      kgIn: kg,
      wheatPrice,
      energyCost: data.settings.energyCost,
      totalCost,
      productsOut
    };

    // Asiento contable de producción terminada
    const entry = {
      id: `E${String(data.entries.length + 1).padStart(3, '0')}`,
      date,
      description: `Producción molienda ${milling.id} - Turno ${shift}`,
      lines: [
        { account: 'A005', debit: totalCost, credit: 0, memo: 'Producción en proceso' },
        { account: 'A004', debit: 0, credit: kg * wheatPrice, memo: 'Stock de trigo' },
        { account: 'R004', debit: 0, credit: kg * data.settings.energyCost, memo: 'Energía eléctrica' }
      ],
      confirmed: true,
      linkedMilling: milling.id
    };

    setData({
      ...data,
      millings: [...data.millings, milling],
      entries: [...data.entries, entry]
    });

    // Resetear formulario
    setKg(12000);
    setProductKgs(data.products.map(p => ({ id: p.id, kgs: Math.round(12000 * p.yield) })));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Registrar Molienda</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-darkGold">Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-darkGold">Turno</label>
            <select value={shift} onChange={e => setShift(e.target.value)} className="w-full p-2 border rounded text-sm">
              <option>Mañana (6-14)</option>
              <option>Tarde (14-22)</option>
              <option>Noche (22-6)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-darkGold">Kilos de trigo ingresados</label>
          <input type="number" value={kg} onChange={e => setKg(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-darkGold">Costo del trigo (centésimos/kg)</label>
          <input type="number" value={wheatPrice} onChange={e => setWheatPrice(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
        </div>
        <div className="text-xs text-darkGold">
          Costo trigo: {formatMoney(kg * wheatPrice)} | Energía: {formatMoney(kg * data.settings.energyCost)} | Total: {formatMoney(totalCost)}
        </div>
      </div>

      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <h3 className="font-bold text-sm">Kilos de salida por producto</h3>
        <p className="text-xs text-darkGold">Total debe ser {kg} kg</p>
        {productKgs.map(p => {
          const prod = data.products.find(x => x.id === p.id);
          return (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{prod.name} ({prod.yield * 100}%)</span>
              <input
                type="number"
                value={p.kgs}
                onChange={e => updateKg(p.id, e.target.value)}
                className="w-20 p-1 border rounded text-sm"
              />
              <span className="text-xs text-darkGold w-20">Valor: {formatMoney(p.kgs * prod.price)}</span>
            </div>
          );
        })}
        <p className={`text-sm font-bold ${sumKgOut !== kg ? 'text-red' : 'text-green'}`}>
          Total salida: {sumKgOut} kg
          {sumKgOut !== kg && ' ✗'}
          {sumKgOut === kg && ' ✓'}
        </p>
      </div>

      <button onClick={processMilling} className="w-full py-2 bg-green text-white rounded font-semibold">
        Procesar molienda y generar asiento
      </button>

      <div className="space-y-4">
        {data.millings.slice().reverse().map(m => (
          <div key={m.id} className="bg-white p-4 rounded border border-beige">
            <h3 className="font-bold text-gold">{m.id} | {formatDate(m.date)} | {m.shift}</h3>
            <p className="text-sm">Ingreso: {m.kgIn} kg | Costo Total: {formatMoney(m.totalCost)}</p>
            <table className="w-full mt-2 text-xs">
              <thead>
                <tr className="text-left text-darkGold border-b">
                  <th>Producto</th><th>Kg</th><th>Costo</th><th>$/Kg</th>
                </tr>
              </thead>
              <tbody>
                {m.productsOut.map(p => (
                  <tr key={p.id} className="border-t border-beige">
                    <td>{p.name}</td><td>{p.kgs}</td><td>{formatMoney(p.cost)}</td><td>{formatMoney(p.costPerKg * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- LIBRO MAYOR (por cuenta con saldo acumulado) ---
const LibroMayor = ({ data }) => {
  const [selectedAccount, setSelectedAccount] = useState(data.accounts[0]?.id || '');
  const [period, setPeriod] = useState('all');

  const availablePeriods = getPeriods(data.entries);
  const account = data.accounts.find(a => a.id === selectedAccount);

  const movements = useMemo(() => {
    if (!selectedAccount) return [];
    return data.entries
      .filter(e => period === 'all' || getMonthKey(e.date) === period)
      .flatMap(e =>
        e.lines
          .filter(l => l.account === selectedAccount)
          .map(l => ({
            date: e.date,
            entryId: e.id,
            description: e.description,
            debit: l.debit || 0,
            credit: l.credit || 0,
            memo: l.memo
          }))
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedAccount, period, data.entries]);

  let saldoAcumulado = 0;
  const movementsWithBalance = movements.map(m => {
    saldoAcumulado += m.debit - m.credit;
    return { ...m, saldo: saldoAcumulado };
  });

  const totalDebit = movements.reduce((s, m) => s + m.debit, 0);
  const totalCredit = movements.reduce((s, m) => s + m.credit, 0);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Libro Mayor</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <select
          value={selectedAccount}
          onChange={e => setSelectedAccount(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        >
          {data.accounts.map(a => (
            <option key={a.id} value={a.id}>{a.id} - {a.name} ({a.type})</option>
          ))}
        </select>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="all">Todos los períodos</option>
          {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {account && (
        <div className="bg-white p-4 rounded border border-beige">
          <h3 className="font-bold">{account.id} - {account.name}</h3>
          <p className="text-xs text-darkGold">{account.type}</p>
          {movementsWithBalance.length === 0 ? (
            <p className="text-sm text-darkGold mt-2">Sin movimientos en este período</p>
          ) : (
            <table className="w-full mt-2 text-xs">
              <thead>
                <tr className="text-left text-darkGold border-b">
                  <th>Fecha</th><th>Asiento</th><th>Descripción</th><th>Debe</th><th>Haber</th><th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {movementsWithBalance.map((m, i) => (
                  <tr key={i} className="border-t border-beige">
                    <td>{formatDate(m.date)}</td>
                    <td>{m.entryId}</td>
                    <td>{m.description} {m.memo && `- ${m.memo}`}</td>
                    <td>{m.debit ? formatMoney(m.debit) : '-'}</td>
                    <td>{m.credit ? formatMoney(m.credit) : '-'}</td>
                    <td className="font-semibold">{formatMoney(m.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-3 p-2 bg-beige/30 rounded text-sm">
            <p>Suma Debe: {formatMoney(totalDebit)}</p>
            <p>Suma Haber: {formatMoney(totalCredit)}</p>
            <p className="font-bold">Saldo final: {formatMoney(totalDebit - totalCredit)} {totalDebit - totalCredit >= 0 ? '(Deudor)' : '(Acreedor)'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- BALANCE DE SUMAS Y SALDOS ---
const Balance = ({ data }) => {
  const [period, setPeriod] = useState('all');
  const availablePeriods = getPeriods(data.entries);

  const balances = useMemo(() => {
    return data.accounts.map(acc => {
      let debit = 0, credit = 0;
      data.entries
        .filter(e => period === 'all' || getMonthKey(e.date) === period)
        .forEach(e => {
          e.lines.filter(l => l.account === acc.id).forEach(l => {
            debit += l.debit || 0;
            credit += l.credit || 0;
          });
        });
      return { ...acc, debit, credit, saldo: debit - credit };
    });
  }, [data, period]);

  const totals = balances.reduce((t, b) => ({
    debit: t.debit + b.debit,
    credit: t.credit + b.credit,
    saldoDeudor: t.saldoDeudor + (b.saldo > 0 ? b.saldo : 0),
    saldoAcreedor: t.saldoAcreedor + (b.saldo < 0 ? Math.abs(b.saldo) : 0)
  }), { debit: 0, credit: 0, saldoDeudor: 0, saldoAcreedor: 0 });

  const isBalanced = Math.abs(totals.saldoDeudor - totals.saldoAcreedor) < 1;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Balance de Sumas y Saldos</h2>
      <div className="bg-white p-4 rounded border border-beige">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="all">Todos los períodos</option>
          {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="bg-white p-4 rounded border border-beige overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-darkGold border-b">
              <th>Cuenta</th><th>Debe</th><th>Haber</th><th>Saldo D</th><th>Saldo A</th>
            </tr>
          </thead>
          <tbody>
            {balances.filter(b => b.debit > 0 || b.credit > 0).map(b => (
              <tr key={b.id} className="border-t border-beige">
                <td>{b.id} - {b.name}</td>
                <td>{b.debit ? formatMoney(b.debit) : '-'}</td>
                <td>{b.credit ? formatMoney(b.credit) : '-'}</td>
                <td>{b.saldo > 0 ? formatMoney(b.saldo) : '-'}</td>
                <td>{b.saldo < 0 ? formatMoney(Math.abs(b.saldo)) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-dark font-bold">
              <td>TOTALES</td>
              <td>{formatMoney(totals.debit)}</td>
              <td>{formatMoney(totals.credit)}</td>
              <td>{formatMoney(totals.saldoDeudor)}</td>
              <td>{formatMoney(totals.saldoAcreedor)}</td>
            </tr>
          </tfoot>
        </table>
        <div className={`mt-3 p-2 rounded text-sm font-bold ${isBalanced ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
          {isBalanced
            ? '✓ Balanceado: Suma saldos deudores = Suma saldos acreedores'
            : '✗ Desbalanceado'}
        </div>
      </div>
    </div>
  );
};

// --- SOCIOS ---
const Socios = ({ data, setData }) => {
  const payAdvances = () => {
    const updated = data.partners.map(p => {
      const totalHours = p.dayHours + p.nightHours;
      if (totalHours > p.monthlyLimit + p.extraLimit && !p.extraApproved) {
        alert(`${p.name} excede horas y no tiene aprobación del consejo. Anticipo bloqueado.`);
        return p;
      }
      const dayAdvance = p.dayHours * data.settings.hourValue;
      const nightAdvance = p.nightHours * data.settings.hourValue * data.settings.nightSurcharge;
      return { ...p, advances: p.advances + Math.round(dayAdvance + nightAdvance) };
    });
    setData({ ...data, partners: updated });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Socios - Anticipos de Retorno</h2>
      <p className="text-xs text-darkGold">Fórmula: horas diurnas × valor hora + horas nocturnas × valor hora × 1,20</p>
      <p className="text-xs text-darkGold">Límite: 184h + 24h extra (requiere aprobación del consejo)</p>
      <button onClick={payAdvances} className="w-full py-2 bg-gold text-white rounded font-semibold">Pagar Anticipos (día 8)</button>
      <div className="space-y-2">
        {data.partners.map(p => (
          <div key={p.id} className="bg-white p-3 rounded border border-beige flex justify-between items-center text-sm">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-darkGold">Día: {p.dayHours}h | Noche: {p.nightHours}h {p.extraApproved && '(Extra OK)'}</p>
            </div>
            <p className="font-bold text-green">{formatMoney(p.advances)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- EMPLEADOS ---
const Empleados = ({ data }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold">Empleados No Socios</h2>
    <p className="text-xs text-darkGold">Los sueldos se registran en "Sueldos y jornales" (R007), NO en "Anticipos de retorno". No participan del excedente.</p>
    {data.employees && data.employees.map(e => (
      <div key={e.id} className="bg-white p-3 rounded border border-beige flex justify-between items-center text-sm">
        <div>
          <p className="font-semibold">{e.name}</p>
          <p className="text-xs text-darkGold">{e.role}</p>
        </div>
        <p className="font-bold text-dark">{formatMoney(e.monthlySalary)}</p>
      </div>
    ))}
  </div>
);

// --- DISTRIBUCIÓN ---
const Distribucion = ({ data, setData }) => {
  const [excedente, setExcedente] = useState(50000000);

  const simulate = () => {
    const reserva = Math.floor(excedente * 0.20);
    const educacion = Math.floor(excedente * 0.05);
    const retornoTotal = excedente - reserva - educacion;
    const totalHours = data.partners.reduce((sum, p) => sum + p.dayHours + p.nightHours, 0);
    const valorHora = Math.floor(retornoTotal / totalHours);

    let distributed = 0;
    const results = data.partners.map((p, index) => {
      const hours = p.dayHours + p.nightHours;
      let amount = hours * valorHora;
      if (index === data.partners.length - 1) {
        amount = retornoTotal - distributed;
      }
      distributed += amount;
      const finalReturn = Math.max(0, amount - p.advances);
      return { ...p, hours, amount, finalReturn };
    });

    setData({ ...data, distribution: { reserva, educacion, retornoTotal, results, totalHours } });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Distribución de Excedente</h2>
      <p className="text-xs text-darkGold">⚠️ Datos de ejemplo configurables. NO es norma uruguaya ni asesoramiento. Los valida un contador.</p>
      <p className="text-xs text-darkGold">Solo socios participan. Empleados no socios NO reciben excedente.</p>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <label className="text-sm font-semibold">Excedente (centésimos)</label>
        <input type="number" value={excedente} onChange={e => setExcedente(Number(e.target.value))} className="w-full p-2 border rounded" />
        <button onClick={simulate} className="w-full py-2 bg-green text-white rounded font-semibold">Simular Distribución</button>
      </div>
      {data.distribution && (
        <div className="bg-white p-4 rounded border border-beige space-y-2">
          <p className="text-sm">Reserva Legal (20%): {formatMoney(data.distribution.reserva)}</p>
          <p className="text-sm">Fondo Educación (5%): {formatMoney(data.distribution.educacion)}</p>
          <p className="text-sm font-bold">Retorno a Socios (75%): {formatMoney(data.distribution.retornoTotal)}</p>
          <p className="text-xs text-darkGold">Total horas socios: {data.distribution.totalHours}h</p>
          <hr className="border-beige" />
          {data.distribution.results.map(r => (
            <div key={r.id} className="flex justify-between text-sm">
              <span>{r.name} ({r.hours}h)</span>
              <span className="font-bold text-green">{formatMoney(r.finalReturn)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- ADMIN ---
const Admin = ({ data, setData }) => {
  const resetData = () => {
    if (confirm('¿Reiniciar todos los datos? Se perderán los asientos y moliendas creados.')) {
      localStorage.removeItem('molino_florida_data');
      location.reload();
    }
  };

  const closeMonth = () => {
    const month = prompt('Ingrese el mes a cerrar (YYYY-MM):');
    if (!month) return;
    if (data.closedMonths && data.closedMonths.includes(month)) return alert('Ya está cerrado');
    setData({ ...data, closedMonths: [...(data.closedMonths || []), month] });
    alert(`Mes ${month} cerrado`);
  };

  const openMonth = () => {
    const month = prompt('Ingrese el mes a reabrir (YYYY-MM):');
    if (!month) return;
    setData({ ...data, closedMonths: (data.closedMonths || []).filter(m => m !== month) });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Panel de Administración</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <h3 className="font-bold">Cierre de meses</h3>
        <p className="text-xs text-darkGold">Meses cerrados: {(data.closedMonths || []).join(', ') || 'Ninguno'}</p>
        <div className="flex gap-2">
          <button onClick={closeMonth} className="px-4 py-2 bg-gold text-white rounded text-sm">Cerrar mes</button>
          <button onClick={openMonth} className="px-4 py-2 bg-beige text-dark rounded text-sm">Reabrir mes</button>
        </div>
      </div>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <h3 className="font-bold">Datos</h3>
        <button onClick={resetData} className="w-full py-2 bg-red text-white rounded font-semibold">
          Reiniciar datos semilla
        </button>
      </div>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <h3 className="font-bold">Configuración</h3>
        <p className="text-xs text-darkGold">Precio trigo: {data.settings.wheatPrice} cent/kg</p>
        <p className="text-xs text-darkGold">Energía: {data.settings.energyCost} cent/kg</p>
        <p className="text-xs text-darkGold">Valor hora: {data.settings.hourValue} cent</p>
        <p className="text-xs text-darkGold">Recargo nocturno: {data.settings.nightSurcharge}x</p>
        <p className="text-xs text-darkGold">Cupo por turno: {data.settings.shiftQuota} kg</p>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const [data, setData] = useLocalState('molino_florida_data', generateSeed);
  const [tab, setTab] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (tab === 'Login' && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-flour shadow-xl">
        <header className="p-4 bg-dark text-flour flex justify-between items-center">
          <h1 className="text-lg font-bold font-slab">Molino Florida</h1>
        </header>
        <Login onLogin={() => { setIsAuthenticated(true); setTab('Admin'); }} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-flour shadow-xl">
      <header className="p-4 bg-dark text-flour flex justify-between items-center">
        <h1 className="text-lg font-bold font-slab">Molino Florida</h1>
        <span className="text-xs text-gold">{isAuthenticated ? '🔓 Admin' : '👁️ Demo'}</span>
      </header>
      <Tabs current={tab} set={setTab} isAuthenticated={isAuthenticated} />
      <main className="pb-20">
        {tab === 'Dashboard' && <Dashboard data={data} />}
        {tab === 'Asientos' && <Asientos data={data} setData={setData} />}
        {tab === 'Moliendas' && <Moliendas data={data} setData={setData} />}
        {tab === 'LibroMayor' && <LibroMayor data={data} />}
        {tab === 'Balance' && <Balance data={data} />}
        {tab === 'Socios' && <Socios data={data} setData={setData} />}
        {tab === 'Empleados' && <Empleados data={data} />}
        {tab === 'Distribucion' && <Distribucion data={data} setData={setData} />}
        {tab === 'Admin' && isAuthenticated && <Admin data={data} setData={setData} />}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
