import { Box, Text, Flex, Link } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Box as="footer" py={4} bg="brand.600" color="white">
      <Flex direction="column" align="center" maxW="1200px" mx="auto">
        <Text fontSize="sm">
          © {new Date().getFullYear()} AI Research Agent - Powered by FastAPI and React
        </Text>
        <Text fontSize="xs" mt={1}>
          <Link href="https://github.com" isExternal>
            GitHub
          </Link>
          {' • '}
          <Link href="https://openai.com" isExternal>
            OpenAI
          </Link>
          {' • '}
          <Link href="https://pinecone.io" isExternal>
            Pinecone
          </Link>
        </Text>
      </Flex>
    </Box>
  )
}

export default Footer 