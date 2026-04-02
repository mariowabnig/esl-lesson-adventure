import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const Section: React.FC<{ title: string; children: React.ReactNode; onReset?: () => void }>
  = ({ title, children, onReset }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold">{title}</h3>
      {onReset && (
        <button onClick={onReset} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md">
          Reset to Defaults
        </button>
      )}
    </div>
    {children}
  </div>
);

const ModuleSettings: React.FC = () => {
  const { settings, setSettings, resetAudio, resetGamePrefs, resetUI } = useSettings();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-blue-600">⚙️ Einstellungen</h1>
        <p className="text-gray-600">Passen Sie Audio, Spiele und Oberfläche an</p>
      </div>

      {/* Audio Controls */}
      <Section title="Audio-Steuerung" onReset={resetAudio}>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="font-bold">Gesamtes Audio aktivieren</span>
            <input type="checkbox" checked={settings.audio.global}
              onChange={(e) => setSettings(s => ({ ...s, audio: { ...s.audio, global: e.target.checked } }))} />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span>Zahlen-Lernmodul Audio</span>
              <input type="checkbox" checked={settings.audio.numbers}
                onChange={(e) => setSettings(s => ({ ...s, audio: { ...s.audio, numbers: e.target.checked } }))} />
            </label>
            <label className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span>BINGO Audio</span>
              <input type="checkbox" checked={settings.audio.bingo}
                onChange={(e) => setSettings(s => ({ ...s, audio: { ...s.audio, bingo: e.target.checked } }))} />
            </label>
          </div>
          <p className="text-sm text-gray-600">Wenn Audio deaktiviert ist, werden alle Audio-Schaltflächen und Symbole vollständig verborgen.</p>
        </div>
      </Section>

      {/* Game Preferences */}
      <Section title="Spiel-Einstellungen" onReset={resetGamePrefs}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span>Battleships Grid Size</span>
            <select className="border rounded-md p-1"
              value={settings.gamePrefs.battleshipsGrid}
              onChange={(e) => setSettings(s => ({ ...s, gamePrefs: { ...s.gamePrefs, battleshipsGrid: Number(e.target.value) as any } }))}
            >
              <option value={10}>10x10</option>
              <option value={12}>12x12</option>
              <option value={15}>15x15</option>
            </select>
          </label>
          <label className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span>Memory Rastergröße</span>
            <select className="border rounded-md p-1"
              value={settings.gamePrefs.memoryGrid}
              onChange={(e) => setSettings(s => ({ ...s, gamePrefs: { ...s.gamePrefs, memoryGrid: Number(e.target.value) as any } }))}
            >
              <option value={12}>3x4 (12)</option>
              <option value={16}>4x4 (16)</option>
              <option value={20}>4x5 (20)</option>
              <option value={24}>4x6 (24)</option>
            </select>
          </label>
        </div>
      </Section>

      {/* Interface */}
      <Section title="Oberfläche" onReset={resetUI}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <span>Sprache</span>
            <select className="border rounded-md p-1"
              value={settings.ui.language}
              onChange={(e) => setSettings(s => ({ ...s, ui: { ...s.ui, language: e.target.value as any } }))}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <span>Design</span>
            <select className="border rounded-md p-1"
              value={settings.ui.theme}
              onChange={(e) => setSettings(s => ({ ...s, ui: { ...s.ui, theme: e.target.value as any } }))}
            >
              <option value="light">Hell</option>
              <option value="dark">Dunkel</option>
            </select>
          </label>
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Datenverwaltung">
        <div className="flex flex-wrap gap-3">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
            onClick={() => {
              try {
                const data = localStorage.getItem('esl-lesson-vocabulary') || '[]';
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'vocabulary.json'; a.click(); URL.revokeObjectURL(url);
              } catch {}
            }}
          >
            Export Vokabular
          </button>
          <label className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md cursor-pointer">
            Import Vokabular
            <input type="file" accept="application/json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parsed = JSON.parse(String(reader.result));
                  localStorage.setItem('esl-lesson-vocabulary', JSON.stringify(parsed));
                  alert('Import erfolgreich. Bitte Seite neu laden.');
                } catch {
                  alert('Ungültige Datei');
                }
              };
              reader.readAsText(file);
            }} />
          </label>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            onClick={() => {
              if (confirm('Alle Daten (Vokabular & Einstellungen) zurücksetzen?')) {
                localStorage.removeItem('esl-lesson-vocabulary');
                localStorage.removeItem('esl-lesson-settings');
                location.reload();
              }
            }}
          >
            Alles zurücksetzen
          </button>
        </div>
      </Section>
    </div>
  );
};

export default ModuleSettings;

