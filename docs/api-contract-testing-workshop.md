# API Contract Testing Workshop

This workshop teaches testers how to validate API behavior as a contract, not just as a transport layer.

It uses Testbed to practise:

- checking response shape
- checking status-code behavior
- checking error handling
- spotting schema drift
- connecting API failures to UI impact

## Learning Goals

By the end of this workshop, you should be able to:

- explain what an API contract is
- identify contract expectations for Testbed endpoints
- write useful Postman checks for success and failure cases
- distinguish transport failure from schema failure
- use fault modes to test consumer resilience

## What a Contract Means Here

An API contract includes:

- endpoint path and method
- expected status codes
- expected response structure
- expected error structure
- expected field types

Examples in Testbed:

- `POST /api/auth/login` should return a user object on success
- `GET /api/shop/products` should return a `products` array
- `POST /api/orders` should return an `order` object on success

## Part 1: Start with the Happy Contract

For each key endpoint, define:

- valid request
- successful status
- required fields
- required field types

### Workshop exercise

Document the contract for:

- `POST /api/auth/login`
- `GET /api/shop/products`
- `POST /api/orders`

Use this template:

```text
Endpoint:

Success status:

Required top-level fields:

Important nested fields:

Field types:
```

## Part 2: Test Error Contracts Too

Error handling is part of the contract.

Test:

- expected error statuses
- presence of error messages
- correlation ID headers
- consistency of error shape

### Workshop exercise

Use:

- `auth-expired`
- `orders-api-422`

Then verify:

- status code
- error body
- correlation header

## Part 3: Use Fault Modes to Break the Contract

The fault matrix makes contract failures explicit.

Use:

- `missing-fields`
- `wrong-types`
- `malformed-json`
- `empty-body`

### Workshop exercise

Apply a fault to `shop.products` and compare:

- normal success
- missing fields
- wrong types
- malformed JSON

Ask:

- what would a consumer expect
- what actually arrived
- how would this affect the UI

## Part 4: Write Postman Assertions

Example:

```js
pm.test('status is 200', function () {
  pm.response.to.have.status(200)
})

pm.test('products is an array', function () {
  const json = pm.response.json()
  pm.expect(json.products).to.be.an('array')
})

pm.test('correlation header exists', function () {
  pm.expect(pm.response.headers.get('x-testbed-correlation-id')).to.exist
})
```

### Workshop exercise

Write checks for:

- login success
- products success
- orders failure
- malformed products response

## Part 5: Consumer Impact

Contract testing is more valuable when you ask:

- what would the UI do with this response
- what would break if a field disappeared
- what would break if a type changed

### Workshop exercise

Pick one contract break and write:

- API expectation
- actual response problem
- likely UI impact

## Part 6: Final Takeaway

API contract testing is about protecting consumers from unexpected behavior.

A passing status code is not enough.
You must also prove the structure is usable and consistent.
