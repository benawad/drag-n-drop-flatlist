import * as React from "react";
import { View, Text } from "react-native";

interface Props {
  panHandlers: any;
  bgColor: string;
  nope: boolean;
  index: number;
  draggingIdx: number;
  onLayout: (e: any) => void;
  item: any;
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
        <View {...(nope ? {} : panHandlers)}>
          <Text style={{ fontSize: 32 }}>@</Text>
        </View>
        <Text style={{ fontSize: 18, textAlign: "center", flex: 1 }}>
          {item}
        </Text>
      </View>
    );
  }
}
