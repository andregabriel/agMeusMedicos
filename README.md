# agSafe v1 - Horários de Remédios 💊

Um aplicativo completo para monitorar horários de medicamentos e controle de sono, com design minimalista inspirado no Insight Timer.

## ✨ Funcionalidades

### 💊 Gerenciamento de Medicamentos
- ✅ Cadastro de medicamentos com dosagem e múltiplos horários
- ✅ Cores personalizáveis para cada medicamento
- ✅ Ativação/desativação de medicamentos
- ✅ Edição completa de todos os dados

### ⏰ Sistema de Alarmes Inteligente
- ✅ Alarmes automáticos nos horários programados
- ✅ Snooze de 5 minutos (até 10 vezes)
- ✅ Opções no alarme:
  - 🔄 **Adiar 5min** - snooze automático
  - ✅ **Tomei** - marcar como tomado
  - 🕐 **Outro horário** - registrar horário personalizado  
  - ❌ **Não tomarei** - pular medicamento
- ✅ Controle individual por medicamento ou ação global
- ✅ Notificações nativas do navegador

### 😴 Controle de Sono
- ✅ Registro de horários de dormir e acordar
- ✅ Cálculo automático da duração do sono
- ✅ Sistema de qualidade com 5 estrelas
- ✅ Notas personalizadas para cada registro
- ✅ Metas visuais com emojis:
  - 😌 **8-10h** - Verde (Ideal)
  - 😊 **7h** - Amarelo (Aceitável) 
  - 😐 **6-7h** - Vermelho (Pouco)
  - 😴 **<6h** - Vermelho escuro (Emergência)
  - 😌 **>10h** - Azul bebê (Serenidade)

### 📅 Visualização em Calendário
- ✅ Visão semanal e mensal
- ✅ Indicadores visuais de precisão dos medicamentos
- ✅ Qualidade do sono por dia com cores
- ✅ Emojis intuitivos para rápida identificação
- ✅ Estatísticas do período selecionado

### 📊 Histórico e Relatórios
- ✅ Histórico detalhado de todos os registros
- ✅ Filtros por período (semana/mês/trimestre)
- ✅ Filtros por tipo (medicamentos/sono/todos)
- ✅ Exportação de dados em JSON
- ✅ Compartilhamento de relatórios para psiquiatra
- ✅ Estatísticas de precisão e qualidade

### 🎨 Design e UX
- ✅ Interface minimalista inspirada no Insight Timer
- ✅ Paleta de cores zen e relaxante
- ✅ Animações suaves com Framer Motion
- ✅ Responsivo para mobile e desktop
- ✅ PWA (Progressive Web App)
- ✅ Armazenamento local (sem servidores)

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS com design system customizado
- **Animações**: Framer Motion
- **Notificações**: React Hot Toast
- **Ícones**: Lucide React
- **PWA**: Manifest e Service Worker ready
- **Armazenamento**: localStorage (dados locais)

## 📱 Como Usar

### 1. Instalação
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### 2. Primeiro Uso
1. **Permitir Notificações**: O app solicitará permissão para notificações
2. **Adicionar Medicamentos**: Vá na aba "Remédios" e cadastre seus medicamentos
3. **Configurar Horários**: Para cada medicamento, defina os horários
4. **Aguardar Alarmes**: O app alertará automaticamente nos horários

### 3. Funcionalidades Principais

#### Gerenciar Medicamentos
- Acesse a aba **Remédios**
- Clique no **+** para adicionar
- Preencha nome, dosagem e horários
- Escolha uma cor identificadora
- Salve e ative o medicamento

#### Registrar Sono
- Acesse a aba **Sono**
- Clique em **Registrar Sono**
- Informe horário de dormir e acordar
- Avalie a qualidade (1-5 estrelas)
- Adicione notas se desejar

#### Visualizar Progresso
- **Hoje**: Visão geral do dia atual
- **Calendário**: Progresso visual semanal/mensal
- **Histórico**: Relatórios detalhados

### 4. Alarmes e Notificações
Quando chegar a hora de um medicamento:
1. **Alarme** aparecerá automaticamente
2. **Som** tocará (se habilitado)
3. **Opções disponíveis**:
   - Adiar 5min (até 10x)
   - Marcar como tomado
   - Registrar outro horário
   - Pular medicamento

## 🔧 Configuração Avançada

### Personalização de Cores
As cores dos medicamentos podem ser personalizadas no componente `MedicationsView.tsx`:

```typescript
const medicationColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
];
```

### Ajuste de Snooze
Para alterar o limite de snooze, edite em `types/index.ts`:

```typescript
interface AlarmState {
  maxSnooze: number; // Padrão: 10
}
```

### Customização do Design
O design utiliza um sistema de cores personalizado em `tailwind.config.js`:
- **sage**: Tons de verde-acinzentado (cores principais)
- **zen**: Tons neutros (backgrounds)
- **primary**: Azuis para destaques

## 📊 Estrutura de Dados

### Medicamento
```typescript
interface Medication {
  id: string;
  name: string;        // Ex: "Omeprazol"
  dosage: string;      // Ex: "20mg"
  times: string[];     // Ex: ["08:00", "20:00"]
  color: string;       // Ex: "#ef4444"
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Registro de Medicamento
```typescript
interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: string;  // Horário programado
  actualTime?: string;    // Horário real (se diferente)
  date: string;          // YYYY-MM-DD
  status: 'taken' | 'skipped' | 'delayed' | 'other_time';
  notes?: string;
  timestamp: Date;
}
```

### Registro de Sono
```typescript
interface SleepRecord {
  id: string;
  date: string;        // YYYY-MM-DD
  bedtime: string;     // HH:mm
  wakeTime: string;    // HH:mm
  duration: number;    // em minutos
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  timestamp: Date;
}
```

## 🔒 Privacidade e Segurança

- ✅ **100% Local**: Todos os dados ficam no seu dispositivo
- ✅ **Sem Servidores**: Nenhuma informação é enviada para a internet
- ✅ **Sem Tracking**: Não há coleta de dados pessoais
- ✅ **Exportação Segura**: Você controla seus dados completamente

## 🎯 Roadmap

### v1.1 (Próxima versão)
- [ ] Backup automático para cloud
- [ ] Lembretes de reabastecimento
- [ ] Gráficos de tendências
- [ ] Modo escuro

### v1.2 (Futuro)
- [ ] Integração com wearables
- [ ] Análise de padrões com IA
- [ ] Relatórios PDF profissionais
- [ ] Múltiplos perfis/usuários

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Design inspirado no Insight Timer
- Ícones por Lucide React
- Comunidade React/Next.js

---

**agSafe v1** - Cuidando da sua saúde com tecnologia e design zen 🧘‍♀️✨