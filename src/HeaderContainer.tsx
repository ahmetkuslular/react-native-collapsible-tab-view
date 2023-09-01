import React from 'react'
import { StyleSheet, View, LayoutChangeEvent } from 'react-native'

import { useTabsContext } from './hooks'
import { CollapsibleProps, TabBarProps, TabName } from './types'

type HeaderContainerProps<T extends TabName = TabName> = Pick<
  CollapsibleProps,
  'renderHeader'
> &
  Pick<TabBarProps<T>, 'containerRef' | 'onTabPress' | 'tabProps'> & {
    tabNamesArray: TabName[]
  }

export const HeaderContainer: React.FC<HeaderContainerProps> = ({
  renderHeader,
  containerRef,
  tabNamesArray,
  onTabPress,
  tabProps,
}) => {
  const { headerHeight, focusedTab, index, indexDecimal } = useTabsContext()

  const getHeaderHeight = React.useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height
      if (headerHeight.value !== height) {
        headerHeight.value = height
      }
    },
    [headerHeight]
  )

  return (
    <View
      style={[styles.container, styles.headerContainer]}
      onLayout={getHeaderHeight}
      pointerEvents="box-none"
    >
      {renderHeader &&
        renderHeader({
          containerRef,
          index,
          tabNames: tabNamesArray,
          focusedTab,
          indexDecimal,
          onTabPress,
          tabProps,
        })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 2,
  },
})
