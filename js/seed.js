const generateSeed = () => {
  const accounts = [];
  const actives = ['Caja','Banco','Deudores por ventas','Stock de trigo','Producción en proceso','Stock de harinas','Stock de subproductos','Stock de raciones','Molino y cilindros','Camión de reparto','Anticipos de retorno a socios'];
  const passives = ['Proveedores de trigo','Capital social','Reserva legal'];
  const results = ['Ventas de harinas','Ventas de raciones','Energía eléctrica','Servicio de carga y descarga','Fletes','Sueldos y jornales'];
  
  actives.forEach((n,i) => accounts.push({id:`A${i+1}`, name:n, type:'Activo'}));
  passives.forEach((n,i) => accounts.push({id:`P${i+1}`, name:n, type:'Pasivo/Patrimonio'}));
  results.forEach((n,i) => accounts.push({id:`R${i+1}`, name:n, type:'Resultado'}));
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

  const clients = Array.from({length: 70}, (_, i) => ({
    id: `C${i+1}`, 
    name: i % 3 === 0 ? `Panadería El Trigo ${i+1}` : i % 3 === 1 ? `Almacén Rural ${i+1}` : `Escuela N° ${i+1}`
  }));

  const partners = Array.from({length: 15}, (_, i) => ({
    id: `S${i+1}`, 
    name: `Socio ${i+1}`, 
    dayHours: 144, 
    nightHours: i === 0 ? 40 : 0, 
    advances: 0
  }));

  return { 
    accounts, products, clients, partners, entries: [], millings: [], 
    settings: { wheatPrice: 1140, energyCost: 85, nightSurcharge: 1.2, hourValue: 25000 } 
  };
};
