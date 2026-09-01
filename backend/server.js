const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Inicializa o banco de dados SQLite e cria as tabelas
async function initDb() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current_stock INTEGER NOT NULL,
      min_stock INTEGER NOT NULL,
      lead_time_days INTEGER DEFAULT 7
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      type TEXT CHECK(type IN ('IN', 'OUT')),
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  console.log('Banco de dados inicializado com sucesso.');
}

initDb();

// Rota 1: Listar produtos
app.get('/api/products', async (req, res) => {
  const products = await db.all('SELECT * FROM products');
  res.json(products);
});

// Rota 2: Cadastrar novo produto
app.post('/api/products', async (req, res) => {
  const { name, current_stock, min_stock, lead_time_days } = req.body;
  const result = await db.run(
    'INSERT INTO products (name, current_stock, min_stock, lead_time_days) VALUES (?, ?, ?, ?)',
    [name, current_stock, min_stock, lead_time_days || 7]
  );
  res.json({ id: result.lastID, name, current_stock, min_stock, lead_time_days });
});

// Rota 3: Registrar entrada ou saída de estoque
app.post('/api/movements', async (req, res) => {
  const { product_id, type, quantity } = req.body;

  await db.run(
    'INSERT INTO stock_movements (product_id, type, quantity) VALUES (?, ?, ?)',
    [product_id, type, quantity]
  );

  const adjustment = type === 'IN' ? quantity : -quantity;
  await db.run(
    'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
    [adjustment, product_id]
  );

  res.json({ message: 'Movimentação registrada com sucesso.' });
});

// Rota 4: Algoritmo de Previsão de Falta de Estoque (Ajustado para novos produtos)
app.get('/api/predictions', async (req, res) => {
  const products = await db.all('SELECT * FROM products');
  const predictions = [];

  for (const product of products) {
    // Busca total de saídas dos últimos 30 dias na tabela de movimentações
    const result = await db.get(
      `SELECT SUM(quantity) as total_out 
       FROM stock_movements 
       WHERE product_id = ? AND type = 'OUT' 
       AND created_at >= datetime('now', '-30 days')`,
      [product.id]
    );

    const totalOut = result?.total_out || 0;
    const calculatedDaily = totalOut / 30;

    // Se houver vendas gravadas, usa o histórico. Se for produto novo, usa a estimativa (min_stock / 7)
    const dailyConsumption = calculatedDaily > 0 ? calculatedDaily : (product.min_stock / 7 || 1);
    
    const daysRemaining = Math.floor(product.current_stock / dailyConsumption);
    const isCritical = daysRemaining <= product.lead_time_days;

    predictions.push({
      productId: product.id,
      name: product.name,
      currentStock: product.current_stock,
      dailyConsumption: dailyConsumption.toFixed(2),
      daysRemaining,
      status: isCritical ? 'CRÍTICO' : 'OK',
      suggestedReorderQuantity: isCritical ? Math.ceil(dailyConsumption * 30) : 0
    });
  }

  res.json(predictions);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));