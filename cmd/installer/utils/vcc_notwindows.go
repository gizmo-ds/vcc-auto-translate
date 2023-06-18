//go:build !windows

package utils

import "errors"

func FindVCCInstallPath() (string, error) {
	return "", errors.New("not implemented")
}

func GetUserDefaultLocale() (string, error) {
	return "", errors.New("not implemented")
}
