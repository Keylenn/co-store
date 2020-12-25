import nodeResolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript2'

const extensions = ['.ts', '.tsx']
const external = ['react']

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: {file: 'lib/co-store.js', format: 'cjs', indent: false},
    external,
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({useTsconfigDeclarationDir: true}),
      babel({
        extensions,
        runtimeHelpers: true,
      }),
    ],
  },
]
