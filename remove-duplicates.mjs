import fs from 'fs';

const data = JSON.parse(fs.readFileSync('server/data/store.json', 'utf-8'));

// Rimuovi i doppioni
let removed = 0;
data.employees.forEach(emp => {
  if (emp.visite_mediche && emp.visite_mediche.length > 1) {
    const seen = [];
    const unique = [];
    
    emp.visite_mediche.forEach(visita => {
      const str = JSON.stringify(visita);
      if (!seen.includes(str)) {
        seen.push(str);
        unique.push(visita);
      } else {
        removed++;
      }
    });
    
    if (unique.length < emp.visite_mediche.length) {
      console.log('✅ ' + emp.nome + ' ' + emp.cognome + ': ' + emp.visite_mediche.length + ' → ' + unique.length);
    }
    emp.visite_mediche = unique;
  }
});

console.log('\n✅ Rimossi ' + removed + ' doppioni in totale');
console.log('💾 Salvataggio...');

fs.writeFileSync('server/data/store.json', JSON.stringify(data, null, 2));
console.log('✅ Store salvato');
