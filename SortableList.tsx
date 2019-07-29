import * as React from "react";
import {
  RecyclerListView,
  LayoutProvider,
  DataProvider
} from "recyclerlistview";
import Animated from "react-native-reanimated";
import { LayoutChangeEvent, Dimensions } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { cond, eq, add, call, Value, event, or } = Animated;

interface Props<T> {
  rowHeight: number;
  data: T[];
  indexToKey: (index: number) => string;
  renderRow: (
    data: T,
    index: number,
    state: "normal" | "dragging" | "placeholder",
    dragHandle: JSX.Element
  ) => JSX.Element | null;
  renderDragHandle: () => JSX.Element;
  onSort: (newData: T[]) => void;
}

interface RState {
  dataProvider: DataProvider;
  dragging: boolean;
  draggingIdx: number;
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

export class SortableList<T> extends React.PureComponent<Props<T>, RState> {
  list = React.createRef<RecyclerListView<any, any>>();
  _layoutProvider: LayoutProvider;
  rowCenterY: Animated.Node<number>;
  absoluteY = new Value(0);
  gestureState = new Value(-1);
  onGestureEvent: any;
  halfRowHeightValue: Animated.Value<number>;
  currIdx = -1;
  scrollOffset = 0;
  flatlistHeight = 0;
  topOffset = 0;
  scrolling = false;

  constructor(props: Props<T>) {
    super(props);

    this.halfRowHeightValue = new Value(-props.rowHeight / 2);

    const { width } = Dimensions.get("window");

    this.onGestureEvent = event([
      {
        nativeEvent: {
          absoluteY: this.absoluteY,
          state: this.gestureState
        }
      }
    ]);

    this.rowCenterY = add(this.absoluteY, this.halfRowHeightValue);

    this._layoutProvider = new LayoutProvider(
      index => {
        return 1;
      },
      (type, dim) => {
        dim.width = width;
        dim.height = props.rowHeight;
      }
    );

    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    }, props.indexToKey);

    this.state = {
      dataProvider: dataProvider.cloneWithRows(props.data),
      dragging: false,
      draggingIdx: -1
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        dataProvider: this.state.dataProvider.cloneWithRows(this.props.data)
      });
    }
  }

  handleScroll = (_, __, offsetY: number) => {
    this.scrollOffset = offsetY;
  };

  handleLayout = (e: LayoutChangeEvent) => {
    this.flatlistHeight = e.nativeEvent.layout.height;
    this.topOffset = e.nativeEvent.layout.y;
  };

  yToIndex = (y: number) =>
    Math.min(
      this.state.dataProvider.getSize() - 1,
      Math.max(
        0,
        Math.floor(
          (y + this.scrollOffset - this.topOffset) / this.props.rowHeight
        )
      )
    );

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
        draggingIdx: this.yToIndex(y)
      });
      this.currIdx = newIdx;
    }
  };

  start = ([y]) => {
    this.currIdx = this.yToIndex(y);
    this.setState({ dragging: true, draggingIdx: this.currIdx });
  };

  reset = () => {
    const newData = this.state.dataProvider.getAllData();
    this.setState({
      dataProvider: this.state.dataProvider.cloneWithRows(newData),
      dragging: false,
      draggingIdx: -1
    });
    this.scrolling = false;
    this.currIdx = -1;
    this.props.onSort(newData);
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

  _rowRenderer = (type, data, index) => {
    return this.props.renderRow(
      data,
      index,
      this.state.draggingIdx === index ? "placeholder" : "normal",
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onGestureEvent}
      >
        <Animated.View>{this.props.renderDragHandle()}</Animated.View>
      </PanGestureHandler>
    );
  };

  render() {
    const { dataProvider, dragging, draggingIdx } = this.state;

    return (
      <>
        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.BEGAN),
              call([this.absoluteY], this.start)
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
              call([this.absoluteY], this.move)
            )
          }
        </Animated.Code>
        {dragging ? (
          <Animated.View
            style={{
              top: this.rowCenterY,
              position: "absolute",
              width: "100%",
              zIndex: 99,
              elevation: 99
            }}
          >
            {this.props.renderRow(
              dataProvider.getDataForIndex(draggingIdx),
              draggingIdx,
              "dragging",
              this.props.renderDragHandle()
            )}
          </Animated.View>
        ) : null}
        <RecyclerListView
          ref={this.list}
          style={{ flex: 1 }}
          onScroll={this.handleScroll}
          onLayout={this.handleLayout}
          layoutProvider={this._layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={this._rowRenderer}
          extendedState={{ dragging: true }}
        />
      </>
    );
  }
}
