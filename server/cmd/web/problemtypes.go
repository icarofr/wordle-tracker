package main

// Problem type URIs as defined in the OpenAPI spec.
// Keep in sync with api/openapi.yaml's problem type definitions.
const (
	problemInvalidCredentials = "/problems/invalid-credentials"
	problemEmailTaken         = "/problems/email-taken"
	problemInvalidFormat      = "/problems/invalid-format"
	problemDuplicateEntry     = "/problems/duplicate-entry"
	problemInvalidOpponent    = "/problems/invalid-opponent"
	problemValidationError    = "/problems/validation-error"
	problemInvalidLimit       = "/problems/invalid-limit"
	problemInvalidCursor      = "/problems/invalid-cursor"
	problemInvalidAvatar      = "/problems/invalid-avatar"
)
