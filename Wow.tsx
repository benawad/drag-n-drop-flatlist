import React from "react";
import { StyleSheet, View, Dimensions, Text } from "react-native";
import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
const { width } = Dimensions.get("window");

const { cond, eq, add, call, set, Value, event } = Animated;

export default class Example extends React.Component {
  state = { x: 0, y: 0 };

  constructor(props) {
    super(props);
  }

  onDrop = ([x, y]) => {
    this.setState({ x, y });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={{ marginTop: 400 }}>{JSON.stringify(this.state)}</Text>
        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.ACTIVE),
              call([this.addX, this.addY], this.onDrop)
            )
          }
        </Animated.Code>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onGestureEvent}
        >
          <Animated.View
            style={[
              styles.box,
              {
                transform: [
                  {
                    // translateX: this.transX
                  },
                  {
                    translateY: this.transY
                  }
                ]
              }
            ]}
          />
        </PanGestureHandler>
      </View>
    );
  }
}

const CIRCLE_SIZE = 70;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  box: {
    backgroundColor: "tomato",
    position: "absolute",
    marginLeft: -(CIRCLE_SIZE / 2),
    marginTop: -(CIRCLE_SIZE / 2),
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderColor: "#000"
  }
});
