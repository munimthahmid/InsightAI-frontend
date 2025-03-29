import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Divider,
  Spinner,
  useToast,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { 
  getTemplates, 
  researchWithTemplate,
  TemplateResponse
} from '../api/researchApi';

// Update the interface to include focus_areas
interface ExtendedTemplateResponse extends TemplateResponse {
  focus_areas: string[];
}

const Templates = () => {
  const [templates, setTemplates] = useState<ExtendedTemplateResponse[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ExtendedTemplateResponse[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedTemplateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [researchLoading, setResearchLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState<number>(5);
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [domains, setDomains] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Apply filters when templates, domain filter, or search filter changes
  useEffect(() => {
    applyFilters();
  }, [templates, domainFilter]);
  
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getTemplates();
      // Cast the templates to ExtendedTemplateResponse type
      setTemplates(response.templates as ExtendedTemplateResponse[]);
      
      // Extract unique domains for filter
      const uniqueDomains = [...new Set(response.templates.map(t => t.domain))];
      setDomains(uniqueDomains);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...templates];
    
    // Apply domain filter
    if (domainFilter) {
      filtered = filtered.filter(t => t.domain === domainFilter);
    }
    
    setFilteredTemplates(filtered);
  };
  
  const handleTemplateClick = (template: ExtendedTemplateResponse) => {
    setSelectedTemplate(template);
    onOpen();
  };
  
  const handleResearch = async () => {
    if (!selectedTemplate || !query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a research query',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setResearchLoading(true);
    
    try {
      const result = await researchWithTemplate({
        query: query.trim(),
        template_id: selectedTemplate.template_id,
        max_results_per_source: maxResults,
      });
      
      // Close modal and navigate to the research result
      onClose();
      navigate(`/research/${result.research_id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to conduct research with template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setResearchLoading(false);
    }
  };
  
  return (
    <Container maxW="container.xl">
      <VStack spacing={6} align="stretch">
        <Heading 
          textAlign="center" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
          bgClip="text"
        >
          Research Templates
        </Heading>
        
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text mt={4}>Loading templates...</Text>
          </Box>
        ) : (
          <>
            <HStack spacing={4}>
              <FormControl maxW="300px">
                <FormLabel>Filter by Domain</FormLabel>
                <Select 
                  placeholder="All Domains" 
                  value={domainFilter} 
                  onChange={(e) => setDomainFilter(e.target.value)}
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </Select>
              </FormControl>
            </HStack>
            
            {filteredTemplates.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg">No templates found</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredTemplates.map(template => (
                  <Box 
                    key={template.template_id}
                    bg="gray.50"
                    _dark={{ bg: 'gray.700' }}
                    p={5}
                    borderRadius="md"
                    shadow="md"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
                    cursor="pointer"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <Heading size="md" mb={2}>{template.name}</Heading>
                    <Badge colorScheme="blue" mb={3}>{template.domain}</Badge>
                    <Text noOfLines={3} mb={4}>{template.description}</Text>
                    
                    <Text fontWeight="bold" fontSize="sm" mb={2}>Focus Areas:</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {template.focus_areas.map(area => (
                        <Badge key={area} colorScheme="green" my={1}>
                          {area}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </VStack>
      
      {/* Template Use Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedTemplate?.name}
            <Badge ml={2} colorScheme="blue">{selectedTemplate?.domain}</Badge>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>{selectedTemplate?.description}</Text>
              
              <HStack spacing={2} flexWrap="wrap">
                {selectedTemplate?.focus_areas.map(area => (
                  <Badge key={area} colorScheme="green">
                    {area}
                  </Badge>
                ))}
              </HStack>
              
              <Divider />
              
              <Heading size="sm" mb={2}>Research with this Template</Heading>
              
              <FormControl isRequired>
                <FormLabel>Research Query</FormLabel>
                <Input
                  placeholder="Enter your research topic or question"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Max Results Per Source</FormLabel>
                <Select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                >
                  <option value={3}>3 results</option>
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={15}>15 results</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              leftIcon={<FaSearch />}
              isLoading={researchLoading}
              loadingText="Researching..."
              onClick={handleResearch}
              isDisabled={!query.trim() || researchLoading}
            >
              Research
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Templates; 