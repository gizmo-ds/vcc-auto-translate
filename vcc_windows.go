//go:build windows

package main

import "golang.org/x/sys/windows/registry"

func findVCCInstallPath() (string, error) {
	// HKEY_CURRENT_USER\Software\VCC
	k, err := registry.OpenKey(registry.CURRENT_USER, "Software\\VCC", registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()

	s, _, err := k.GetStringValue("InstallPath")
	if err != nil {
		return "", err
	}
	return s, nil
}
