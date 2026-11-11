const { useState, useEffect, useMemo } = React;
const ADMIN_PASSWORD = "molino2026";

const formatMoney = (cents) => `$U ${(cents / 100).toFixed(2)}`;
const formatDate = (d) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; };
const getMonthKey = (d) => d.substring(0, 7);
const getPeriods = (entries) => [...new Set(entries.map(e => getMonthKey(e.date)))].sort();

const useLocalState = (key, init) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : init();
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
};

const Tabs = ({ current, set, isAuthenticated }) => {
  const tabs = [
    { id: 'Dashboard', label: 'Dashboard' }, { id: 'Asientos', label: 'Asientos' },
    { id: 'Moliendas', label: 'Moliendas' }, { id: 'LibroMayor', label: 'Libro Mayor' },
    { id: 'Balance', label: 'Balance' }, { id: 'Socios', label: 'Socios' },
    { id: 'Empleados', label: 'Empleados' }, { id: 'Distribucion', label: 'Distribución' },
    { id: 'Admin', label: '🔒 Admin', requiresAuth: true }
  ];
  return (
    <div className="flex overflow-x-auto bg-white border-b border-beige sticky top-0 z-10">
      {tabs.map(t => (
        <button key={t.id} onClick={() => t.requiresAuth && !isAuthenticated ? set('Login') : set(t.id)}
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${current === t.id ? 'text-gold border-b-2 border-gold' : 'text-darkGold'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [pass, setPass] = useState('');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-flour p-4 space-y-4">
      <h1 className="text-2xl font-bold font-slab">Panel Administrativo</h1>
      <input type="password" placeholder="Clave de acceso" value={pass} onChange={e => setPass(e.target.value)} className="p-2 border rounded w-full max-w-xs" />
      <button onClick={() => pass === ADMIN_PASSWORD ? onLogin() : alert('Clave incorrecta')} className="px-4 py-2 bg-gold text-white rounded font-semibold w-full max-w-xs">Ingresar</button>
      <p className="text-xs text-darkGold">Clave demo: molino2026</p>
    </div>
  );
};

const Dashboard = ({ data }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-2xl font-bold text-dark">Molino Florida</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige"><p className="text-xs text-darkGold">Cuentas</p><p className="text-2xl font-bold">{data.accounts.length}</p></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige"><p className="text-xs text-darkGold">Asientos</p><p className="text-2xl font-bold">{data.entries.length}</p></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige"><p className="text-xs text-darkGold">Moliendas</p><p className="text-2xl font-bold">{data.millings.length}</p></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige"><p className="text-xs text-darkGold">Meses cerrados</p><p className="text-2xl font-bold">{data.closedMonths.length}</p></div>
    </div>
  </div>
);

const Asientos = ({ data, setData }) => {
  const [lines, setLines] = useState([{ account: '', debit: 0, credit: 0, memo: '' }]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const saveEntry = () => {
    const totalD = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalC = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    if (totalD !== totalC || totalD === 0) return alert(`Desbalanceado. Debe: ${totalD}, Haber: ${totalC}`);
    if (data.closedMonths.includes(getMonthKey(date))) return alert(`Mes ${getMonthKey(date)} cerrado.`);
    
    const newEntry = { id: `E${String(data.entries.length + 1).padStart(3, '0')}`, date, description, lines: lines.map(l => ({ ...l, debit: Number(l.debit || 0), credit: Number(l.credit || 0) })), confirmed: true };
    setData({ ...data, entries: [...data.entries, newEntry] });
    setLines([{ account: '', debit: 0, credit: 0, memo: '' }]);
    setDescription('');
  };

  const revertEntry = (entryId) => {
    const entry = data.entries.find(e => e.id === entryId);
    if (!entry) return;
    if (data.closedMonths.includes(getMonthKey(entry.date))) return alert('Mes cerrado, no se puede revertir.');
    if (!confirm(`¿Revertir asiento ${entry.id}? Se generará un contraasiento.`)) return;
    
    const contraLines = entry.lines.map(l => ({ account: l.account, debit: l.credit, credit: l.debit, memo: `Reversión de ${entry.id}` }));
    const contraEntry = { id: `E${String(data.entries.length + 1).padStart(3, '0')}`, date: new Date().toISOString().split('T')[0], description: `Reversión de ${entry.id}`, lines: contraLines, confirmed: true, revertedFrom: entryId };
    setData({ ...data, entries: [...data.entries, contraEntry] });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Nuevo Asiento</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
        <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded text-sm" />
      </div>
      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 items-center bg-white p-2 rounded border border-beige">
            <select className="flex-1 p-2 text-sm border rounded" value={l.account} onChange={e => { const nl = [...lines]; nl[i].account = e.target.value; setLines(nl); }}>
              <option value="">Cuenta...</option>
              {data.accounts.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
            </select>
            <input type="number" placeholder="Debe" className="w-20 p-2 text-sm border rounded" value={l.debit || ''} onChange={e => { const nl = [...lines]; nl[i].debit = Number(e.target.value); setLines(nl); }} />
            <input type="number" placeholder="Haber" className="w-20 p-2 text-sm border rounded" value={l.credit || ''} onChange={e => { const nl = [...lines]; nl[i].credit = Number(e.target.value); setLines(nl); }} />
            {lines.length > 1 && <button onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="text-red text-sm px-2">✕</button>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setLines([...lines, { account: '', debit: 0, credit: 0, memo: '' }])} className="px-4 py-2 bg-beige text-dark rounded">+ Línea</button>
        <button onClick={saveEntry} className="px-4 py-2 bg-gold text-white rounded">Confirmar</button>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-bold">Historial (Inmutable)</h3>
        {data.entries.slice().reverse().map(e => (
          <div key={e.id} className="bg-white p-3 rounded border border-beige text-sm">
            <div className="flex justify-between">
              <p className="font-semibold">{e.id} - {formatDate(e.date)} {e.revertedFrom && <span className="text-red text-xs"> (Rev. de {e.revertedFrom})</span>}</p>
              {!e.revertedFrom && <button onClick={() => revertEntry(e.id)} className="text-xs text-red underline">Revertir</button>}
            </div>
            {e.lines.map((l, i) => <p key={i} className="text-xs text-darkGold">{l.account} | D: {formatMoney(l.debit)} | H: {formatMoney(l.credit)} {l.memo && `- ${l.memo}`}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Moliendas = ({ data, setData }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Mañana');
  const [kg, setKg] = useState(12000);
  const [wheatPrice, setWheatPrice] = useState(data.settings.wheatPrice);
  const [productKgs, setProductKgs] = useState(data.products.map(p => ({ id: p.id, kgs: Math.round(12000 * p.yield) })));

  useEffect(() => { setProductKgs(data.products.map(p => ({ id: p.id, kgs: Math.round(kg * p.yield) }))); }, [kg]);
  const updateKg = (id, value) => setProductKgs(productKgs.map(p => p.id === id ? { ...p, kgs: Number(value) || 0 } : p));
  const sumKgOut = productKgs.reduce((s, p) => s + p.kgs, 0);
  const totalCost = (kg * wheatPrice) + (kg * data.settings.energyCost);

  const processMilling = () => {
    const usedQuota = data.millings.filter(m => m.date === date && m.shift === shift).reduce((sum, m) => sum + m.kgIn, 0);
    if (usedQuota + kg > data.settings.shiftQuota) return alert(`Cupo excedido para el turno ${shift}.`);
    if (data.closedMonths.includes(getMonthKey(date))) return alert('Mes cerrado.');
    if (sumKgOut !== kg) return alert(`Los kilos de salida (${sumKgOut}) deben igualar los ingresados (${kg}).`);

    const productsOut = data.products.map((p, idx) => {
      const kgs = productKgs.find(pk => pk.id === p.id).kgs;
      return { ...p, kgs, val: kgs * p.price };
    });
    const sumValue = productsOut.reduce((s, p) => s + p.val, 0);
    let assignedCost = 0;
    const maxValProd = productsOut.reduce((max, p) => p.val > max.val ? p : max, productsOut[0]);

    productsOut.forEach(p => {
      if (p.id === 'PMER') { p.cost = 0; p.costPerKg = 0; return; }
      if (p === maxValProd) { p.cost = totalCost - assignedCost; } 
      else { p.cost = Math.floor((totalCost * p.val) / sumValue); assignedCost += p.cost; }
      p.costPerKg = p.kgs > 0 ? Math.floor((p.cost / p.kgs) * 100) / 100 : 0;
    });

    const milling = { id: `M${String(data.millings.length + 1).padStart(3, '0')}`, date, shift, kgIn: kg, totalCost, productsOut };
    const entry = {
      id: `E${String(data.entries.length + 1).padStart(3, '0')}`, date, description: `Producción ${milling.id} - ${shift}`,
      lines: [
        { account: 'A005', debit: totalCost, credit: 0, memo: 'Producción en proceso' },
        { account: 'A004', debit: 0, credit: kg * wheatPrice, memo: 'Stock de trigo' },
        { account: 'R004', debit: 0, credit: kg * data.settings.energyCost, memo: 'Energía eléctrica' }
      ], confirmed: true, linkedMilling: milling.id
    };

    setData({ ...data, millings: [...data.millings, milling], entries: [...data.entries, entry] });
    setKg(12000); setProductKgs(data.products.map(p => ({ id: p.id, kgs: Math.round(12000 * p.yield) })));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Registrar Molienda</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded text-sm" />
          <select value={shift} onChange={e => setShift(e.target.value)} className="p-2 border rounded text-sm">
            <option>Mañana (6-14)</option><option>Tarde (14-22)</option><option>Noche (22-6)</option>
          </select>
        </div>
        <input type="number" placeholder="Kilos de trigo" value={kg} onChange={e => setKg(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
        <input type="number" placeholder="Costo trigo (cent/kg)" value={wheatPrice} onChange={e => setWheatPrice(Number(e.target.value))} className="w-full p-2 border rounded text-sm" />
        <p className="text-xs text-darkGold">Costo total estimado: {formatMoney(totalCost)}</p>
      </div>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <h3 className="font-bold text-sm">Kilos de salida (Total debe ser {kg} kg)</h3>
        {productKgs.map(p => {
          const prod = data.products.find(x => x.id === p.id);
          return (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{prod.name}</span>
              <input type="number" value={p.kgs} onChange={e => updateKg(p.id, e.target.value)} className="w-20 p-1 border rounded text-sm" />
            </div>
          );
        })}
        <p className={`text-sm font-bold ${sumKgOut !== kg ? 'text-red' : 'text-green'}`}>Total salida: {sumKgOut} kg {sumKgOut === kg ? '✓' : '✗'}</p>
      </div>
      <button onClick={processMilling} className="w-full py-2 bg-green text-white rounded font-semibold">Procesar y generar asiento</button>
      <div className="space-y-4">
        {data.millings.slice().reverse().map(m => (
          <div key={m.id} className="bg-white p-4 rounded border border-beige">
            <h3 className="font-bold text-gold">{m.id} | {formatDate(m.date)} | {m.shift}</h3>
            <table className="w-full mt-2 text-xs">
              <thead><tr className="text-left border-b"><th>Prod</th><th>Kg</th><th>Costo</th></tr></thead>
              <tbody>{m.productsOut.map(p => <tr key={p.id} className="border-t"><td>{p.name}</td><td>{p.kgs}</td><td>{formatMoney(p.cost)}</td></tr>)}</tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

const LibroMayor = ({ data }) => {
  const [accId, setAccId] = useState(data.accounts[0]?.id || '');
  const [period, setPeriod] = useState('all');
  const account = data.accounts.find(a => a.id === accId);
  
  const movements = useMemo(() => {
    if (!accId) return [];
    return data.entries.filter(e => period === 'all' || getMonthKey(e.date) === period)
      .flatMap(e => e.lines.filter(l => l.account === accId).map(l => ({ ...l, date: e.date, id: e.id, desc: e.description })))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [accId, period, data.entries]);

  let saldo = 0;
  const movs = movements.map(m => { saldo += (m.debit || 0) - (m.credit || 0); return { ...m, saldo }; });
  const totalD = movs.reduce((s, m) => s + (m.debit || 0), 0);
  const totalC = movs.reduce((s, m) => s + (m.credit || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Libro Mayor</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <select value={accId} onChange={e => setAccId(e.target.value)} className="w-full p-2 border rounded text-sm">
          {data.accounts.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full p-2 border rounded text-sm">
          <option value="all">Todos los períodos</option>
          {getPeriods(data.entries).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {account && (
        <div className="bg-white p-4 rounded border border-beige">
          <h3 className="font-bold">{account.id} - {account.name}</h3>
          <table className="w-full mt-2 text-xs">
            <thead><tr className="border-b"><th>Fecha</th><th>Asiento</th><th>Debe</th><th>Haber</th><th>Saldo</th></tr></thead>
            <tbody>
              {movs.map((m, i) => (
                <tr key={i} className="border-t"><td>{formatDate(m.date)}</td><td>{m.id}</td>
                <td>{m.debit ? formatMoney(m.debit) : '-'}</td><td>{m.credit ? formatMoney(m.credit) : '-'}</td>
                <td className="font-semibold">{formatMoney(m.saldo)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm font-bold">Saldo Final: {formatMoney(totalD - totalC)} {totalD - totalC >= 0 ? '(Deudor)' : '(Acreedor)'}</p>
        </div>
      )}
    </div>
  );
};

const Balance = ({ data }) => {
  const [period, setPeriod] = useState('all');
  const balances = useMemo(() => data.accounts.map(acc => {
    let d = 0, c = 0;
    data.entries.filter(e => period === 'all' || getMonthKey(e.date) === period).forEach(e => 
      e.lines.filter(l => l.account === acc.id).forEach(l => { d += l.debit || 0; c += l.credit || 0; })
    );
    return { ...acc, d, c, s: d - c };
  }), [data, period]);

  const totals = balances.reduce((t, b) => ({
    d: t.d + b.d, c: t.c + b.c, sD: t.sD + (b.s > 0 ? b.s : 0), sA: t.sA + (b.s < 0 ? Math.abs(b.s) : 0)
  }), { d: 0, c: 0, sD: 0, sA: 0 });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Balance de Sumas y Saldos</h2>
      <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
        <option value="all">Todos los períodos</option>
        {getPeriods(data.entries).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <div className="bg-white p-4 rounded border border-beige overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b"><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Saldo D</th><th>Saldo A</th></tr></thead>
          <tbody>
            {balances.filter(b => b.d > 0 || b.c > 0).map(b => (
              <tr key={b.id} className="border-t"><td>{b.name}</td><td>{formatMoney(b.d)}</td><td>{formatMoney(b.c)}</td>
              <td>{b.s > 0 ? formatMoney(b.s) : '-'}</td><td>{b.s < 0 ? formatMoney(Math.abs(b.s)) : '-'}</td></tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t-2 font-bold"><td>TOTALES</td><td>{formatMoney(totals.d)}</td><td>{formatMoney(totals.c)}</td><td>{formatMoney(totals.sD)}</td><td>{formatMoney(totals.sA)}</td></tr></tfoot>
        </table>
        <p className={`mt-2 text-sm font-bold ${Math.abs(totals.sD - totals.sA) < 1 ? 'text-green' : 'text-red'}`}>
          {Math.abs(totals.sD - totals.sA) < 1 ? '✓ Balanceado' : '✗ Desbalanceado'}
        </p>
      </div>
    </div>
  );
};

const Socios = ({ data, setData }) => {
  const payAdvances = () => {
    const updated = data.partners.map(p => {
      if ((p.dayHours + p.nightHours) > p.monthlyLimit + p.extraLimit && !p.extraApproved) {
        alert(`${p.name} excede horas sin aprobación. Bloqueado.`); return p;
      }
      return { ...p, advances: p.advances + Math.round((p.dayHours * data.settings.hourValue) + (p.nightHours * data.settings.hourValue * data.settings.nightSurcharge)) };
    });
    setData({ ...data, partners: updated });
  };
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Socios - Anticipos</h2>
      <button onClick={payAdvances} className="w-full py-2 bg-gold text-white rounded">Pagar Anticipos</button>
      {data.partners.map(p => (
        <div key={p.id} className="bg-white p-3 rounded border border-beige flex justify-between text-sm">
          <div><p className="font-semibold">{p.name}</p><p className="text-xs text-darkGold">Día: {p.dayHours}h | Noche: {p.nightHours}h {p.extraApproved && '(Extra OK)'}</p></div>
          <p className="font-bold text-green">{formatMoney(p.advances)}</p>
        </div>
      ))}
    </div>
  );
};

const Empleados = ({ data }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold">Empleados No Socios</h2>
    <p className="text-xs text-darkGold">Registrados en "Sueldos y jornales". No participan del excedente.</p>
    {data.employees.map(e => (
      <div key={e.id} className="bg-white p-3 rounded border border-beige flex justify-between text-sm">
        <div><p className="font-semibold">{e.name}</p><p className="text-xs text-darkGold">{e.role}</p></div>
        <p className="font-bold">{formatMoney(e.monthlySalary)}</p>
      </div>
    ))}
  </div>
);

const Distribucion = ({ data, setData }) => {
  const [exc, setExc] = useState(50000000);
  const simulate = () => {
    const res = Math.floor(exc * 0.20), edu = Math.floor(exc * 0.05), ret = exc - res - edu;
    const totalH = data.partners.reduce((s, p) => s + p.dayHours + p.nightHours, 0);
    const valH = Math.floor(ret / totalH);
    let dist = 0;
    const results = data.partners.map((p, i) => {
      const h = p.dayHours + p.nightHours;
      let amt = h * valH;
      if (i === data.partners.length - 1) amt = ret - dist;
      dist += amt;
      return { ...p, hours: h, final: Math.max(0, amt - p.advances) };
    });
    setData({ ...data, distribution: { res, edu, ret, results } });
  };
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Distribución de Excedente</h2>
      <p className="text-xs text-darkGold">⚠️ Datos de ejemplo. NO es norma uruguaya. Valida un contador. Solo socios participan.</p>
      <input type="number" value={exc} onChange={e => setExc(Number(e.target.value))} className="w-full p-2 border rounded" />
      <button onClick={simulate} className="w-full py-2 bg-green text-white rounded">Simular</button>
      {data.distribution && (
        <div className="bg-white p-4 rounded border border-beige text-sm space-y-1">
          <p>Reserva (20%): {formatMoney(data.distribution.res)}</p>
          <p>Educación (5%): {formatMoney(data.distribution.edu)}</p>
          <p className="font-bold">Retorno (75%): {formatMoney(data.distribution.ret)}</p>
          {data.distribution.results.map(r => <div key={r.id} className="flex justify-between"><span>{r.name} ({r.hours}h)</span><span className="text-green">{formatMoney(r.final)}</span></div>)}
        </div>
      )}
    </div>
  );
};

const Admin = ({ data, setData }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold">Panel de Administración</h2>
    <button onClick={() => { localStorage.removeItem('molino_florida_data'); location.reload(); }} className="w-full py-2 bg-red text-white rounded">Reiniciar datos semilla</button>
  </div>
);

const App = () => {
  const [data, setData] = useLocalState('molino_florida_data', generateSeed);
  const [tab, setTab] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (tab === 'Login' && !isAuthenticated) {
    return <div className="max-w-md mx-auto min-h-screen bg-flour shadow-xl"><header className="p-4 bg-dark text-flour"><h1 className="text-lg font-bold font-slab">Molino Florida</h1></header><Login onLogin={() => { setIsAuthenticated(true); setTab('Admin'); }} /></div>;
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
