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
import { AlertTriangle, Package, TrendingUp, CheckCircle, PlusCircle } from 'lucide-react';

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

const API_URL = "https://estoque-inteligente-xmd0.onrender.com/api/predict";

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos 3 campos do formulário
  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [dailyConsumption, setDailyConsumption] = useState('');

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(API_URL);
      setPredictions(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Função disparada ao clicar no botão de "Calcular & Cadastrar"
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envia os dados convertidos para número para o Backend no Render
      await axios.post(API_URL, {
        name: name,
        current_stock: Number(currentStock),
        daily_consumption: Number(dailyConsumption)
      });
      
      // Limpa os campos do formulário após o sucesso
      setName('');
      setCurrentStock('');
      setDailyConsumption('');
      
      // Busca a lista atualizada para mostrar na tabela imediatamente
      fetchPredictions();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Ocorreu um erro ao salvar. O backend pode estar em modo de espera, tente novamente em alguns segundos.");
    }
  };

  // Configuração de dados para o Gráfico de Barras
  const chartData = {
    labels: predictions.map((p) => p.name || `Produto ${p.id}`),
    datasets: [
      {
        label: 'Dias Restantes de Estoque',
        data: predictions.map((p) => p.days_remaining),
        backgroundColor: predictions.map((p) => 
          p.days_remaining <= 5 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
        ),
        borderColor: predictions.map((p) => 
          p.days_remaining <= 5 ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
          <Package className="text-blue-600 w-8 h-8" />
          Controle Preditivo de Estoque
        </h1>
        <p className="text-slate-500 mt-2 ml-11">Previsão de reposição inteligente baseada no consumo diário</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
            <PlusCircle className="text-blue-600" />
            Cadastrar Produto & Calcular Autonomia
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Produto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Cadeira"
                className="w-full p-2 border rounded-lg bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-slate-600 mb-1">Estoque Atual (un)</label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                required
                min="0"
                placeholder="Ex: 50"
                className="w-full p-2 border rounded-lg bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-slate-600 mb-1">Consumo Diário (un/dia)</label>
              <input
                type="number"
                value={dailyConsumption}
                onChange={(e) => setDailyConsumption(e.target.value)}
                required
                min="0.1"
                step="0.1"
                placeholder="Ex: 7"
                className="w-full p-2 border rounded-lg bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 h-[42px]"
            >
              <TrendingUp className="w-4 h-4" />
              Calcular & Cadastrar
            </button>
          </form>
        </div>

        {/* TABELA DE DADOS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 px-4 text-slate-600 font-semibold">Produto</th>
                <th className="py-3 px-4 text-slate-600 font-semibold">Estoque Atual</th>
                <th className="py-3 px-4 text-slate-600 font-semibold">Média Diária</th>
                <th className="py-3 px-4 text-slate-600 font-semibold">Dias Restantes</th>
                <th className="py-3 px-4 text-slate-600 font-semibold">Status</th>
                <th className="py-3 px-4 text-slate-600 font-semibold">Sugestão de Compra</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-4 text-center text-slate-500">Carregando dados...</td></tr>
              ) : predictions.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-center text-slate-500">Nenhum produto cadastrado ainda.</td></tr>
              ) : (
                predictions.map((p, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{p.name || `Produto ${p.id}`}</td>
                    <td className="py-3 px-4 text-slate-600">{p.current_stock} un</td>
                    <td className="py-3 px-4 text-slate-600">{p.daily_consumption} /dia</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{p.days_remaining} dias</td>
                    <td className="py-3 px-4">
                      {p.status === 'CRÍTICO' || p.days_remaining <= 5 ? (
                        <span className="flex items-center gap-1 text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-xs w-max">
                          <AlertTriangle className="w-3 h-3" /> CRÍTICO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-xs w-max">
                          <CheckCircle className="w-3 h-3" /> OK
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-orange-600 font-semibold">
                      {p.reorder_suggestion > 0 ? `+${p.reorder_suggestion} un` : <span className="text-slate-400">Nenhuma</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Autonomia de Estoque (Dias Restantes)</h2>
          <div className="h-64">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true }
                }
              }} 
            />
          </div>
        </div>

      </main>
    </div>
  );
}