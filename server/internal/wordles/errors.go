package wordles

import "errors"

var (
	ErrDuplicateEntry = errors.New("duplicate entry")
	ErrInvalidFormat  = errors.New("invalid format")
)
