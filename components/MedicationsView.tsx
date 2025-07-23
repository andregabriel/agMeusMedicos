'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Medication } from '@/types';
import { PlusIcon, EditIcon, TrashIcon, PillIcon, ClockIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const medicationColors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export default function MedicationsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: [''],
    color: medicationColors[0],
    active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      times: [''],
      color: medicationColors[0],
      active: true
    });
    setEditingId(null);
  };

  const handleEdit = (medication: Medication) => {
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      times: [...medication.times],
      color: medication.color,
      active: medication.active
    });
    setEditingId(medication.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const validTimes = formData.times.filter(time => time.trim());
    if (validTimes.length === 0) {
      toast.error('Adicione pelo menos um horário');
      return;
    }

            if (editingId) {
          dispatch({
            type: 'UPDATE_MEDICATION',
            payload: {
              id: editingId,
              name: formData.name.trim(),
              dosage: formData.dosage.trim(),
              times: validTimes,
              color: formData.color,
              active: formData.active,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          toast.success('Medicamento atualizado');
        } else {
          dispatch({
            type: 'ADD_MEDICATION',
            payload: {
              id: Date.now().toString(),
              name: formData.name.trim(),
              dosage: formData.dosage.trim(),
              times: validTimes,
              color: formData.color,
              active: formData.active,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          toast.success('Medicamento adicionado');
        }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este medicamento?')) {
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
        {state.medications.map(medication => (
          <div
            key={medication.id}
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
          </div>
        ))}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-sage-800 mb-4">
              {editingId ? 'Editar Medicamento' : 'Adicionar Medicamento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Nome do Medicamento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Ex: Paracetamol"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Dosagem *
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Ex: 500mg"
                  required
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Cor
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {medicationColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-sage-600' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  Horários *
                </label>
                <div className="space-y-2">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                        required
                      />
                      {formData.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="w-full px-3 py-2 border border-dashed border-sage-300 rounded-lg text-sage-600 hover:bg-sage-50"
                  >
                    + Adicionar Horário
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                />
                <label htmlFor="active" className="text-sm text-sage-700">
                  Medicamento ativo
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-sage-300 text-sage-700 rounded-lg hover:bg-sage-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700"
                >
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}