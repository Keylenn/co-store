import * as React from 'react'
import {ActionCreatorsMapObject, SubCtsxMapObject, Actions, ScopeStore} from './types/store'
import {EmptyObj} from './types/common'

const UNIQUE_SYMBOL = Symbol()
const UNDEFINED = void 0

export default function createScopeStore<
  I,
  A extends ActionCreatorsMapObject<I, A>,
  S extends Record<string, (state: I) => any>
>(initialState: I, actionCreatorsMap: A, subscriptionsMap?: S): ScopeStore<I, A, S> {
  // initialize contexts
  const StateContext = React.createContext<I>(initialState)
  const DispatcherContext = React.createContext<Actions<I, A> | typeof UNIQUE_SYMBOL>(UNIQUE_SYMBOL)

  const subCtxsMap: SubCtsxMapObject<S, any> | EmptyObj = {}
  const subCtxs: any[] = []
  const isSubscriptionsMapObject = typeof subscriptionsMap === 'object'
  const subscriptions = isSubscriptionsMapObject ? Object.values(subscriptionsMap as S) : []
  if (isSubscriptionsMapObject) {
    for (const key in subscriptionsMap) {
      const Ctx = React.createContext(subscriptionsMap[key](initialState))
      subCtxs.push(Ctx)
      ;(subCtxsMap as SubCtsxMapObject<S, any>)[key] = Ctx
    }
  }

  function Provider({children}: {children: React.ReactNode}) {
    const [state, setState] = React.useState(initialState)
    const stateRef = React.useRef(initialState)
    stateRef.current = state

    // persist Actions
    const memoActions = React.useMemo(() => {
      const actions = {} as Actions<I, A>
      for (const key in actionCreatorsMap) {
        actions[key] = async (...args: any[]) => {
          const newState = await actionCreatorsMap[key](stateRef.current, ...args)
          if (newState === UNDEFINED) return
          setState(newState)
        }
      }
      return actions
    }, [])

    return (
      <DispatcherContext.Provider value={memoActions}>
        <StateContext.Provider value={state}>
          {subCtxs.length
            ? subCtxs.reduce(
                (prev, ctx, idx) => <ctx.Provider value={subscriptions[idx](state)}>{prev}</ctx.Provider>,
                children,
              )
            : children}
        </StateContext.Provider>
      </DispatcherContext.Provider>
    )
  }

  function useActions() {
    const value = React.useContext(DispatcherContext)
    if (value === UNIQUE_SYMBOL) {
      throw new Error('Component must be wrapped with Provider')
    }
    return value
  }

  const useStore = (): [I, Actions<I, A>] => {
    return [React.useContext(StateContext), useActions()]
  }

  const useSubscribe = <K extends keyof S>(subKey: K) => {
    if (subKey === UNDEFINED) throw new Error('useSubscribe requires a key as a parameter, Please check')

    const ctx = (subCtxsMap as SubCtsxMapObject<S, any>)[subKey]

    if (ctx === UNDEFINED)
      throw new Error(
        `subscription has no a attribute named ${subKey},Please check! Or you don't pass in subscription as the third parameter when creatingScopeStore`,
      )
    return React.useContext(ctx)
  }

  return {
    Provider,
    useActions,
    useStore,
    useSubscribe,
  }
}

export type TscopeStore = ReturnType<typeof createScopeStore>
