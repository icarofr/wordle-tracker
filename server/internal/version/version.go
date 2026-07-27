package version

import (
	"fmt"
	"runtime/debug"
)

func Get() string {
	bi, ok := debug.ReadBuildInfo()
	if ok {
		return bi.Main.Version
	}

	return "unavailable"
}

func GetRevision() string {
	bi, ok := debug.ReadBuildInfo()
	if !ok {
		return "unavailable"
	}

	var revision string
	var modified bool
	for _, s := range bi.Settings {
		switch s.Key {
		case "vcs.revision":
			revision = s.Value
		case "vcs.modified":
			modified = s.Value == "true"
		}
	}

	if revision == "" {
		return "unavailable"
	}

	if modified {
		return fmt.Sprintf("%s+dirty", revision)
	}

	return revision
}
