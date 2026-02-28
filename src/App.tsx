import FileLoader from './components/FileLoader'
import { Card } from 'flowbite-react'
import { EpubProvider } from './epub/store/EpubContext'
import './App.css'

function App() {
  return (
    <EpubProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="max-w-2xl mx-auto mt-8 mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            eBook Reader
          </h1>
          <FileLoader />
        </Card>
      </div>
    </EpubProvider>
  )
}

export default App
