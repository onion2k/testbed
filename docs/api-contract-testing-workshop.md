# API Contract Testing Workshop

This workshop is about understanding an API as a promise between two parts of a system.

When one system calls another, it depends on more than the endpoint existing. It depends on that endpoint returning the kind of data the consumer expects, in the shape the consumer expects, with the kinds of success and error responses the consumer can handle.

That is what contract testing is really about.

## What a Contract Means in Simple Terms

An API contract tells the caller what it can rely on.

That usually includes:

- the endpoint path and method
- the success status
- the top-level response structure
- important nested fields
- the type of those fields
- the error shape when something goes wrong

In Testbed, for example, the products endpoint is expected to return a `products` array. The orders endpoint is expected to return an `order` object when creation succeeds. If that structure changes unexpectedly, the UI may break even if the request still returns `200`.

## Why Contract Testing Matters to Manual Testers

Contract testing is especially helpful for testers moving into automation because it teaches a more system-level way of thinking.

Instead of asking only “Does the page look right?”, you start asking:

- what is the browser expecting from the service
- which fields matter most
- what would happen if one of those fields disappeared
- what would happen if the type changed

That shift is important because it makes your testing more precise and often helps you spot problems earlier.

## Use Testbed to Break the Contract Safely

Testbed is a good place to learn this because it lets you deliberately break responses in controlled ways.

You can create responses with:

- missing fields
- wrong data types
- malformed JSON
- empty bodies

That gives you a safe way to practise a very realistic kind of failure: the service is “there”, but what it returns is not actually usable.

## A Practical Way to Approach Contract Testing

Start with the happy response.

Ask yourself:

- what fields must exist
- which fields are most important
- what type should each field be
- what error response should the client understand

Then use the fault tools to see how the consumer behaves when the contract breaks.

This teaches you something much stronger than simple transport checks. It teaches you whether the service and the consumer still agree.

## What This Looks Like in Testbed

In Testbed, the clearest contract examples are the login, products, and orders endpoints. The browser app depends on them returning useful data in the shape it expects. If the structure changes unexpectedly, the page may stop behaving correctly even though the request itself still “worked”.

That is the kind of problem contract testing is designed to expose.

## A Simple Example

Imagine the products endpoint stops returning an array and instead returns a string. A very shallow API check might only notice that the response status is still `200`. A contract-aware check would notice immediately that the response is no longer usable by the browser.

That difference is the heart of this workshop.

## Common Beginner Mistake

One common mistake is to treat any successful status code as proof that the API is behaving correctly.

That is often too weak. Contract testing teaches you to ask whether the response is actually usable, not just whether it exists.

## What Good Looks Like

Good contract testing means the tester can explain which parts of the response matter most and why. It also means they can connect a contract break to likely consumer impact instead of treating the API as an isolated thing.

## Final Thought

Contract testing helps you catch the problems that sit between “request sent” and “UI behaved correctly”.

That middle area is often where some of the most important automation learning happens.

## Further Reading

- Postman documentation on tests and scripts
- OpenAPI or schema documentation used by your team
- Introductions to consumer-driven contract testing
