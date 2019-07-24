import React, { useState, useCallback, createRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableHighlight,
  PanResponder,
  FlatList,
  SafeAreaView,
  PanResponderInstance,
  Animated
} from "react-native";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function immutableMove(arr, from, to) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
}

const colorMap = {};

export default class App extends React.Component {
  state = {
    dragging: false,
    draggingIdx: -1,
    data: Array.from(Array(200), (_, i) => {
      colorMap[i] = getRandomColor();
      return i;
    })
  };

  _panResponder: PanResponderInstance;
  flatList = createRef<FlatList<any>>();
  point = new Animated.ValueXY();
  rowHeight = 0;
  currentY = -1;
  scrollOffset = 0;
  flatlistHeight = -1;
  topOffset = 0;
  currIdx = 0;
  active = false;

  constructor(props) {
    super(props);

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        this.active = true;
        Animated.event([{ y: this.point.y }])({
          y: gestureState.y0 - this.rowHeight / 2
        });
        this.currIdx = this.yToIndex(gestureState.y0);
        this.setState(
          {
            dragging: true,
            draggingIdx: this.currIdx
          },
          () => {
            this.animateList();
          }
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        this.currentY = gestureState.moveY;
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        Animated.event([{ y: this.point.y }])({
          y: gestureState.moveY - this.rowHeight / 2
        });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.reset();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.reset();
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      }
    });
  }

  yToIndex = (y: number) =>
    Math.min(
      this.state.data.length - 1,
      Math.max(
        0,
        Math.floor((y + this.scrollOffset - this.topOffset) / this.rowHeight)
      )
    );

  reset = () => {
    this.active = false;
    this.setState({ dragging: false, draggingIdx: -1 });
    this.currentY = -1;
  };

  animateList = () => {
    if (!this.active) {
      return;
    }

    requestAnimationFrame(() => {
      if (this.currentY !== -1 && this.flatlistHeight !== -1) {
        // console.log(this.currentY + 100, this.flatlistHeight, this.contentY);
        if (this.currentY + 100 > this.flatlistHeight) {
          this.flatList.current.scrollToOffset({
            offset: this.scrollOffset + 5,
            animated: false
          });
        } else if (this.currentY < 100) {
          this.flatList.current.scrollToOffset({
            offset: this.scrollOffset - 5,
            animated: false
          });
        }

        const newIdx = this.yToIndex(this.currentY);
        if (this.currIdx !== newIdx) {
          const data = immutableMove(this.state.data, this.currIdx, newIdx);
          console.log("baddie");
          // console.log(this.currIdx, newIdx, data);
          this.currIdx = newIdx;
          this.setState({
            draggingIdx: newIdx,
            data
          });
        }
      }

      this.animateList();
    });
  };

  render() {
    const { dragging, draggingIdx, data } = this.state;

    const renderItem = ({ item, index }, nope = false) => {
      return (
        <View
          style={{
            padding: 16,
            backgroundColor: colorMap[item],
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            opacity: !nope && index === draggingIdx ? 0 : 1
          }}
          onLayout={e => {
            this.rowHeight = e.nativeEvent.layout.height;
          }}
        >
          <View {...(nope ? {} : this._panResponder.panHandlers)}>
            <Text style={{ fontSize: 32 }}>@</Text>
          </View>
          <Text style={{ fontSize: 18, textAlign: "center", flex: 1 }}>
            {item}
          </Text>
        </View>
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        {dragging ? (
          <Animated.View
            style={{
              display: dragging ? "flex" : "none",
              position: "absolute",
              top: this.point.getLayout().top,
              width: "100%",
              zIndex: 2
            }}
          >
            {renderItem({ item: data[draggingIdx], index: -1 }, true)}
          </Animated.View>
        ) : null}
        <FlatList
          ref={this.flatList}
          style={{ width: "100%" }}
          onScroll={e => {
            this.scrollOffset = e.nativeEvent.contentOffset.y;
          }}
          onLayout={e => {
            this.flatlistHeight = e.nativeEvent.layout.height;
            this.topOffset = e.nativeEvent.layout.y;
          }}
          scrollEventThrottle={16}
          data={data}
          scrollEnabled={!dragging}
          renderItem={x => {
            return renderItem(x);
          }}
          keyExtractor={item => "" + item}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
