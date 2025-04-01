import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Switch,
  Progress,
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { 
  conductResearch, 
  ResearchResponse
} from '../api/researchApi'
import ReactMarkdown from 'react-markdown'

const Research = () => {
  const [query, setQuery] = useState('')
  const [maxResults, setMaxResults] = useState<number | undefined>(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResearchResponse | null>(null)
  const [saveToHistory, setSaveToHistory] = useState(true)
  const [agentStatus, setAgentStatus] = useState<string>('')
  const toast = useToast()

  // Simulate agent progress updates
  useEffect(() => {
    let timer: number;
    
    if (loading) {
      let phase = 0;
      const phases = [
        "Controller Agent: Initializing multi-agent research system...",
        "Acquisition Agent: Collecting data from multiple sources...",
        "Acquisition Agent: Processing documents and storing in vector database...",
        "Analysis Agent: Clustering documents with K-means algorithm...",
        "Analysis Agent: Extracting key entities and topics...",
        "Analysis Agent: Generating concept map of information...",
        "Synthesis Agent: Creating comprehensive research report...",
        "Synthesis Agent: Adding citations and formatting references...",
        "Controller Agent: Finalizing research process..."
      ];
      
      const updateStatus = () => {
        if (phase < phases.length) {
          setAgentStatus(phases[phase]);
          phase++;
          timer = window.setTimeout(updateStatus, 10000 + Math.random() * 10000);
        }
      };
      
      updateStatus();
    }
    
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a research query',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setAgentStatus("Controller Agent: Initializing research process...")

    try {
      // Standard research
      const response = await conductResearch({
        query: query.trim(),
        max_results_per_source: maxResults,
        save_history: saveToHistory
      })
      
      setResult(response)
    } catch (err) {
      setError('An error occurred while conducting research. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.lg">
      <VStack spacing={8} align="stretch">
        <Heading 
          textAlign="center" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
          bgClip="text"
        >
          Research Any Topic
        </Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Research Query</FormLabel>
              <Input
                placeholder="Enter a topic or question to research"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="lg"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="save-history" mb="0">
                Save to History
              </FormLabel>
              <Switch 
                id="save-history" 
                isChecked={saveToHistory}
                onChange={(e) => setSaveToHistory(e.target.checked)}
                colorScheme="brand"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Maximum Results Per Source</FormLabel>
              <NumberInput
                min={1}
                max={10}
                value={maxResults}
                onChange={(_, val) => setMaxResults(val)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              leftIcon={<FaSearch />}
              isLoading={loading}
              loadingText="Researching..."
              isDisabled={!query.trim() || loading}
            >
              Research
            </Button>
          </VStack>
        </Box>

        {loading && (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <VStack mt={4} spacing={3}>
              <Text fontSize="lg">
                Researching your query... This may take a minute.
              </Text>
              <Box 
                border="1px" 
                borderColor="gray.200" 
                p={4} 
                borderRadius="md" 
                w="100%" 
                bg="gray.50"
                _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
              >
                <Text fontWeight="bold" mb={2}>
                  Multi-Agent System Status
                </Text>
                <Text color="blue.500" fontSize="md" mb={3}>
                  {agentStatus}
                </Text>
                <Progress 
                  size="sm" 
                  isIndeterminate 
                  colorScheme="brand" 
                  borderRadius="md"
                />
                <Text fontSize="xs" mt={3} color="gray.500">
                  Our advanced multi-agent system uses vector embeddings, clustering algorithms and semantic analysis to process your research query. It may takes 2-3 minutes to complete.
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {result && (
          <Box>
            <Divider my={6} />
            <Heading as="h2" size="lg" mb={4}>
              Research Results: {result.query}
            </Heading>
            
            <Box 
              bg="gray.50" 
              p={8} 
              borderRadius="md" 
              boxShadow="md"
              overflowX="auto"
              _dark={{ bg: 'gray.700' }} 
              className="markdown-content"
            >
              <ReactMarkdown>{result.report}</ReactMarkdown>
            </Box>
            
            {result.metadata?.sources && (
              <Box mt={6} p={4} bg="gray.100" borderRadius="md" _dark={{ bg: 'gray.800' }}>
                <Text fontWeight="bold" mb={2}>Sources:</Text>
                <Box as="ul" pl={5}>
                  {Object.entries(result.metadata.sources).map(([source, count]) => (
                    <Box as="li" key={source}>
                      {source}: {String(count)} results
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            
            {result.research_id && (
              <Text fontSize="sm" mt={4} color="gray.500" _dark={{ color: 'gray.400' }}>
                Research ID: {result.research_id}
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  )
}

export default Research 