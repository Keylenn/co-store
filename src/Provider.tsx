import * as React from 'react'
import {TscopeStore} from './createScopeStore'
import {ChiProvider} from './types/store'

export interface ComProviderProps {
  stores: TscopeStore[]
  children: React.ReactNode
}

function composeProviders(providers: ChiProvider[]): ChiProvider {
  const CompProvider = ({children}: {children: React.ReactNode}) => (
    <>
      {providers.reduce(
        (prev, Provider) => (
          <Provider>{prev}</Provider>
        ),
        children,
      )}
    </>
  )

  return CompProvider
}

const Provider = ({stores, children}: ComProviderProps): JSX.Element => {
  const CompProvider = composeProviders(stores.map(({Provider}) => Provider))
  return <CompProvider>{children}</CompProvider>
}

export const withStores = (Component: (props: any) => JSX.Element, stores: ComProviderProps['stores']): React.FC => {
  const Wrapper: React.FC = props => (
    <Provider stores={stores}>
      <Component {...props} />
    </Provider>
  )

  return Wrapper
}

export default Provider
