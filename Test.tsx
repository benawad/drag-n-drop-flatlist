import React, { Component } from "react";
import { Animated, StyleSheet, View } from "react-native";

import {
  PanGestureHandler,
  ScrollView,
  State
} from "react-native-gesture-handler";
import { LoremIpsum } from "./LoremIpsum";

export class DraggableBox extends Component {
  _translateX = new Animated.Value(0);
  _translateY = new Animated.Value(0);
  _lastOffset = { x: 0, y: 0 };
  _onGestureEvent: (...args: any[]) => void;

  constructor(props) {
    super(props);
    this._onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateX,
            translationY: this._translateY
          }
        }
      ],
      { useNativeDriver: true }
    );
  }
  _onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX;
      this._lastOffset.y += event.nativeEvent.translationY;
      this._translateX.setOffset(this._lastOffset.x);
      this._translateX.setValue(0);
      this._translateY.setOffset(this._lastOffset.y);
      this._translateY.setValue(0);
    }
  };
  render() {
    return (
      <>
        <Animated.View
          style={[
            styles.box,
            {
              transform: [
                { translateX: this._translateX },
                { translateY: this._translateY }
              ]
            },
            { backgroundColor: "red" }
            // this.props.boxStyle,
          ]}
        />
        <PanGestureHandler
          {...this.props}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.box
              // this.props.boxStyle,
            ]}
          />
        </PanGestureHandler>
      </>
    );
  }
}

export class Test extends Component {
  render() {
    return (
      <View style={styles.scrollView}>
        <LoremIpsum words={40} />
        <DraggableBox />
        <LoremIpsum />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  box: {
    width: 150,
    height: 150,
    alignSelf: "center",
    backgroundColor: "plum",
    margin: 10,
    zIndex: 200
  }
});
