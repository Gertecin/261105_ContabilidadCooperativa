const { useState, useEffect } = React;
const ADMIN_PASSWORD = "molino2026";

const useLocalState = (key, init) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : init();
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
};

const Tabs = ({ current, set }) => {
  const tabs = ['Dashboard', 'Asientos', 'Moliendas', 'Socios', 'Empleados', 'Distribución', 'Reportes', 'Admin'];
  return (
    <div className="flex overflow-x-auto bg-white border-b border-beige sticky top-0 z-10">
      {tabs.map(t => (
        <button 
          key={t} 
          onClick={() => set(t)} 
          className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${current === t ? 'text-gold border-b-2 border-gold' : 'text-darkGold'}`}
        >
          {t === 'Admin' ? '🔒 Admin' : t}
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

const Admin = ({ data, setData }) => {
  const resetData = () => { 
    if(confirm('¿Reiniciar todos los datos?')) { 
      localStorage.removeItem('molino_florida_data'); 
      location.reload(); 
    } 
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Panel de Administración</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <h3 className="font-bold text-sm">Configuración</h3>
        <p className="text-xs text-darkGold">Clave actual: <strong>molino2026</strong></p>
      </div>
      <button onClick={resetData} className="w-full py-2 bg-red text-white rounded font-semibold">
        Reiniciar datos semilla
      </button>
    </div>
  );
};

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
    </div>
  </div>
);

const Asientos = ({ data, setData }) => {
  const [lines, setLines] = useState([{account:'', debit:0, credit:0}]);
  
  const saveEntry = () => {
    const totalD = lines.reduce((s,l) => s + Number(l.debit||0), 0);
    const totalC = lines.reduce((s,l) => s + Number(l.credit||0), 0);
    if(totalD !== totalC || totalD === 0) return alert(`Asiento desbalanceado. Debe: ${totalD}, Haber: ${totalC}`);
    
    const newEntry = { id: `E${data.entries.length + 1}`, date: new Date().toISOString().split('T')[0], lines: [...lines], confirmed: true };
    setData({ ...data, entries: [...data.entries, newEntry] });
    setLines([{account:'', debit:0, credit:0}]);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Nuevo Asiento</h2>
      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 items-center bg-white p-2 rounded border border-beige">
            <select className="flex-1 p-2 text-sm border rounded" value={l.account} onChange={e => { const nl = [...lines]; nl[i].account = e.target.value; setLines(nl); }}>
              <option value="">Cuenta...</option>
              {data.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input type="number" placeholder="Debe" className="w-20 p-2 text-sm border rounded" value={l.debit||''} onChange={e => { const nl = [...lines]; nl[i].debit = Number(e.target.value); setLines(nl); }} />
            <input type="number" placeholder="Haber" className="w-20 p-2 text-sm border rounded" value={l.credit||''} onChange={e => { const nl = [...lines]; nl[i].credit = Number(e.target.value); setLines(nl); }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setLines([...lines, {account:'', debit:0, credit:0}])} className="px-4 py-2 bg-beige text-dark text-sm rounded font-semibold">+ Línea</button>
        <button onClick={saveEntry} className="px-4 py-2 bg-gold text-white text-sm rounded font-semibold">Confirmar</button>
      </div>
    </div>
  );
};

const Moliendas = ({ data, setData }) => {
  const [kg, setKg] = useState(12000);
  
  const processMilling = () => {
    const totalCost = (kg * data.settings.wheatPrice) + (kg * data.settings.energyCost);
    let productsOut = [];
    let sumValue = 0;
    let sumKgOut = 0;
    
    data.products.forEach((p, index) => {
      let kgs = Math.round(kg * p.yield);
      if (index === data.products.length - 1) kgs = kg - sumKgOut;
      sumKgOut += kgs;
      const val = kgs * p.price;
      sumValue += val;
      productsOut.push({ ...p, kgs, val });
    });

    let assignedCost = 0;
    const maxValProd = productsOut.reduce((max, p) => p.val > max.val ? p : max, productsOut[0]);
    
    productsOut.forEach(p => {
      if(p.id === 'PMER') { p.cost = 0; p.costPerKg = 0; return; }
      if(p === maxValProd) {
        p.cost = totalCost - assignedCost;
      } else {
        p.cost = Math.round((totalCost * p.val) / sumValue);
        assignedCost += p.cost;
      }
      p.costPerKg = p.kgs > 0 ? Math.round((p.cost / p.kgs) * 100) / 100 : 0;
    });

    const newMilling = { id: `M${data.millings.length + 1}`, date: new Date().toISOString().split('T')[0], kgIn: kg, totalCost, productsOut };
    setData({ ...data, millings: [...data.millings, newMilling] });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Registrar Molienda</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <label className="text-sm font-semibold">Kilos de Trigo</label>
        <input type="number" value={kg} onChange={e => setKg(Number(e.target.value))} className="w-full p-2 border rounded" />
        <button onClick={processMilling} className="w-full py-2 bg-green text-white rounded font-semibold">Procesar</button>
      </div>
      {data.millings.slice().reverse().map(m => (
        <div key={m.id} className="bg-white p-4 rounded border border-beige">
          <h3 className="font-bold text-gold">{m.id} | {m.date}</h3>
          <p className="text-sm">Ingreso: {m.kgIn} kg | Costo Total: {formatMoney(m.totalCost)}</p>
        </div>
      ))}
    </div>
  );
};

const Socios = ({ data, setData }) => {
  const payAdvances = () => {
    const updated = data.partners.map(p => {
      const dayAdvance = p.dayHours * data.settings.hourValue;
      const nightAdvance = p.nightHours * data.settings.hourValue * data.settings.nightSurcharge;
      return { ...p, advances: p.advances + Math.round(dayAdvance + nightAdvance) };
    });
    setData({ ...data, partners: updated });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Socios - Anticipos</h2>
      <button onClick={payAdvances} className="w-full py-2 bg-gold text-white rounded font-semibold">Pagar Anticipos</button>
      {data.partners.map(p => (
        <div key={p.id} className="bg-white p-3 rounded border border-beige flex justify-between items-center text-sm">
          <div><p className="font-semibold">{p.name}</p><p className="text-xs text-darkGold">Día: {p.dayHours}h | Noche: {p.nightHours}h</p></div>
          <p className="font-bold text-green">{formatMoney(p.advances)}</p>
        </div>
      ))}
    </div>
  );
};

const Empleados = ({ data }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold">Empleados No Socios</h2>
    <p className="text-xs text-darkGold">Los sueldos se registran en "Sueldos y jornales", NO en "Anticipos de retorno". No participan del excedente.</p>
    {data.employees && data.employees.map(e => (
      <div key={e.id} className="bg-white p-3 rounded border border-beige text-sm">
        <p className="font-semibold">{e.name}</p>
        <p className="text-xs text-darkGold">Sueldo: {formatMoney(e.monthlySalary)}</p>
      </div>
    ))}
  </div>
);

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
      if (index === data.partners.length - 1) amount = retornoTotal - distributed;
      distributed += amount;
      return { ...p, hours, finalReturn: Math.max(0, amount - p.advances) };
    });

    setData({ ...data, distribution: { reserva, educacion, retornoTotal, results } });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Distribución de Excedente</h2>
      <p className="text-xs text-darkGold">⚠️ Datos de ejemplo. NO es norma uruguaya. Valida un contador.</p>
      <input type="number" value={excedente} onChange={e => setExcedente(Number(e.target.value))} className="w-full p-2 border rounded" />
      <button onClick={simulate} className="w-full py-2 bg-green text-white rounded font-semibold">Simular</button>
      {data.distribution && (
        <div className="bg-white p-4 rounded border border-beige mt-2">
          <p>Reserva (20%): {formatMoney(data.distribution.reserva)}</p>
          <p>Educación (5%): {formatMoney(data.distribution.educacion)}</p>
          <p className="font-bold">Retorno (75%): {formatMoney(data.distribution.retornoTotal)}</p>
        </div>
      )}
    </div>
  );
};

const Reportes = ({ data }) => {
  const totalDebit = data.entries.reduce((s,e) => s + e.lines.reduce((sl,l) => sl + Number(l.debit||0), 0), 0);
  const totalCredit = data.entries.reduce((s,e) => s + e.lines.reduce((sl,l) => sl + Number(l.credit||0), 0), 0);
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Balance</h2>
      <div className="bg-white p-4 rounded border border-beige space-y-2">
        <p className="text-sm text-darkGold">Cuentas: {data.accounts.length}</p>
        <p className="text-sm text-darkGold">Asientos: {data.entries.length}</p>
        <div className="mt-4 p-3 bg-beige/50 rounded">
          <p className="text-sm font-semibold">Suma Debe: {formatMoney(totalDebit)}</p>
          <p className="text-sm font-semibold">Suma Haber: {formatMoney(totalCredit)}</p>
          <p className={`text-sm font-bold mt-2 ${totalDebit === totalCredit ? 'text-green' : 'text-red'}`}>
            {totalDebit === totalCredit ? '✓ Balanceado' : '✗ Desbalanceado'}
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [data, setData] = useLocalState('molino_florida_data', generateSeed);
  const [tab, setTab] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleTabChange = (newTab) => {
    if (newTab === 'Admin' && !isAuthenticated) {
      setTab('Login');
    } else {
      setTab(newTab);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-flour shadow-xl">
      <header className="p-4 bg-dark text-flour flex justify-between items-center">
        <h1 className="text-lg font-bold font-slab">Molino Florida</h1>
        <span className="text-xs text-gold">{isAuthenticated ? '🔓 Admin' : '👁️ Demo'}</span>
      </header>
      <Tabs current={tab} set={handleTabChange} />
      <main className="pb-20">
        {tab === 'Dashboard' && <Dashboard data={data} />}
        {tab === 'Asientos' && <Asientos data={data} setData={setData} />}
        {tab === 'Moliendas' && <Moliendas data={data} setData={setData} />}
        {tab === 'Socios' && <Socios data={data} setData={setData} />}
        {tab === 'Empleados' && <Empleados data={data} />}
        {tab === 'Distribución' && <Distribucion data={data} setData={setData} />}
        {tab === 'Reportes' && <Reportes data={data} />}
        {tab === 'Login' && !isAuthenticated && (
          <Login onLogin={() => { setIsAuthenticated(true); setTab('Admin'); }} />
        )}
        {tab === 'Admin' && isAuthenticated && <Admin data={data} setData={setData} />}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
