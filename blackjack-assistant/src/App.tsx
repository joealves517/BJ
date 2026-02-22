import { Dashboard } from './components/Dashboard';
import { ActionKeyboard } from './components/ActionKeyboard';
import { Table } from './components/Table';
import './index.css';

function App() {
  return (
    <div className="min-h-screen min-h-dvh bg-black text-zinc-100 flex justify-center p-2 font-sans w-full">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 pb-32">
        <Dashboard />
        <Table />
      </div>
      <ActionKeyboard />
    </div>
  );
}

export default App;
