const { useState, useEffect } = React;

const useLocalState = (key, init) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : init();
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  return [state, setState];
};

const Tabs = ({ current, set }) => {
  const tabs = ['Dashboard', 'Asientos', 'Moliendas', 'Socios', 'Reportes'];
  return (
    <div className="flex overflow-x-auto bg-white border-b border-beige sticky top-0 z-10">
      {tabs.map(t => (
        <button key={t} onClick={() => set(t)} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${current === t ? 'text-gold border-b-2 border-gold' : 'text-darkGold'}`}>{t}</button>
      ))}
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-beige"><p className="text-xs text-darkGold">Socios</p><p className="text-2xl font-bold">{data.partners.length}</p></div>
    </div>
  </div>
);

const Asientos = ({ data, setData }) => {
  const [lines, setLines] = useState([{account:'', debit:0, credit:0}]);
  const addLine = () => setLines([...lines, {account:'', debit:0, credit:0}]);
  
  const saveEntry = () => {
    const totalD = lines.reduce((s,l) => s + Number(l.debit||0), 0);
    const totalC = lines.reduce((s,l) => s + Number(l.credit||0), 0);
    if(totalD !== totalC || totalD === 0) return alert(`Desbalanceado. Debe: ${totalD}, Haber: ${totalC}`);
    
    const newEntry = { id: `E${data.entries.length + 1}`, date: new Date().toISOString().split('T')[0], lines: [...lines], confirmed: true };
    setData({ ...data, entries: [...data.entries, newEntry] });
    setLines([{account:'', debit:0, credit:0}]);
  };

  const revertEntry = (entryId) => {
    const entry = data.entries.find(e => e.id === entryId);
    if(!entry) return;
    const contraLines = entry.lines.map(l => ({account: l.account, debit: l.credit, credit: l.debit}));
    const contraEntry = { id: `E${data.entries.length + 1}`, date: new Date().toISOString().split('T')[0], lines: contraLines, confirmed: true, revertedFrom: entryId };
    setData({ ...data, entries: [...data.entries, contraEntry] });
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
        <button onClick={addLine} className="px-4 py-2 bg-beige text-dark text-sm rounded font-semibold">+ Línea</button>
        <button onClick={saveEntry} className="px-4 py-2 bg-gold text-white text-sm rounded font-semibold">Confirmar</button>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-bold">Historial</h3>
        {data.entries.map(e => (
          <div key={e.id} className="bg-white p-3 rounded border border-beige text-sm">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{e.id} - {e.date}</p>
              {!e.revertedFrom && <button onClick={() => revertEntry(e.id)} className="text-xs text-red underline">Revertir</button>}
            </div>
            {e.lines.map((l,i) => <p key={i} className="text-xs text-darkGold"> {l.account} | D: {l.debit} | H: {l.credit}</p>)}
          </div>
        ))}
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
    let maxValProd = null;
    
    data.products.forEach(p => {
      const kgs = Math.round(kg * p.yield);
      const val = kgs * p.price;
      sumValue += val;
      productsOut.push({ ...p, kgs, val });
      if(p.price > 0 && (!maxValProd || val > maxValProd.val)) maxValProd = productsOut[productsOut.length - 1];
    });

    let assignedCost = 0;
    productsOut.forEach(p => {
      if(p.id === 'PMER') { p.cost = 0; p.costPerKg = 0; return; }
      if(p === maxValProd) {
        p.cost = totalCost - assignedCost;
      } else {
        p.cost = Math.floor((totalCost * p.val) / sumValue);
        assignedCost += p.cost;
      }
      p.costPerKg = p.kgs > 0 ? Math.floor(p.cost / p.kgs * 100) / 100 : 0;
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
      <div className="space-y-4">
        {data.millings.slice().reverse().map(m => (
          <div key={m.id} className="bg-white p-4 rounded border border-beige">
            <h3 className="font-bold text-gold">{m.id} | {m.date}</h3>
            <p className="text-sm">Ingreso: {m.kgIn} kg | Costo Total: {formatMoney(m.totalCost)}</p>
            <table className="w-full mt-2 text-xs">
              <thead><tr className="text-left text-darkGold border-b"><th>Producto</th><th>Kg</th><th>Costo</th><th>$/Kg</th></tr></thead>
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
      <h2 className="text-xl font-bold">Anticipos</h2>
      <button onClick={payAdvances} className="w-full py-2 bg-gold text-white rounded font-semibold">Pagar Anticipos</button>
      <div className="space-y-2">
        {data.partners.map(p => (
          <div key={p.id} className="bg-white p-3 rounded border border-beige flex justify-between items-center text-sm">
            <div><p className="font-semibold">{p.name}</p><p className="text-xs text-darkGold">Día: {p.dayHours}h | Noche: {p.nightHours}h</p></div>
            <p className="font-bold text-green">{formatMoney(p.advances)}</p>
          </div>
        ))}
      </div>
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
  const resetData = () => { if(confirm('¿Reiniciar?')) { localStorage.removeItem('molino_florida_data'); location.reload(); } };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-flour shadow-xl">
      <header className="p-4 bg-dark text-flour flex justify-between items-center">
        <h1 className="text-lg font-bold font-slab">Molino Florida</h1>
        <button onClick={resetData} className="text-xs bg-red px-2 py-1 rounded">Reset</button>
      </header>
      <Tabs current={tab} set={setTab} />
      <main className="pb-20">
        {tab === 'Dashboard' && <Dashboard data={data} />}
        {tab === 'Asientos' && <Asientos data={data} setData={setData} />}
        {tab === 'Moliendas' && <Moliendas data={data} setData={setData} />}
        {tab === 'Socios' && <Socios data={data} setData={setData} />}
        {tab === 'Reportes' && <Reportes data={data} />}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
