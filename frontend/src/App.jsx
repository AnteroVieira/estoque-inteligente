import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlertTriangle, Package, TrendingUp, CheckCircle, PlusCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = "https://estoque-inteligente-xmd0.onrender.com/api/predict";

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos 3 campos do formulário
  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [dailyConsumption, setDailyConsumption] = useState('');

  const fetchPredictions = () => {
    axios.get(API_URL)
      .then(res => {
        setPredictions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar dados:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !currentStock || !dailyConsumption) return;

    // Envia os 3 dados para o backend processar
    axios.post(API_URL, {
      name,
      currentStock: Number(currentStock),
      dailyConsumption: Number(dailyConsumption)
    })
    .then(() => {
      fetchPredictions(); // Atualiza a tabela e o gráfico imediatamente
      setName('');
      setCurrentStock('');
      setDailyConsumption('');
    })
    .catch(err => console.error('Erro ao calcular produto:', err));
  };

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

      {/* Formulário com os 3 campos e o botão Calcular */}
      <section style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', color: '#1e293b', marginBottom: '15px' }}>
          <PlusCircle size={20} color="#2563eb" /> Cadastrar Produto & Calcular Autonomia
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          {/* Campo 1: Nome do Produto */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              Nome do Produto
            </label>
            <input 
              type="text" 
              placeholder="Ex: Arroz 5kg" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          {/* Campo 2: Estoque Atual */}
          <div style={{ flex: '1', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              Estoque Atual (un)
            </label>
            <input 
              type="number" 
              placeholder="Ex: 50" 
              value={currentStock} 
              onChange={e => setCurrentStock(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          {/* Campo 3: Consumo Médio Diário */}
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              Consumo Diário (un/dia)
            </label>
            <input 
              type="number" 
              placeholder="Ex: 5" 
              value={dailyConsumption} 
              onChange={e => setDailyConsumption(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          {/* Botão de Ação */}
          <button 
            type="submit" 
            style={{ backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', border: 'none', padding: '11px 20px', borderRadius: '6px', cursor: 'pointer' }}
          >
            📊 Calcular & Cadastrar
          </button>
        </form>
      </section>

      {loading ? (
        <p>Carregando dados do servidor...</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* Tabela de Produtos */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Visão Geral & Sugestão de Estoque</h2>
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

          {/* Gráfico */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} /> Autonomia do Estoque (Dias Restantes)
            </h2>
            <Line data={chartData} />
          </div>

        </div>
      )}
    </div>
  );
}