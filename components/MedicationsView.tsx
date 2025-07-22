'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/types';
import { PlusIcon, EditIcon, TrashIcon, PillIcon, ClockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const medicationColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
];

export default function MedicationsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: [''],
    color: medicationColors[0],
    active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      times: [''],
      color: medicationColors[0],
      active: true,
    });
    setEditingMedication(null);
    setShowForm(false);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      times: [...medication.times],
      color: medication.color,
      active: medication.active,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast.error('Nome e dosagem são obrigatórios');
      return;
    }

    const validTimes = formData.times.filter(time => time.trim() && /^\d{2}:\d{2}$/.test(time));
    if (validTimes.length === 0) {
      toast.error('Pelo menos um horário válido é necessário');
      return;
    }

    const medicationData: Medication = {
      id: editingMedication?.id || Date.now().toString(),
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      times: validTimes,
      color: formData.color,
      active: formData.active,
      createdAt: editingMedication?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingMedication) {
      dispatch({ type: 'UPDATE_MEDICATION', payload: medicationData });
      toast.success('Medicamento atualizado!');
    } else {
      dispatch({ type: 'ADD_MEDICATION', payload: medicationData });
      toast.success('Medicamento adicionado!');
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este medicamento?')) {
      dispatch({ type: 'DELETE_MEDICATION', payload: id });
      toast.success('Medicamento removido');
    }
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }));
  };

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold gradient-text">Meus Medicamentos</h1>
          <p className="text-sage-600">Gerencie seus remédios e horários</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="zen-button"
        >
          <PlusIcon size={20} />
        </button>
      </div>

      {/* Lista de Medicamentos */}
      <div className="space-y-4">
        <AnimatePresence>
          {state.medications.map(medication => (
            <motion.div
              key={medication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: medication.color }}
                  >
                    <PillIcon className="text-white" size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-sage-800">{medication.name}</h3>
                      {!medication.active && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sage-600 mb-2">{medication.dosage}</p>
                    
                    <div className="flex items-center space-x-2 text-sm text-sage-500">
                      <ClockIcon size={14} />
                      <span>{medication.times.length} horário{medication.times.length > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {medication.times.map((time, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-zen-100 text-sage-700 text-xs rounded-lg"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(medication)}
                    className="zen-button p-2"
                  >
                    <EditIcon size={16} className="text-sage-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(medication.id)}
                    className="zen-button p-2"
                  >
                    <TrashIcon size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.medications.length === 0 && (
          <div className="text-center py-12 text-sage-500">
            <PillIcon size={64} className="mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Nenhum medicamento cadastrado</h3>
            <p className="mb-6">Adicione seus primeiros medicamentos para começar</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Adicionar Medicamento
            </button>
          </div>
        )}
      </div>

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
                {editingMedication ? 'Editar Medicamento' : 'Novo Medicamento'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Nome do Medicamento
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: Omeprazol"
                    required
                  />
                </div>

                {/* Dosagem */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Dosagem
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: 20mg"
                    required
                  />
                </div>

                {/* Horários */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-sage-700">
                      Horários
                    </label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="text-sm text-sage-600 hover:text-sage-800"
                    >
                      + Adicionar horário
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          className="input-field flex-1"
                          required
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="zen-button p-2"
                          >
                            <TrashIcon size={16} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Cor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {medicationColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-sage-600' : 'border-zen-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded border-zen-300 text-sage-600 focus:ring-sage-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-sage-700">
                    Medicamento ativo
                  </label>
                </div>

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
                    {editingMedication ? 'Atualizar' : 'Adicionar'}
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