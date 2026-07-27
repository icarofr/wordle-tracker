package validator

import (
	"net/mail"
	"unicode/utf8"
)

// Validator collects per-field validation errors.
type Validator struct {
	Errors map[string][]string
}

// New returns a ready-to-use Validator.
func New() *Validator {
	return &Validator{Errors: make(map[string][]string)}
}

// Valid reports whether any errors have been recorded.
func (v *Validator) Valid() bool {
	return len(v.Errors) == 0
}

// AddError records a validation error for the given field.
func (v *Validator) AddError(field, message string) {
	v.Errors[field] = append(v.Errors[field], message)
}

// CheckRequired adds an error if value is empty.
func (v *Validator) CheckRequired(value, field, message string) {
	if value == "" {
		v.AddError(field, message)
	}
}

// CheckMaxLength adds an error if value exceeds max runes.
func (v *Validator) CheckMaxLength(value string, max int, field, message string) {
	if utf8.RuneCountInString(value) > max {
		v.AddError(field, message)
	}
}

// CheckMinLength adds an error if value has fewer than min runes.
func (v *Validator) CheckMinLength(value string, min int, field, message string) {
	if utf8.RuneCountInString(value) < min {
		v.AddError(field, message)
	}
}

// CheckEmail adds an error if value is not a valid email address.
func (v *Validator) CheckEmail(value, field, message string) {
	if _, err := mail.ParseAddress(value); err != nil {
		v.AddError(field, message)
	}
}
