//go:build !windows

package main

import "errors"

func findVCCInstallPath() (string, error) {
	return "", errors.New("not implemented")
}
