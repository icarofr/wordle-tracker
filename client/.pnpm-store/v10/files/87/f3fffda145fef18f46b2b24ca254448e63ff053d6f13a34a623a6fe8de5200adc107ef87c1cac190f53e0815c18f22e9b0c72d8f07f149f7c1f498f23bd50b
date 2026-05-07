// packages/logger/src/index.ts
import { array as array2 } from "@nothing-but/utils";
import {
  addSolidUpdateListener,
  getOwnerType as getOwnerType2,
  interceptComputationRerun,
  isSolidComputation,
  isSolidMemo as isSolidMemo2,
  isSolidSignal,
  lookupOwner,
  makeValueUpdateListener,
  observeValueUpdate,
  onParentCleanup,
  removeValueUpdateObserver
} from "@solid-devtools/debugger";
import { NodeType as NodeType2 } from "@solid-devtools/debugger/types";
import { arrayEquals, asArray } from "@solid-primitives/utils";
import { $PROXY, createEffect, getOwner as getOwner2, on, onCleanup, untrack } from "solid-js";

// packages/logger/src/log.ts
import { array } from "@nothing-but/utils";
import { getNodeName, getNodeType, getOwnerType, isSolidMemo } from "@solid-devtools/debugger";
import { NODE_TYPE_NAMES, NodeType, UNKNOWN } from "@solid-devtools/debugger/types";

// packages/logger/src/utils.ts
import "@solid-devtools/debugger/types";
import { createComputed, createRoot, getOwner, runWithOwner } from "solid-js";
function getFunctionSources(fn) {
  let nodes;
  let init = true;
  runWithOwner(
    null,
    () => createRoot(
      (dispose) => createComputed(() => {
        if (!init) return;
        init = false;
        fn();
        const sources = getOwner().sources;
        if (sources) nodes = [...sources];
        dispose();
      })
    )
  );
  return nodes ?? [];
}
function makeTimeMeter() {
  let last = performance.now();
  return () => {
    const now = performance.now();
    const diff = now - last;
    last = now;
    return Math.round(diff);
  };
}
function getDiffMap(from, to, mapConstructor = WeakMap) {
  const marks = new mapConstructor();
  const allItems = [];
  const toCopy = [...to];
  from.forEach((owner) => {
    const index = toCopy.indexOf(owner);
    if (index !== -1) toCopy.splice(index, 1);
    else marks.set(owner, "removed");
    allItems.push(owner);
  });
  toCopy.forEach((owner) => {
    if (allItems.includes(owner)) return;
    marks.set(owner, "added");
    allItems.push(owner);
  });
  return [(item) => marks.get(item) || null, allItems];
}
function getStackDiffMap(from, to, mapConstructor = WeakMap) {
  const marks = new mapConstructor();
  const allItems = [...from];
  for (let i = allItems.length; i < to.length; i++) {
    allItems.push(to[i]);
    marks.set(to[i], "added");
  }
  return [(item) => marks.get(item) || null, allItems];
}

// packages/logger/src/log.ts
var UNUSED = Symbol("unused");
var STYLES = {
  bold: "font-weight: bold; font-size: 1.1em;",
  ownerName: "font-weight: bold; font-size: 1.1em; background: rgba(153, 153, 153, 0.3); padding: 0.1em 0.3em; border-radius: 4px;",
  grayBackground: "background: rgba(153, 153, 153, 0.3); padding: 0 0.2em; border-radius: 4px;",
  signalUnderline: "text-decoration: orange wavy underline;",
  new: "color: orange; font-style: italic"
};
var inGray = (text) => `\x1B[90m${text}\x1B[m`;
var styleTime = (time) => `\x1B[90;3m${time}\u200Ams\x1B[m`;
var getNameStyle = (type) => type === NodeType.Signal ? STYLES.signalUnderline : STYLES.grayBackground;
function getValueSpecifier(v) {
  if (typeof v === "object") return " %o";
  if (typeof v === "function") return " %O";
  return "";
}
function getNodeState(owner) {
  if ("type" in owner && "typeName" in owner && "name" in owner) return owner;
  const type = getNodeType(owner);
  return {
    type,
    typeName: NODE_TYPE_NAMES[type],
    name: getNodeName(owner) ?? UNKNOWN
  };
}
function getNodeStateWithValue(owner) {
  if ("type" in owner && "typeName" in owner && "name" in owner) return owner;
  const type = getNodeType(owner);
  return {
    type,
    typeName: NODE_TYPE_NAMES[type],
    name: getNodeName(owner) ?? UNKNOWN,
    value: owner.value
  };
}
function createAlignedTextWidth() {
  let width = 0;
  return [(text) => text.padEnd(width), (text) => width = Math.max(text.length, width)];
}
function paddedForEach(list, getPaddedValue, callback) {
  const [getPaddedText, updateWidth] = createAlignedTextWidth();
  const mapped = list.map((item, index) => {
    const paddedValue = getPaddedValue(item, index);
    updateWidth(paddedValue);
    return [item, paddedValue];
  });
  mapped.forEach(
    ([item, paddedValue], index) => callback(getPaddedText(paddedValue), item, index)
  );
}
var getComputationCreatedLabel = (type, name, timeElapsed) => [
  `%c${type} %c${name}%c created  ${styleTime(timeElapsed)}`,
  "",
  STYLES.ownerName,
  ""
];
var getComputationRerunLabel = (name, timeElapsed) => [
  `%c${name}%c re-executed  ${styleTime(timeElapsed)}`,
  STYLES.ownerName,
  ""
];
var getOwnerDisposedLabel = (name) => [
  `%c${name}%c disposed`,
  STYLES.ownerName,
  ""
];
function logPrevValue(prev) {
  console.log(`${inGray("Previous =")}${getValueSpecifier(prev)}`, prev);
}
var logComputationDetails = ({
  causedBy,
  owner,
  owned,
  sources,
  prev,
  value
}) => {
  if (owner !== UNUSED) {
    const label = inGray("Owner:");
    if (!owner) console.log(label, null);
    else {
      const { name } = getNodeState(owner);
      console.log(`${label} %c${name}`, STYLES.grayBackground);
    }
  }
  if (value !== UNUSED) console.log(`${inGray("Value =")}${getValueSpecifier(value)}`, value);
  if (prev !== UNUSED) logPrevValue(prev);
  if (causedBy && causedBy.length) {
    if (causedBy.length === 1) {
      const cause = causedBy[0];
      console.log(
        `%c${inGray("Caused By:")} %c${cause.name}%c ${inGray("=")}`,
        "",
        getNameStyle(cause.type),
        "",
        cause.value
      );
    } else {
      console.groupCollapsed(inGray("Caused By:"), causedBy.length);
      causedBy.forEach((cause) => {
        console.log(
          `%c${cause.name}%c ${inGray("=")}`,
          getNameStyle(cause.type),
          "",
          cause.value
        );
      });
      console.groupEnd();
    }
  }
  if (sources.length) {
    console.groupCollapsed(inGray("Sources:"), sources.length);
    sources.forEach((source) => {
      const { type, name } = getNodeState(source);
      console.log(`%c${name}%c ${inGray("=")}`, getNameStyle(type), "", source.value);
    });
    console.groupEnd();
  } else {
    console.log(inGray("Sources:"), 0);
  }
  if (owned.length) {
    console.groupCollapsed(inGray("Owned:"), owned.length);
    logOwnerList(owned);
    console.groupEnd();
  } else {
    console.log(inGray("Owned:"), 0);
  }
};
var logComputation = (groupLabel, state) => {
  console.groupCollapsed(...groupLabel);
  logComputationDetails(state);
  console.groupEnd();
};
function logOwned(ownerState, owned, prevOwned) {
  console.groupCollapsed(
    `Owned by the %c${ownerState.name}%c ${ownerState.typeName}:`,
    STYLES.ownerName,
    "",
    owned.length
  );
  logOwnersDiff(prevOwned, owned, "stack", (owner) => {
    const sources = owner.sources ? array.deduped(owner.sources) : [];
    const usesPrev = !!owner.fn.length;
    const usesValue = usesPrev || isSolidMemo(owner);
    logComputationDetails({
      owner: ownerState,
      owned: owner.owned ?? [],
      sources,
      prev: UNUSED,
      value: usesValue ? owner.value : UNUSED,
      causedBy: null
    });
  });
  console.groupEnd();
}
function logSignalsInitialValues(signals) {
  console.groupCollapsed("Signals initial values:");
  signals.forEach(logSignalValue);
  console.groupEnd();
}
function logInitialValue(node) {
  const { type, typeName, value, name } = getNodeStateWithValue(node);
  console.log(
    `%c${typeName} %c${name}%c initial value ${inGray("=")}${getValueSpecifier(value)}`,
    "",
    `${STYLES.bold} ${getNameStyle(type)}`,
    "",
    value
  );
}
function logSignalValue(signal) {
  const { type, typeName, name, value } = getNodeStateWithValue(signal);
  console.log(
    `${inGray(typeName)} %c${name}%c ${inGray("=")}${getValueSpecifier(value)}`,
    `${getNameStyle(type)}`,
    "",
    value
  );
}
function logSignalValueUpdate({ name, type }, value, prev, observers) {
  console.groupCollapsed(
    `%c${name}%c updated ${inGray("=")}${getValueSpecifier(value)}`,
    `${STYLES.bold} ${getNameStyle(type)}`,
    "",
    value
  );
  logPrevValue(prev);
  observers && logCausedUpdates(observers);
  console.groupEnd();
}
function logCausedUpdates(observers) {
  if (!observers.length) return;
  console.groupCollapsed(inGray("Caused Updates:"), observers.length);
  logOwnerList(observers);
  console.groupEnd();
}
function logObservers(signalName, observers, prevObservers) {
  const label = [
    `%c${signalName}%c observers changed:`,
    `${STYLES.bold} ${STYLES.signalUnderline}`,
    "",
    observers.length
  ];
  if (!observers.length && !prevObservers.length) return console.log(...label);
  console.groupCollapsed(...label);
  logOwnersDiff(prevObservers, observers, "thorow");
  console.groupEnd();
}
function logOwnersDiff(from, to, diff, logGroup) {
  const [getMark, owners] = diff === "thorow" ? getDiffMap(from, to) : getStackDiffMap(from, to);
  paddedForEach(
    owners,
    (owner) => NODE_TYPE_NAMES[getOwnerType(owner)],
    (type, owner) => {
      const mark = getMark(owner);
      const name = getNodeName(owner);
      const label = (() => {
        if (mark === "added")
          return [`${inGray(type)} %c${name}%c  new`, STYLES.grayBackground, STYLES.new];
        if (mark === "removed")
          return [
            `${inGray(type)} %c${name}`,
            "background: rgba(153, 153, 153, 0.15); padding: 0 0.2em; border-radius: 4px; text-decoration: line-through; color: #888"
          ];
        return [`${inGray(type)} %c${name}`, STYLES.grayBackground];
      })();
      if (logGroup) {
        console.groupCollapsed(...label);
        logGroup(owner);
        console.groupEnd();
      } else console.log(...label);
    }
  );
}
function logOwnerList(owners, logGroup) {
  paddedForEach(
    owners,
    (owner) => NODE_TYPE_NAMES[getOwnerType(owner)],
    (type, owner) => {
      const label = [`${inGray(type)} %c${getNodeName(owner)}`, STYLES.grayBackground];
      if (logGroup) {
        console.groupCollapsed(...label);
        logGroup(owner);
        console.groupEnd();
      } else console.log(...label);
    }
  );
}
function getPropsInitLabel(state, proxy, empty) {
  const { type, typeName, name } = state;
  return [
    `%c${typeName} %c${name}%c created with ${empty ? "empty" : ""}${proxy ? "dynamic " : ""}props`,
    "",
    getNameStyle(type),
    ""
  ];
}
function getPropsKeyUpdateLabel({ name, type }, empty) {
  return [
    `Dynamic props of %c${name}%c ${empty ? "are empty now" : "updated keys:"}`,
    getNameStyle(type),
    ""
  ];
}
function getPropLabel(type, name, value, occurrence) {
  if (occurrence === null)
    return [`${inGray(type)} ${name} ${inGray("=")}${getValueSpecifier(value)}`, value];
  if (occurrence === "added")
    return [
      `${inGray(type)} ${name}%c new ${inGray("=")}${getValueSpecifier(value)}`,
      STYLES.new,
      value
    ];
  return [`${inGray(type)} %c${name}`, "text-decoration: line-through; color: #888"];
}

// packages/logger/src/index.ts
var isSolidProxy = (o) => !!o[$PROXY];
function markDebugNode(o, type) {
  let property;
  if (type === "computation") property = "$debug";
  else if (type === "signals") property = "$debugSignals";
  else if (type === "owned") property = "$debugOwned";
  else property = "$debugSignal";
  if (o[property]) return true;
  o[property] = true;
  return () => o[property] = false;
}
function debugComputation(_owner, { initialRun = true } = {}) {
  const owner = _owner === void 0 ? getOwner2() : _owner;
  if (!owner || !isSolidComputation(owner)) return console.warn("owner is not a computation");
  if (markDebugNode(owner, "computation") === true) return;
  const { type, typeName, name } = getNodeState(owner);
  const SYMBOL = Symbol(name);
  const usesPrev = !!owner.fn.length;
  const usesValue = usesPrev || type === NodeType2.Memo;
  let updateListeners = [];
  let signalUpdates = [];
  const observeSources = (sources) => {
    updateListeners.forEach((unsub) => unsub());
    updateListeners = [];
    sources.forEach((source) => {
      observeValueUpdate(
        source,
        (value) => signalUpdates.push({ ...getNodeState(source), value }),
        SYMBOL
      );
      updateListeners.push(() => removeValueUpdateObserver(source, SYMBOL));
    });
  };
  if (initialRun) {
    observeValueUpdate(
      owner,
      (value) => {
        const timeElapsed = time();
        removeValueUpdateObserver(owner, SYMBOL);
        const sources = owner.sources ? array2.deduped(owner.sources) : [];
        logComputation(getComputationCreatedLabel(typeName, name, timeElapsed), {
          owner: { type, typeName, name },
          owned: owner.owned ?? [],
          sources,
          prev: UNUSED,
          value: usesValue ? value : UNUSED,
          causedBy: null
        });
        observeSources(sources);
      },
      SYMBOL
    );
  } else observeSources(owner.sources ? array2.deduped(owner.sources) : []);
  interceptComputationRerun(owner, (fn, prev) => {
    const updates = signalUpdates;
    signalUpdates = [];
    time();
    const value = fn();
    const elapsedTime = time();
    const sources = owner.sources ? array2.deduped(owner.sources) : [];
    logComputation(getComputationRerunLabel(name, elapsedTime), {
      owner: UNUSED,
      owned: owner.owned ?? [],
      sources,
      prev: usesPrev ? prev : UNUSED,
      value: usesValue ? value : UNUSED,
      causedBy: updates
    });
    observeSources(sources);
  });
  onParentCleanup(
    owner,
    () => {
      console.log(...getOwnerDisposedLabel(name));
      updateListeners.forEach((unsub) => unsub());
      updateListeners.length = 0;
      signalUpdates.length = 0;
    },
    // run before other cleanup functions
    true
  );
  const time = makeTimeMeter();
}
function debugOwnerComputations(_owner) {
  const owner = _owner === void 0 ? getOwner2() : _owner;
  if (!owner) return console.warn("no owner passed to debugOwnedComputations");
  const marked = markDebugNode(owner, "owned");
  if (marked === true) return;
  onCleanup(marked);
  const { type, typeName, name } = getNodeState(
    lookupOwner(owner, (o) => getOwnerType2(o) !== NodeType2.Refresh)
  );
  let prevOwned = [];
  onCleanup(
    addSolidUpdateListener(() => {
      const { owned } = owner;
      if (!owned) return;
      let computations = [];
      let i = prevOwned.length;
      for (; i < owned.length; i++) {
        const computation = owned[i];
        debugComputation(computation, {
          initialRun: false
        });
        computations.push(computation);
      }
      if (computations.length === 0) return;
      computations = [...prevOwned, ...computations];
      logOwned({ type, typeName, name }, computations, prevOwned);
      prevOwned = computations;
    })
  );
}
function debugSignal(source, options = {}) {
  let signal;
  if (typeof source === "function") {
    const sources = getFunctionSources(source);
    if (sources.length === 0) return console.warn("No signal was passed to debugSignal");
    else if (sources.length > 1)
      return console.warn("More then one signal was passed to debugSignal");
    signal = sources[0];
  } else {
    signal = source;
  }
  if (markDebugNode(signal) === true) return;
  const { trackObservers = true, logInitialValue: _logInitialValue = true } = options;
  const state = getNodeState(signal);
  const SYMBOL = Symbol(state.name);
  _logInitialValue && logInitialValue({ ...state, value: signal.value });
  let actualObservers;
  let prevObservers = [];
  let actualPrevObservers = [];
  if (!signal.observers) {
    signal.observers = [];
    signal.observerSlots = [];
  }
  makeValueUpdateListener(
    signal,
    (value, prev) => {
      logSignalValueUpdate(
        state,
        value,
        prev,
        trackObservers ? prevObservers : array2.deduped(signal.observers)
      );
    },
    SYMBOL
  );
  if (trackObservers) {
    let logObserversChange2 = function() {
      const observers = array2.deduped(actualObservers);
      if (array2.includes_same_members(observers, prevObservers)) return;
      logObservers(state.name, observers, prevObservers);
      prevObservers = [...observers];
      actualPrevObservers = [...actualObservers];
    };
    var logObserversChange = logObserversChange2;
    onCleanup(
      addSolidUpdateListener(() => {
        actualObservers = signal.observers;
        if (actualObservers.length !== actualPrevObservers.length)
          return logObserversChange2();
        for (let i = actualObservers.length; i >= 0; i--) {
          if (actualObservers[i] !== actualPrevObservers[i]) return logObserversChange2();
        }
      })
    );
  }
}
function debugSignals(source, options = {}) {
  let signals = [];
  asArray(source).forEach((s) => {
    if (typeof s === "function") signals.push.apply(signals, getFunctionSources(s));
    else signals.push(s);
  });
  if (signals.length === 0) return console.warn("No signals were passed to debugSignals");
  signals = signals.filter((s) => !s.$debugSignal);
  if (signals.length === 1) return debugSignal(signals[0], options);
  if (options.logInitialValue === false) logSignalsInitialValues(signals);
  signals.forEach((signal) => {
    debugSignal(signal, {
      ...options,
      logInitialValue: false
    });
  });
}
function debugOwnerSignals(owner = getOwner2(), options = {}) {
  if (!owner) return console.warn("debugOwnerState found no Owner");
  if (markDebugNode(owner, "signals") === true) return;
  let prevSourceListLength = 0;
  let prevOwnedLength = 0;
  onCleanup(
    addSolidUpdateListener(() => {
      const signals = [];
      let i;
      if (owner.sourceMap) {
        const sourceList = Object.values(owner.sourceMap);
        for (i = prevSourceListLength; i < sourceList.length; i++) {
          const signal = sourceList[i];
          if (isSolidSignal(signal)) signals.push(signal);
        }
        prevSourceListLength = i;
      }
      if (owner.owned) {
        for (i = prevOwnedLength; i < owner.owned.length; i++) {
          const childOwner = owner.owned[i];
          if (isSolidMemo2(childOwner)) signals.push(childOwner);
        }
        prevOwnedLength = i;
      }
      if (signals.length === 0) return;
      debugSignals(signals, options);
    })
  );
}
var getPropValue = (props, desc) => untrack(() => desc.get ? desc.get.call(props) : desc.value);
function debugProps(props) {
  const owner = getOwner2();
  if (!owner) return console.warn("debugProps should be used synchronously inside a component");
  const ownerState = getNodeState(lookupOwner(owner, (o) => getOwnerType2(o) !== NodeType2.Refresh));
  const isProxy = isSolidProxy(props);
  const descriptorsList = Object.entries(Object.getOwnPropertyDescriptors(props));
  if (descriptorsList.length === 0) console.log(...getPropsInitLabel(ownerState, isProxy, true));
  else {
    console.groupCollapsed(...getPropsInitLabel(ownerState, isProxy, false));
    paddedForEach(
      descriptorsList,
      ([, desc]) => desc.get ? "Getter" : "Value",
      (type, [key, desc]) => {
        const value = getPropValue(props, desc);
        const signals = type === "Getter" ? getFunctionSources(() => props[key]) : [];
        const label = getPropLabel(type, key, value, null);
        if (signals.length > 0) {
          console.groupCollapsed(...label);
          signals.forEach(logSignalValue);
          console.groupEnd();
        } else console.log(...label);
      }
    );
    console.groupEnd();
  }
  if (isProxy) {
    createEffect(
      on(
        () => Object.keys(props),
        (keys, prevKeys) => {
          if (!prevKeys) return;
          if (arrayEquals(keys, prevKeys)) return;
          const descriptors = Object.getOwnPropertyDescriptors(props);
          if (Object.entries(descriptors).length === 0) {
            console.log(...getPropsKeyUpdateLabel(ownerState, true));
          } else {
            const [getMark, allKeys] = getDiffMap(prevKeys, keys, Map);
            console.groupCollapsed(...getPropsKeyUpdateLabel(ownerState, false));
            allKeys.forEach((key) => {
              const mark = getMark(key);
              if (mark === "removed")
                return console.log(...getPropLabel("Getter", key, null, "removed"));
              const desc = descriptors[key];
              const value = getPropValue(props, desc);
              const label = getPropLabel("Getter", key, value, mark);
              const signals = getFunctionSources(() => props[key]);
              if (signals.length > 0) {
                console.groupCollapsed(...label);
                signals.forEach(logSignalValue);
                console.groupEnd();
              } else console.log(...label);
            });
            console.groupEnd();
          }
        }
      ),
      void 0,
      { name: "debugProps EFFECT" }
    );
  }
}
export {
  debugComputation,
  debugOwnerComputations,
  debugOwnerSignals,
  debugProps,
  debugSignal,
  debugSignals
};
