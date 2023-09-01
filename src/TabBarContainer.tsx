import React from 'react'
import { View, LayoutChangeEvent, StyleSheet } from 'react-native'

import { useTabsContext } from './hooks'
import { CollapsibleProps, TabBarProps, TabName } from './types'

type TabBarContainerProps<T extends TabName = TabName> = Pick<
  CollapsibleProps,
  'renderTabBar' | 'width'
> &
  Pick<TabBarProps<T>, 'onTabPress' | 'tabProps' | 'containerRef'> & {
    tabNamesArray: TabName[]
  }

export const TabBarContainer: React.FC<TabBarContainerProps> = ({
  renderTabBar,
  onTabPress,
  tabProps,
  tabNamesArray,
  containerRef,
  width,
}) => {
  const { tabBarHeight, focusedTab, index, indexDecimal } = useTabsContext()

  const getTabBarHeight = React.useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height
      if (tabBarHeight.value !== height) tabBarHeight.value = height
    },
    [tabBarHeight]
  )

  return (
    <View
      style={[styles.container, styles.tabBarContainer]}
      onLayout={getTabBarHeight}
      pointerEvents="box-none"
    >
      {renderTabBar &&
        renderTabBar({
          containerRef,
          index,
          tabNames: tabNamesArray,
          focusedTab,
          indexDecimal,
          width,
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
  tabBarContainer: {
    zIndex: 1,
  },
})
