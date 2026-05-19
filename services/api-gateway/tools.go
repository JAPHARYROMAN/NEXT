//go:build tools

// Package tools keeps gqlgen in go.mod so `go run github.com/99designs/gqlgen ...`
// resolves. Not built into the service binary.
package tools

import (
	_ "github.com/99designs/gqlgen"
)
