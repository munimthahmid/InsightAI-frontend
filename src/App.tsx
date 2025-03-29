import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Research from './pages/Research'
import ResearchHistory from './pages/ResearchHistory'
import ResearchDetail from './pages/ResearchDetail'
import CompareResearch from './pages/CompareResearch'
import LiteratureReview from './pages/LiteratureReview'
import Templates from './pages/Templates'
import Header from './components/Header'
import Footer from './components/Footer'
import theme from './theme'

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" display="flex" flexDirection="column">
          <Header />
          <Box flex="1" py={8} px={4}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/research" element={<Research />} />
              <Route path="/history" element={<ResearchHistory />} />
              <Route path="/research/:id" element={<ResearchDetail />} />
              <Route path="/compare" element={<CompareResearch />} />
              <Route path="/literature-review/:id" element={<LiteratureReview />} />
              <Route path="/templates" element={<Templates />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App 