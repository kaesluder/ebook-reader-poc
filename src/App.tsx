import FileLoader from './components/FileLoader'
import ChapterList from './components/ChapterList'
import ChapterViewer from './components/ChapterViewer'
import { Card } from 'flowbite-react'
import { EpubProvider, useEpub } from './epub/store/EpubContext'
import './App.css'

function AppContent() {
  const { state } = useEpub()
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          eBook Reader
        </h1>
        <FileLoader />
        <ChapterList />
        {state.selectedChapterHref && (
          <p className="text-sm text-gray-500 mt-2">
            Selected: {state.selectedChapterHref}
          </p>
        )}
        <ChapterViewer />
      </Card>
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
