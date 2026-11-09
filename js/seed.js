const generateSeed = () => {
  const accounts = [];
  const actives = ['Caja','Banco','Deudores por ventas','Stock de trigo','Producción en proceso','Stock de harinas','Stock de subproductos','Stock de raciones','Molino y cilindros','Camión de reparto','Anticipos de retorno a socios','IVA crédito fiscal'];
  const passives = ['Proveedores de trigo','Capital social','Reserva legal','Fondo de educación cooperativa','IVA débito fiscal','Sueldos a pagar'];
  const results = ['Ventas de harinas','Ventas de raciones','Ventas de subproductos','Energía eléctrica','Servicio de carga y descarga','Fletes','Sueldos y jornales','Gastos de administración','Depreciaciones'];
  
  actives.forEach((n,i) => accounts.push({id:`A${String(i+1).padStart(3,'0')}`, name:n, type:'Activo'}));
  passives.forEach((n,i) => accounts.push({id:`P${String(i+1).padStart(3,'0')}`, name:n, type:'Pasivo/Patrimonio'}));
  results.forEach((n,i) => accounts.push({id:`R${String(i+1).padStart(3,'0')}`, name:n, type:'Resultado'}));
  while(accounts.length < 65) accounts.push({id:`X${accounts.length}`, name:`Cuenta Auxiliar ${accounts.length}`, type:'Activo'});

  const products = [
    {id:'P000', name:'Harina 000', yield:0.52, price:2800},
    {id:'P0000', name:'Harina 0000', yield:0.14, price:3400},
    {id:'P00', name:'Harina 00', yield:0.03, price:2600},
    {id:'P0', name:'Harina 0', yield:0.03, price:2200},
    {id:'PINT', name:'Harina Integral', yield:0.02, price:3000},
    {id:'PSAL', name:'Salvado', yield:0.20, price:900},
    {id:'PGER', name:'Germen', yield:0.02, price:4500},
    {id:'PMER', name:'Merma', yield:0.04, price:0}
  ];

  // Otros productos (costo directo, sin costeo conjunto)
  const otherProducts = [
    {id:'OP01', name:'Harina de maíz'}, {id:'OP02', name:'Polenta'}, {id:'OP03', name:'Gofio'},
    {id:'OP04', name:'Avena'}, {id:'OP05', name:'Maíz'}, {id:'OP06', name:'Ración vacas lecheras'},
    {id:'OP07', name:'Ración equinos'}, {id:'OP08', name:'Ración ovinos'}, {id:'OP09', name:'Chicharrón'},
    {id:'OP10', name:'Grasa'}, {id:'OP11', name:'Margarina'}
  ];

  const clients = Array.from({length: 70}, (_, i) => ({
    id: `C${String(i+1).padStart(3,'0')}`, 
    name: i % 4 === 0 ? `Panadería El Trigo ${i+1}` : i % 4 === 1 ? `Almacén Rural ${i+1}` : i % 4 === 2 ? `Productor Lechero ${i+1}` : `Escuela N° ${i+1}`
  }));

  // 33 Socios con control de horas (184 base + 24 extra)
  const partners = Array.from({length: 33}, (_, i) => {
    const baseHours = 184;
    const extra = i < 5 ? 24 : 0; 
    const nightHours = i % 3 === 0 ? 40 : i % 3 === 1 ? 20 : 0;
    const dayHours = baseHours + extra - nightHours;
    return {
      id: `S${String(i+1).padStart(3,'0')}`, name: `Socio ${i+1}`,
      dayHours, nightHours, advances: 0, isPartner: true,
      monthlyLimit: baseHours, extraLimit: extra, extraApproved: i < 5
    };
  });

  const employees = Array.from({length: 12}, (_, i) => ({
    id: `E${String(i+1).padStart(3,'0')}`, name: `Empleado ${i+1}`,
    monthlySalary: 4500000, isPartner: false
  }));

  // Generador de datos históricos (7 meses, ~260 asientos, ~90 moliendas)
  const entries = [];
  const millings = [];
  const closedMonths = [];
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 7, 1);
  let entryCounter = 1, millingCounter = 1;

  for (let m = 0; m < 7; m++) {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + m, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    // ~13 moliendas por mes
    for (let ml = 0; ml < 13; ml++) {
      const day = Math.min(1 + Math.floor((daysInMonth - 1) * ml / 13), daysInMonth);
      const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const kgIn = 12000;
      const totalCost = (kgIn * 1140) + (kgIn * 85);
      
      const productsOut = products.map((p, idx) => {
        let kgs = Math.round(kgIn * p.yield);
        if (idx === products.length - 1) kgs = kgIn - products.slice(0, idx).reduce((s, x) => s + Math.round(kgIn * x.yield), 0);
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

      millings.push({
        id: `M${String(millingCounter++).padStart(3, '0')}`, date,
        shift: ml % 3 === 0 ? 'Mañana' : ml % 3 === 1 ? 'Tarde' : 'Noche',
        kgIn, totalCost, productsOut
      });
      entries.push({
        id: `E${String(entryCounter++).padStart(3, '0')}`, date, description: `Producción molienda`,
        lines: [{account:'A005', debit:totalCost, credit:0}, {account:'A004', debit:0, credit:kgIn*1140}, {account:'R004', debit:0, credit:kgIn*85}],
        confirmed: true
      });
    }
    if (m < 6) closedMonths.push(monthKey);
  }

  return {
    accounts, products, otherProducts, clients, partners, employees,
    entries, millings, closedMonths,
    settings: { wheatPrice: 1140, energyCost: 85, nightSurcharge: 1.2, hourValue: 25000, shiftQuota: 12000 }
  };
};
