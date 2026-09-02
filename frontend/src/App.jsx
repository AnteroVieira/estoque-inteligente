import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
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
  const [dailyConsumption, setDailyConsumption] = useState('');

  const fetchPredictions = async () => {
    try {
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

    const stockNum = Number(currentStock);
    const dailyNum = Number(dailyConsumption);

    // Envia min_stock baseado na venda diária inserida (7 dias de cobertura)
    const payload = {
      name: name,
      current_stock: stockNum,
      min_stock: Math.ceil(dailyNum * 7),
      lead_time_days: 7
    };

    try {
      await axios.post(`${API_BASE}/products`, payload);
      setName('');
      setCurrentStock('');
      setDailyConsumption('');
      fetchPredictions();
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar produto. Verifique a conexão com o servidor.");
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm("Deseja realmente apagar TODOS os produtos cadastrados e zerar a lista?")) {
      try {
        await axios.delete(`${API_BASE}/reset`);
        alert("Todos os produtos antigos foram removidos com sucesso!");
        fetchPredictions();
      } catch (error) {
        console.error("Erro ao zerar banco:", error);
        alert("Erro ao zerar o banco de dados.");
      }
    }
  };

  const chartData = {
    labels: predictions.map((p) => p.name || `Produto ${p.productId || p.id || ''}`),
    datasets: [
      {
        label: 'Dias Restantes',
        data: predictions.map((p) => p.daysRemaining ?? p.days_remaining ?? 0),
        backgroundColor: predictions.map((p) => {
          const days = p.daysRemaining ?? p.days_remaining ?? 0;
          return days <= 7 ? '#dc2626' : '#2563eb';
        }),
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { beginAtZero: true, grid: { color: '#e2e8f0' } },
      y: { grid: { display: false } }
    }
  };

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* CARD DO FORMULÁRIO */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '4px', height: '18px', backgroundColor: '#1d4ed8', borderRadius: '2px' }}></span>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              ➕ Cadastrar Produto & Calcular Autonomia
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: '2', minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Nome do Produto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Cadeira gamer"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Estoque Atual (un)
              </label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                required
                min="0"
                placeholder="Ex: 50"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: '1', minWidth: '170px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Venda Média diária (un)
              </label>
              <input
                type="number"
                value={dailyConsumption}
                onChange={(e) => setDailyConsumption(e.target.value)}
                required
                min="0.1"
                step="0.1"
                placeholder="Ex: 5"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#1d4ed8', color: '#ffffff', fontWeight: 'bold', padding: '9px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📊 Calcular & Cadastrar
            </button>
          </form>
        </div>

        {/* CARD DA TABELA */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '18px', backgroundColor: '#1d4ed8', borderRadius: '2px' }}></span>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                📋 Visão Geral & Sugestão de Estoque
              </h2>
            </div>
            <button
              onClick={handleResetDatabase}
              style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
            >
              🗑️ Limpar Todos os Itens
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>Produto</th>
                <th style={{ padding: '10px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>Estoque Atual</th>
                <th style={{ padding: '10px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>Média Diária</th>
                <th style={{ padding: '10px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>Dias Restantes</th>
                <th style={{ padding: '10px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '10px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>Sugestão de Compra</th>
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
                  const daily = p.dailyConsumption ?? p.daily_consumption ?? 0;
                  const days = p.daysRemaining ?? p.days_remaining ?? 0;
                  const isCritical = p.status === 'CRÍTICO';
                  const reorder = p.suggestedReorderQuantity ?? 0;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{p.name || `Produto ${p.productId || p.id}`}</td>
                      <td style={{ padding: '12px 10px', color: '#334155', fontSize: '14px' }}>{stock} un</td>
                      <td style={{ padding: '12px 10px', color: '#334155', fontSize: '14px' }}>{daily} /dia</td>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{days} dias</td>
                      <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 'bold' }}>
                        {isCritical ? (
                          <span style={{ color: '#dc2626' }}>⚠️ CRÍTICO</span>
                        ) : (
                          <span style={{ color: '#16a34a' }}>✓ OK</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', fontSize: '14px' }}>
                        {reorder > 0 ? (
                          <span style={{ color: '#d97706' }}>+{reorder} un</span>
                        ) : (
                          <span style={{ color: '#64748b', fontWeight: 'normal' }}>Nenhuma</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* CARD DO GRÁFICO HORIZONTAL */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '4px', height: '18px', backgroundColor: '#1d4ed8', borderRadius: '2px' }}></span>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              📈 Autonomia de Estoque (Dias Restantes)
            </h2>
          </div>

          <div style={{ height: `${Math.max(180, predictions.length * 45)}px` }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

      </main>
    </div>
  );
}