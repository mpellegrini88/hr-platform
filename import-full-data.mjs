import fs from 'fs';

// CSV completo con tutti i dipendenti
const csvData = [
  {cognome: 'DI DONATO', nome: 'ANDREA', dataNascita: '1996-03-20', scadenza: '2027-07-29', ultima: '2025-07-29'},
  {cognome: 'BARTESELLI', nome: 'EDOARDO', dataNascita: '1994-09-19', scadenza: '2030-10-15', ultima: '2025-10-16'},
  {cognome: 'BASILI', nome: 'TEO', dataNascita: '1990-11-12', scadenza: '2027-11-25', ultima: '2025-11-26'},
  {cognome: 'BATALONI', nome: 'LORENZO', dataNascita: '1999-12-16', scadenza: '2028-07-12', ultima: '2023-07-12'},
  {cognome: 'BERTELLI', nome: 'FILIPPO', dataNascita: '1993-12-21', scadenza: '2028-01-27', ultima: '2026-01-28'},
  {cognome: 'BETTINI', nome: 'GABRIELE', dataNascita: '1999-08-20', scadenza: '2030-09-10', ultima: '2025-09-10'},
  {cognome: 'BORDONARO', nome: 'LORENZO', dataNascita: '2000-01-24', scadenza: '2029-11-20', ultima: '2024-11-20'},
  {cognome: 'BORELLI', nome: 'ROSITA', dataNascita: '1979-11-30', scadenza: '2028-07-19', ultima: '2023-07-19'},
  {cognome: 'BRONTE', nome: 'FEDERICO', dataNascita: '1993-01-06', scadenza: '2027-07-29', ultima: '2025-07-30'},
  {cognome: 'CAMPI', nome: 'MARINA', dataNascita: '1993-12-20', scadenza: '2028-07-19', ultima: '2023-07-19'},
  {cognome: 'CANCIANI', nome: 'ELENA', dataNascita: '1998-01-05', scadenza: '2027-11-09', ultima: '2025-11-10'},
  {cognome: 'CECCHINI', nome: 'ANSANO', dataNascita: '1969-05-30', scadenza: null, ultima: null},
  {cognome: 'CIANCIO', nome: 'FEDERICA', dataNascita: '1998-11-18', scadenza: '2030-12-03', ultima: '2025-12-04'},
  {cognome: 'CIARDELLI', nome: 'MATTEO', dataNascita: '1999-10-20', scadenza: '2030-09-30', ultima: '2025-10-01'},
  {cognome: 'CIMA', nome: 'Matteo', dataNascita: '1999-07-23', scadenza: '2027-11-11', ultima: '2025-11-12'},
  {cognome: 'CIOFFI', nome: 'DARIO', dataNascita: '1983-01-14', scadenza: '2027-04-09', ultima: '2025-04-09'},
  {cognome: 'COLZI', nome: 'MARCO', dataNascita: '1994-02-18', scadenza: '2030-03-26', ultima: '2025-03-26'},
  {cognome: 'CORBETTA', nome: 'SIMONE', dataNascita: '1983-02-24', scadenza: '2029-11-07', ultima: '2024-11-07'},
  {cognome: 'CORONA', nome: 'ELISA', dataNascita: '1992-04-27', scadenza: '2030-12-02', ultima: '2025-12-03'},
  {cognome: 'CORSI', nome: 'GABRIELE', dataNascita: '1994-04-16', scadenza: '2028-06-28', ultima: '2023-06-28'},
  {cognome: 'CORTI', nome: 'ELEONORA', dataNascita: '1997-08-28', scadenza: '2030-09-10', ultima: '2025-09-10'},
  {cognome: 'COZZI', nome: 'SARA', dataNascita: '1995-12-23', scadenza: '2029-04-09', ultima: '2024-04-09'},
  {cognome: 'DE LELLIS', nome: 'PAOLO', dataNascita: '1994-03-05', scadenza: '2028-07-19', ultima: '2023-07-19'},
  {cognome: 'DEL BIANCO', nome: 'ALBERTO', dataNascita: '1988-07-29', scadenza: '2030-07-30', ultima: '2025-07-30'},
  {cognome: 'DI MALTA', nome: 'VALERIO', dataNascita: null, scadenza: null, ultima: null},
  {cognome: 'DI RICCO', nome: 'SIMONE', dataNascita: '1991-07-22', scadenza: '2028-07-19', ultima: '2023-07-19'},
  {cognome: 'DORI', nome: 'MARCO LUCA', dataNascita: '1995-01-26', scadenza: '2029-10-23', ultima: '2024-10-23'},
  {cognome: 'DUCCI', nome: 'GABRIELE', dataNascita: '1998-09-07', scadenza: '2027-06-04', ultima: '2025-06-04'},
  {cognome: 'FABBRICA', nome: 'EDOARDO', dataNascita: '1994-08-21', scadenza: '2029-04-09', ultima: '2024-04-09'},
  {cognome: 'FAVA', nome: 'ALESSANDRO', dataNascita: '1994-10-10', scadenza: '2030-01-27', ultima: '2026-01-28'},
  {cognome: 'FERRARI', nome: 'ANDREA', dataNascita: '1997-09-18', scadenza: '2029-04-09', ultima: '2024-04-09'},
  {cognome: 'FERRERO', nome: 'GIACOMO', dataNascita: '1998-06-15', scadenza: '2029-04-23', ultima: '2024-04-23'},
  {cognome: 'FILIPPETTO', nome: 'ILARIA', dataNascita: '1996-07-26', scadenza: '2028-07-19', ultima: '2023-07-19'},
  {cognome: 'FINI', nome: 'LUCA', dataNascita: '1966-11-05', scadenza: null, ultima: null},
  {cognome: 'FLORES D\'ARCAIS', nome: 'STEFANO', dataNascita: '1998-12-12', scadenza: '2029-04-23', ultima: '2024-04-23'},
  {cognome: 'FREDIANI', nome: 'FERDINANDO', dataNascita: '1994-08-05', scadenza: '2028-07-18', ultima: '2023-07-18'},
  {cognome: 'FREDIANI', nome: 'GIACOMO', dataNascita: '1996-03-06', scadenza: '2029-11-27', ultima: '2024-11-27'},
  {cognome: 'GABURRO', nome: 'ANDREA', dataNascita: '1996-03-01', scadenza: '2029-04-23', ultima: '2024-04-23'},
  {cognome: 'GALLI', nome: 'MARCO', dataNascita: '1995-11-23', scadenza: '2027-07-29', ultima: '2025-07-29'},
  {cognome: 'GIACOMELLI', nome: 'SIMONE', dataNascita: '1985-06-30', scadenza: '2029-11-04', ultima: '2025-11-05'},
  {cognome: 'GUERCINI', nome: 'GLAUCO', dataNascita: '1994-03-25', scadenza: '2028-07-18', ultima: '2023-07-18'},
  {cognome: 'LENTO', nome: 'ALESSANDRO', dataNascita: '1994-11-04', scadenza: '2028-01-14', ultima: '2026-01-14'},
  {cognome: 'LICHERI', nome: 'NICOLA', dataNascita: '1991-12-23', scadenza: '2026-02-11', ultima: '2026-02-10'},
  {cognome: 'LUCA', nome: 'ANTONIO', dataNascita: '1996-08-16', scadenza: '2029-04-09', ultima: '2024-04-09'},
  {cognome: 'LUCIA', nome: 'SIMONE', dataNascita: '1995-10-31', scadenza: '2027-10-15', ultima: '2025-10-14'},
  {cognome: 'MANETTI', nome: 'ALESSANDRO', dataNascita: '1992-10-21', scadenza: '2027-07-29', ultima: '2025-07-29'},
  {cognome: 'MANCINI', nome: 'WILLIAM', dataNascita: '1988-06-01', scadenza: '2028-02-11', ultima: '2026-02-10'},
  {cognome: 'MARESCA', nome: 'FEDERICA', dataNascita: '2000-08-11', scadenza: '2027-04-02', ultima: '2025-04-02'},
  {cognome: 'MELI', nome: 'GIUSEPPE DANIEL', dataNascita: '1997-03-22', scadenza: '2029-02-13', ultima: '2024-02-13'},
  {cognome: 'MONZO', nome: 'MARIO', dataNascita: '1972-02-17', scadenza: null, ultima: null},
  {cognome: 'MORO', nome: 'ALESSIO', dataNascita: '1989-04-21', scadenza: '2028-01-27', ultima: '2026-01-28'},
  {cognome: 'NOBILI', nome: 'ALESSANDRO', dataNascita: '1994-02-14', scadenza: '2028-07-18', ultima: '2023-07-18'},
  {cognome: 'PACINI', nome: 'TOMMASO', dataNascita: '1994-04-19', scadenza: '2026-09-24', ultima: '2025-09-24'},
  {cognome: 'PAOLINO', nome: 'CARMINE', dataNascita: '1994-04-18', scadenza: '2028-01-27', ultima: '2026-01-28'},
  {cognome: 'PELLEGRINI', nome: 'MARCO', dataNascita: '1988-03-30', scadenza: '2029-02-13', ultima: '2024-02-13'},
  {cognome: 'PETRANGELI', nome: 'EUGENIA', dataNascita: '1992-03-18', scadenza: '2027-03-19', ultima: '2025-03-19'},
  {cognome: 'PETRONI', nome: 'IRENE', dataNascita: '1996-05-22', scadenza: '2026-07-19', ultima: '2025-07-29'},
  {cognome: 'POMIATO', nome: 'EMMANUELE', dataNascita: '1987-12-11', scadenza: '2028-01-27', ultima: '2026-02-28'},
  {cognome: 'QUATTRINI', nome: 'PIETRO', dataNascita: '1993-02-03', scadenza: '2027-03-19', ultima: '2026-03-18'},
  {cognome: 'RESCHIGLIAN', nome: 'MATTIA', dataNascita: '1990-09-14', scadenza: '2027-09-01', ultima: '2025-09-01'},
  {cognome: 'RIGAMONTI', nome: 'RICCARDO', dataNascita: '1999-12-08', scadenza: '2028-01-27', ultima: '2026-01-28'},
  {cognome: 'ROMAGNOLI', nome: 'DAVIDE', dataNascita: '1994-07-06', scadenza: '2027-07-29', ultima: '2025-07-29'},
  {cognome: 'ROSELLI', nome: 'GABRIELE', dataNascita: '1999-05-26', scadenza: '2030-12-14', ultima: '2025-12-16'},
  {cognome: 'SADUSHI', nome: 'MARTIN', dataNascita: '2000-02-01', scadenza: '2027-07-02', ultima: '2025-07-02'},
  {cognome: 'SALADINO', nome: 'MICHELE', dataNascita: '1999-01-07', scadenza: '2030-10-21', ultima: '2025-10-22'},
  {cognome: 'SALTI', nome: 'NICOLO\'', dataNascita: '2000-08-23', scadenza: '2029-10-23', ultima: '2024-10-23'},
  {cognome: 'SALUCCI', nome: 'GABRIELE', dataNascita: '1993-04-10', scadenza: '2029-04-09', ultima: '2024-04-09'},
  {cognome: 'SAYARI', nome: 'OMAR', dataNascita: '1999-06-18', scadenza: '2029-04-23', ultima: '2024-04-23'},
  {cognome: 'SCIARRA', nome: 'MATTEO', dataNascita: '2001-01-14', scadenza: '2030-06-17', ultima: '2025-06-17'},
  {cognome: 'SIBILO', nome: 'MARIO', dataNascita: '1994-08-08', scadenza: '2026-12-16', ultima: '2025-12-17'},
  {cognome: 'TABARRANI', nome: 'GABRIELE', dataNascita: '1987-04-03', scadenza: '2028-07-18', ultima: '2023-07-18'},
  {cognome: 'TAGLIAFERRI', nome: 'LORENZO', dataNascita: '1998-03-19', scadenza: '2030-07-29', ultima: '2025-07-29'},
  {cognome: 'TANGANELLI', nome: 'MARCO', dataNascita: '1989-07-11', scadenza: '2027-08-16', ultima: '2025-08-27'},
  {cognome: 'TAPPA', nome: 'RICCARDO', dataNascita: '1994-07-14', scadenza: '2028-02-10', ultima: '2026-02-10'},
  {cognome: 'TINACCI', nome: 'LORENZO', dataNascita: '1992-06-13', scadenza: '2029-02-13', ultima: '2024-02-13'},
  {cognome: 'TOGNARINI', nome: 'LORENZO', dataNascita: '1995-12-05', scadenza: '2028-07-18', ultima: '2023-07-18'},
  {cognome: 'TOMEI', nome: 'CHIARA', dataNascita: '1993-10-18', scadenza: '2027-05-28', ultima: '2025-05-28'},
  {cognome: 'TORRI', nome: 'FEDERICO', dataNascita: '1996-12-09', scadenza: '2029-11-07', ultima: '2024-11-07'},
  {cognome: 'TRASACCO', nome: 'ANDREA', dataNascita: '2000-11-19', scadenza: '2030-09-24', ultima: '2025-09-25'},
  {cognome: 'TROVESI', nome: 'GIULIO', dataNascita: '1998-06-09', scadenza: '2029-02-13', ultima: '2024-02-13'},
  {cognome: 'VANNI', nome: 'PIETRO', dataNascita: '1996-01-15', scadenza: '2030-06-04', ultima: '2025-06-04'},
  {cognome: 'VANNONI', nome: 'SAMUELE', dataNascita: '1998-02-24', scadenza: '2028-01-26', ultima: '2026-01-28'},
  {cognome: 'VIGNI', nome: 'DAVIDE', dataNascita: '1997-10-28', scadenza: '2029-10-23', ultima: '2024-10-23'},
  {cognome: 'WEISS VON TROSTPRUGG', nome: 'JOSCHA FREDERICK', dataNascita: '1986-07-03', scadenza: '2029-04-09', ultima: '2024-04-09'},
  {cognome: 'ZORZATO', nome: 'LUCA', dataNascita: '1997-03-04', scadenza: '2029-04-09', ultima: '2024-04-09'}
];

const data = JSON.parse(fs.readFileSync('server/data/store.json', 'utf-8'));

function normalizzaStringa(s) {
  if (!s) return '';
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
    // Aggiungi data di nascita
    if (record.dataNascita) {
      employee.dataNascita = record.dataNascita;
    }
    
    // Aggiungi visita medica se ha scadenze
    if (record.scadenza && record.ultima) {
      employee.visite_mediche = employee.visite_mediche || [];
      
      // Calcola periodicità
      const ultima = new Date(record.ultima);
      const prossima = new Date(record.scadenza);
      const periodicita_mesi = Math.round((prossima - ultima) / (1000 * 60 * 60 * 24 * 30.44));

      employee.visite_mediche.push({
        tipo: 'Idoneità Medica',
        data_ultima: record.ultima,
        data_prossima: record.scadenza,
        periodicita_mesi: periodicita_mesi || 24,
        esito: 'Normal',
        medico: 'Non specificato',
        struttura: 'Non specificato',
        note: 'Importato da CSV'
      });
    }

    matched++;
    console.log('✅ ' + employee.nome + ' ' + employee.cognome + 
      (record.dataNascita ? ' | DoB: ' + record.dataNascita : '') +
      (record.scadenza ? ' | Scad: ' + record.scadenza : ''));
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
