import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Radio,
  RadioGroup,
  Stack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Alert,
  AlertIcon,
  Flex,
} from '@chakra-ui/react';
import { FaArrowLeft, FaDownload, FaCopy } from 'react-icons/fa';
import { 
  getResearchById, 
  generateLiteratureReview, 
  LiteratureReviewResponse 
} from '../api/researchApi';
import ReactMarkdown from 'react-markdown';

const LiteratureReview = () => {
  const { id } = useParams<{ id: string }>();
  const [researchTitle, setResearchTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formatType, setFormatType] = useState<'APA' | 'MLA' | 'Chicago' | 'IEEE'>('APA');
  const [sectionFormat, setSectionFormat] = useState<'chronological' | 'thematic' | 'methodological'>('thematic');
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  const [literatureReview, setLiteratureReview] = useState<LiteratureReviewResponse | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  
  useEffect(() => {
    if (id) {
      fetchResearchInfo(id);
    }
  }, [id]);
  
  const fetchResearchInfo = async (researchId: string) => {
    try {
      setInitialLoading(true);
      const response = await getResearchById(researchId);
      setResearchTitle(response.query);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch research information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setInitialLoading(false);
    }
  };
  
  const handleGenerateLiteratureReview = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    setLiteratureReview(null);
    
    try {
      const response = await generateLiteratureReview({
        research_id: id,
        format_type: formatType,
        section_format: sectionFormat,
        max_length: maxLength,
      });
      
      setLiteratureReview(response);
    } catch (error) {
      setError('Failed to generate literature review. Please try again.');
      console.error('Literature review generation error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!literatureReview) return;
    
    navigator.clipboard.writeText(literatureReview.report)
      .then(() => {
        toast({
          title: 'Copied',
          description: 'Literature review copied to clipboard',
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
    if (!literatureReview) return;
    
    const element = document.createElement('a');
    const file = new Blob([literatureReview.report], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    
    // Create a safe filename using research ID
    const safeFilename = `literature_review_${literatureReview.research_id}`;
      
    element.download = safeFilename + '.md';
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
            onClick={() => navigate(`/research/${id}`)}
          >
            Back to Research
          </Button>
        </HStack>
        
        <Heading 
          textAlign="center" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
          bgClip="text"
        >
          Literature Review Generator
        </Heading>
        
        {initialLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text mt={4}>Loading research information...</Text>
          </Box>
        ) : (
          <>
            <Text textAlign="center" fontSize="lg">
              Generate a formal literature review for: <strong>{researchTitle}</strong>
            </Text>
            
            <Box bg="gray.50" p={6} borderRadius="md" _dark={{ bg: 'gray.700' }}>
              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel>Citation Format</FormLabel>
                  <RadioGroup value={formatType} onChange={(val) => setFormatType(val as any)}>
                    <Stack direction="row" spacing={4}>
                      <Radio value="APA">APA</Radio>
                      <Radio value="MLA">MLA</Radio>
                      <Radio value="Chicago">Chicago</Radio>
                      <Radio value="IEEE">IEEE</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Organization Style</FormLabel>
                  <Select 
                    value={sectionFormat} 
                    onChange={(e) => setSectionFormat(e.target.value as any)}
                  >
                    <option value="thematic">Thematic (by themes and concepts)</option>
                    <option value="chronological">Chronological (by time periods)</option>
                    <option value="methodological">Methodological (by research methods)</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Max Length (words, optional)</FormLabel>
                  <NumberInput
                    value={maxLength}
                    onChange={(_, val) => setMaxLength(val)}
                    min={500}
                    max={5000}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <Button
                  colorScheme="brand"
                  size="lg"
                  isLoading={loading}
                  loadingText="Generating..."
                  onClick={handleGenerateLiteratureReview}
                >
                  Generate Literature Review
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
                  Generating literature review... This may take a minute or two.
                </Text>
              </Box>
            )}
            
            {literatureReview && (
              <>
                <Divider my={4} />
                
                <Flex justify="space-between" align="center">
                  <Heading size="md">
                    Literature Review ({literatureReview.format_type} format)
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
                  <ReactMarkdown>{literatureReview.report}</ReactMarkdown>
                </Box>
              </>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default LiteratureReview; 