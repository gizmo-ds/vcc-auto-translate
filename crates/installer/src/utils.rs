use std::path::PathBuf;

#[cfg(target_os = "windows")]
pub fn verbatim_path_display(path: &PathBuf) -> String {
    let display = path.display().to_string();
    if display.starts_with(r#"\\?\UNC"#) {
        return display;
    }
    display.replace(r#"\\?\"#, "").replace("\\", "/")
}

#[cfg(not(target_os = "windows"))]
pub fn verbatim_path_display(path: &PathBuf) -> String {
    path.display().to_string()
}
