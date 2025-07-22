'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SleepRecord } from '@/types';
import { formatDate, formatDateBR, calculateSleepDuration, getSleepQuality, getSleepQualityColor } from '@/utils/dateHelpers';
import { MoonIcon, SunIcon, ClockIcon, EditIcon, PlusIcon, StarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SleepView() {
  const { state, dispatch, getTodaySleep } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    bedtime: '',
    wakeTime: '',
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: '',
  });

  const todaySleep = getTodaySleep();
  const recentSleep = state.sleepRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const resetForm = () => {
    setFormData({
      date: formatDate(new Date()),
      bedtime: '',
      wakeTime: '',
      quality: 3,
      notes: '',
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleEdit = (record: SleepRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      bedtime: record.bedtime,
      wakeTime: record.wakeTime,
      quality: record.quality,
      notes: record.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bedtime || !formData.wakeTime) {
      toast.error('Horários de dormir e acordar são obrigatórios');
      return;
    }

    const duration = calculateSleepDuration(formData.bedtime, formData.wakeTime);

    const sleepRecord: SleepRecord = {
      id: editingRecord?.id || Date.now().toString(),
      date: formData.date,
      bedtime: formData.bedtime,
      wakeTime: formData.wakeTime,
      duration,
      quality: formData.quality,
      notes: formData.notes,
      timestamp: new Date(),
    };

    if (editingRecord) {
      dispatch({ type: 'UPDATE_SLEEP_RECORD', payload: sleepRecord });
      toast.success('Registro de sono atualizado!');
    } else {
      dispatch({ type: 'ADD_SLEEP_RECORD', payload: sleepRecord });
      toast.success('Registro de sono adicionado!');
    }

    resetForm();
  };

  const getSleepEmoji = (hours: number) => {
    if (hours >= 8 && hours <= 10) return '😌';
    if (hours >= 7) return '😊';
    if (hours >= 6) return '😐';
    return '😴';
  };

  const getQualityStars = (quality: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        size={16} 
        className={i < quality ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
      />
    ));
  };

  const averageSleepHours = recentSleep.length > 0 
    ? recentSleep.reduce((sum, record) => sum + record.duration, 0) / recentSleep.length / 60
    : 0;

  const averageQuality = recentSleep.length > 0 
    ? recentSleep.reduce((sum, record) => sum + record.quality, 0) / recentSleep.length
    : 0;

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold gradient-text">Controle de Sono</h1>
          <p className="text-sage-600">Monitore sua qualidade de sono</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="zen-button"
        >
          <PlusIcon size={20} />
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card text-center"
        >
          <div className="text-2xl mb-2">
            {averageSleepHours > 0 ? getSleepEmoji(averageSleepHours) : '💤'}
          </div>
          <div className="text-2xl font-light text-sage-800">
            {averageSleepHours > 0 ? `${averageSleepHours.toFixed(1)}h` : '--'}
          </div>
          <div className="text-sm text-sage-600">Média Semanal</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="flex justify-center mb-2">
            {getQualityStars(Math.round(averageQuality))}
          </div>
          <div className="text-2xl font-light text-sage-800">
            {averageQuality > 0 ? averageQuality.toFixed(1) : '--'}
          </div>
          <div className="text-sm text-sage-600">Qualidade Média</div>
        </motion.div>
      </div>

      {/* Sono de Hoje */}
      {todaySleep ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sage-800">Sono de Hoje</h2>
            <button
              onClick={() => handleEdit(todaySleep)}
              className="zen-button p-2"
            >
              <EditIcon size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <MoonIcon className="text-indigo-500" size={20} />
              <div>
                <div className="text-sm text-sage-600">Dormiu</div>
                <div className="font-medium text-sage-800">{todaySleep.bedtime}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <SunIcon className="text-yellow-500" size={20} />
              <div>
                <div className="text-sm text-sage-600">Acordou</div>
                <div className="font-medium text-sage-800">{todaySleep.wakeTime}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zen-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="text-sage-500" size={16} />
                <span className="text-sage-700">
                  {(todaySleep.duration / 60).toFixed(1)} horas
                </span>
                <span className="text-2xl">{getSleepEmoji(todaySleep.duration / 60)}</span>
              </div>
              <div className="flex items-center space-x-1">
                {getQualityStars(todaySleep.quality)}
              </div>
            </div>
            
            {todaySleep.notes && (
              <div className="mt-3 p-3 bg-zen-50 rounded-xl">
                <p className="text-sm text-sage-700">{todaySleep.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <MoonIcon size={48} className="mx-auto mb-4 text-sage-400" />
          <h3 className="text-lg font-medium text-sage-800 mb-2">
            Ainda não registrou o sono de hoje
          </h3>
          <p className="text-sage-600 mb-4">
            Adicione seus horários de sono para acompanhar sua qualidade
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Registrar Sono
          </button>
        </motion.div>
      )}

      {/* Histórico Recente */}
      {recentSleep.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-sage-800 mb-4">Últimos 7 Dias</h2>
          
          <div className="space-y-3">
            {recentSleep.map(record => {
              const hours = record.duration / 60;
              const quality = getSleepQuality(hours);
              const qualityColor = getSleepQualityColor(quality);
              
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-zen-50 rounded-xl hover:bg-zen-100 transition-colors cursor-pointer"
                  onClick={() => handleEdit(record)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${qualityColor}`} />
                    <div>
                      <div className="font-medium text-sage-800">
                        {formatDateBR(new Date(record.date), 'dd/MM')}
                      </div>
                      <div className="text-sm text-sage-600">
                        {record.bedtime} - {record.wakeTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-sage-800">
                      {hours.toFixed(1)}h {getSleepEmoji(hours)}
                    </div>
                    <div className="flex justify-end">
                      {getQualityStars(record.quality)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Meta de Sono */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-sage-800 mb-4">Meta de Sono</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-sage-700">8-10h por dia</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg">😌 Ideal</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sage-700">7h</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg">😊 Aceitável</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sage-700">6-7h</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg">😐 Pouco</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sage-700">Menos de 6h</span>
            <span className="px-2 py-1 bg-red-200 text-red-800 rounded-lg">😴 Emergência</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sage-700">Mais de 10h</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">😌 Serenidade</span>
          </div>
        </div>
      </motion.div>

      {/* Modal de Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-semibold text-sage-800 mb-6">
                {editingRecord ? 'Editar Sono' : 'Registrar Sono'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Data */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                {/* Horário de Dormir */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Horário que foi dormir
                  </label>
                  <input
                    type="time"
                    value={formData.bedtime}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedtime: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                {/* Horário de Acordar */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Horário que acordou
                  </label>
                  <input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, wakeTime: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                {/* Qualidade do Sono */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Qualidade do Sono (1-5 estrelas)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, quality: rating as 1 | 2 | 3 | 4 | 5 }))}
                        className="p-2"
                      >
                        <StarIcon 
                          size={24} 
                          className={rating <= formData.quality ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Como foi seu sono? Algo que influenciou?"
                  />
                </div>

                {/* Duração calculada */}
                {formData.bedtime && formData.wakeTime && (
                  <div className="p-3 bg-zen-50 rounded-xl">
                    <div className="text-sm text-sage-600">Duração estimada:</div>
                    <div className="text-lg font-medium text-sage-800">
                      {(calculateSleepDuration(formData.bedtime, formData.wakeTime) / 60).toFixed(1)} horas
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingRecord ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}