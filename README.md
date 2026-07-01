# ☀️ Solar Management

Sistema interno para gestão de projetos de instalação de energia solar — controle de clientes, equipes técnicas e dados por instalação, com mapa geográfico, funil de conversão e relatório executivo exportável em PDF.

![Demo do sistema](public/demo.gif)

---

## Funcionalidades

- **Dashboard** com indicadores de negócio (projetos, potência instalada, valor total), gráfico mensal filtrável por ano, funil de conversão por etapa e mapa interativo com localização de cada projeto no Ceará
- **Gestão de projetos** com busca por cliente ou cidade, filtro por status e paginação
- **CRUD completo** de projetos e dados de instalação com persistência real em banco de dados PostgreSQL
- **Relatório em PDF** exportável com sumário executivo, distribuição por status e tabela de projetos filtrada por ano
- **Controle de acesso** via Supabase Auth — visualização pública, criação/edição/exclusão restritas a usuários autenticados

---

## Stack

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

## Estrutura do projeto

```
src/
├── components/
│   ├── layout/             # Sidebar, TopBar
│   └── shared/             # InstallationForm, ProjectForm, ProjectMap, StatCard, StatusChip
├── lib/
│   ├── AuthContext.tsx     # Contexto global de autenticação
│   ├── supabaseClient.ts
│   └── useExportPDF.ts     # Hook de geração de relatório PDF
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── ProjectDetail.tsx
│   └── Projects.tsx
├── services/
│   └── projectService.ts   # Camada de acesso ao Supabase (CRUD + instalações)
├── mock/
│   └── cearaCoordinates.ts # Coordenadas das cidades do Ceará
└── types/
    └── index.ts
```

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) com um projeto criado

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

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

Os valores estão disponíveis em **Project Settings → Data API** no painel do Supabase.

### 4. Configure o banco de dados

No **SQL Editor** do Supabase, execute os scripts abaixo na ordem indicada.

<details>
<summary> Sequences </summary>

```sql
create sequence projects_seq start 19;
create sequence installations_seq start 8;
```
</details>

<details>
<summary>Tabelas</summary>

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

create index idx_projects_status on projects(status);
create index idx_projects_city on projects(city);
create index idx_installations_project_id on installations(project_id);
```
</details>

<details>
<summary>Políticas de acesso (RLS)</summary>

```sql
-- Leitura pública
create policy "Leitura pública de projetos"
  on projects for select to anon, authenticated using (true);

create policy "Leitura pública de instalações"
  on installations for select to anon, authenticated using (true);

-- Escrita apenas para autenticados
create policy "Insert projetos autenticados"
  on projects for insert to authenticated with check (true);

create policy "Update projetos autenticados"
  on projects for update to authenticated using (true) with check (true);

create policy "Delete projetos autenticados"
  on projects for delete to authenticated using (true);

create policy "Insert instalações autenticados"
  on installations for insert to authenticated with check (true);

create policy "Update instalações autenticados"
  on installations for update to authenticated using (true) with check (true);

create policy "Delete instalações autenticados"
  on installations for delete to authenticated using (true);
```
</details>

<details>
<summary>Dados de exemplo (opcional)</summary>

```sql
insert into projects (id, client_name, address, city, lat, lng, installed_power, status, start_date, estimated_value, responsible) values
('proj-001', 'Supermercado Boa Esperança', 'Av. Washington Soares, 1321', 'Fortaleza', -3.7327, -38.5270, 48.4, 'Concluído', '2024-01-10', 98000, 'Carlos Menezes'),
('proj-002', 'Cerâmica Vale do Jaguaribe', 'Rod. CE-060, km 12', 'Limoeiro do Norte', -5.1433, -38.0975, 120.0, 'Concluído', '2024-02-03', 215000, 'Fernanda Queiroz'),
('proj-003', 'Hotel Pousada Mandacaru', 'Rua das Dunas, 88', 'Jericoacoara', -2.7975, -40.5133, 36.3, 'Concluído', '2024-02-20', 74500, 'Carlos Menezes'),
('proj-004', 'Frigorífico Serra Grande', 'Distrito Industrial, Lote 14', 'Juazeiro do Norte', -7.2133, -39.3150, 200.0, 'Em andamento', '2024-03-15', 360000, 'Amanda Rocha'),
('proj-005', 'Escola Municipal João XXIII', 'Rua Cel. Antônio Filgueira, 210', 'Sobral', -3.6891, -40.3482, 24.2, 'Concluído', '2024-04-01', 51000, 'Fernanda Queiroz'),
('proj-006', 'Fazenda Agro Sertão', 'Zona Rural, Sítio Lagoa Seca', 'Quixadá', -4.9794, -39.0150, 84.7, 'Em andamento', '2024-04-22', 148000, 'Carlos Menezes'),
('proj-007', 'Clínica Vida e Saúde', 'Rua Barão do Rio Branco, 540', 'Crato', -7.2367, -39.4097, 18.15, 'Concluído', '2024-05-05', 39800, 'Amanda Rocha'),
('proj-008', 'Condomínio Residencial Brisa Mar', 'Av. Beira Mar, 2200', 'Caucaia', -3.7333, -38.6667, 60.5, 'Em andamento', '2024-06-10', 112000, 'Fernanda Queiroz'),
('proj-009', 'Posto de Combustível Irmãos Alves', 'BR-116, km 487', 'Iguatu', -6.3606, -39.2986, 30.25, 'Aguardando', '2024-07-01', 63500, 'Carlos Menezes'),
('proj-010', 'Indústria de Castanha Sertaneja', 'Rua do Comércio, 75', 'Barbalha', -7.3117, -39.3022, 96.8, 'Aguardando', '2024-07-18', 178000, 'Amanda Rocha'),
('proj-011', 'Shopping Center Cariri', 'Av. Leão Sampaio, 3800', 'Juazeiro do Norte', -7.2133, -39.3150, 315.0, 'Aguardando', '2024-08-05', 540000, 'Fernanda Queiroz'),
('proj-012', 'Laticínios Sertão Vivo', 'Rua Padre Cícero, 1002', 'Senador Pompeu', -5.5883, -39.3717, 55.0, 'Em andamento', '2024-09-02', 99500, 'Carlos Menezes'),
('proj-013', 'Hospital Regional do Cariri', 'Av. Padre Cícero, 4500', 'Juazeiro do Norte', -7.2133, -39.3150, 250.0, 'Concluído', '2025-01-15', 480000, 'Fernanda Queiroz'),
('proj-014', 'Granja Santa Luzia', 'Estrada do Açude, s/n', 'Quixadá', -4.9794, -39.0150, 72.6, 'Concluído', '2025-02-10', 135000, 'Carlos Menezes'),
('proj-015', 'Pousada Recanto do Sol', 'Rua do Forró, 55', 'Jericoacoara', -2.7975, -40.5133, 28.5, 'Em andamento', '2025-03-05', 62000, 'Amanda Rocha'),
('proj-016', 'Mercado Municipal de Sobral', 'Praça São João, s/n', 'Sobral', -3.6891, -40.3482, 90.0, 'Em andamento', '2025-04-01', 175000, 'Fernanda Queiroz'),
('proj-017', 'Sítio Ecológico Boa Vista', 'Zona Rural, km 8', 'Barbalha', -7.3117, -39.3022, 15.0, 'Aguardando', '2025-05-20', 34000, 'Carlos Menezes'),
('proj-018', 'Condomínio Residencial Parque Verde', 'Av. Central, 1500', 'Fortaleza', -3.7327, -38.5270, 120.0, 'Aguardando', '2025-06-10', 225000, 'Amanda Rocha');

insert into installations (id, project_id, installed_at, panel_count, inverter_model, notes) values
('inst-001', 'proj-001', '2024-02-28', 110, 'Fronius Symo 15.0-3-M', 'Instalação em telhado metálico. Estrutura de suporte reforçada devido à inclinação.'),
('inst-002', 'proj-002', '2024-04-10', 272, 'SMA Sunny Tripower 60', 'Sistema de grande porte com dois inversores em paralelo. Monitoramento remoto configurado.'),
('inst-003', 'proj-003', '2024-04-05', 82, 'Growatt MID 33KTL3-X', 'Telhado cerâmico colonial. Cabos protegidos contra salinidade pela proximidade do mar.'),
('inst-005', 'proj-005', '2024-05-30', 55, 'Huawei SUN2000-20KTL-M3', 'Projeto com incentivo de eficiência energética municipal. Telhado de fibrocimento reforçado.'),
('inst-007', 'proj-007', '2024-06-20', 41, 'Deye SUN-12K-SG04LP3', 'Gerador de backup integrado ao sistema. UPS configurado para equipamentos críticos da clínica.');
```
</details>

### 5. Crie um usuário administrador

No painel do Supabase, acesse **Authentication → Users → Add user → Create new user** e cadastre e-mail e senha. Esse usuário habilita as ações de escrita no sistema.

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`.

---

## Autenticação

O sistema permite navegação e leitura de dados sem login. Para criar, editar ou excluir projetos, faça login pelo botão **"Entrar"** no canto superior direito com o usuário criado no passo 5.

---

## Contato

[LinkedIn](https://www.linkedin.com/in/louise-portela-vieira/) · [GitHub](https://github.com/portelavieira)