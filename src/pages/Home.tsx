import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  SimpleGrid, 
  Icon, 
  useColorModeValue 
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaSearch, FaDatabase, FaRobot, FaBookReader } from 'react-icons/fa'

const features = [
  {
    icon: FaSearch,
    title: 'Multi-Source Research',
    description: 'Fetches data from ArXiv, News, GitHub, and Wikipedia for comprehensive research.'
  },
  {
    icon: FaDatabase,
    title: 'Vector Database',
    description: 'Utilizes Pinecone for efficient storage and retrieval of semantic information.'
  },
  {
    icon: FaRobot,
    title: 'AI-Powered',
    description: 'Leverages OpenAI models for intelligent summarization and insights.'
  },
  {
    icon: FaBookReader,
    title: 'Detailed Reports',
    description: 'Generates structured research reports with citations and references.'
  }
]

const Home = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBg = useColorModeValue('white', 'gray.700')

  return (
    <Container maxW="container.xl">
      <VStack spacing={10} alignItems="center" textAlign="center">
        <Box py={10}>
          <Heading 
            as="h1" 
            size="2xl" 
            bgGradient="linear(to-r, brand.400, brand.600)" 
            bgClip="text"
            lineHeight="1.2"
            mb={4}
          >
            Autonomous AI Research Agent
          </Heading>
          <Text fontSize="xl" maxW="container.md" mb={8}>
            An intelligent system that autonomously researches any topic by fetching data 
            from multiple sources and providing comprehensive summaries.
          </Text>
          <Button 
            as={RouterLink} 
            to="/research" 
            size="lg" 
            colorScheme="brand" 
            leftIcon={<FaSearch />}
          >
            Start Researching
          </Button>
        </Box>

        <Box w="full" py={10} bg={bgColor} borderRadius="lg">
          <Heading as="h2" size="xl" mb={10} textAlign="center">
            Key Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} px={8}>
            {features.map((feature, index) => (
              <Box 
                key={index} 
                bg={cardBg} 
                p={6} 
                borderRadius="md" 
                shadow="md" 
                textAlign="center"
              >
                <Icon as={feature.icon} w={10} h={10} color="brand.500" mb={4} />
                <Heading as="h3" size="md" mb={2}>
                  {feature.title}
                </Heading>
                <Text>{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  )
}

export default Home 