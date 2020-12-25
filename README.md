# co-store

基于Context + React Hooks实现**局部**的状态管理，类比Custom Hook，co-store强调**基于功能**设计Store。


## Installation
npm：```npm i co-store```

yarn：```yarn add co-store```

## API

### ```createScopeStore(initialState, actionCreators)```

##### ScopeStore Examples: [Counter](https://codesandbox.io/s/co-store-counter-r211x)

```jsx
import React from "react"
import {createScopeStore} from "co-store"

// 创建counterStore
const initialState: number = 0
const actionCreators = {
  reset() {
    return initialState
  },
  inc() {
    return (c: number) => c + 1
  },
  dec() {
    return (c: number) => c - 1
  }
}

const {
  Provider: CounterProvider,
  useStore,
  useActions
} = createScopeStore(initialState, actionCreators)

// 直接在组件中使用，上层组件需要用Provider包裹
function ChildInStore({ id = "0", btns = ["+", "-"] }) {
  // 返回[state, actions]
  const [count, { inc, dec }] = useStore()
  return (
    <div>
      Child{id} in Store----count:{count}
      {btns.includes("+") && <button onClick={inc}>+</button>}
      {btns.includes("-") && <button onClick={dec}>-</button>}
    </div>
  )
}

const ResetBtn = () => {
  // 读写分离，重置组件时只触发action，不会重渲染
  const { reset } = useActions()
  return <button onClick={reset}>reset</button>
}

export default function Counter() {
  return (
    <CounterProvider>
      <ChildInStore btns={["+"]} />
      <ChildInStore id="1" btns={["-"]} />
      <ResetBtn />
    </CounterProvider>
  )
}
```

##### ScopeStore Examples use subscribe: [Info](https://codesandbox.io/s/co-store-subscriptions-forked-03cs7)

```jsx
import React from "react"
import {createScopeStore} from "co-store"

// 创建infoStore
interface StateType {
  name: string
  age: number
  gender: number
}

const initialState = {
  name: "Tony",
  age: 23,
  gender: 0
}
const actionCreators = {
  setInfo(prevInfo: StateType, newInfo: Partial<StateType>) {
    return { ...prevInfo, ...newInfo }
  },
  resetInfo() {
    return initialState
  }
}

// 订阅state
const subscriptions = {
  // 只订阅了name，只有name改变了才会重渲染
  name: (info: StateType) => info.name,
  // 订阅了gender，实现衍生数据
  gender: (info: StateType) => (info.gender === 0 ? "女" : "男")
}

const infoStore = createScopeStore(initialState, actionCreators, subscriptions)

// 直接在组件中使用，上层组件需要用Provider包裹
function Info() {
  console.log(`Info render`)
  const [info, { setInfo, resetInfo }] = infoStore.useStore()
  return (
    <div>
      <p>info: {JSON.stringify(info)}</p>
      <button onClick={() => setInfo({ name: "Bob" })}>setName</button>
      <button onClick={() => setInfo({ age: 30 })}>setAge</button>
      <button onClick={() => setInfo({ gender: 1 })}>setGender</button>
      <button onClick={() => resetInfo()}>reset</button>
    </div>
  )
}

function InfoName() {
  console.log(`InfoName render`)
  const name = infoStore.useSubscribe("name")
  return (
    <div>
      <p>name: {name}</p>
    </div>
  )
}

function InfoGender() {
  console.log(`InfoGender render`)
  const gender = infoStore.useSubscribe("gender")
  return (
    <div>
      <p>gender: {gender}</p>
    </div>
  )
}

export default function Info() {
  return (
    <infoStore.Provider>
      <Info />
      <InfoName />
      <InfoGender />
    </infoStore.Provider>
  )
}
```

### ```withStores(Component, stores) | <Provider stores={stores}>...</Provider>``` 

##### composeStores Examples: [InfoCounter](https://codesandbox.io/s/co-sotre-compstores-u8o7v)

```jsx
import React from "react"
import {createScopeStore, Provider, withStores} from "co-store"

// 创建counterStore
const initialState: number = 0
const actionCreators = {
  reset() {
    return initialState
  },
  inc() {
    return (c: number) => c + 1
  },
  dec() {
    return (c: number) => c - 1
  }
}
const counterStore = createScopeStore(initialState, actionCreators)

// 创建infoStore
export interface StateType {
  name: string
  age: number
}
const initialState = {
  name: "Tony",
  age: 23
}
const actionCreators = {
  // 默认把prevState当作第一个参数传入，在调用store返回的actions中无需传递prevState
  setInfo(prevInfo: StateType, newInfo: Partial<StateType>) {
    return { ...prevInfo, ...newInfo }
  },
  resetInfo() {
    return initialState
  }
}
const infoStore = createScopeStore(initialState, actionCreators)

// 组合stores
const stores = [counterStore, infoStore]

// 直接在组件中使用，上层组件需要用Provider包裹
function Counter() {
  console.log(`Counter render`)
  const [count, { inc, dec, reset}] = counterStore.useStore()
  return (
    <div>
      count:{count}
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
      <button onClick={reset}>reset</button>
    </div>
  )
}

function Info() {
  console.log(`Info render`)
  const [info, { setInfo, resetInfo }] = infoStore.useStore()
  return (
    <div>
      <p>info: {JSON.stringify(info)}</p>
      <button onClick={() => setInfo({ name: "Bob" })}>setName</button>
      <button onClick={() => setInfo({ age: 30 })}>setAge</button>
      <button onClick={() => resetInfo()}>reset</button>
    </div>
  )
}

// use Provider to compose stores
export default function App() {
  return (
    <Provider stores={stores}>
      <Counter />
      <Info />
    </Provider>
  );
}

// use withStores to compose stores

// function App() {
//   return (
//     <>
//       <Counter />
//       <Info />
//     </>
//   );
// }

// export default withStores(App, stores);
```

