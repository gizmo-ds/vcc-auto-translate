#[macro_use(defer)]
extern crate scopeguard;

use std::fs::{copy, File};
use std::io::{self, BufRead, Read, Write};
use std::path::Path;

use anyhow::Context;

mod vcc;

fn main() {
    defer! {
        println!("\nPress Enter to exit...");
        let _ = io::stdin().lock().lines().next();
    }

    println!(
        "{}",
        r#"VCC Auto Translate installer

This installer will add the VCC Auto Translate script to your VCC installation.
Source code: https://github.com/gizmo-ds/vcc-auto-translate
"#
    );

    let install_path = match vcc::install_path() {
        Ok(path) => path,
        Err(e) => return println!("Error: {:?}", e),
    };

    println!("VCC Install Path: {}", install_path);

    let dist_path = Path::new(&install_path).join("WebApp").join("Dist");
    if !dist_path.exists() {
        return println!("Error: Dist path does not exist");
    }

    let index_file = dist_path.join("index.html");
    if !index_file.exists() {
        return println!("Error: index.html does not exist");
    }

    let backup_file = dist_path.join("index.html.backup");
    if !backup_file.exists() {
        match copy(&index_file, &backup_file) {
            Ok(_) => println!("Backup created: {}", backup_file.display()),
            Err(e) => return println!("Error: {:?}", e),
        };
    }

    let mut index_content = String::new();
    let mut file = match File::open(match backup_file.exists() {
        true => &backup_file,
        false => &index_file,
    })
    .with_context(|| "Failed to open index file")
    {
        Ok(f) => f,
        Err(e) => return println!("Error: {:?}", e),
    };
    file.flush().unwrap();

    match file
        .read_to_string(&mut index_content)
        .with_context(|| format!("Failed to read index file: {}", index_file.display()))
    {
        Ok(_) => (),
        Err(e) => return println!("Error: {:?}", e),
    }

    index_content = match vcc::installer_csp(index_content) {
        Ok(content) => content,
        Err(e) => return println!("Error: {:?}", e),
    };

    let mut file = match File::create(&index_file) {
        Ok(f) => f,
        Err(e) => return println!("Failed to create index file: {:?}", e),
    };
    match file
        .write_all(index_content.as_bytes())
        .with_context(|| format!("Failed to write index file: {}", index_file.display()))
    {
        Ok(_) => println!("VCC Auto Translate installed successfully"),
        Err(e) => return println!("Error: {:?}", e),
    }
}
