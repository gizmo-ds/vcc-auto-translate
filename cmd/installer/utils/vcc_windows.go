//go:build windows

package utils

import "golang.org/x/sys/windows/registry"

func FindVCCInstallPath() (string, error) {
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

func GetUserDefaultLocale() (string, error) {
	k, err := registry.OpenKey(registry.CURRENT_USER, "Control Panel\\International", registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()

	s, _, err := k.GetStringValue("LocaleName")
	if err != nil {
		return "", err
	}
	return s, nil
}
