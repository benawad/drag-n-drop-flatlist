import * as React from "react";
import { SortableList } from "./SortableList";
import { Text, View, SafeAreaView } from "react-native";

interface Props {}

const colorMap = {};

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const data = Array.from(Array(200), (_, i) => {
  colorMap[i] = getRandomColor();
  return i;
});

export const SoTest: React.FC<Props> = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SortableList
        data={data}
        onSort={x => console.log(x)}
        rowHeight={70}
        indexToKey={idx => "" + data[idx]}
        renderDragHandle={() => <Text style={{ fontSize: 32 }}>@</Text>}
        renderRow={(data, index, state, dragHandle) => {
          return (
            <View
              style={{
                padding: 16,
                backgroundColor:
                  state === "dragging" ? "#f2f2f2" : colorMap[data],
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                opacity: state === "placeholder" ? 0 : 1
              }}
              // onLayout={onLayout}
            >
              {dragHandle}
              <Text style={{ fontSize: 18, textAlign: "center", flex: 1 }}>
                {data}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};
