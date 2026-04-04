import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const defaultAppConfig = readJsonFile(path.join(projectRoot, 'src/config/app-config.json'))
const defaultUsers = readJsonFile(path.join(projectRoot, 'src/config/users.json')).users
const defaultProducts = readJsonFile(path.join(projectRoot, 'src/data/products.json')).products
const defaultPresets = readJsonFile(path.join(projectRoot, 'src/config/scenario-presets.json')).presets
const defaultOrders = []
const baselinePreset = defaultPresets.find((preset) => preset.id === 'baseline') ?? defaultPresets[0]
const defaultTestControls = {
  activePresetId: baselinePreset?.id ?? null,
  breakModes: deepClone(defaultAppConfig.breakModes),
  faults: deepClone(baselinePreset?.faults ?? {}),
  tracing: {
    enabled: true,
    maxEntries: 100,
  },
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}

function atomicWriteJson(filePath, data) {
  const tempFilePath = `${filePath}.tmp`
  fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2))
  fs.renameSync(tempFilePath, filePath)
}

function resolveRuntimePaths(dataDirectory) {
  return {
    users: path.join(dataDirectory, 'users.json'),
    breakModes: path.join(dataDirectory, 'break-modes.json'),
    products: path.join(dataDirectory, 'products.json'),
    orders: path.join(dataDirectory, 'orders.json'),
    appState: path.join(dataDirectory, 'app-state.json'),
    testControls: path.join(dataDirectory, 'test-controls.json'),
  }
}

function validateRole(role) {
  return ['customer', 'vip', 'admin'].includes(role)
}

function validateUser(user) {
  return Boolean(
    user &&
      typeof user.username === 'string' &&
      typeof user.password === 'string' &&
      typeof user.displayName === 'string' &&
      validateRole(user.role) &&
      user.username.trim() &&
      user.password.trim() &&
      user.displayName.trim(),
  )
}

export function ensureRuntimeData(dataDirectory) {
  ensureDirectory(dataDirectory)
  const paths = resolveRuntimePaths(dataDirectory)
  const seeds = {
    [paths.users]: defaultUsers,
    [paths.breakModes]: defaultAppConfig.breakModes,
    [paths.products]: defaultProducts,
    [paths.orders]: defaultOrders,
    [paths.appState]: {
      createdAt: new Date().toISOString(),
      selectedDataDirectory: dataDirectory,
    },
    [paths.testControls]: defaultTestControls,
  }

  for (const [filePath, seedValue] of Object.entries(seeds)) {
    if (!fs.existsSync(filePath)) {
      atomicWriteJson(filePath, deepClone(seedValue))
    }
  }

  return paths
}

export function createRuntimeStore(dataDirectory) {
  const paths = ensureRuntimeData(dataDirectory)

  function readUsers() {
    return readJsonFile(paths.users)
  }

  function writeUsers(users) {
    if (!Array.isArray(users) || users.some((user) => !validateUser(user))) {
      throw new Error('Users data is invalid.')
    }

    atomicWriteJson(paths.users, users)
    return users
  }

  function readBreakModes() {
    const testControls = readTestControls()
    return testControls.breakModes
  }

  function writeBreakModes(breakModes) {
    atomicWriteJson(paths.breakModes, breakModes)
    const current = readTestControls()
    writeTestControls({
      ...current,
      breakModes,
    })
    return breakModes
  }

  function listScenarioPresets() {
    return deepClone(defaultPresets)
  }

  function readTestControls() {
    const current = readJsonFile(paths.testControls)
    const next = {
      ...deepClone(defaultTestControls),
      ...current,
      breakModes: {
        ...deepClone(defaultAppConfig.breakModes),
        ...(current?.breakModes ?? {}),
        apiFailures: {
          ...deepClone(defaultAppConfig.breakModes.apiFailures),
          ...(current?.breakModes?.apiFailures ?? {}),
        },
      },
      faults: {
        ...deepClone(defaultTestControls.faults),
        ...(current?.faults ?? {}),
      },
      tracing: {
        ...deepClone(defaultTestControls.tracing),
        ...(current?.tracing ?? {}),
      },
    }

    if (JSON.stringify(next) !== JSON.stringify(current)) {
      atomicWriteJson(paths.testControls, next)
    }

    return next
  }

  function writeTestControls(testControls) {
    atomicWriteJson(paths.testControls, testControls)
    atomicWriteJson(paths.breakModes, testControls.breakModes)
    return testControls
  }

  function updateTestControls(update) {
    const current = readTestControls()
    const next = {
      ...current,
      ...update,
      breakModes: update.breakModes
        ? {
            ...current.breakModes,
            ...update.breakModes,
            apiFailures: {
              ...current.breakModes.apiFailures,
              ...(update.breakModes.apiFailures ?? {}),
            },
          }
        : current.breakModes,
      faults: update.faults
        ? {
            ...current.faults,
            ...update.faults,
          }
        : current.faults,
      tracing: update.tracing
        ? {
            ...current.tracing,
            ...update.tracing,
          }
        : current.tracing,
    }

    return writeTestControls(next)
  }

  function applyScenarioPreset(presetId) {
    const preset = defaultPresets.find((candidate) => candidate.id === presetId)

    if (!preset) {
      throw new Error('Scenario preset not found.')
    }

    const current = readTestControls()
    return writeTestControls({
      ...current,
      activePresetId: preset.id,
      breakModes: deepClone(preset.breakModes),
      faults: deepClone(preset.faults),
    })
  }

  function mergeBreakModes(update) {
    const current = readBreakModes()
    const next = {
      ...current,
      ...update,
      apiFailures: {
        ...current.apiFailures,
        ...update.apiFailures,
      },
    }

    return writeBreakModes(next)
  }

  function readProducts() {
    return readJsonFile(paths.products)
  }

  function writeProducts(products) {
    atomicWriteJson(paths.products, products)
    return products
  }

  function updateProduct(productId, updates) {
    const products = readProducts()
    const nextProducts = products.map((product) =>
      product.id === productId ? { ...product, ...updates } : product,
    )
    writeProducts(nextProducts)
    return nextProducts.find((product) => product.id === productId) ?? null
  }

  function readOrders() {
    return readJsonFile(paths.orders)
  }

  function writeOrders(orders) {
    atomicWriteJson(paths.orders, orders)
    return orders
  }

  function addOrder(order) {
    const nextOrders = [order, ...readOrders()]
    writeOrders(nextOrders)
    return order
  }

  function createUser(input) {
    const users = readUsers()
    const normalized = {
      username: String(input.username ?? '').trim().toLowerCase(),
      password: String(input.password ?? '').trim(),
      displayName: String(input.displayName ?? '').trim(),
      role: input.role,
    }

    if (!validateUser(normalized)) {
      throw new Error('User data is invalid.')
    }

    if (users.some((user) => user.username === normalized.username)) {
      throw new Error('A user with that username already exists.')
    }

    return writeUsers([...users, normalized])
  }

  function updateUser(username, input) {
    const users = readUsers()
    const target = users.find((user) => user.username === username)

    if (!target) {
      throw new Error('User not found.')
    }

    const nextUser = {
      ...target,
      ...input,
      username: input.username ? String(input.username).trim().toLowerCase() : target.username,
      password: input.password ? String(input.password).trim() : target.password,
      displayName: input.displayName ? String(input.displayName).trim() : target.displayName,
    }

    if (!validateUser(nextUser)) {
      throw new Error('User data is invalid.')
    }

    if (
      nextUser.username !== username &&
      users.some((user) => user.username === nextUser.username)
    ) {
      throw new Error('A user with that username already exists.')
    }

    return writeUsers(users.map((user) => (user.username === username ? nextUser : user)))
  }

  function deleteUser(username) {
    return writeUsers(readUsers().filter((user) => user.username !== username))
  }

  function resetBreakModes() {
    const current = readTestControls()
    writeTestControls({
      ...current,
      activePresetId: baselinePreset?.id ?? null,
      breakModes: deepClone(defaultAppConfig.breakModes),
      faults: deepClone(defaultTestControls.faults),
    })

    return deepClone(defaultAppConfig.breakModes)
  }

  function resetRuntimeData() {
    writeUsers(deepClone(defaultUsers))
    writeTestControls(deepClone(defaultTestControls))
    atomicWriteJson(paths.breakModes, deepClone(defaultAppConfig.breakModes))
    writeProducts(deepClone(defaultProducts))
    writeOrders(deepClone(defaultOrders))
    atomicWriteJson(paths.appState, {
      createdAt: new Date().toISOString(),
      selectedDataDirectory: dataDirectory,
      lastResetAt: new Date().toISOString(),
    })
  }

  return {
    dataDirectory,
    defaults: {
      appConfig: deepClone(defaultAppConfig),
      users: deepClone(defaultUsers),
      products: deepClone(defaultProducts),
    },
    readUsers,
    writeUsers,
    createUser,
    updateUser,
    deleteUser,
    listScenarioPresets,
    readBreakModes,
    writeBreakModes,
    mergeBreakModes,
    resetBreakModes,
    readTestControls,
    writeTestControls,
    updateTestControls,
    applyScenarioPreset,
    readProducts,
    writeProducts,
    updateProduct,
    readOrders,
    writeOrders,
    addOrder,
    resetRuntimeData,
  }
}
