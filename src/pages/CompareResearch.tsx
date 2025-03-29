import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Flex,
  Badge,
  Select,
  Checkbox,
  Alert,
  AlertIcon,
  CloseButton,
} from '@chakra-ui/react';
import { FaArrowLeft, FaDownload, FaCopy, FaSync } from 'react-icons/fa';
import { 
  getResearchHistory, 
  getResearchById, 
  compareResearch,
  ResearchHistoryItem,
  ResearchResponse,
  ComparisonResponse,
} from '../api/researchApi';
import ReactMarkdown from 'react-markdown';

// Helper function to parse search parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const CompareResearch = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [historyItems, setHistoryItems] = useState<ResearchHistoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<ResearchResponse[]>([]);
  const [comparisonAspects, setComparisonAspects] = useState<string[]>([
    'Main findings',
    'Methodology',
    'Data sources',
    'Key conclusions',
  ]);
  const [customAspect, setCustomAspect] = useState('');
  const [includeVisualization, setIncludeVisualization] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On initial load, fetch research history and check for IDs in URL
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch research history
        const response = await getResearchHistory();
        setHistoryItems(response.items);
        
        // Check if we have IDs in URL
        const idsParam = query.get('ids');
        if (idsParam) {
          const ids = idsParam.split(',');
          setSelectedItems(ids);
          
          // Fetch details for each selected research
          const selectedDetails = await Promise.all(
            ids.map(id => getResearchById(id))
          );
          setSelectedResearch(selectedDetails);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load research data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // When selected items change, fetch their details
  useEffect(() => {
    const fetchSelectedDetails = async () => {
      if (selectedItems.length === 0) {
        setSelectedResearch([]);
        return;
      }
      
      try {
        const selectedDetails = await Promise.all(
          selectedItems.map(id => getResearchById(id))
        );
        setSelectedResearch(selectedDetails);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch details for selected research',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchSelectedDetails();
  }, [selectedItems]);
  
  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value && !selectedItems.includes(value)) {
      setSelectedItems([...selectedItems, value]);
    }
  };
  
  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item !== id));
  };
  
  const handleAddCustomAspect = () => {
    if (customAspect.trim() && !comparisonAspects.includes(customAspect.trim())) {
      setComparisonAspects([...comparisonAspects, customAspect.trim()]);
      setCustomAspect('');
    }
  };
  
  const handleRemoveAspect = (aspect: string) => {
    setComparisonAspects(comparisonAspects.filter(a => a !== aspect));
  };
  
  const handleCompare = async () => {
    if (selectedItems.length < 2) {
      toast({
        title: 'Error',
        description: 'Please select at least 2 research items to compare',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    setComparisonResult(null);
    
    try {
      const result = await compareResearch({
        research_ids: selectedItems,
        comparison_aspects: comparisonAspects,
        include_visualization: includeVisualization,
      });
      
      setComparisonResult(result);
    } catch (error) {
      setError('Failed to generate comparison. Please try again.');
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!comparisonResult) return;
    
    navigator.clipboard.writeText(comparisonResult.comparison_result)
      .then(() => {
        toast({
          title: 'Copied',
          description: 'Comparison copied to clipboard',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };
  
  const handleDownload = () => {
    if (!comparisonResult) return;
    
    const element = document.createElement('a');
    const file = new Blob([comparisonResult.comparison_result], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    
    // Create a filename based on topics
    const topicsSlug = comparisonResult.topics
      .map(t => t.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 20))
      .join('_vs_');
      
    element.download = `comparison_${topicsSlug}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Container maxW="container.xl">
      <VStack spacing={6} align="stretch">
        <HStack>
          <Button 
            leftIcon={<FaArrowLeft />} 
            variant="ghost" 
            onClick={() => navigate('/history')}
          >
            Back to History
          </Button>
        </HStack>
        
        <Heading 
          textAlign="center" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
          bgClip="text"
        >
          Compare Research
        </Heading>
        
        {initialLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text mt={4}>Loading research data...</Text>
          </Box>
        ) : (
          <>
            <Box bg="gray.50" p={6} borderRadius="md" _dark={{ bg: 'gray.700' }}>
              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel>Select Research to Compare</FormLabel>
                  <Select 
                    placeholder="Add research to comparison" 
                    onChange={handleItemChange}
                    value=""
                  >
                    {historyItems.map(item => (
                      <option 
                        key={item.research_id} 
                        value={item.research_id}
                        disabled={selectedItems.includes(item.research_id)}
                      >
                        {item.query}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedResearch.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Selected Items:</Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedResearch.map(item => (
                        <Flex 
                          key={item.research_id} 
                          p={2} 
                          bg="gray.100" 
                          borderRadius="md" 
                          justify="space-between"
                          align="center"
                          _dark={{ bg: 'gray.600' }}
                        >
                          <Text>{item.query}</Text>
                          <CloseButton 
                            onClick={() => handleRemoveItem(item.research_id || '')}
                          />
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}
                
                <Divider />
                
                <FormControl>
                  <FormLabel>Comparison Aspects</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    {comparisonAspects.map(aspect => (
                      <Flex 
                        key={aspect} 
                        p={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        justify="space-between"
                        align="center"
                        _dark={{ bg: 'gray.600' }}
                      >
                        <Text>{aspect}</Text>
                        <CloseButton 
                          onClick={() => handleRemoveAspect(aspect)}
                        />
                      </Flex>
                    ))}
                  </VStack>
                  
                  <HStack mt={3}>
                    <Input 
                      placeholder="Add custom aspect to compare" 
                      value={customAspect}
                      onChange={(e) => setCustomAspect(e.target.value)}
                    />
                    <Button onClick={handleAddCustomAspect}>Add</Button>
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <Checkbox 
                    isChecked={includeVisualization} 
                    onChange={(e) => setIncludeVisualization(e.target.checked)}
                  >
                    Include comparison table
                  </Checkbox>
                </FormControl>
                
                <Button
                  colorScheme="brand"
                  size="lg"
                  leftIcon={<FaSync />}
                  isLoading={loading}
                  loadingText="Comparing..."
                  onClick={handleCompare}
                  isDisabled={selectedItems.length < 2}
                >
                  Generate Comparison
                </Button>
              </VStack>
            </Box>
            
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            {loading && (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text mt={4}>
                  Generating comparison... This may take a minute or two.
                </Text>
              </Box>
            )}
            
            {comparisonResult && (
              <>
                <Divider my={4} />
                
                <Flex justify="space-between" align="center">
                  <Heading size="md">
                    Comparison Results
                  </Heading>
                  
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FaCopy />}
                      onClick={handleCopyToClipboard}
                      size="sm"
                    >
                      Copy
                    </Button>
                    <Button
                      leftIcon={<FaDownload />}
                      onClick={handleDownload}
                      size="sm"
                    >
                      Download
                    </Button>
                  </HStack>
                </Flex>
                
                <Box 
                  bg="gray.50" 
                  p={8} 
                  borderRadius="md"
                  boxShadow="md" 
                  _dark={{ bg: 'gray.700' }}
                  className="markdown-content" 
                  overflowX="auto"
                >
                  <ReactMarkdown>{comparisonResult.comparison_result}</ReactMarkdown>
                </Box>
              </>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default CompareResearch; 