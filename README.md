# ☀️ Solar Management

Sistema de gestão de projetos de energia solar desenvolvido como projeto de portfólio, com foco em demonstrar integração completa entre front-end moderno e back-end real.

![Dashboard Demo](public/demo.gif)

---

## 🚀 Funcionalidades

- **Dashboard** com cards de resumo, gráfico de projetos por mês, funil de status e mapa interativo do Ceará
- **Listagem de projetos** com busca, filtro por status e paginação
- **CRUD completo** de projetos e instalações com persistência real no banco de dados
- **Autenticação** via Supabase Auth — visualização pública, edição restrita a usuários autenticados
- **Exportação de relatório em PDF** com sumário executivo e tabela de projetos
- **Design responsivo** com sidebar adaptável para mobile

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| UI | Material UI v5 |
| Roteamento | React Router v6 |
| Mapas | Leaflet + react-leaflet |
| Gráficos | Recharts |
| Back-end / Banco | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Exportação PDF | jsPDF + jspdf-autotable |
| Build | Vite |

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── layout/         # Sidebar, TopBar
│   └── shared/         # InstallationForm, ProjectForm, ProjectMap, StatCard, StatusChip
├── lib/
│   ├── AuthContext.tsx  # Contexto global de autenticação
│   ├── supabaseClient.ts
│   └── useExportPDF.ts  # Hook de geração de PDF
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── ProjectDetail.tsx
│   └── Projects.tsx
├── services/
│   └── projectService.ts  # Camada de acesso ao Supabase
├── mock/
│   └── cearaCoordinates.ts  # Coordenadas das cidades do Ceará
└── types/
    └── index.ts
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) com o projeto configurado

### 1. Clone o repositório

```bash
git clone https://github.com/portelavieira/Solar-Management.git
cd solar-management
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

Os valores estão disponíveis em **Project Settings → Data API** no painel do Supabase.

### 4. Configure o banco de dados

No SQL Editor do Supabase, execute os scripts na seguinte ordem:

**Sequences:**
```sql
create sequence projects_seq start 19;
create sequence installations_seq start 1;
```

**Tabelas:**
```sql
create type project_status as enum ('Em andamento', 'Concluído', 'Aguardando');

create table projects (
  id text primary key default ('proj-' || lpad(nextval('projects_seq')::text, 3, '0')),
  client_name text not null,
  address text not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  installed_power numeric not null,
  status project_status not null default 'Aguardando',
  start_date date not null,
  estimated_value numeric not null,
  responsible text not null,
  created_at timestamptz not null default now()
);

create table installations (
  id text primary key default ('inst-' || lpad(nextval('installations_seq')::text, 3, '0')),
  project_id text not null references projects(id) on delete cascade,
  installed_at date not null,
  panel_count integer not null,
  inverter_model text not null,
  notes text,
  created_at timestamptz not null default now()
);
```

**Políticas de acesso (RLS):**
```sql
-- Leitura pública
create policy "Leitura pública de projetos" on projects for select to anon, authenticated using (true);
create policy "Leitura pública de instalações" on installations for select to anon, authenticated using (true);

-- Escrita apenas para autenticados
create policy "Insert projetos autenticados" on projects for insert to authenticated with check (true);
create policy "Update projetos autenticados" on projects for update to authenticated using (true) with check (true);
create policy "Delete projetos autenticados" on projects for delete to authenticated using (true);
create policy "Insert instalações autenticados" on installations for insert to authenticated with check (true);
create policy "Update instalações autenticados" on installations for update to authenticated using (true) with check (true);
create policy "Delete instalações autenticados" on installations for delete to authenticated using (true);
```

### 5. Rode o projeto

```bash
npm run dev
```

Acesse `http://localhost:5173`.

---

## 🔐 Acesso à demo

O sistema permite navegação pública sem login. Para testar criação e edição de projetos, clique em **"Entrar"** no canto superior direito e use as credenciais abaixo:

| Campo | Valor |
|---|---|
| E-mail | demo@solarmanagement.com |
| Senha | Demo@1234 |

---

## 📄 Licença

Projeto desenvolvido para fins de portfólio.
