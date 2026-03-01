import Toolbar from './components/Toolbar'
import ChapterViewer from './components/ChapterViewer'
import { EpubProvider } from './epub/store/EpubContext'
import './App.css'

function AppContent() {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <main className="flex-1 overflow-hidden">
        <ChapterViewer />
      </main>
    </div>
  )
}

function App() {
  return (
    <EpubProvider>
      <AppContent />
    </EpubProvider>
  )
}

export default App
