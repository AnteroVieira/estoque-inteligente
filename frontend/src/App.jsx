import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "https://estoque-inteligente-xmd0.onrender.com/api";

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('5'); // Valor padrão para min_stock

  const fetchPredictions = async () => {
    try {
      // Tenta buscar as previsões prontas da API
      const res = await axios.get(`${API_BASE}/predictions`).catch(() => axios.get(`${API_BASE}/products`));
      if (Array.isArray(res.data)) {
        setPredictions(res.data);
      }
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Payload correspondente ao schema do SQLite no server.js
    const payload = {
      name: name,
      current_stock: Number(currentStock),
      min_stock: Number(minStock) || 5,
      lead_time_days: 7
    };

    try {
      await axios.post(`${API_BASE}/products`, payload);

      setName('');
      setCurrentStock('');
      setMinStock('5');
      fetchPredictions();
      alert("Produto cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar. Verifique o console com F12.");
    }
  };

  const chartData = {
    labels: predictions.map((p) => p.name || `Prod ${p.productId || p.id || ''}`),
    datasets: [
      {
        label: 'Dias Restantes de Estoque',
        data: predictions.map((p) => p.daysRemaining ?? p.days_remaining ?? 0),
        backgroundColor: predictions.map((p) => {
          const days = p.daysRemaining ?? p.days_remaining ?? 0;
          return days <= 7 ? 'rgba(220, 38, 38, 0.8)' : 'rgba(37, 99, 235, 0.8)';
        }),
      },
    ],
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '32px', fontFamily: 'sans-serif', color: '#0f172a' }}>
      <header style={{ maxWidth: '1100px', margin: '0 auto 24px auto', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          📦 Controle Preditivo de Estoque
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
          Previsão de reposição inteligente baseada no histórico de saídas
        </p>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* CARD DO FORMULÁRIO */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            ➕ Cadastrar Produto no Estoque
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                Nome do Produto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Cadeira Gamer"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ width: '160px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                Estoque Atual (un)
              </label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                required
                min="0"
                placeholder="Ex: 50"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ width: '160px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                Estoque Mínimo (un)
              </label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                required
                min="1"
                placeholder="Ex: 5"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 'bold', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', height: '42px', fontSize: '14px' }}
            >
              📈 Cadastrar Produto
            </button>
          </form>
        </div>

        {/* CARD DA TABELA */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Produto</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Estoque Atual</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Consumo Diário (Média)</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Dias Restantes</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Sugestão de Compra</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Carregando dados...</td></tr>
              ) : predictions.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Nenhum produto cadastrado ainda.</td></tr>
              ) : (
                predictions.map((p, index) => {
                  const stock = p.currentStock ?? p.current_stock ?? 0;
                  const daily = p.dailyConsumption ?? 0;
                  const days = p.daysRemaining ?? p.days_remaining ?? 0;
                  const isCritical = p.status === 'CRÍTICO';
                  const reorder = p.suggestedReorderQuantity ?? p.reorder_suggestion ?? 0;
                  
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{p.name || `Produto ${p.productId || p.id}`}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{stock} un</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{daily} /dia</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{days} dias</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: isCritical ? '#fee2e2' : '#dcfce7',
                          color: isCritical ? '#dc2626' : '#16a34a',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {isCritical ? '⚠️ CRÍTICO' : '✅ OK'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#d97706', fontWeight: '600' }}>
                        {reorder > 0 ? `+${reorder} un` : <span style={{ color: '#94a3b8' }}>Nenhuma</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* CARD DO GRÁFICO */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            📊 Autonomia de Estoque (Dias Restantes)
          </h2>
          <div style={{ height: '260px' }}>
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
              }} 
            />
          </div>
        </div>

      </main>
    </div>
  );
}