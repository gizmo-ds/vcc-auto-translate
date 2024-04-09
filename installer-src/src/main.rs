#[macro_use(defer)]
extern crate scopeguard;

use std::fs::{copy, File};
use std::io::{self, BufRead, Read, Write};
use std::path::Path;

use anyhow::Context;

mod vcc;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut pause = true;
    let mut installer_type = "meta".to_string();

    // Parse arguments
    for arg in args {
        match arg.split('=').collect::<Vec<&str>>().as_slice() {
            ["--dont-pause"] => {
                pause = false;
            }
            ["--type", value] => {
                installer_type = value.to_string();
            }
            _ => return println!("Invalid argument: {}", arg),
        }
    }
    let installer = match installer_type.as_str() {
        "csp" => vcc::installer_csp,
        "meta" => vcc::installer_meta,
        t => return println!("Invalid installer type: {}", t),
    };

    // Pause before exit
    defer! {
        if !pause {return;}
        println!("\nPress Enter to exit...");
        let _ = io::stdin().lock().lines().next();
    }

    println!(
        r#"VCC Auto Translate installer

This installer will add the VCC Auto Translate script to your VCC installation.
Source code: https://github.com/gizmo-ds/vcc-auto-translate
"#
    );

    let mut vcc_path = match Path::new("./").canonicalize() {
        Ok(path) => path,
        Err(e) => return println!("Error: {:?}", e),
    };
    if !vcc_path.join("CreatorCompanion.exe").exists()
        && !vcc_path.join("CreatorCompanionBeta.exe").exists()
    {
        let install_path_str = match vcc::install_path() {
            Ok(path) => path,
            Err(e) => return println!("Error: {:?}", e),
        };
        vcc_path = Path::new(&install_path_str).to_path_buf();
    }
    println!("VCC Install Path: {}\n", vcc_path.display());

    let dist_path = vcc_path.join("WebApp").join("Dist");
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

    index_content = match installer(index_content) {
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
