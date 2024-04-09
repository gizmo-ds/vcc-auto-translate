use anyhow::{Context, Result};
use regex_automata::meta;

#[cfg(target_os = "windows")]
pub fn install_path() -> Result<String> {
    use winreg::RegKey;
    let install_path: String = RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey("Software\\VCC")?
        .get_value("InstallPath")
        .with_context(|| "Failed to get VCC install path")?;
    Ok(install_path)
}

pub fn patch_loader() -> Result<String> {
    let script_content = include_bytes!("../assets/patch-loader.js");
    let script_content = std::str::from_utf8(script_content.as_ref())
        .with_context(|| "Failed to convert patch loader asset to string")?;
    let loader_content = format!(
        r#"<script type="module" name="vcc-auto-translate" defer>
// This script is generated by the vcc-auto-translate project
// Source code: https://github.com/gizmo-ds/vcc-auto-translate
{}
</script>"#,
        script_content
    );
    Ok(loader_content)
}

pub fn installer_csp(index_content: String) -> Result<String> {
    let mut index_content = index_content.replace(
        "<head>",
         "<head><meta http-equiv=\"Content-Security-Policy\" content=\"script-src 'none' 'unsafe-inline'\">");

    let loader_content = patch_loader()?;
    let loader_content = format!("</body>\n{}", loader_content);

    index_content = index_content.replace("</body>", loader_content.as_str());
    Ok(index_content)
}

pub fn installer_meta(index_content: String) -> Result<String> {
    let re = meta::Regex::new(r#"<script.*?(\/assets\/index-[a-z0-9]+\.js)["'<>\/script]+>"#)?;

    let mut caps = re.create_captures();
    re.captures(&index_content, &mut caps);
    if !caps.is_match() {
        return Err(anyhow::anyhow!("Failed to find index.js script tag"));
    }
    if caps.group_len() < 2 {
        return Err(anyhow::anyhow!("Failed to find index.js script tag"));
    }

    let index_tag = match caps.get_group(0) {
        Some(span) => &index_content[span.start..span.end],
        None => return Err(anyhow::anyhow!("Failed to find index.js script tag")),
    };
    let index_file = match caps.get_group(1) {
        Some(span) => &index_content[span.start..span.end],
        None => return Err(anyhow::anyhow!("Failed to find index.js script tag")),
    };

    let index_content = index_content.replace(
        index_tag,
        &format!("<meta name=\"index-module\" content=\"{}\">", index_file),
    );

    let loader_content = patch_loader()?;
    let index_content =
        index_content.replace("</body>", format!("{}\n</body>", loader_content).as_str());
    Ok(index_content.to_string())
}
