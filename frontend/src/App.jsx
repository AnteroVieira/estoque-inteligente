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

const API_PRODUCTS = "https://estoque-inteligente-xmd0.onrender.com/api/products";

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [dailyConsumption, setDailyConsumption] = useState('');

  const fetchPredictions = async () => {
    try {
      const res = await axios.get(API_PRODUCTS);
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
    
    // Payload formatado para a rota /api/products
    const payload = {
      name: name,
      currentStock: Number(currentStock),
      dailyConsumption: Number(dailyConsumption),
      current_stock: Number(currentStock),
      daily_consumption: Number(dailyConsumption)
    };

    try {
      await axios.post(API_PRODUCTS, payload);

      setName('');
      setCurrentStock('');
      setDailyConsumption('');
      fetchPredictions();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro no servidor (Status 500). Verifique os logs do Render ou tente novamente.");
    }
  };

  const chartData = {
    labels: predictions.map((p) => p.name || `Prod ${p.id || ''}`),
    datasets: [
      {
        label: 'Dias Restantes de Estoque',
        data: predictions.map((p) => p.days_remaining ?? p.days_left ?? 0),
        backgroundColor: predictions.map((p) => 
          (p.days_remaining <= 5 || p.days_left <= 5) ? 'rgba(220, 38, 38, 0.8)' : 'rgba(37, 99, 235, 0.8)'
        ),
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
          Previsão de reposição inteligente baseada no consumo diário
        </p>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* FORMULÁRIO */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            ➕ Cadastrar Produto & Calcular Autonomia
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
                placeholder="Ex: Cadeira"
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
            <div style={{ width: '180px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                Consumo Diário (un/dia)
              </label>
              <input
                type="number"
                value={dailyConsumption}
                onChange={(e) => setDailyConsumption(e.target.value)}
                required
                min="0.1"
                step="0.1"
                placeholder="Ex: 10"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 'bold', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', height: '42px', fontSize: '14px' }}
            >
              📈 Calcular & Cadastrar
            </button>
          </form>
        </div>

        {/* TABELA */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Produto</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Estoque Atual</th>
                <th style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>Média Diária</th>
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
                  const days = p.days_remaining ?? p.days_left ?? (p.daily_consumption ? Math.floor(p.current_stock / p.daily_consumption) : 0);
                  const isCritical = p.status === 'CRÍTICO' || days <= 5;
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{p.name || `Produto ${p.id}`}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{p.current_stock ?? p.currentStock} un</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{p.daily_consumption ?? p.dailyConsumption ?? '-'} /dia</td>
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
                        {p.reorder_suggestion > 0 ? `+${p.reorder_suggestion} un` : <span style={{ color: '#94a3b8' }}>Nenhuma</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* GRÁFICO */}
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