
import { Note } from '../types';
import { getState, updateState } from './localEngine';

export const getNotes = (): Note[] => {
  return getState().vault.notes;
};

export const saveNote = (title: string, content: string): Note[] => {
  const state = getState();
  const newNote: Note = {
    id: Date.now().toString(),
    title,
    content,
    createdAt: new Date().toISOString()
  };
  const updatedNotes = [newNote, ...state.vault.notes];
  updateState({ vault: { ...state.vault, notes: updatedNotes } });
  return updatedNotes;
};

export const deleteNote = (id: string): Note[] => {
  const state = getState();
  const updatedNotes = state.vault.notes.filter(n => n.id !== id);
  updateState({ vault: { ...state.vault, notes: updatedNotes } });
  return updatedNotes;
};
