import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Spinner, 
  Alert, 
  AlertIcon,
  HStack,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { getResearchById, deleteResearchById, ResearchResponse } from '../api/researchApi';
import ReactMarkdown from 'react-markdown';

const ResearchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [research, setResearch] = useState<ResearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingResearch, setDeletingResearch] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchResearch = async () => {
      try {
        const data = await getResearchById(id);
        setResearch(data);
      } catch (err) {
        console.error('Error fetching research:', err);
        setError('Failed to load research details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResearch();
  }, [id]);
  
  const handleDeleteResearch = async () => {
    if (!id) return;
    
    setDeletingResearch(true);
    try {
      await deleteResearchById(id);
      toast({
        title: 'Research deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/history');
    } catch (err) {
      console.error('Error deleting research:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete research',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingResearch(false);
    }
  };
  
  const renderFormattedMarkdown = (markdown: string) => {
    // Process the markdown content to add tooltips for citations
    if (!research?.citations) {
      return <ReactMarkdown>{markdown}</ReactMarkdown>;
    }
    
    // Replace citation links with tooltips
    const citationPattern = /\[(.*?)\]\(([^)]+)\)/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    
    // Create a regex that finds citation patterns
    const regex = new RegExp(citationPattern);
    
    // Iterate through all citation matches
    while ((match = regex.exec(markdown)) !== null) {
      const [fullMatch, text, chunkId] = match;
      const startIndex = match.index;
      
      // Add the text before this citation
      if (startIndex > lastIndex) {
        parts.push(
          <ReactMarkdown key={`text-${lastIndex}`}>
            {markdown.substring(lastIndex, startIndex)}
          </ReactMarkdown>
        );
      }
      
      // Add the citation with tooltip
      if (research.citations[chunkId]) {
        const citation = research.citations[chunkId];
        parts.push(
          <Tooltip 
            key={`citation-${startIndex}`} 
            label={`${citation.source_type}: ${citation.title}`}
            placement="top"
            hasArrow
          >
            <Link 
              color="blue.500" 
              href={`#citation-${chunkId}`}
              textDecoration="underline"
            >
              {text}
              <sup>[{chunkId}]</sup>
            </Link>
          </Tooltip>
        );
      } else {
        // If citation not found, just display as text
        parts.push(<span key={`citation-${startIndex}`}>{text}</span>);
      }
      
      lastIndex = startIndex + fullMatch.length;
    }
    
    // Add the remaining text
    if (lastIndex < markdown.length) {
      parts.push(
        <ReactMarkdown key={`text-${lastIndex}`}>
          {markdown.substring(lastIndex)}
        </ReactMarkdown>
      );
    }
    
    return <>{parts}</>;
  };
  
  return (
    <Container maxW="container.lg">
      <VStack spacing={6} align="stretch">
        <HStack>
          <Button 
            leftIcon={<FaArrowLeft />} 
            variant="ghost" 
            onClick={() => navigate('/history')}
          >
            Back to History
          </Button>
          
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={<FaTrash />}
            ml="auto"
            isLoading={deletingResearch}
            onClick={handleDeleteResearch}
          >
            Delete
          </Button>
        </HStack>
        
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text mt={4}>Loading research details...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : research ? (
          <>
            <Heading as="h1" size="xl">
              {research.query}
            </Heading>
            
            <HStack>
              {research.metadata?.template && (
                <>
                  <Badge colorScheme="blue">
                    {research.metadata.template.name}
                  </Badge>
                  <Badge colorScheme="green">
                    {research.metadata.template.domain}
                  </Badge>
                </>
              )}
              
              {research.research_id && (
                <Text fontSize="sm" color="gray.500">
                  ID: {research.research_id}
                </Text>
              )}
            </HStack>
            
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {Object.entries(research.sources).map(([source, count]) => (
                <Stat key={source} bg="gray.50" p={3} borderRadius="md" _dark={{ bg: 'gray.700' }}>
                  <StatLabel>{source.charAt(0).toUpperCase() + source.slice(1)}</StatLabel>
                  <StatNumber fontSize="2xl">{count}</StatNumber>
                  <StatHelpText>Sources</StatHelpText>
                </Stat>
              ))}
              
              {research.metadata?.processing_time?.total_time && (
                <Stat bg="gray.50" p={3} borderRadius="md" _dark={{ bg: 'gray.700' }}>
                  <StatLabel>Processing Time</StatLabel>
                  <StatNumber>
                    {research.metadata.processing_time.total_time.toFixed(2)}s
                  </StatNumber>
                  <StatHelpText>Total Processing Time</StatHelpText>
                </Stat>
              )}
            </SimpleGrid>
            
            <Divider my={4} />
            
            <Tabs colorScheme="brand" isFitted variant="enclosed">
              <TabList>
                <Tab>Research Report</Tab>
                <Tab>Citations & Evidence</Tab>
                <Tab>Metadata</Tab>
                {research.contradictions && Object.keys(research.contradictions).length > 0 && (
                  <Tab>Contradictions</Tab>
                )}
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <Box 
                    bg="gray.50" 
                    p={8} 
                    borderRadius="md"
                    boxShadow="md"
                    overflowX="auto" 
                    _dark={{ bg: 'gray.700' }}
                    className="markdown-content"
                  >
                    {renderFormattedMarkdown(research.report)}
                  </Box>
                </TabPanel>
                
                <TabPanel>
                  {research.citations && Object.keys(research.citations).length > 0 ? (
                    <Accordion allowMultiple>
                      {Object.entries(research.citations).map(([chunkId, citation]) => (
                        <AccordionItem key={chunkId} id={`citation-${chunkId}`}>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold">{citation.title}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {citation.source_type.toUpperCase()} citation
                                </Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4} bg="gray.50" _dark={{ bg: 'gray.600' }}>
                            <VStack align="stretch" spacing={3}>
                              {citation.url && (
                                <Link href={citation.url} color="blue.500" isExternal>
                                  View Source
                                </Link>
                              )}
                              <Box>
                                <Text fontWeight="bold">Evidence:</Text>
                                <Text mt={1}>{citation.text}</Text>
                              </Box>
                              {Object.entries(citation.additional_info).length > 0 && (
                                <Box>
                                  <Text fontWeight="bold">Additional Information:</Text>
                                  <SimpleGrid columns={2} spacing={2} mt={1}>
                                    {Object.entries(citation.additional_info).map(([key, value]) => (
                                      <Text key={key}>
                                        <strong>{key}:</strong> {value}
                                      </Text>
                                    ))}
                                  </SimpleGrid>
                                </Box>
                              )}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Box p={4} bg="gray.50" borderRadius="md" _dark={{ bg: 'gray.700' }}>
                      <Text>No citation data available for this research.</Text>
                    </Box>
                  )}
                </TabPanel>
                
                <TabPanel>
                  <Box bg="gray.50" p={6} borderRadius="md" _dark={{ bg: 'gray.700' }}>
                    <Heading size="md" mb={4}>Metadata</Heading>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontWeight="bold">Research ID:</Text>
                        <Text>{research.research_id || id}</Text>
                      </Box>
                      
                      {research.metadata?.processing_time && (
                        <Box>
                          <Text fontWeight="bold">Processing Times:</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} mt={2}>
                            <Text>Data Fetch: {research.metadata.processing_time.fetch_time}s</Text>
                            <Text>Vector Processing: {research.metadata.processing_time.process_time}s</Text>
                            <Text>Query Time: {research.metadata.processing_time.query_time}s</Text>
                            <Text>Report Generation: {research.metadata.processing_time.report_time}s</Text>
                          </SimpleGrid>
                        </Box>
                      )}
                      
                      {research.metadata?.template && (
                        <Box>
                          <Text fontWeight="bold">Template Used:</Text>
                          <Text>{research.metadata.template.name} ({research.metadata.template.domain})</Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </TabPanel>
                
                {research.contradictions && Object.keys(research.contradictions).length > 0 && (
                  <TabPanel>
                    <Box bg="gray.50" p={6} borderRadius="md" _dark={{ bg: 'gray.700' }}>
                      <Heading size="md" mb={4}>Contradictions Found</Heading>
                      <VStack align="stretch" spacing={4}>
                        {Object.entries(research.contradictions).map(([topic, views]) => (
                          <Box key={topic} p={4} borderWidth="1px" borderRadius="md">
                            <Heading size="sm" mb={2}>{topic}</Heading>
                            <VStack align="stretch" spacing={2}>
                              {views.map((view, index) => (
                                <Box 
                                  key={index} 
                                  p={3} 
                                  bg={index % 2 === 0 ? "blue.50" : "red.50"} 
                                  borderRadius="md"
                                  _dark={{
                                    bg: index % 2 === 0 ? "blue.900" : "red.900",
                                  }}
                                >
                                  <Text>{view.statement}</Text>
                                  <Text fontSize="sm" mt={1}>
                                    Source: {view.source_type} - {view.source_title}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </>
        ) : (
          <Alert status="warning">
            <AlertIcon />
            Research not found
          </Alert>
        )}
      </VStack>
    </Container>
  );
};

export default ResearchDetail; 