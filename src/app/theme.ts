import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#E6FFFA',
    100: '#B2F5EA',
    200: '#81E6D9',
    300: '#4FD1C5',
    400: '#38B2AC',
    500: '#319795',
    600: '#2C7A7B',
    700: '#285E61',
    800: '#234E52',
    900: '#1D4044',
  },
  background: {
    dark: '#121212', // Updated to a darker, more neutral background color
  },
}

const fonts = {
  heading: '"Poppins", sans-serif',
  body: '"Inter", sans-serif',
}

const styles = {
  global: {
    body: {
      bg: 'background.dark',
    },
  },
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'full',
    },
    variants: {
      solid: {
        bg: 'brand.200',
        color: 'gray.800',
        _hover: {
          bg: 'brand.300',
        },
      },
      outline: {
        borderColor: 'brand.200',
        color: 'brand.200',
        _hover: {
          bg: 'brand.200',
          color: 'gray.800',
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
      letterSpacing: 'tight',
    },
  },
  Link: {
    baseStyle: {
      color: 'brand.200',
      _hover: {
        textDecoration: 'none',
        color: 'brand.100',
      },
    },
  },
}

const theme = extendTheme({ 
  config,
  colors,
  fonts,
  styles,
  components,
})

export default theme