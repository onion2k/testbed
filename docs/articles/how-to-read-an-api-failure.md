# How to Read an API Failure

API failures can look intimidating at first because they seem less human than a broken screen. A page can be explored visually. A failing API call often appears as a status code, a block of JSON, and a frustrated comment from a test that something “did not work.” The skill is to slow the situation down and read the evidence in a sensible order rather than reacting to the first surprising detail.

The first thing to look at is the status code. It will not tell you everything, but it helps you frame the kind of problem you are dealing with. A `401` suggests an authentication issue. A `403` suggests that the caller is known but not allowed. A `404` suggests the route or resource is wrong. A `422` usually points to validation. A `500` indicates the server failed internally. This is not the end of the investigation, but it gives you a sensible starting point.

After that, look at the request itself. Was it sent to the route you expected? Did it include the right method, headers, and body? In a learning environment like Testbed, this is especially important because some routes now expect a Bearer token. A tester who jumps straight to blaming the server can miss the simple truth that the request was incomplete. This is one reason Postman is useful: it makes the shape of the request easier to inspect.

Next, read the response body carefully. People often skim it too fast because they are expecting a dramatic error message. Sometimes the response is plain and helpful. It might tell you that a required field is missing, that a token is invalid, or that the request shape is malformed. Even when the message is brief, it often tells you where to look next. If the body is empty or malformed, that is also evidence. It may indicate a different kind of problem from a neat JSON error object.

Context matters as well. Was this a public route or an admin route? Was there a break mode active that intentionally changes the response? Was the same route working earlier in the session? A failure is easier to understand when you place it in the story around it rather than treating it as a random isolated event.

One of the best habits is to compare what you saw in the UI with what the API is saying. If a page shows a generic “Something went wrong” banner, the API may be much more specific. If the API shows a valid success response but the page is still wrong, that suggests the problem may be in the frontend. If the API itself returns the wrong data, the browser is often only the messenger. This comparison saves time and helps you write better bug reports.

In Testbed, the trace viewer is useful because it links requests and responses to correlation IDs and timing information. That means you are not relying on guesswork about which request was responsible for which screen state. You can inspect the exact call, the exact response mode, and whether a fault or latency rule was applied. This teaches a very practical lesson: good testers look for evidence before they reach for theory.

A common beginner error is to treat every API failure as a product bug. Sometimes it is a setup issue. Sometimes it is an authentication issue. Sometimes it is an expected failure that the UI should handle gracefully. The job is not only to notice the response was non-200. The job is to interpret whether that response was wrong, expected, or badly handled.

Reading API failures well is not about memorising every status code. It is about building a calm sequence of questions. What was requested? What came back? What does that imply? What surface should I inspect next? Once you have that habit, API investigation becomes much less mysterious. It becomes another form of testing evidence, and one that often tells a clearer story than the screen alone.
