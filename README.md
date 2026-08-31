# 📦 Controle Preditivo de Estoque Inteligente

> Sistema full-stack para gestão preditiva de estoque com cálculo de autonomia em tempo real, visualização em gráficos e alertas automáticos de reposição.

## 🚀 Acesse a Aplicação

O painel interativo está publicado e disponível para uso no link abaixo:

🔗 **[Clique aqui para acessar o Controle Preditivo de Estoque](https://estoque-inteligente-xmd0.onrender.com)**



## 🎯 Sobre o Projeto

O **Controle Preditivo de Estoque** foi criado para resolver um problema clássico de gestão: a falta ou o excesso de produtos armazenados. 

Através da análise do consumo diário de cada item, o sistema calcula automaticamente:
* A quantidade exata de **dias restantes de estoque** (autonomia).
* A necessidade de reposição imediata com alertas de **status crítico**.
* Sugestões diretas de **quantidade para compra**.

---

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* **React.js** (Vite)
* **Chart.js** / `react-chartjs-2` (Gráficos interativos)
* **Lucide React** (Iconografia)
* **Axios** (Integração HTTP)

**Backend:**
* **Node.js** com **Express**
* **SQLite3** (Banco de dados relacional)

**Deploy & Infraestrutura:**
* **GitHub Pages** (Hospedagem do Frontend)
* **Render** (Hospedagem da API REST e Banco de Dados)

---

## ⚡ Como Usar

### 1. Acesso Direto (Nuvem)
Basta acessar o link da aplicação live:  
👉 [https://anterovieira.github.io/estoque-inteligente/](https://anterovieira.github.io/estoque-inteligente/)

### 2. Execução Local

Caso queira rodar o projeto em sua máquina local:

```bash
# Clone o repositório
git clone [https://github.com/AnteroVieira/estoque-inteligente.git](https://github.com/AnteroVieira/estoque-inteligente.git)

# Entre no repositório
cd estoque-inteligente

# Instale e inicie o Backend
cd backend
npm install
npm start

# Em outro terminal, instale e inicie o Frontend
cd frontend
npm install
npm run dev
