import { Box, Flex, Heading, Button, HStack, useColorMode } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaMoon, FaSun } from 'react-icons/fa'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="header" bg="brand.600" color="white" px={4} py={3} shadow="md">
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <Heading as={RouterLink} to="/" size="lg" fontWeight="bold" _hover={{ textDecoration: 'none' }}>
          AI Research Agent
        </Heading>
        
        <HStack spacing={4}>
          <Button as={RouterLink} to="/" variant="ghost" colorScheme="whiteAlpha">
            Home
          </Button>
          <Button as={RouterLink} to="/research" variant="ghost" colorScheme="whiteAlpha">
            Research
          </Button>
          <Button 
            onClick={toggleColorMode} 
            variant="ghost" 
            colorScheme="whiteAlpha"
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          >
            {colorMode === 'light' ? <FaMoon /> : <FaSun />}
          </Button>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header 