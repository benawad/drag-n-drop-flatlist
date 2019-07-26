import * as React from "react";
import { View, Text } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

interface Props {
  bgColor: string;
  nope: boolean;
  index: number;
  draggingIdx: number;
  onLayout: (e: any) => void;
  item: any;
  onGestureEvent: any;
}

export class PureRow extends React.PureComponent<Props> {
  render() {
    const {
      item,
      panHandlers,
      draggingIdx,
      bgColor,
      nope,
      index,
      onGestureEvent,
      onLayout
    } = this.props;

    return (
      <View
        style={{
          padding: 16,
          backgroundColor: bgColor,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          opacity: !nope && index === draggingIdx ? 0 : 1
        }}
        // onLayout={onLayout}
      >
        {nope ? (
          <View>
            <Text style={{ fontSize: 32 }}>@</Text>
          </View>
        ) : (
          <PanGestureHandler
            maxPointers={1}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onGestureEvent}
          >
            <Animated.View>
              <Text style={{ fontSize: 32 }}>@</Text>
            </Animated.View>
          </PanGestureHandler>
        )}
        <Text style={{ fontSize: 18, textAlign: "center", flex: 1 }}>
          {item}
        </Text>
      </View>
    );
  }
}
