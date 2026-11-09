const { useState, useEffect, useMemo } = React;
const ADMIN_PASSWORD = "molino2026";

const useLocalState = (key, init) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : init();
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
};

const formatMoney = (cents) => `$U ${(cents / 100).toFixed(2)}`;
const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('es-UY');
const getMonthKey = (dateStr) => dateStr.substring(0, 7);

const Navigation = ({ current, set, isAuthenticated, onAdmin }) => {
  const tabs = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'Asientos', label: 'Asientos' },
    { id: 'Moliendas', label: 'Moliendas' },
    { id: 'LibroMayor', label: 'Libro Mayor' },
    { id: 'Balance', label: 'Balance' },
    { id: 'Socios', label: 'Socios' },
    { id: 'Distribucion', label: 'Distribución' },
    { id: 'Admin', label: '🔒 Admin', requiresAuth: true }
  ];
  return (
    <div className="flex overflow-x-auto bg-white border-b border-beige sticky top-0 z-10">
      {tabs.map(t => (
        <button key={t.id} onClick={() => t.requiresAuth && !isAuthenticated ? onAdmin() : set(t.id)} 
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${current === t.id ? 'text-gold border-b-2 border-gold' : 'text-darkGold'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
};

const Login = ({ onLogin, onCancel }) => {
  const [pass, setPass] = useState('');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-flour p-4">
      <h1 className="text-2xl font-bold font-slab mb-4">Panel Administrativo</h1>
      <input type="password" placeholder="Clave" value={pass} onChange={e => setPass(e.target.value)} className="p-2 border rounded mb-2 w-full max-w-xs" />
      <div className="flex gap-2">
        <button onClick={() => pass === ADMIN_PASSWORD ? onLogin() : alert('Clave incorrecta')} className="px-4 py-2 bg-gold text-white rounded">Ingresar</button>
        <button onClick={onCancel} className="px-4 py-2 bg-beige text-dark rounded">Cancelar</button>
      </div>
    </div>
  );
};

const Dashboard = ({ data }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-2xl font-bold text-dark">Molino Florida</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded border border-beige"><p className="text-xs text-darkGold">Cuentas</p><p className="text-2xl font-bold">{data.accounts.length}</p></div>
      <div className="bg-white p-4 rounded border border-beige"><p className="text-xs text-darkGold">Asientos</p><p className="text-2xl font-bold">{data.entries.length}</p></div>
      <div className="bg-white p-4 rounded border border-beige"><p className="text-xs text-darkGold">Moliendas</p><p className="text-2xl font-bold">{data.millings.length}</p></div>
      <div className="bg-white p-4 rounded border border-beige"><p className="text-xs text-darkGold">Socios</p><p className="text-2xl font-bold">{data.partners.length}</p></div>
    </div>
    <div className="bg-green/10 p-4 rounded border border-green/30">
      <h3 className="font-bold text-green">Calendario y Reparto</h3>
      <p className="text-sm mt-1">Turnos: L-V (6-14, 14-22, 22-6). Embolsado: 7-15. <br/>Reparto: Martes y Jueves. Anticipos: día 8 del mes siguiente.</p>
    </div>
  </div>
);

const Asientos = ({ data, setData }) => {
  const [lines, setLines] = useState([{account:'', debit:0, credit:0, memo:''}]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const saveEntry = () => {
    const totalD = lines.reduce((s,l) => s + Number(l.debit||0), 0);
    const totalC = lines.reduce((s,l) => s + Number(l.credit||0), 0);
    if (totalD !== totalC || totalD === 0) return alert(`Desbalanceado. Debe: ${totalD}, Haber: ${totalC}`);
    if (data.closedMonths.includes(getMonthKey(date))) return alert(`Mes ${getMonthKey(date)} cerrado.`);
    
    const newEntry = { id: `E${String(data.entries.length + 1).padStart(3,'0')}`, date, description, lines: [...lines], confirmed: true };
    setData({ ...data, entries: [...data.entries, newEntry] });
    setLines([{account:'', debit:0, credit:0, memo:''}]);
    setDescription('');
  };

  const revertEntry = (entryId) => {
    const entry = data.entries.find(e => e.id === entryId);
    if (!entry) return;
    if (data.closedMonths.includes(getMonthKey(entry.date))) return alert('Mes cerrado.');
    const contraLines = entry.lines.map(l => ({account: l.account, debit: l.credit, credit: l.debit, memo: `Rev. ${entry.id}`}));
    const contraEntry = { id: `E${String(data.entries.length + 1).padStart(3,'0')}`, date: new Date().toISOString().split('T')[0], description: `Reversión ${entry.id}`, lines: contraLines, confirmed: true, revertedFrom: entryId };
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
            <input type="number" placeholder="Debe" className="w-20 p-2 text-sm border rounded" value={l.debit||''} onChange={e => { const nl = [...lines]; nl[i].debit = Number(e.target.value); setLines(nl); }} />
            <input type="number" placeholder="Haber" className="w-20 p-2 text-sm border rounded" value={l.credit||''} onChange={e => { const nl = [...lines]; nl[i].credit = Number(e.target.value); setLines(nl); }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setLines([...lines, {account:'', debit:0, credit:0, memo:''}])} className="px-4 py-2 bg-beige text-dark rounded">+ Línea</button>
        <button onClick={saveEntry} className="px-4 py-2 bg-gold text-white rounded">Confirmar</button>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-bold">Historial</h3>
        {data.entries.slice().reverse().map(e => (
          <div key={e.id} className="bg-white p-3 rounded border border-beige text-sm">
            <div className="flex justify-between">
              <p className="font-semibold">{e.id} - {formatDate(e.date)} {e.revertedFrom && <span className="text-red text-xs">(Rev. {e.revertedFrom})</span>}</p>
              {!e.revertedFrom && <button onClick={() => revertEntry(e.id)} className="text-xs text-red underline">Revertir</button>}
            </div>
            {e.lines.map((l,i) => <p key={i} className="text-xs text-darkGold">{l.account} | D: {l.debit} | H: {l.credit}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Moliendas = ({ data, setData }) => {
  const [kg, setKg] = useState(12000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Mañana');

  const processMilling = () => {
    // 1. Validar cupo por turno
    const usedQuota = data.millings
      .filter(m => m.date === date && m.shift === shift)
      .reduce((sum, m) => sum + m.kgIn, 0);
    if (usedQuota + kg > data.settings.shiftQuota) {
      return alert(`Cupo excedido. Turno ${shift} del ${formatDate(date)} tiene ${usedQuota} kg usados. Cupo máximo: ${data.settings.shiftQuota} kg.`);
    }
    if (data.closedMonths.includes(getMonthKey(date))) return alert('Mes cerrado.');

    // 2. Calcular costos
    const totalCost = (kg * data.settings.wheatPrice) + (kg * data.settings.energyCost);
    const productsOut = data.products.map((p, idx) => {
      let kgs = Math.round(kg * p.yield);
      if (idx === data.products.length - 1) kgs = kg - data.products.slice(0, idx).reduce((s, x) => s + Math.round(kg * x.yield), 0);
      return { ...p, kgs, val: kgs * p.price };
    });
    
    // Validación estricta de kilos (Criterio)
    if (productsOut.reduce((s,p) => s+p.kgs, 0) !== kg) return alert('Error de redondeo en kilos.');

    const sumValue = productsOut.reduce((s, p) => s + p.val, 0);
    let assignedCost = 0;
    const maxValProd = productsOut.reduce((max, p) => p.val > max.val ? p : max, productsOut[0]);
    productsOut.forEach(p => {
      if (p.id === 'PMER') { p.cost = 0; p.costPerKg = 0; return; }
      if (p === maxValProd) { p.cost = totalCost - assignedCost; } 
      else { p.cost = Math.floor((totalCost * p.val) / sumValue); assignedCost += p.cost; }
      p.costPerKg = p.kgs > 0 ? Math.floor((p.cost / p.kgs) * 100) / 100 : 0;
    });

    const milling = { id: `M${String(data.millings.length + 1).padStart(3,'0')}`, date, shift, kgIn: kg, totalCost, productsOut };
    const entry = { id: `E${String(data.entries.length + 1).padStart(3,'0')}`, date, description: `Producción ${milling.id}`, 
      lines: [{account:'A005', debit:totalCost, credit:0}, {account:'A004', debit:0, credit:kg*data.settings.wheatPrice}, {account:'R004', debit:0, credit:kg*data.settings.energyCost}], confirmed: true };
    
    setData({ ...data, millings: [...data.millings, milling], entries: [...data.entries, entry] });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Registrar Molienda</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded text-sm" />
          <select value={shift} onChange={e => setShift(e.target.value)} className="p-2 border rounded text-sm">
            <option>Mañana</option><option>Tarde</option><option>Noche</option>
          </select>
        </div>
        <input type="number" value={kg} onChange={e => setKg(Number(e.target.value))} className="w-full p-2 border rounded" />
        <p className="text-xs text-darkGold">Cupo turno: {data.settings.shiftQuota} kg</p>
        <button onClick={processMilling} className="w-full py-2 bg-green text-white rounded">Procesar</button>
      </div>
      {data.millings.slice().reverse().map(m => (
        <div key={m.id} className="bg-white p-4 rounded border border-beige">
          <h3 className="font-bold text-gold">{m.id} | {formatDate(m.date)} | {m.shift}</h3>
          <p className="text-sm">Ingreso: {m.kgIn} kg | Costo: {formatMoney(m.totalCost)}</p>
          <table className="w-full mt-2 text-xs">
            <thead><tr className="text-left border-b"><th>Prod</th><th>Kg</th><th>Costo</th></tr></thead>
            <tbody>{m.productsOut.map(p => <tr key={p.id} className="border-t"><td>{p.name}</td><td>{p.kgs}</td><td>{formatMoney(p.cost)}</td></tr>)}</tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

const LibroMayor = ({ data }) => {
  const [accId, setAccId] = useState(data.accounts[0]?.id);
  const movements = useMemo(() => data.entries.flatMap(e => e.lines.filter(l => l.account === accId).map(l => ({...l, date: e.date, id: e.id}))).sort((a,b) => a.date.localeCompare(b.date)), [accId, data.entries]);
  const balance = movements.reduce((b, m) => ({d: b.d + m.debit, c: b.c + m.credit}), {d:0, c:0});
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Libro Mayor</h2>
      <select value={accId} onChange={e => setAccId(e.target.value)} className="w-full p-2 border rounded">
        {data.accounts.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
      </select>
      <div className="bg-white p-4 rounded border border-beige text-sm">
        {movements.map((m,i) => <p key={i}>{formatDate(m.date)} | {m.id} | D: {m.debit} | H: {m.credit}</p>)}
        <p className="mt-2 font-bold">Saldo: {formatMoney(balance.d - balance.c)}</p>
      </div>
    </div>
  );
};

const Balance = ({ data }) => {
  const totals = data.accounts.map(acc => {
    const d = data.entries.reduce((s,e) => s + e.lines.filter(l=>l.account===acc.id).reduce((sl,l)=>sl+l.debit,0), 0);
    const c = data.entries.reduce((s,e) => s + e.lines.filter(l=>l.account===acc.id).reduce((sl,l)=>sl+l.credit,0), 0);
    return {...acc, d, c, s: d-c};
  });
  const sumD = totals.reduce((s,t) => s + (t.s>0?t.s:0), 0);
  const sumC = totals.reduce((s,t) => s + (t.s<0?Math.abs(t.s):0), 0);
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Balance de Sumas y Saldos</h2>
      <div className="bg-white p-4 rounded border border-beige text-xs overflow-x-auto">
        <table className="w-full"><thead><tr className="border-b"><th>Cuenta</th><th>Debe</th><th>Haber</th><th>Saldo D</th><th>Saldo A</th></tr></thead>
        <tbody>{totals.filter(t=>t.d>0||t.c>0).map(t => <tr key={t.id} className="border-t"><td>{t.name}</td><td>{formatMoney(t.d)}</td><td>{formatMoney(t.c)}</td><td>{t.s>0?formatMoney(t.s):'-'}</td><td>{t.s<0?formatMoney(Math.abs(t.s)):'-'}</td></tr>)}</tbody></table>
        <p className={`mt-2 font-bold ${Math.abs(sumD-sumC)<1?'text-green':'text-red'}`}>{Math.abs(sumD-sumC)<1?'✓ Balanceado':'✗ Desbalanceado'} (D: {formatMoney(sumD)} | A: {formatMoney(sumC)})</p>
      </div>
    </div>
  );
};

const Socios = ({ data, setData }) => {
  const payAdvances = () => {
    const updated = data.partners.map(p => {
      const totalHours = p.dayHours + p.nightHours;
      // Bloqueo si supera 184+24 y no está aprobado
      if (totalHours > p.monthlyLimit + p.extraLimit && !p.extraApproved) {
        alert(`${p.name} excede horas y no tiene aprobación del consejo. Anticipo bloqueado.`);
        return p;
      }
      const advance = (p.dayHours * data.settings.hourValue) + (p.nightHours * data.settings.hourValue * data.settings.nightSurcharge);
      return { ...p, advances: p.advances + Math.round(advance) };
    });
    setData({ ...data, partners: updated });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Socios y Anticipos</h2>
      <button onClick={payAdvances} className="w-full py-2 bg-gold text-white rounded">Pagar Anticipos (Día 8)</button>
      {data.partners.map(p => (
        <div key={p.id} className="bg-white p-3 rounded border border-beige flex justify-between text-sm">
          <div><p className="font-semibold">{p.name}</p><p className="text-xs text-darkGold">Día: {p.dayHours}h | Noche: {p.nightHours}h {p.extraApproved && '(Extra OK)'}</p></div>
          <p className="font-bold text-green">{formatMoney(p.advances)}</p>
        </div>
      ))}
    </div>
  );
};

const Distribucion = ({ data, setData }) => {
  const [exc, setExc] = useState(50000000);
  const simulate = () => {
    const res = Math.floor(exc * 0.20), edu = Math.floor(exc * 0.05), ret = exc - res - edu;
    const totalH = data.partners.reduce((s,p) => s + p.dayHours + p.nightHours, 0);
    const valH = Math.floor(ret / totalH);
    let dist = 0;
    const results = data.partners.map((p,i) => {
      const h = p.dayHours + p.nightHours;
      let amt = h * valH;
      if (i === data.partners.length - 1) amt = ret - dist;
      dist += amt;
      return {...p, hours: h, final: Math.max(0, amt - p.advances)};
    });
    setData({...data, distribution: {res, edu, ret, results}});
  };
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Distribución de Excedente</h2>
      <p className="text-xs text-darkGold">Solo socios. Empleados no participan.</p>
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
    <h2 className="text-xl font-bold">Administración</h2>
    <button onClick={() => { localStorage.removeItem('molino_florida_data'); location.reload(); }} className="w-full py-2 bg-red text-white rounded">Reset Datos</button>
  </div>
);

const App = () => {
  const [data, setData] = useLocalState('molino_florida_data', generateSeed);
  const [tab, setTab] = useState('Dashboard');
  const [auth, setAuth] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState(false);

  if (pendingAdmin) return <div className="max-w-md mx-auto min-h-screen bg-flour"><Login onLogin={() => { setAuth(true); setPendingAdmin(false); setTab('Admin'); }} onCancel={() => setPendingAdmin(false)} /></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-flour shadow-xl">
      <header className="p-4 bg-dark text-flour flex justify-between items-center">
        <h1 className="text-lg font-bold font-slab">Molino Florida</h1>
      </header>
      <Navigation current={tab} set={setTab} isAuthenticated={auth} onAdmin={() => setPendingAdmin(true)} />
      <main className="pb-20">
        {tab === 'Dashboard' && <Dashboard data={data} />}
        {tab === 'Asientos' && <Asientos data={data} setData={setData} />}
        {tab === 'Moliendas' && <Moliendas data={data} setData={setData} />}
        {tab === 'LibroMayor' && <LibroMayor data={data} />}
        {tab === 'Balance' && <Balance data={data} />}
        {tab === 'Socios' && <Socios data={data} setData={setData} />}
        {tab === 'Distribucion' && <Distribucion data={data} setData={setData} />}
        {tab === 'Admin' && auth && <Admin data={data} setData={setData} />}
      </main>
    </div>
  );
};
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
