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
  Flex,
} from '@chakra-ui/react';
import { FaArrowLeft, FaTrash, FaBookOpen, FaSearch } from 'react-icons/fa';
import { getResearchById, deleteResearchById, ResearchResponse, generateLiteratureReview, generateFocusedReport } from '../api/researchApi';
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

  const handleGenerateLiteratureReview = () => {
    if (!id) return;
    navigate(`/literature-review/${id}`);
  };

  const handleGenerateFocusedReport = () => {
    if (!id) return;
    navigate(`/focused-report/${id}`);
  };
  
  const getSourceColor = (sourceType: string): string => {
    const colorMap: Record<string, string> = {
      'arxiv': 'teal',
      'web': 'blue',
      'news': 'purple',
      'semantic_scholar': 'red',
      'github': 'green',
      'wikipedia': 'orange',
      'research': 'pink'
    };
    
    return colorMap[sourceType] || 'gray';
  };

  const renderReferencesSection = (content: string) => {
    const lines = content.split('\n\n').filter(line => line.trim());
    
    return (
      <VStack align="start" spacing={2} width="100%">
        {lines.map((line, index) => {
          // Extract citation key and content
          const keyMatch = line.match(/^\[(.*?)\]/);
          if (!keyMatch) return <Text key={index}>{line}</Text>;
          
          const key = keyMatch[0];
          const restContent = line.substring(key.length).trim();
          
          // Extract source type from key [source-number]
          const sourceMatch = key.match(/\[(.*?)-\d+\]/);
          const sourceType = sourceMatch ? sourceMatch[1] : 'unknown';
          const sourceColor = getSourceColor(sourceType);
          
          // Check for URL links in markdown format - more flexible regex
          // This handles [url](url) format or plain URLs
          const urlRegex = /\[(https?:\/\/[^\s\]]+)\]\((https?:\/\/[^\s\)]+)\)/;
          const plainUrlRegex = /(https?:\/\/[^\s\)]+)/;
          
          const urlMatch = restContent.match(urlRegex);
          const plainUrlMatch = !urlMatch ? restContent.match(plainUrlRegex) : null;
          
          // Get the URL from either regex match
          const url = urlMatch ? urlMatch[2] : (plainUrlMatch ? plainUrlMatch[1] : null);
          
          return (
            <Box 
              key={index} 
              width="100%" 
              p={3} 
              mb={2}
              borderLeftWidth="4px" 
              borderLeftColor={`${sourceColor}.400`}
              borderRadius="md"
              bg={`${sourceColor}.50`}
              boxShadow="sm"
            >
              <Flex alignItems="center" mb={1}>
                <Text as="span" fontWeight="bold" mr={2}>{key}</Text>
                <Badge colorScheme={sourceColor}>{sourceType}</Badge>
              </Flex>
              
              <Text>
                {url ? (
                  <>
                    {/* Extract the text before the URL using the appropriate match pattern */}
                    {urlMatch 
                      ? restContent.substring(0, urlMatch.index || 0)
                      : (plainUrlMatch 
                          ? restContent.substring(0, plainUrlMatch.index || 0) 
                          : restContent)
                    }
                    <Link href={url} isExternal color={`${sourceColor}.600`} fontWeight="medium">
                      Visit Source
                    </Link>
                    {/* Extract the text after the URL using the appropriate match pattern */}
                    {urlMatch 
                      ? restContent.substring((urlMatch.index || 0) + urlMatch[0].length)
                      : (plainUrlMatch 
                          ? restContent.substring((plainUrlMatch.index || 0) + plainUrlMatch[0].length)
                          : '')
                    }
                  </>
                ) : restContent}
              </Text>
            </Box>
          );
        })}
      </VStack>
    );
  };

  const renderFormattedMarkdown = (markdown: string) => {
    // Process the markdown content to add tooltips for citations
    if (!research?.citations) {
      return <ReactMarkdown>{markdown}</ReactMarkdown>;
    }
    
    // Split the markdown to handle References section separately
    // This regex captures the entire references section including heading
    const referencesSectionRegex = /\n## References\n([\s\S]*?)(\n## |$)/;
    const referencesMatch = markdown.match(referencesSectionRegex);
    
    let mainContent = markdown;
    let referencesContent = null;
    
    if (referencesMatch) {
      // Exclude references section from main content
      const fullMatch = referencesMatch[0];
      const matchIndex = markdown.indexOf(fullMatch);
      mainContent = markdown.substring(0, matchIndex);
      
      // Extract the References content (without the heading)
      referencesContent = referencesMatch[1];
      
      // Check for duplicated References sections (might happen with reports enhanced by the backend)
      const remainingContent = markdown.substring(matchIndex + fullMatch.length);
      const secondRefMatch = remainingContent.match(/\n## References\n/);
      if (secondRefMatch) {
        console.log("Detected duplicate References section - showing only the first one");
      }
    }
    
    // Replace citation links with tooltips in main content
    const citationPattern = /\[(.*?)\]\(([^)]+)\)/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    
    // Create a regex that finds citation patterns
    const regex = new RegExp(citationPattern);
    
    // Iterate through all citation matches
    while ((match = regex.exec(mainContent)) !== null) {
      const [fullMatch, text, chunkId] = match;
      const startIndex = match.index;
      
      // Add the text before this citation
      if (startIndex > lastIndex) {
        parts.push(
          <ReactMarkdown key={`text-${lastIndex}`}>
            {mainContent.substring(lastIndex, startIndex)}
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
    if (lastIndex < mainContent.length) {
      parts.push(
        <ReactMarkdown key={`text-${lastIndex}`}>
          {mainContent.substring(lastIndex)}
        </ReactMarkdown>
      );
    }
    
    // Return main content and references section separately
    return (
      <>
        {parts}
        {referencesContent && (
          <>
            <Heading as="h2" size="lg" mt={6} mb={2}>References</Heading>
            <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
              {renderReferencesSection(referencesContent)}
            </Box>
          </>
        )}
      </>
    );
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
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

            <Flex justifyContent="flex-end" gap={3}>
              <Button 
                leftIcon={<FaBookOpen />}
                colorScheme="blue"
                onClick={handleGenerateLiteratureReview}
                size="sm"
              >
                Generate Literature Review
              </Button>
              <Button 
                leftIcon={<FaSearch />}
                colorScheme="green"
                onClick={handleGenerateFocusedReport}
                size="sm"
              >
                Generate Focused Report
              </Button>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Sources</StatLabel>
                <StatNumber>{research.sources_used?.length || 0}</StatNumber>
                <StatHelpText>
                  {research.sources_used?.map(source => (
                    <Badge key={source} mr={1}>{source}</Badge>
                  ))}
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Results</StatLabel>
                <StatNumber>{research.result_count}</StatNumber>
                <StatHelpText>Documents processed</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Date</StatLabel>
                <StatNumber>{research.timestamp ? formatDate(research.timestamp) : 'Unknown'}</StatNumber>
                <StatHelpText>
                  {research.template_id && <Badge colorScheme="blue">Template Used</Badge>}
                </StatHelpText>
              </Stat>
            </SimpleGrid>
            
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Report</Tab>
                <Tab>Sources</Tab>
                {research.citations && Object.keys(research.citations).length > 0 && (
                  <Tab>Citations</Tab>
                )}
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <Box className="research-report">
                    {renderFormattedMarkdown(research.report)}
                  </Box>
                </TabPanel>
                
                <TabPanel>
                  <Box>
                    <Heading as="h3" size="md" mb={4}>Sources Used</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {research.sources_used?.map((source, index) => (
                        <Box 
                          key={index}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <Badge mb={2}>{source}</Badge>
                          <Text fontWeight="bold">{source} Sources</Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                </TabPanel>
                
                {research.citations && (
                  <TabPanel>
                    <Box>
                      <Heading as="h3" size="md" mb={4}>Citations</Heading>
                      <Accordion allowMultiple>
                        {Object.entries(research.citations).map(([id, citation]) => (
                          <AccordionItem key={id} id={`citation-${id}`}>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold">{citation.title}</Text>
                                <Badge mr={2}>{citation.source_type}</Badge>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <Text mb={2}>{citation.text}</Text>
                              {citation.url && (
                                <Link href={citation.url} isExternal color="blue.500">
                                  Source Link
                                </Link>
                              )}
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
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