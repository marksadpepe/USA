# Social Login
To implement Social Login in the service, I would use **OAuth 2.0**, which is supported by most social platforms (Google, Facebook, Twitter, etc.).

## OAuth 2.0 and Third-Party Authorization
In a NestJS application, I would set up a separate route for each social network. For example, ```/auth/google``` would redirect users to Google’s authentication page, where the necessary permissions would be requested. Once authorized, Google redirects the user back to our service with a unique authorization code.
