package env

import (
	"fmt"
	"os"
	"strconv"
)

func GetString(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}

	return value
}

func GetInt(key string, defaultValue int) (int, error) {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue, nil
	}

	intValue, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("env %s: %w", key, err)
	}

	return intValue, nil
}

func GetBool(key string, defaultValue bool) (bool, error) {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue, nil
	}

	boolValue, err := strconv.ParseBool(value)
	if err != nil {
		return false, fmt.Errorf("env %s: %w", key, err)
	}

	return boolValue, nil
}
