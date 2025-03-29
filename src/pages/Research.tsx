import { useState } from 'react'
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
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { conductResearch, ResearchResponse } from '../api/researchApi'

const Research = () => {
  const [query, setQuery] = useState('')
  const [maxResults, setMaxResults] = useState<number | undefined>(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResearchResponse | null>(null)
  const toast = useToast()

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
      const response = await conductResearch({
        query: query.trim(),
        max_results_per_source: maxResults,
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
            
            <Box bg="gray.50" p={6} borderRadius="md" whiteSpace="pre-wrap" _dark={{ bg: 'gray.700' }}>
              {result.report}
            </Box>
            
            <Box mt={4}>
              <Text fontWeight="bold" mb={2}>Sources:</Text>
              <Box as="ul" pl={5}>
                {Object.entries(result.sources).map(([source, count]) => (
                  <Box as="li" key={source}>
                    {source}: {count} results
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </VStack>
    </Container>
  )
}

export default Research 