import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlertTriangle, Package, TrendingUp, CheckCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados do backend
    axios.get("https://estoque-inteligente-xmd0.onrender.com/api/predict")
      .then(res => {
        setPredictions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar dados:', err);
        setLoading(false);
      });
  }, []);

  const chartData = {
    labels: predictions.map(p => p.name),
    datasets: [
      {
        label: 'Dias Restantes de Estoque',
        data: predictions.map(p => p.daysRemaining),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
          <Package color="#2563eb" /> Controle Preditivo de Estoque
        </h1>
        <p style={{ color: '#64748b' }}>Previsão de reposição inteligente baseada no consumo diário</p>
      </header>

      {loading ? (
        <p>Carregando dados do servidor...</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* Tabela de Produtos e Status */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Visão Geral de Produtos</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Produto</th>
                  <th>Estoque Atual</th>
                  <th>Média Diária</th>
                  <th>Dias Restantes</th>
                  <th>Status</th>
                  <th>Sugestão de Compra</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map(item => (
                  <tr key={item.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.name}</td>
                    <td>{item.currentStock} un</td>
                    <td>{item.dailyConsumption} /dia</td>
                    <td>{item.daysRemaining} dias</td>
                    <td>
                      {item.status === 'CRÍTICO' ? (
                        <span style={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={16} /> CRÍTICO
                        </span>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={16} /> OK
                        </span>
                      )}
                    </td>
                    <td style={{ color: item.suggestedReorderQuantity > 0 ? '#d97706' : '#64748b', fontWeight: 'bold' }}>
                      {item.suggestedReorderQuantity > 0 ? `+${item.suggestedReorderQuantity} un` : 'Nenhuma'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gráfico de Tendência */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} /> Autonomia do Estoque (Dias)
            </h2>
            <Line data={chartData} />
          </div>

        </div>
      )}
    </div>
  );
}