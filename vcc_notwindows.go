//go:build !windows

package main

import "errors"

func findVCCInstallPath() (string, error) {
	return "", errors.New("not implemented")
}

func getUserDefaultLocale() (string, error) {
	return "", errors.New("not implemented")
}
