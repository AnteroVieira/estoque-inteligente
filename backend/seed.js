const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function seed() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Limpa dados antigos
  await db.exec('DELETE FROM stock_movements; DELETE FROM products;');

  // Insere produtos de teste
  await db.run("INSERT INTO products (id, name, current_stock, min_stock, lead_time_days) VALUES (1, 'Notebook Dell XPS', 5, 10, 7)");
  await db.run("INSERT INTO products (id, name, current_stock, min_stock, lead_time_days) VALUES (2, 'Mouse Sem Fio Logi', 45, 15, 5)");
  await db.run("INSERT INTO products (id, name, current_stock, min_stock, lead_time_days) VALUES (3, 'Teclado Mecânico RGB', 12, 10, 7)");

  // Simula saídas (vendas) nos últimos 30 dias
  for (let i = 0; i < 20; i++) {
    await db.run("INSERT INTO stock_movements (product_id, type, quantity) VALUES (1, 'OUT', 2)");
    await db.run("INSERT INTO stock_movements (product_id, type, quantity) VALUES (2, 'OUT', 1)");
    await db.run("INSERT INTO stock_movements (product_id, type, quantity) VALUES (3, 'OUT', 1)");
  }

  console.log('Dados fictícios gerados com sucesso!');
}

seed();