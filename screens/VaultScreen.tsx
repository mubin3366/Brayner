
import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Trash2, Library, BookText } from 'lucide-react';
import { Note } from '../types';
import { getNotes, saveNote, deleteNote } from '../services/vaultService';

interface VaultScreenProps {
  onBack: () => void;
}

const VaultScreen: React.FC<VaultScreenProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!title || !content) return;
    const updated = saveNote(title, content);
    setNotes(updated);
    setTitle('');
    setContent('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = deleteNote(id);
    setNotes(updated);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500 pb-10">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">Knowledge Vault</h1>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-95 transition-all"
        >
          {isAdding ? <ArrowLeft className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {isAdding ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 space-y-4 shadow-sm">
          <input 
            type="text" 
            placeholder="Note Title (e.g., Physics Vector Formulas)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <textarea 
            placeholder="Write your study notes here..." 
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" /> Save Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
              <Library className="w-16 h-16" />
              <p className="text-sm font-medium">Your vault is empty.<br/>Save key concepts to review later.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 group transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <BookText className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{note.title}</h3>
                  </div>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {note.content}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    Added: {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VaultScreen;
