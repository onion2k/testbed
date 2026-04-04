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
const defaultOrders = []

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
    return readJsonFile(paths.breakModes)
  }

  function writeBreakModes(breakModes) {
    atomicWriteJson(paths.breakModes, breakModes)
    return breakModes
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
    return writeBreakModes(deepClone(defaultAppConfig.breakModes))
  }

  function resetRuntimeData() {
    writeUsers(deepClone(defaultUsers))
    writeBreakModes(deepClone(defaultAppConfig.breakModes))
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
    readBreakModes,
    writeBreakModes,
    mergeBreakModes,
    resetBreakModes,
    readProducts,
    writeProducts,
    updateProduct,
    readOrders,
    writeOrders,
    addOrder,
    resetRuntimeData,
  }
}
