// Generador pseudoaleatorio determinista con semilla fija
// Garantiza que los datos de ejemplo sean siempre idénticos
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

const generateSeed = () => {
  const rand = seededRandom(261105); // Semilla fija - cambiar para generar datos distintos

  // --- PLAN DE CUENTAS (65 cuentas) ---
  const accounts = [];
  const actives = [
    'Caja', 'Banco', 'Deudores por ventas', 'Stock de trigo',
    'Producción en proceso', 'Stock de harinas', 'Stock de subproductos',
    'Stock de raciones', 'Molino y cilindros', 'Camión de reparto',
    'Anticipos de retorno a socios', 'IVA crédito fiscal', 'Seguro pagado por adelantado'
  ];
  const passives = [
    'Proveedores de trigo', 'Capital social', 'Reserva legal',
    'Fondo de educación cooperativa', 'IVA débito fiscal', 'Sueldos a pagar'
  ];
  const results = [
    'Ventas de harinas', 'Ventas de raciones', 'Ventas de subproductos',
    'Energía eléctrica', 'Servicio de carga y descarga', 'Fletes',
    'Sueldos y jornales', 'Gastos de administración', 'Depreciaciones'
  ];
  actives.forEach((n, i) => accounts.push({ id: `A${String(i + 1).padStart(3, '0')}`, name: n, type: 'Activo' }));
  passives.forEach((n, i) => accounts.push({ id: `P${String(i + 1).padStart(3, '0')}`, name: n, type: 'Pasivo/Patrimonio' }));
  results.forEach((n, i) => accounts.push({ id: `R${String(i + 1).padStart(3, '0')}`, name: n, type: 'Resultado' }));
  while (accounts.length < 65) {
    accounts.push({ id: `X${accounts.length}`, name: `Cuenta Auxiliar ${accounts.length}`, type: 'Activo' });
  }

  // --- PRODUCTOS DE MOLIENDA (costeo conjunto) ---
  const products = [
    { id: 'P000', name: 'Harina 000', yield: 0.52, price: 2800 },
    { id: 'P0000', name: 'Harina 0000', yield: 0.14, price: 3400 },
    { id: 'P00', name: 'Harina 00', yield: 0.03, price: 2600 },
    { id: 'P0', name: 'Harina 0', yield: 0.03, price: 2200 },
    { id: 'PINT', name: 'Harina Integral', yield: 0.02, price: 3000 },
    { id: 'PSAL', name: 'Salvado', yield: 0.20, price: 900 },
    { id: 'PGER', name: 'Germen', yield: 0.02, price: 4500 },
    { id: 'PMER', name: 'Merma', yield: 0.04, price: 0 }
  ];

  // --- OTROS PRODUCTOS (costo directo, sin costeo conjunto) ---
  const otherProducts = [
    { id: 'OP01', name: 'Harina de maíz' },
    { id: 'OP02', name: 'Polenta' },
    { id: 'OP03', name: 'Gofio' },
    { id: 'OP04', name: 'Avena' },
    { id: 'OP05', name: 'Maíz' },
    { id: 'OP06', name: 'Ración vacas lecheras' },
    { id: 'OP07', name: 'Ración equinos' },
    { id: 'OP08', name: 'Ración ovinos' },
    { id: 'OP09', name: 'Chicharrón' },
    { id: 'OP10', name: 'Grasa' },
    { id: 'OP11', name: 'Margarina' }
  ];

  // --- CLIENTES (70) ---
  const clientTypes = ['Panadería', 'Almacén', 'Productor Lechero', 'Escuela Rural'];
  const clientNames = ['El Trigo', 'La Espiga', 'Rural', 'Campestre', 'Del Campo', 'Harinero', 'Molino', 'Trigal'];
  const clients = Array.from({ length: 70 }, (_, i) => ({
    id: `C${String(i + 1).padStart(3, '0')}`,
    type: clientTypes[i % 4],
    name: `${clientTypes[i % 4]} ${clientNames[i % 8]} ${String(i + 1).padStart(2, '0')}`
  }));

  // --- SOCIOS (33) con control de horas ---
  // Cada socio: 184h base + hasta 24h extra (aprobadas por consejo)
  // Distribución de horas nocturnas: ~1/3 con 40h, ~1/3 con 20h, ~1/3 sin nocturnas
  const partners = Array.from({ length: 33 }, (_, i) => {
    const baseHours = 184;
    const extraHours = i < 5 ? 24 : 0; // Primeros 5 socios tienen horas extra aprobadas
    const nightPattern = i % 3;
    const nightHours = nightPattern === 0 ? 40 : nightPattern === 1 ? 20 : 0;
    const dayHours = baseHours + extraHours - nightHours;
    
    return {
      id: `S${String(i + 1).padStart(3, '0')}`,
      name: `Socio ${String(i + 1).padStart(2, '0')}`,
      dayHours,
      nightHours,
      monthlyLimit: baseHours,
      extraLimit: extraHours,
      extraApproved: i < 5,
      advances: 0,
      isPartner: true
    };
  });

  // --- EMPLEADOS NO SOCIOS (12) ---
  // Reciben sueldo fijo, no participan del excedente
  const employeeRoles = ['Operario de molino', 'Chofer de reparto', 'Administrativo', 'Encargado de embolsado'];
  const employees = Array.from({ length: 12 }, (_, i) => ({
    id: `E${String(i + 1).padStart(3, '0')}`,
    name: `Empleado ${String(i + 1).padStart(2, '0')}`,
    role: employeeRoles[i % 4],
    monthlySalary: 4500000 + Math.floor(rand() * 500000), // Entre $U 45.000 y $U 50.000
    isPartner: false
  }));

  // --- GENERADOR DE DATOS HISTÓRICOS ---
  // 7 meses de actividad: ~90 moliendas, ~260 asientos, 6 meses cerrados
  const entries = [];
  const millings = [];
  const closedMonths = [];
  
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 7, 1);
  
  let entryCounter = 1;
  let millingCounter = 1;

  for (let m = 0; m < 7; m++) {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + m, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    // ~13 moliendas por mes (91 en 7 meses)
    const millingsThisMonth = 13;
    for (let ml = 0; ml < millingsThisMonth; ml++) {
      const day = Math.min(1 + Math.floor((daysInMonth - 1) * ml / millingsThisMonth), daysInMonth);
      const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const shift = ml % 3 === 0 ? 'Mañana' : ml % 3 === 1 ? 'Tarde' : 'Noche';
      
      const kgIn = 12000;
      const wheatCost = kgIn * 1140; // 13.680.000 centésimos
      const energyCost = kgIn * 85;  // 1.020.000 centésimos
      const totalCost = wheatCost + energyCost; // 14.700.000 centésimos

      // Calcular kilos de salida por producto
      const productsOut = products.map((p, idx) => {
        let kgs = Math.round(kgIn * p.yield);
        // Ajuste del último producto para que la suma sea exacta
        if (idx === products.length - 1) {
          kgs = kgIn - products.slice(0, idx).reduce((s, x) => s + Math.round(kgIn * x.yield), 0);
        }
        return { ...p, kgs, val: kgs * p.price };
      });

      // Asignación de costos por valor de venta relativo
      const sumValue = productsOut.reduce((s, p) => s + p.val, 0);
      let assignedCost = 0;
      const maxValProd = productsOut.reduce((max, p) => p.val > max.val ? p : max, productsOut[0]);

      productsOut.forEach(p => {
        if (p.id === 'PMER') { p.cost = 0; p.costPerKg = 0; return; }
        if (p === maxValProd) {
          p.cost = totalCost - assignedCost; // El mayor valor absorbe el redondeo
        } else {
          p.cost = Math.floor((totalCost * p.val) / sumValue);
          assignedCost += p.cost;
        }
        p.costPerKg = p.kgs > 0 ? Math.floor((p.cost / p.kgs) * 100) / 100 : 0;
      });

      const milling = {
        id: `M${String(millingCounter++).padStart(3, '0')}`,
        date,
        shift,
        kgIn,
        wheatCost,
        energyCost,
        totalCost,
        productsOut
      };
      millings.push(milling);

      // Asiento contable de producción terminada por cada molienda
      entries.push({
        id: `E${String(entryCounter++).padStart(3, '0')}`,
        date,
        description: `Producción molienda ${milling.id} - Turno ${shift}`,
        lines: [
          { account: 'A005', debit: totalCost, credit: 0, memo: 'Producción en proceso' },
          { account: 'A004', debit: 0, credit: wheatCost, memo: 'Stock de trigo' },
          { account: 'R004', debit: 0, credit: energyCost, memo: 'Energía eléctrica' }
        ],
        confirmed: true
      });
    }

    // Asientos de ventas (~8 por mes)
    for (let v = 0; v < 8; v++) {
      const day = Math.min(1 + Math.floor((daysInMonth - 1) * v / 8), daysInMonth);
      const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const amount = 5000000 + Math.floor(rand() * 10000000); // Entre $U 50.000 y $U 150.000
      entries.push({
        id: `E${String(entryCounter++).padStart(3, '0')}`,
        date,
        description: `Venta de harinas - ${clients[v % clients.length].name}`,
        lines: [
          { account: 'A002', debit: amount, credit: 0, memo: 'Banco' },
          { account: 'R001', debit: 0, credit: amount, memo: 'Ventas de harinas' }
        ],
        confirmed: true
      });
    }

    // Asientos de compra de trigo (~5 por mes)
    for (let c = 0; c < 5; c++) {
      const day = Math.min(1 + Math.floor((daysInMonth - 1) * c / 5), daysInMonth);
      const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const amount = 15000000 + Math.floor(rand() * 5000000); // Entre $U 150.000 y $U 200.000
      entries.push({
        id: `E${String(entryCounter++).padStart(3, '0')}`,
        date,
        description: 'Compra de trigo a proveedor',
        lines: [
          { account: 'A004', debit: amount, credit: 0, memo: 'Stock de trigo' },
          { account: 'P001', debit: 0, credit: amount, memo: 'Proveedores de trigo' }
        ],
        confirmed: true
      });
    }

    // Asiento de anticipos a socios (día 8 del mes, excepto el primer mes)
    if (m > 0) {
      const date = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-08`;
      let totalAdvances = 0;
      partners.forEach(p => {
        const advance = (p.dayHours * 25000) + (p.nightHours * 25000 * 1.2);
        totalAdvances += Math.round(advance);
      });
      entries.push({
        id: `E${String(entryCounter++).padStart(3, '0')}`,
        date,
        description: 'Anticipos de retorno a socios - mes anterior',
        lines: [
          { account: 'A011', debit: totalAdvances, credit: 0, memo: 'Anticipos de retorno a socios' },
          { account: 'A002', debit: 0, credit: totalAdvances, memo: 'Banco' }
        ],
        confirmed: true
      });
    }

    // Asiento de sueldos empleados (1 por mes, día 28)
    const totalSalaries = employees.reduce((s, e) => s + e.monthlySalary, 0);
    entries.push({
      id: `E${String(entryCounter++).padStart(3, '0')}`,
      date: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-28`,
      description: 'Sueldos y jornales del mes',
      lines: [
        { account: 'R007', debit: totalSalaries, credit: 0, memo: 'Sueldos y jornales' },
        { account: 'P006', debit: 0, credit: totalSalaries, memo: 'Sueldos a pagar' }
      ],
      confirmed: true
    });

    // Asiento de servicio de carga y descarga (1 por mes)
    const cargoCost = 2500000 + Math.floor(rand() * 1000000);
    entries.push({
      id: `E${String(entryCounter++).padStart(3, '0')}`,
      date: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-15`,
      description: 'Servicio de carga y descarga - Cooperativa',
      lines: [
        { account: 'R005', debit: cargoCost, credit: 0, memo: 'Servicio de carga y descarga' },
        { account: 'P001', debit: 0, credit: cargoCost, memo: 'Proveedores' }
      ],
      confirmed: true
    });

    // Marcar los primeros 6 meses como cerrados
    if (m < 6) closedMonths.push(monthKey);
  }

  // Asiento de apertura del mes actual (mes 7)
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  entries.push({
    id: `E${String(entryCounter++).padStart(3, '0')}`,
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
    description: 'Asiento de apertura del ejercicio',
    lines: [
      { account: 'A001', debit: 25000000, credit: 0, memo: 'Caja' },
      { account: 'A002', debit: 180000000, credit: 0, memo: 'Banco' },
      { account: 'P002', debit: 0, credit: 205000000, memo: 'Capital social' }
    ],
    confirmed: true
  });

  return {
    accounts,
    products,
    otherProducts,
    clients,
    partners,
    employees,
    entries,
    millings,
    closedMonths,
    currentMonth: currentMonthKey,
    settings: {
      wheatPrice: 1140,        // $U 11,40/kg en centésimos
      energyCost: 85,          // $U 0,85/kg en centésimos
      nightSurcharge: 1.2,     // Recargo nocturno
      hourValue: 25000,        // $U 250,00/hora en centésimos
      shiftQuota: 12000        // Cupo por turno en kg
    }
  };
};
