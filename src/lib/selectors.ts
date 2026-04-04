import { breakModes } from './demo-config'

export function testId(base: string) {
  return breakModes.selectorsChange ? `${base}-alt` : base
}

export function qaClass(base: string) {
  return breakModes.selectorsChange ? `${base}--changed` : base
}
