'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDateBR, formatDate } from '@/utils/dateHelpers';
import { DownloadIcon, FilterIcon, ClockIcon, PillIcon, EditIcon, ShareIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'medications' | 'sleep';
type PeriodType = 'week' | 'month' | 'quarter';

export default function HistoryView() {
  const { state } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const getFilteredData = () => {
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    const filteredMedicationLogs = state.medicationLogs.filter(log => 
      new Date(log.date) >= startDate
    );

    const filteredSleepRecords = state.sleepRecords.filter(record => 
      new Date(record.date) >= startDate
    );

    return { medicationLogs: filteredMedicationLogs, sleepRecords: filteredSleepRecords };
  };

  const { medicationLogs, sleepRecords } = getFilteredData();

  const generateReport = () => {
    const report = {
      period: period,
      generated: new Date().toISOString(),
      medications: state.medications.filter(med => med.active),
      medicationLogs: medicationLogs,
      sleepRecords: sleepRecords,
      summary: {
        totalMedications: state.medications.filter(med => med.active).length,
        totalLogs: medicationLogs.length,
        averageAccuracy: medicationLogs.length > 0 
          ? Math.round((medicationLogs.filter(log => log.status === 'taken').length / medicationLogs.length) * 100)
          : 0,
        averageSleepHours: sleepRecords.length > 0 
          ? sleepRecords.reduce((acc, record) => acc + record.duration, 0) / sleepRecords.length / 60
          : 0,
        averageSleepQuality: sleepRecords.length > 0 
          ? sleepRecords.reduce((acc, record) => acc + record.quality, 0) / sleepRecords.length
          : 0,
      }
    };

    return report;
  };

  const exportData = () => {
    const report = generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `agsafe-relatorio-${period}-${formatDate(new Date())}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Relatório exportado com sucesso!');
  };

  const shareReport = async () => {
    const report = generateReport();
    
    const shareText = `
📊 Relatório agSafe - ${period === 'week' ? 'Última Semana' : period === 'month' ? 'Último Mês' : 'Últimos 3 Meses'}

💊 Medicamentos:
• Total de registros: ${report.summary.totalLogs}
• Precisão média: ${report.summary.averageAccuracy}%

😴 Sono:
• Horas médias: ${report.summary.averageSleepHours.toFixed(1)}h
• Qualidade média: ${report.summary.averageSleepQuality.toFixed(1)}/5

Gerado em ${formatDateBR(new Date())}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Relatório agSafe',
          text: shareText,
        });
        toast.success('Relatório compartilhado!');
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success('Relatório copiado para a área de transferência!');
    }
  };

  const getMedicationName = (medicationId: string) => {
    const medication = state.medications.find(med => med.id === medicationId);
    return medication?.name || 'Medicamento desconhecido';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'text-green-600 bg-green-50';
      case 'skipped': return 'text-red-600 bg-red-50';
      case 'delayed': return 'text-orange-600 bg-orange-50';
      case 'other_time': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken': return 'Tomado';
      case 'skipped': return 'Não tomado';
      case 'delayed': return 'Atrasado';
      case 'other_time': return 'Outro horário';
      default: return status;
    }
  };

  const groupedByDate = [...medicationLogs, ...sleepRecords.map(record => ({
    ...record,
    type: 'sleep' as const
  }))]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((groups, item) => {
      const date = item.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {} as Record<string, any[]>);

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold gradient-text">Histórico</h1>
          <p className="text-sage-600">Relatórios e análises</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={shareReport}
            className="zen-button p-2"
            title="Compartilhar relatório"
          >
            <ShareIcon size={20} />
          </button>
          <button
            onClick={exportData}
            className="zen-button p-2"
            title="Exportar dados"
          >
            <DownloadIcon size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sage-800">Filtros</h2>
          <FilterIcon className="text-sage-400" size={20} />
        </div>
        
        <div className="space-y-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Período
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'week', label: 'Última Semana' },
                { key: 'month', label: 'Último Mês' },
                { key: 'quarter', label: 'Últimos 3 Meses' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setPeriod(option.key as PeriodType)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    period === option.key 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-zen-200 text-sage-700 hover:bg-zen-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Tipo de Dados
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'medications', label: 'Medicamentos' },
                { key: 'sleep', label: 'Sono' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key as FilterType)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === option.key 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-zen-200 text-sage-700 hover:bg-zen-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-sage-800 mb-4">Resumo do Período</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {(filter === 'all' || filter === 'medications') && (
            <>
              <div className="text-center">
                <div className="text-2xl font-light text-sage-800">
                  {medicationLogs.length}
                </div>
                <div className="text-sm text-sage-600">Registros de Medicamentos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-light text-sage-800">
                  {medicationLogs.length > 0 
                    ? Math.round((medicationLogs.filter(log => log.status === 'taken').length / medicationLogs.length) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-sage-600">Precisão Média</div>
              </div>
            </>
          )}
          
          {(filter === 'all' || filter === 'sleep') && (
            <>
              <div className="text-center">
                <div className="text-2xl font-light text-sage-800">
                  {sleepRecords.length > 0 
                    ? (sleepRecords.reduce((acc, record) => acc + record.duration, 0) / sleepRecords.length / 60).toFixed(1)
                    : 0}h
                </div>
                <div className="text-sm text-sage-600">Sono Médio</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-light text-sage-800">
                  {sleepRecords.length > 0 
                    ? (sleepRecords.reduce((acc, record) => acc + record.quality, 0) / sleepRecords.length).toFixed(1)
                    : 0}/5
                </div>
                <div className="text-sm text-sage-600">Qualidade Média</div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Detailed History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-sage-800">Histórico Detalhado</h2>
        
        {Object.entries(groupedByDate).length === 0 ? (
          <div className="card text-center py-12">
            <ClockIcon size={48} className="mx-auto mb-4 text-sage-400 opacity-50" />
            <h3 className="text-lg font-medium text-sage-800 mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-sage-600">
              Ajuste os filtros para ver dados de outros períodos
            </p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, items]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sage-800">
                  {formatDateBR(new Date(date), 'EEEE, dd MMMM yyyy')}
                </h3>
                <span className="text-sm text-sage-600">
                  {items.length} registro{items.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-zen-50 rounded-xl"
                  >
                    {('medicationId' in item) ? (
                      // Medication log
                      <>
                        <div className="flex items-center space-x-3">
                          <PillIcon className="text-sage-500" size={16} />
                          <div>
                            <div className="font-medium text-sage-800">
                              {getMedicationName(item.medicationId)}
                            </div>
                            <div className="text-sm text-sage-600">
                              Programado: {item.scheduledTime}
                              {item.actualTime && item.actualTime !== item.scheduledTime && (
                                <span> • Tomado: {item.actualTime}</span>
                              )}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-sage-500 mt-1">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </>
                    ) : (
                      // Sleep record
                      <>
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="text-indigo-500" size={16} />
                          <div>
                            <div className="font-medium text-sage-800">
                              Sono: {(item.duration / 60).toFixed(1)} horas
                            </div>
                            <div className="text-sm text-sage-600">
                              {item.bedtime} - {item.wakeTime}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-sage-500 mt-1">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < item.quality ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Export Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-sage-800 mb-4">Exportar Dados</h3>
        
        <div className="space-y-3 text-sm text-sage-600">
          <p>
            • <strong>Compartilhar:</strong> Gera um resumo para enviar à sua psiquiatra
          </p>
          <p>
            • <strong>Exportar:</strong> Baixa todos os dados em formato JSON para backup
          </p>
          <p>
            • Os dados incluem medicamentos, registros de horários e informações de sono
          </p>
          <p className="text-xs text-sage-500 mt-4">
            Seus dados são armazenados localmente e nunca enviados para servidores externos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}