import fs from 'fs';

// Dati CSV
const csvData = [
  {cognome: 'DI DONATO', nome: 'ANDREA', scadenza: '2027-07-29', ultima: '2025-07-29'},
  {cognome: 'BARTESELLI', nome: 'EDOARDO', scadenza: '2030-10-15', ultima: '2025-10-16'},
  {cognome: 'BASILI', nome: 'TEO', scadenza: '2027-11-25', ultima: '2025-11-26'},
  {cognome: 'BATALONI', nome: 'LORENZO', scadenza: '2028-07-12', ultima: '2023-07-12'},
  {cognome: 'BERTELLI', nome: 'FILIPPO', scadenza: '2028-01-27', ultima: '2026-01-28'},
  {cognome: 'BETTINI', nome: 'GABRIELE', scadenza: '2030-09-10', ultima: '2025-09-10'},
  {cognome: 'BORDONARO', nome: 'LORENZO', scadenza: '2029-11-20', ultima: '2024-11-20'},
  {cognome: 'BORELLI', nome: 'ROSITA', scadenza: '2028-07-19', ultima: '2023-07-19'},
  {cognome: 'BRONTE', nome: 'FEDERICO', scadenza: '2027-07-29', ultima: '2025-07-30'},
  {cognome: 'CAMPI', nome: 'MARINA', scadenza: '2028-07-19', ultima: '2023-07-19'}
];

const data = JSON.parse(fs.readFileSync('server/data/store.json', 'utf-8'));

function normalizzaStringa(s) {
  return s.trim().toLowerCase();
}

let matched = 0;
let notFound = [];

csvData.forEach(record => {
  const employee = data.employees.find(e => {
    const nomeMatch = normalizzaStringa(e.nome) === normalizzaStringa(record.nome);
    const cognomeMatch = normalizzaStringa(e.cognome) === normalizzaStringa(record.cognome);
    return nomeMatch && cognomeMatch;
  });

  if (employee) {
    employee.visite_mediche = employee.visite_mediche || [];
    
    // Calcola periodicità (differenza in anni tra ultima e prossima)
    const ultima = new Date(record.ultima);
    const prossima = new Date(record.scadenza);
    const periodicita_mesi = Math.round((prossima - ultima) / (1000 * 60 * 60 * 24 * 30.44));

    employee.visite_mediche.push({
      tipo: 'Idoneità Medica',
      data_ultima: record.ultima,
      data_prossima: record.scadenza,
      periodicita_mesi: periodicita_mesi || 12,
      esito: 'Normal',
      medico: 'Non specificato',
      struttura: 'Non specificato',
      note: 'Importato da CSV'
    });

    matched++;
    console.log('✅ ' + employee.nome + ' ' + employee.cognome + ' → Scadenza: ' + record.scadenza);
  } else {
    notFound.push(record.nome + ' ' + record.cognome);
  }
});

if (notFound.length > 0) {
  console.log('\n⚠️  Non trovati: ' + notFound.join(', '));
}

console.log('\n✅ Matched: ' + matched + ' / ' + csvData.length);

fs.writeFileSync('server/data/store.json', JSON.stringify(data, null, 2));
console.log('💾 Store salvato');
