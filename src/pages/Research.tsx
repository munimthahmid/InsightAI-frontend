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
  Select,
  Switch,
  HStack,
  Flex,
  Badge,
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { 
  conductResearch, 
  ResearchResponse, 
  getTemplates, 
  TemplateResponse,
  researchWithTemplate
} from '../api/researchApi'
import ReactMarkdown from 'react-markdown'

const Research = () => {
  const [query, setQuery] = useState('')
  const [maxResults, setMaxResults] = useState<number | undefined>(5)
  const [loading, setLoading] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResearchResponse | null>(null)
  const [templates, setTemplates] = useState<TemplateResponse[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [useTemplate, setUseTemplate] = useState(false)
  const [saveToHistory, setSaveToHistory] = useState(true)
  const toast = useToast()

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const response = await getTemplates()
      setTemplates(response.templates)
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setTemplatesLoading(false)
    }
  }

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

    try {
      let response
      
      if (useTemplate && selectedTemplate) {
        // Research with template
        response = await researchWithTemplate({
          query: query.trim(),
          template_id: selectedTemplate,
          max_results_per_source: maxResults,
          save_history: saveToHistory
        })
      } else {
        // Standard research
        response = await conductResearch({
          query: query.trim(),
          max_results_per_source: maxResults,
          save_history: saveToHistory
        })
      }
      
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

            <HStack>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-template" mb="0">
                  Use Research Template
                </FormLabel>
                <Switch 
                  id="use-template" 
                  isChecked={useTemplate}
                  onChange={(e) => setUseTemplate(e.target.checked)}
                  colorScheme="brand"
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
            </HStack>

            {useTemplate && (
              <FormControl>
                <FormLabel>Select Template</FormLabel>
                <Select
                  placeholder={templatesLoading ? "Loading templates..." : "Select a template"}
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  isDisabled={templatesLoading}
                >
                  {templates.map(template => (
                    <option key={template.template_id} value={template.template_id}>
                      {template.name} ({template.domain})
                    </option>
                  ))}
                </Select>
                {selectedTemplate && (
                  <Text fontSize="sm" mt={1}>
                    {templates.find(t => t.template_id === selectedTemplate)?.description}
                  </Text>
                )}
              </FormControl>
            )}

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
            <Text mt={4} fontSize="lg">
              Researching your query... This may take a minute.
            </Text>
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
            
            {/* Show template info if used */}
            {result.metadata?.template && (
              <Flex align="center" mb={4}>
                <Text fontWeight="bold" mr={2}>Template:</Text>
                <Badge colorScheme="blue" mr={2}>{result.metadata.template.name}</Badge>
                <Badge colorScheme="green">{result.metadata.template.domain}</Badge>
              </Flex>
            )}
            
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
            
            <Box mt={6} p={4} bg="gray.100" borderRadius="md" _dark={{ bg: 'gray.800' }}>
              <Text fontWeight="bold" mb={2}>Sources:</Text>
              <Box as="ul" pl={5}>
                {Object.entries(result.sources).map(([source, count]) => (
                  <Box as="li" key={source}>
                    {source}: {count} results
                  </Box>
                ))}
              </Box>
            </Box>
            
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