import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Checkbox,
  HStack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { FaTrash, FaEye, FaFileAlt, FaExchangeAlt } from 'react-icons/fa';
import { getResearchHistory, deleteResearchById, ResearchHistoryItem } from '../api/researchApi';

const ResearchHistory = () => {
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    fetchHistory();
  }, []);
  
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getResearchHistory();
      setHistory(response.items);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch research history',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewResearch = (id: string) => {
    navigate(`/research/${id}`);
  };
  
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    onOpen();
  };
  
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteResearchById(itemToDelete);
      setHistory(history.filter(item => item.research_id !== itemToDelete));
      toast({
        title: 'Success',
        description: 'Research deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete research',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setItemToDelete(null);
      onClose();
    }
  };
  
  const handleCheckboxChange = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const handleCompareSelected = () => {
    if (selectedItems.length < 2) {
      toast({
        title: 'Error',
        description: 'Please select at least 2 items to compare',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Navigate to compare page with selected items
    navigate(`/compare?ids=${selectedItems.join(',')}`);
  };
  
  const handleGenerateLiteratureReview = (id: string) => {
    navigate(`/literature-review/${id}`);
  };
  
  // Format date string for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };
  
  return (
    <Container maxW="container.xl">
      <VStack spacing={6} align="stretch">
        <Heading 
          textAlign="center" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
          bgClip="text"
        >
          Research History
        </Heading>
        
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text mt={4}>Loading research history...</Text>
          </Box>
        ) : history.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl">No research history found</Text>
            <Button 
              mt={4} 
              colorScheme="brand" 
              onClick={() => navigate('/research')}
            >
              Start a New Research
            </Button>
          </Box>
        ) : (
          <>
            <Flex justify="space-between" align="center">
              <Text>Total Items: {history.length}</Text>
              
              <HStack>
                <Button
                  colorScheme="blue"
                  leftIcon={<FaExchangeAlt />}
                  onClick={handleCompareSelected}
                  isDisabled={selectedItems.length < 2}
                  size="sm"
                >
                  Compare Selected ({selectedItems.length})
                </Button>
              </HStack>
            </Flex>
            
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th width="50px"></Th>
                    <Th>Query</Th>
                    <Th>Date</Th>
                    <Th>Sources</Th>
                    <Th width="200px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {history.map(item => (
                    <Tr key={item.research_id}>
                      <Td>
                        <Checkbox
                          isChecked={selectedItems.includes(item.research_id)}
                          onChange={() => handleCheckboxChange(item.research_id)}
                        />
                      </Td>
                      <Td>
                        <Text fontWeight="medium">{item.query}</Text>
                        {item.template_id && (
                          <Badge colorScheme="blue" mt={1}>Template</Badge>
                        )}
                      </Td>
                      <Td>
                        {item.timestamp 
                          ? formatTimestamp(item.timestamp)
                          : item.saved_at
                            ? formatDate(item.saved_at)
                            : 'Unknown'
                        }
                      </Td>
                      <Td>
                        <Flex flexWrap="wrap" gap={1}>
                          {item.sources_used?.map((source, idx) => (
                            <Badge key={idx} colorScheme="green">{source}</Badge>
                          ))}
                          {!item.sources_used && item.metadata?.sources && 
                            Object.keys(item.metadata.sources).map((source, idx) => (
                              <Badge key={idx} colorScheme="green">{source}</Badge>
                            ))
                          }
                        </Flex>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<FaEye />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleViewResearch(item.research_id)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FaFileAlt />}
                            colorScheme="green"
                            variant="outline"
                            onClick={() => handleGenerateLiteratureReview(item.research_id)}
                          >
                            Lit Review
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FaTrash />}
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleDeleteClick(item.research_id)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </VStack>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Research
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this research? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default ResearchHistory; 