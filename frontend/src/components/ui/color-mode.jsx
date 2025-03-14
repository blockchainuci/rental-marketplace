'use client'

import { ClientOnly, IconButton, Skeleton } from '@chakra-ui/react'
import { ThemeProvider, useTheme } from 'next-themes'

import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'

export function ColorModeProvider(props) {
  return (
    // Disable dark mode
    //<ThemeProvider attribute='class' disableTransitionOnChange {...props} />
    <ThemeProvider {...props} attribute="class" defaultTheme="light" forcedTheme="light"/>
  )
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    // Disable dark mode
    //setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
    setTheme('light');
  }
  return {
    // Disable dark mode
    //colorMode: resolvedTheme,
    colorMode: 'light',
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue(light, dark) {
  const { colorMode } = useColorMode()
  // Disable dark mode
  // return colorMode === 'dark' ? dark : light
  return light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  // Disable dark mode
  //return colorMode === 'dark' ? <LuMoon /> : <LuSun />
  return <LuSun />
}

export const ColorModeButton = React.forwardRef(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode()
    return (
      <ClientOnly fallback={<Skeleton boxSize='8' />}>
        <IconButton
          onClick={toggleColorMode}
          variant='ghost'
          aria-label='Toggle color mode'
          size='sm'
          ref={ref}
          {...props}
          css={{
            _icon: {
              width: '5',
              height: '5',
            },
          }}
        >
          <ColorModeIcon />
        </IconButton>
      </ClientOnly>
    )
  },
)
