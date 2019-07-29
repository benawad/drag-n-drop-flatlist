import React, { useState, useCallback, createRef } from "react";
import { debounce } from "lodash";
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
  Dimensions
} from "react-native";
import { PureRow } from "./PureRow";
import { Test } from "./Test";
import Wow from "./Wow";
import Rec from "./Rec";
import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { SoTest } from "./SoTest";
const { width } = Dimensions.get("window");

const { cond, eq, add, call, set, Value, event } = Animated;

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

// export default class App extends React.Component {
//   state = {
//     dragging: false,
//     draggingIdx: -1,
//     data: Array.from(Array(200), (_, i) => {
//       colorMap[i] = getRandomColor();
//       return i;
//     })
//   };

//   _panResponder: PanResponderInstance;
//   flatList = createRef<FlatList<any>>();
//   // point = new Animated.ValueXY();
//   // rowHeight = 0;
//   rowHeight = 70;
//   currentY = -1;
//   scrollOffset = 0;
//   flatlistHeight = -1;
//   topOffset = 0;
//   currIdx = 0;
//   active = false;

//   dragY = new Value(0);
//   y = new Value(0);
//   offsetY = new Value(100);
//   gestureState = new Value(-1);
//   addY: Animated.Node<number>;
//   transY: Animated.Node<number>;
//   onGestureEvent: any;

//   constructor(props) {
//     super(props);

//     this.onGestureEvent = event([
//       {
//         nativeEvent: {
//           absoluteY: this.y,
//           translationY: this.dragY,
//           state: this.gestureState
//         }
//       }
//     ]);

//     this.addY = add(this.offsetY, this.dragY);

//     this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, [
//       set(this.offsetY, this.addY)
//     ]);
//   }

//   yToIndex = (y: number) =>
//     Math.min(
//       this.state.data.length - 1,
//       Math.max(
//         0,
//         Math.floor((y + this.scrollOffset - this.topOffset) / this.rowHeight)
//       )
//     );

//   reset = () => {
//     this.active = false;
//     this.setState({ dragging: false, draggingIdx: -1 });
//     this.currentY = -1;
//   };

//   animateList = () => {
//     if (!this.active) {
//       return;
//     }

//     requestAnimationFrame(() => {
//       if (this.currentY !== -1 && this.flatlistHeight !== -1) {
//         // console.log(this.currentY + 100, this.flatlistHeight, this.contentY);
//         if (this.currentY + 100 > this.flatlistHeight) {
//           this.flatList.current.scrollToOffset({
//             offset: this.scrollOffset + 20,
//             animated: false
//           });
//         } else if (this.currentY < 100) {
//           this.flatList.current.scrollToOffset({
//             offset: this.scrollOffset - 20,
//             animated: false
//           });
//         }

//         const newIdx = this.yToIndex(this.currentY);
//         if (this.currIdx !== newIdx) {
//           const data = immutableMove(this.state.data, this.currIdx, newIdx);
//           console.log("setState");
//           // console.log(this.currIdx, newIdx, data);
//           this.currIdx = newIdx;
//           this.setState({
//             draggingIdx: newIdx,
//             data
//           });
//         }
//       }

//       this.animateList();
//     });
//   };

//   handleLayout = e => {
//     this.rowHeight = e.nativeEvent.layout.height;
//   };

//   start = arr => {
//     this.currIdx = this.yToIndex(arr[0]);
//     this.setState({ dragging: true, draggingIdx: this.currIdx });
//   };

//   updateOrder = debounce(
//     y => {
//       const newIdx = this.yToIndex(y);
//       if (this.currIdx !== newIdx) {
//         console.log("setState", this.currIdx, newIdx);
//         this.setState({
//           data: immutableMove(this.state.data, this.currIdx, newIdx),
//           draggingIdx: this.yToIndex(y)
//         });
//         this.currIdx = newIdx;
//       }
//     },
//     150,
//     { maxWait: 150 }
//   );

//   move = ([y]) => {
//     if (y + 100 > this.flatlistHeight) {
//       this.flatList.current.scrollToOffset({
//         offset: this.scrollOffset + 20,
//         animated: false
//       });
//     } else if (y < 100) {
//       this.flatList.current.scrollToOffset({
//         offset: this.scrollOffset - 20,
//         animated: false
//       });
//     }

//     // this.updateOrder(y);
//   };

//   render() {
//     const { dragging, draggingIdx, data } = this.state;

//     const renderItem = ({ item, index }, nope = false) => {
//       return (
//         <PureRow
//           onGestureEvent={this.onGestureEvent}
//           index={index}
//           nope={nope}
//           onLayout={this.handleLayout}
//           bgColor={colorMap[item]}
//           item={item}
//           draggingIdx={draggingIdx}
//         />
//         // <View
//         //   style={{
//         //     padding: 16,
//         //     backgroundColor: colorMap[item],
//         //     display: "flex",
//         //     flexDirection: "row",
//         //     alignItems: "center",
//         //     opacity: !nope && index === draggingIdx ? 0 : 1
//         //   }}
//         //   onLayout={e => {
//         //     this.rowHeight = e.nativeEvent.layout.height;
//         //   }}
//         // >
//         //   <View {...(nope ? {} : this._panResponder.panHandlers)}>
//         //     <Text style={{ fontSize: 32 }}>@</Text>
//         //   </View>
//         //   <Text style={{ fontSize: 18, textAlign: "center", flex: 1 }}>
//         //     {item}
//         //   </Text>
//         // </View>
//       );
//     };

//     return (
//       <SafeAreaView style={styles.container}>
//         <Animated.Code>
//           {() =>
//             cond(
//               eq(this.gestureState, State.BEGAN),
//               call([this.y, this.addY, this.offsetY, this.transY], this.start)
//             )
//           }
//         </Animated.Code>
//         <Animated.Code>
//           {() => cond(eq(this.gestureState, State.END), call([], this.reset))}
//         </Animated.Code>
//         <Animated.Code>
//           {() =>
//             cond(eq(this.gestureState, State.ACTIVE), call([this.y], this.move))
//           }
//         </Animated.Code>
//         {dragging ? (
//           <Animated.View
//             style={{
//               // transform: [
//               //   {
//               //     translateY: this.transY
//               //   }
//               // ],
//               top: this.y,
//               position: "absolute",
//               width: "100%",
//               zIndex: 2
//             }}
//           >
//             {renderItem({ item: data[draggingIdx], index: -1 }, true)}
//           </Animated.View>
//         ) : null}
//         <FlatList
//           ref={this.flatList}
//           style={{ width: "100%" }}
//           onScroll={e => {
//             this.scrollOffset = e.nativeEvent.contentOffset.y;
//           }}
//           onLayout={e => {
//             this.flatlistHeight = e.nativeEvent.layout.height;
//             this.topOffset = e.nativeEvent.layout.y;
//           }}
//           scrollEventThrottle={32}
//           data={data}
//           scrollEnabled={!dragging}
//           renderItem={renderItem}
//           keyExtractor={item => "" + item}
//         />
//       </SafeAreaView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center"
//   }
// });

export default SoTest;
