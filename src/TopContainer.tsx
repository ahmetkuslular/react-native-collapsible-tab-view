import React from 'react'
import { StyleSheet } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  Extrapolate,
  interpolate,
  withDecay,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated'

import { scrollToImpl } from './helpers'
import { useOnScroll, useSnap, useTabsContext } from './hooks'
import { CollapsibleProps } from './types'

type TabBarContainerProps = Pick<
  CollapsibleProps,
  'headerContainerStyle' | 'cancelTranslation' | 'children'
>

export const TopContainer: React.FC<TabBarContainerProps> = ({
  children,
  headerContainerStyle,
  cancelTranslation,
}) => {
  const {
    headerTranslateY,
    revealHeaderOnScroll,
    isSlidingTopContainer,
    scrollYCurrent,
    contentInset,
    refMap,
    tabNames,
    index,
    headerScrollDistance,
  } = useTabsContext()

  const isSlidingTopContainerPrev = useSharedValue(false)
  const isTopContainerOutOfSync = useSharedValue(false)
  const startY = useSharedValue(0)

  const tryToSnap = useSnap()
  const onScroll = useOnScroll()

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: headerTranslateY.value,
        },
      ],
    }
  }, [revealHeaderOnScroll])

  const syncActiveTabScroll = (position: number) => {
    'worklet'

    scrollToImpl(refMap[tabNames.value[index.value]], 0, position, false)
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event: any) => {
      if (!isSlidingTopContainer.value) {
        startY.value = scrollYCurrent.value
        isSlidingTopContainer.value = true
        return
      }
      scrollYCurrent.value = interpolate(
        -event.translationY + startY.value,
        [0, headerScrollDistance.value],
        [0, headerScrollDistance.value],
        Extrapolate.CLAMP
      )
    })
    .onEnd((event: any) => {
      if (!isSlidingTopContainer.value) return

      startY.value = 0
      scrollYCurrent.value = withDecay(
        {
          velocity: -event.velocityY,
          clamp: [0, headerScrollDistance.value],
          // deceleration: IS_IOS ? 0.998 : 0.99,
          deceleration: 0.998,
        },
        () => {
          isSlidingTopContainer.value = false
          isTopContainerOutOfSync.value = false
        }
      )
    })

  //Keeps updating the active tab scroll as we scroll on the top container element
  useAnimatedReaction(
    () => scrollYCurrent.value - contentInset.value,
    (nextPosition, previousPosition) => {
      if (nextPosition !== previousPosition && isSlidingTopContainer.value) {
        syncActiveTabScroll(nextPosition)
        onScroll()
      }
    }
  )

  /* Syncs the scroll of the active tab once we complete the scroll gesture
  on the header and the decay animation completes with success
   */
  useAnimatedReaction(
    () => {
      return (
        isSlidingTopContainer.value !== isSlidingTopContainerPrev.value &&
        isTopContainerOutOfSync.value
      )
    },
    (result) => {
      isSlidingTopContainerPrev.value = isSlidingTopContainer.value

      if (!result) return
      if (isSlidingTopContainer.value === true) return

      syncActiveTabScroll(scrollYCurrent.value - contentInset.value)
      onScroll()
      tryToSnap()

      isTopContainerOutOfSync.value = false
    }
  )

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          headerContainerStyle,
          !cancelTranslation && animatedStyles,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
})
