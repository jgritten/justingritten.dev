import '@/styles/App.css'
import { Heading } from '@radix-ui/themes'
import { ProductList } from './Components/ProductList/ProductList'
import { FileExplorer} from './Components/FileExplorer/FileExplorer'

function App() {
  return (
    <main className="app">
      {/* <Heading as="h1" size="6">Products</Heading>
      <ProductList /> */}
      <FileExplorer />
    </main>
  )
}

export default App
