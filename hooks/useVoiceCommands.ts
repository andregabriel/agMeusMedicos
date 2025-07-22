import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

interface VoiceCommandResult {
  command: string;
  parameters: string[];
  confidence: number;
}

export function useVoiceCommands() {
  const { state, dispatch } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const startRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'pt-BR';

    recognitionInstance.onstart = () => {
      setIsRecording(true);
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Comando detectado:', transcript);
      processVoiceCommand(transcript);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsRecording(false);
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  }, [recognition]);

  const processVoiceCommand = useCallback((transcript: string) => {
    const command = parseCommand(transcript);
    
    if (command) {
      executeCommand(command);
    } else {
      console.log('Comando não reconhecido:', transcript);
    }
  }, [state]);

  const parseCommand = (transcript: string): VoiceCommandResult | null => {
    const text = transcript.toLowerCase().trim();
    
    // Comandos para remover medicamento
    if (text.includes('retire') || text.includes('remova') || text.includes('delete')) {
      const medicationName = extractMedicationName(text);
      return {
        command: 'remove_medication',
        parameters: [medicationName],
        confidence: 0.8
      };
    }
    
    // Comandos para adicionar medicamento
    if (text.includes('adicione') || text.includes('crie') || text.includes('novo medicamento')) {
      const medicationName = extractMedicationName(text);
      return {
        command: 'add_medication',
        parameters: [medicationName],
        confidence: 0.8
      };
    }
    
    // Comandos para alterar medicamento
    if (text.includes('altere') || text.includes('modifique') || text.includes('mude')) {
      const medicationName = extractMedicationName(text);
      return {
        command: 'edit_medication',
        parameters: [medicationName],
        confidence: 0.7
      };
    }
    
    // Comandos para marcar como tomado
    if (text.includes('tomei') || text.includes('tomado') || text.includes('medicamento tomado')) {
      const medicationName = extractMedicationName(text);
      return {
        command: 'mark_taken',
        parameters: [medicationName],
        confidence: 0.9
      };
    }

    return null;
  };

  const extractMedicationName = (text: string): string => {
    // Remove palavras de comando comum
    const cleanText = text
      .replace(/(retire|remova|delete|adicione|crie|novo|medicamento|altere|modifique|mude|tomei|tomado)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Tenta encontrar medicamento existente que mais se parece
    const existingMedication = state.medications.find(med => 
      cleanText.includes(med.name.toLowerCase()) || 
      med.name.toLowerCase().includes(cleanText)
    );
    
    return existingMedication?.name || cleanText;
  };

  const executeCommand = useCallback((command: VoiceCommandResult) => {
    switch (command.command) {
      case 'remove_medication':
        const medicationToRemove = state.medications.find(med => 
          med.name.toLowerCase().includes(command.parameters[0].toLowerCase())
        );
        if (medicationToRemove) {
          dispatch({ type: 'DELETE_MEDICATION', payload: medicationToRemove.id });
          alert(`Medicamento "${medicationToRemove.name}" removido com sucesso!`);
        } else {
          alert(`Medicamento "${command.parameters[0]}" não encontrado.`);
        }
        break;
        
      case 'add_medication':
        // Navegar para a tela de medicamentos para adicionar
        dispatch({ type: 'SET_VIEW', payload: 'medications' });
        alert(`Navegando para adicionar o medicamento: ${command.parameters[0]}`);
        break;
        
      case 'edit_medication':
        const medicationToEdit = state.medications.find(med => 
          med.name.toLowerCase().includes(command.parameters[0].toLowerCase())
        );
        if (medicationToEdit) {
          dispatch({ type: 'SET_VIEW', payload: 'medications' });
          alert(`Navegando para editar: ${medicationToEdit.name}`);
        } else {
          alert(`Medicamento "${command.parameters[0]}" não encontrado.`);
        }
        break;
        
      case 'mark_taken':
        const medicationToMark = state.medications.find(med => 
          med.name.toLowerCase().includes(command.parameters[0].toLowerCase())
        );
        if (medicationToMark) {
          // Adicionar log de medicamento tomado
          const now = new Date();
          const log = {
            id: Date.now().toString(),
            medicationId: medicationToMark.id,
            scheduledTime: now.toTimeString().substring(0, 5),
            actualTime: now.toTimeString().substring(0, 5),
            date: now.toISOString().split('T')[0],
            status: 'taken' as const,
            notes: 'Marcado via comando de voz',
            timestamp: now
          };
          dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
          alert(`Medicamento "${medicationToMark.name}" marcado como tomado!`);
        } else {
          alert(`Medicamento "${command.parameters[0]}" não encontrado.`);
        }
        break;
        
      default:
        console.log('Comando não implementado:', command);
    }
  }, [state, dispatch]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    processVoiceCommand
  };
}