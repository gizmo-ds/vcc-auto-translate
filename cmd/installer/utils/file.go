package utils

import (
	"fmt"
	"io"
	"os"
)

func CopyFile(src, dst string) (int64, error) {
	s, err := os.Stat(src)
	if err != nil {
		return 0, err
	}
	if !s.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}
	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()
	d, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer d.Close()
	written, err := io.Copy(d, source)
	return written, err
}
