import React, { createRef } from "react";
import { View, Text, Dimensions, SafeAreaView } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider
} from "recyclerlistview";
import Animated from "react-native-reanimated";

const ViewTypes = {
  FULL: 0,
  HALF_LEFT: 1,
  HALF_RIGHT: 2
};

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

const { cond, eq, add, call, set, Value, event, or } = Animated;

export default class RecycleTestComponent extends React.Component<
  {},
  { dataProvider: DataProvider; dragging: boolean; draggingIdx: number }
> {
  list = createRef<RecyclerListView<any, any>>();
  listContainer = createRef<View>();
  _layoutProvider: LayoutProvider;
  y: Animated.Node<number>;
  offY = new Value(0);
  gestureState = new Value(-1);
  onGestureEvent: any;
  rowHeight = 70;
  currIdx = -1;
  scrollOffset = 0;
  lastScrollOffset = -1;
  flatlistHeight = -1;
  topOffset = 0;
  scrolling = false;

  constructor(args) {
    super(args);

    let { width } = Dimensions.get("window");

    this.onGestureEvent = event([
      {
        nativeEvent: {
          absoluteY: this.offY,
          state: this.gestureState
        }
      }
    ]);

    this.y = add(this.offY, new Value(-this.rowHeight / 2));

    this._layoutProvider = new LayoutProvider(
      index => {
        return ViewTypes.FULL;
      },
      (type, dim) => {
        dim.width = width;
        dim.height = 70;
      }
    );

    this._rowRenderer = this._rowRenderer.bind(this);

    const arr = this._generateArray(300);

    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this.state = {
      dragging: false,
      draggingIdx: -1,
      dataProvider: dataProvider.cloneWithRows(arr)
    };
  }

  _generateArray(n) {
    return Array.from(Array(n), (_, i) => {
      colorMap[i] = getRandomColor();
      return i;
    });
  }

  _rowRenderer(type, data, index, _, nope) {
    nope = !!nope;
    return (
      <View
        style={{
          padding: 16,
          backgroundColor: nope ? "#f2f2f2" : colorMap[data],
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          opacity: !nope && index === this.state.draggingIdx ? 0 : 1
        }}
      >
        {nope ? (
          <View>
            <Text style={{ fontSize: 32 }}>@</Text>
          </View>
        ) : (
          <PanGestureHandler
            maxPointers={1}
            onGestureEvent={this.onGestureEvent}
            onHandlerStateChange={this.onGestureEvent}
          >
            <Animated.View>
              <Text style={{ fontSize: 32 }}>@</Text>
            </Animated.View>
          </PanGestureHandler>
        )}
        <Text style={{ fontSize: 18, textAlign: "center", flex: 1 }}>
          {data}
        </Text>
      </View>
    );
  }

  yToIndex = (y: number) =>
    Math.min(
      this.state.dataProvider.getSize() - 1,
      Math.max(
        0,
        Math.floor((y + this.scrollOffset - this.topOffset) / this.rowHeight)
      )
    );

  reset = () => {
    this.setState({
      dataProvider: this.state.dataProvider.cloneWithRows(
        this.state.dataProvider.getAllData()
      ),
      dragging: false,
      draggingIdx: -1
    });
    this.scrolling = false;
  };

  start = ([y]) => {
    this.currIdx = this.yToIndex(y);
    this.setState({ dragging: true, draggingIdx: this.currIdx });
  };

  updateOrder = y => {
    const newIdx = this.yToIndex(y);
    if (this.currIdx !== newIdx) {
      this.setState({
        dataProvider: this.state.dataProvider.cloneWithRows(
          immutableMove(
            this.state.dataProvider.getAllData(),
            this.currIdx,
            newIdx
          )
        ),
        draggingIdx: newIdx
      });
      this.currIdx = newIdx;
    }
  };

  moveList = amount => {
    if (!this.scrolling) {
      return;
    }

    this.list.current.scrollToOffset(
      this.scrollOffset + amount,
      this.scrollOffset + amount,
      false
    );

    requestAnimationFrame(() => {
      this.moveList(amount);
    });
  };

  move = ([y]) => {
    if (y + 100 > this.flatlistHeight) {
      if (!this.scrolling) {
        this.scrolling = true;
        this.moveList(20);
      }
    } else if (y < 100) {
      if (!this.scrolling) {
        this.scrolling = true;
        this.moveList(-20);
      }
    } else {
      this.scrolling = false;
    }
    this.updateOrder(y);
  };

  render() {
    const { dragging, dataProvider, draggingIdx } = this.state;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.BEGAN),
              call([this.offY], this.start)
            )
          }
        </Animated.Code>
        <Animated.Code>
          {() =>
            cond(
              or(
                eq(this.gestureState, State.END),
                eq(this.gestureState, State.CANCELLED),
                eq(this.gestureState, State.FAILED),
                eq(this.gestureState, State.UNDETERMINED)
              ),
              call([], this.reset)
            )
          }
        </Animated.Code>
        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.ACTIVE),
              call([this.offY], this.move)
            )
          }
        </Animated.Code>
        {dragging ? (
          <Animated.View
            style={{
              top: this.y,
              position: "absolute",
              width: "100%",
              zIndex: 99,
              elevation: 99
            }}
          >
            {this._rowRenderer(
              -1,
              dataProvider.getDataForIndex(draggingIdx),
              -1,
              -1,
              true
            )}
          </Animated.View>
        ) : null}
        <View
          ref={this.listContainer}
          style={{ flex: 1 }}
          onLayout={e => {
            this.flatlistHeight = e.nativeEvent.layout.height;
            this.listContainer.current.measureInWindow((_x, y) => {
              this.topOffset = y;
            });
          }}
        >
          <RecyclerListView
            ref={this.list}
            style={{ flex: 1 }}
            onScroll={e => {
              this.scrollOffset = e.nativeEvent.contentOffset.y;
            }}
            layoutProvider={this._layoutProvider}
            dataProvider={dataProvider}
            rowRenderer={this._rowRenderer}
          />
        </View>
      </SafeAreaView>
    );
  }
}
