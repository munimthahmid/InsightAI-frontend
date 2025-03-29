import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  HStack, 
  useColorMode, 
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaMoon, FaSun, FaChevronDown } from 'react-icons/fa'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box as="header" bg={bg} borderBottom="1px" borderColor={borderColor} py={4} px={8}>
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        <Heading 
          as={RouterLink} 
          to="/" 
          size="md" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
          bgClip="text"
        >
          AI Research Agent
        </Heading>
        
        <HStack spacing={4}>
          <Button
            as={RouterLink}
            to="/research"
            variant="ghost"
            colorScheme="brand"
            size="sm"
          >
            Research
          </Button>
          
          <Button
            as={RouterLink}
            to="/history"
            variant="ghost"
            colorScheme="brand"
            size="sm"
          >
            History
          </Button>
          
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              colorScheme="brand"
              size="sm"
              rightIcon={<FaChevronDown />}
            >
              Tools
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/templates">Research Templates</MenuItem>
              <MenuItem as={RouterLink} to="/compare">Compare Research</MenuItem>
            </MenuList>
          </Menu>

          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="brand"
            size="sm"
          />
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header 